const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
const admin = require("firebase-admin");

dotenv.config();

let isInitialized = false;

const sanitizeErrorMessage = (error) => {
  const message = error?.message || String(error || "Unknown error");
  return String(message).slice(0, 500);
};

const logEmailEvent = async ({
  eventType,
  status,
  recipient,
  statusCode,
  providerMessageId,
  customArgs,
  errorMessage,
}) => {
  try {
    const db = admin.firestore();
    await db.collection("emailEvents").add({
      eventType: eventType || "unknown",
      provider: "sendgrid",
      status,
      recipient,
      statusCode: statusCode || null,
      providerMessageId: providerMessageId || null,
      donationId: customArgs?.donationId || null,
      organizationId: customArgs?.organizationId || null,
      uid: customArgs?.uid || null,
      errorMessage: errorMessage || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (logError) {
    console.error("Failed to write emailEvents audit log:", sanitizeErrorMessage(logError));
  }
};

const getEmailConfig = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const fromName = process.env.SENDGRID_FROM_NAME || "SwiftCause";

  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not configured.");
  }

  if (!fromEmail) {
    throw new Error("SENDGRID_FROM_EMAIL is not configured.");
  }

  return {
    apiKey,
    fromEmail,
    fromName,
  };
};

const ensureEmailInitialized = () => {
  if (isInitialized) return;
  const {apiKey} = getEmailConfig();
  sgMail.setApiKey(apiKey);
  isInitialized = true;
};

const escapeHtml = (value = "") =>
  String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  categories,
  customArgs,
  auditEventType,
}) => {
  ensureEmailInitialized();
  const {fromEmail, fromName} = getEmailConfig();
  const recipient = Array.isArray(to) ? to.join(",") : String(to || "");

  try {
    const [response] = await sgMail.send({
      to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject,
      text,
      html,
      categories,
      customArgs,
    });

    const result = {
      statusCode: response?.statusCode,
      messageId: response?.headers?.["x-message-id"] || null,
    };

    await logEmailEvent({
      eventType: auditEventType,
      status: "success",
      recipient,
      statusCode: result.statusCode,
      providerMessageId: result.messageId,
      customArgs,
    });

    return result;
  } catch (error) {
    await logEmailEvent({
      eventType: auditEventType,
      status: "failed",
      recipient,
      customArgs,
      errorMessage: sanitizeErrorMessage(error),
    });
    throw error;
  }
};

const sendDonationThankYouEmail = async ({
  to,
  donorName,
  campaignName,
  amount,
  currency,
  donationId,
  organizationId,
}) => {
  const safeDonorName = (typeof donorName === "string" && donorName.trim()) ?
    donorName.trim() :
    "Donor";
  const safeCampaignName = (typeof campaignName === "string" && campaignName.trim()) ?
    campaignName.trim() :
    null;
  const upperCurrency = typeof currency === "string" ? currency.toUpperCase() : "";
  const amountDisplay = typeof amount === "number" ?
    `${(amount / 100).toFixed(2)} ${upperCurrency}`.trim() :
    null;

  const subject = safeCampaignName ?
    `Thank you for supporting ${safeCampaignName}!` :
    "Thank you for your donation!";

  const textLines = [
    `Dear ${safeDonorName},`,
    "",
    "Thank you for your generous donation.",
  ];

  if (amountDisplay) textLines.push(`Amount: ${amountDisplay}`);
  if (safeCampaignName) textLines.push(`Campaign: ${safeCampaignName}`);

  textLines.push("", "We appreciate your support.", "", "SwiftCause");

  const html = `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <h2>Thank you for your donation!</h2>
    <p>Dear ${escapeHtml(safeDonorName)},</p>
    <p>Thank you for your generous donation.</p>
    ${amountDisplay ? `<p><strong>Amount:</strong> ${escapeHtml(amountDisplay)}</p>` : ""}
    ${safeCampaignName ? `<p><strong>Campaign:</strong> ${escapeHtml(safeCampaignName)}</p>` : ""}
    <p>We appreciate your support.</p>
    <p><strong>SwiftCause</strong></p>
  </body>
</html>`;

  return sendEmail({
    to,
    subject,
    text: textLines.join("\n"),
    html,
    categories: ["donation-thank-you"],
    customArgs: {
      donationId: donationId || "",
      organizationId: organizationId || "",
    },
    auditEventType: "donation_thank_you",
  });
};

const sendOrganizationWelcomeEmail = async ({
  to,
  organizationName,
  recipientName,
  organizationId,
  uid,
}) => {
  const safeRecipientName = (typeof recipientName === "string" && recipientName.trim()) ?
    recipientName.trim() :
    "there";
  const safeOrgName = (typeof organizationName === "string" && organizationName.trim()) ?
    organizationName.trim() :
    "your organization";

  const subject = `Welcome to SwiftCause, ${safeOrgName}!`;
  const text = [
    `Hi ${safeRecipientName},`,
    "",
    `Welcome to SwiftCause. Your organization (${safeOrgName}) has been created.`,
    "You can now sign in and start setting up campaigns and kiosks.",
    "",
    "SwiftCause",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <h2>Welcome to SwiftCause</h2>
    <p>Hi ${escapeHtml(safeRecipientName)},</p>
    <p>Welcome to SwiftCause. Your organization
      <strong>${escapeHtml(safeOrgName)}</strong> has been created.</p>
    <p>You can now sign in and start setting up campaigns and kiosks.</p>
    <p><strong>SwiftCause</strong></p>
  </body>
</html>`;

  return sendEmail({
    to,
    subject,
    text,
    html,
    categories: ["organization-welcome"],
    customArgs: {
      organizationId: organizationId || "",
      uid: uid || "",
    },
    auditEventType: "org_welcome",
  });
};

const sendContactConfirmationEmail = async ({
  to,
  firstName,
  message,
}) => {
  const safeFirstName = (typeof firstName === "string" && firstName.trim()) ?
    firstName.trim() :
    "there";
  const safeMessage = typeof message === "string" ? message.trim() : "";
  const messageHtml = escapeHtml(safeMessage).replace(/\r?\n/g, "<br/>");

  const subject = "We received your message";
  const text = [
    `Hi ${safeFirstName},`,
    "",
    "Thanks for contacting SwiftCause. We received your message and will get back to you shortly.",
    "",
    "Message:",
    safeMessage || "(No message provided)",
    "",
    "SwiftCause Team",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <p>Hi ${escapeHtml(safeFirstName)},</p>
    <p>Thanks for contacting SwiftCause. We received your message and will get back to you shortly.</p>
    <p><strong>Message:</strong><br/>${messageHtml || "(No message provided)"}</p>
    <p><strong>SwiftCause Team</strong></p>
  </body>
</html>`;

  return sendEmail({
    to,
    subject,
    text,
    html,
    categories: ["contact-confirmation"],
    auditEventType: "contact_confirmation",
  });
};

module.exports = {
  ensureEmailInitialized,
  sendEmail,
  sendDonationThankYouEmail,
  sendOrganizationWelcomeEmail,
  sendContactConfirmationEmail,
};
