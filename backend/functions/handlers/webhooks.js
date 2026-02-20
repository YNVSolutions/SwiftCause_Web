const admin = require("firebase-admin");
const {stripe, getWebhookSecrets, ensureStripeInitialized} = require("../services/stripe");

const DEFAULT_GIFT_AID_DECLARATION_TEXT = "I confirm I have paid enough UK Income or Capital Gains Tax to cover all my Gift Aid donations in this tax year.";

const toBoolean = (value) => value === true || value === "true" || value === "1";

const toStringOrNull = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const parseIsoDate = (value) => {
  const normalized = toStringOrNull(value);
  if (!normalized) return null;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const getDonationDateFromPaymentIntent = (paymentIntent, metadata) => {
  const metadataDonationDate = parseIsoDate(metadata.giftAidDonationDate);
  if (metadataDonationDate) return metadataDonationDate;
  if (typeof paymentIntent.created === "number") {
    return new Date(paymentIntent.created * 1000).toISOString();
  }
  return new Date().toISOString();
};

const getTaxYear = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const startYear = month >= 3 ? year : year - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYearShort}`;
};

const createGiftAidDeclarationIfNeeded = async ({
  paymentIntent,
  metadata,
  campaignId,
  campaignTitleSnapshot,
  organizationId,
}) => {
  const isGiftAid = toBoolean(metadata.isGiftAid);
  if (!isGiftAid) return;

  const donationId = paymentIntent.id;
  const giftAidRef = admin.firestore().collection("giftAidDeclarations").doc(donationId);
  const existingGiftAid = await giftAidRef.get();

  if (existingGiftAid.exists) {
    return;
  }

  const donorFirstName = toStringOrNull(metadata.giftAidFirstName);
  const donorSurname = toStringOrNull(metadata.giftAidSurname);
  const donorName = toStringOrNull(metadata.donorName);
  const parsedNames = donorName ? donorName.split(" ").filter(Boolean) : [];
  const fallbackFirstName = parsedNames[0] || "Anonymous";
  const fallbackSurname = parsedNames.slice(1).join(" ") || "Donor";

  const donationDate = getDonationDateFromPaymentIntent(paymentIntent, metadata);
  const declarationDate = parseIsoDate(metadata.giftAidDeclarationDate) || donationDate;
  const now = new Date().toISOString();
  const resolvedOrganizationId =
    toStringOrNull(organizationId) ||
    toStringOrNull(metadata.giftAidOrganizationId) ||
    toStringOrNull(metadata.organizationId) ||
    null;

  const giftAidData = {
    id: donationId,
    donationId,
    donorFirstName: donorFirstName || fallbackFirstName,
    donorSurname: donorSurname || fallbackSurname,
    donorHouseNumber: toStringOrNull(metadata.giftAidHouseNumber) || "",
    donorAddressLine1: toStringOrNull(metadata.giftAidAddressLine1) || "",
    donorAddressLine2: toStringOrNull(metadata.giftAidAddressLine2) || "",
    donorTown: toStringOrNull(metadata.giftAidTown) || "",
    donorPostcode: toStringOrNull(metadata.giftAidPostcode) || "",
    declarationText:
      toStringOrNull(metadata.giftAidDeclarationText) ||
      DEFAULT_GIFT_AID_DECLARATION_TEXT,
    declarationDate,
    ukTaxpayerConfirmation: toBoolean(metadata.giftAidTaxpayer),
    donationAmount: paymentIntent.amount,
    giftAidAmount: Math.round(paymentIntent.amount * 0.25),
    campaignId: campaignId || null,
    campaignTitle: campaignTitleSnapshot || "Deleted Campaign",
    organizationId: resolvedOrganizationId,
    donationDate,
    taxYear:
      toStringOrNull(metadata.giftAidTaxYear) ||
      getTaxYear(donationDate) ||
      "unknown",
    giftAidStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await giftAidRef.set(giftAidData);
};

/**
 * Handle Stripe account.updated webhook
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @return {Promise<void>} Promise that resolves when complete
 */
const handleAccountUpdatedStripeWebhook = async (req, res) => {
  let event;

  try {
    // Ensure Stripe is initialized
    const stripeClient = ensureStripeInitialized();
    
    const sig = req.headers["stripe-signature"];
    const {account: endpointSecretAccount} = getWebhookSecrets();
    event = stripeClient.webhooks.constructEvent(
        req.rawBody,
        sig,
        endpointSecretAccount,
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "account.updated") {
    const account = event.data.object;
    const orgId = account.metadata.orgId;

    if (orgId) {
      const chargesEnabled = account.charges_enabled;
      const payoutsEnabled = account.payouts_enabled;

      await admin
          .firestore()
          .collection("organizations")
          .doc(orgId)
          .set(
              {
                stripe: {
                  chargesEnabled: chargesEnabled,
                  payoutsEnabled: payoutsEnabled,
                },
              },
              {merge: true},
          );
      console.log(`Stripe account status updated for organization ${orgId}:
        Charges Enabled: ${chargesEnabled}, 
        Payouts Enabled: ${payoutsEnabled}`);
    } else {
      console.warn(
          "Received account.updated webhook without orgId in metadata.",
          account.id,
      );
    }
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send("OK");
};

/**
 * Handle Stripe payment_intent.succeeded webhook
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @return {Promise<void>} Promise that resolves when complete
 */
const handlePaymentCompletedStripeWebhook = async (req, res) => {
  let event;

  try {
    // Ensure Stripe is initialized
    const stripeClient = ensureStripeInitialized();
    
    const sig = req.headers["stripe-signature"];
    const {payment: endpointSecretPayment} = getWebhookSecrets();
    event = stripeClient.webhooks.constructEvent(
        req.rawBody,
        sig,
        endpointSecretPayment,
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata || {};
    const campaignId = toStringOrNull(metadata.campaignId);
    let organizationId = toStringOrNull(metadata.organizationId);
    let campaignTitleSnapshot = toStringOrNull(metadata.campaignTitle) || "Deleted Campaign";
    let campaignExists = false;

    if (campaignId) {
      const campaignRef = admin.firestore().collection("campaigns").doc(campaignId);
      const campaignSnap = await campaignRef.get();

      if (campaignSnap.exists) {
        campaignExists = true;
        const campaignData = campaignSnap.data() || {};
        campaignTitleSnapshot =
          toStringOrNull(campaignData.title) || campaignTitleSnapshot;
        organizationId =
          toStringOrNull(campaignData.organizationId) || organizationId;
      } else {
        console.warn("Campaign not found for payment intent:", paymentIntent.id, campaignId);
      }
    }

    // Check if donation already exists (idempotency)
    const donationRef = admin.firestore().collection("donations").doc(paymentIntent.id);
    const existingDonation = await donationRef.get();
    
    if (existingDonation.exists) {
      await createGiftAidDeclarationIfNeeded({
        paymentIntent,
        metadata,
        campaignId,
        campaignTitleSnapshot,
        organizationId,
      });
      console.log("Webhook retry handled - donation already exists:", paymentIntent.id);
      res.status(200).send("OK");
      return;
    }

    const donationData = {
      campaignId: campaignId || null,
      campaignTitleSnapshot,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      donorName: toStringOrNull(metadata.donorName) || "Anonymous",
      donorEmail: toStringOrNull(metadata.donorEmail),
      donorPhone: toStringOrNull(metadata.donorPhone),
      donorMessage: toStringOrNull(metadata.donorMessage),
      isAnonymous: toBoolean(metadata.isAnonymous),
      isGiftAid: toBoolean(metadata.isGiftAid),
      isRecurring: toBoolean(metadata.isRecurring),
      recurringInterval: toStringOrNull(metadata.recurringInterval),
      kioskId: toStringOrNull(metadata.kioskId),
      transactionId: paymentIntent.id,
      timestamp: admin.firestore.Timestamp.now(),
      platform: toStringOrNull(metadata.platform) || "unknown",
      organizationId: organizationId || null,
      paymentStatus: "success",
      source: "stripe_webhook",
    };

    await donationRef.set(donationData);
    console.log("Donation stored for:", paymentIntent.id);

    await createGiftAidDeclarationIfNeeded({
      paymentIntent,
      metadata,
      campaignId,
      campaignTitleSnapshot,
      organizationId,
    });

    if (campaignId && campaignExists) {
      const campaignRef = admin
          .firestore()
          .collection("campaigns")
          .doc(campaignId);
      await campaignRef.update({
        raised: admin.firestore.FieldValue.increment(paymentIntent.amount),
        donationCount: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.Timestamp.now(),
      });
      console.log("Campaign updated for donation:", campaignId);
    }
  }
  res.status(200).send("OK");
};

module.exports = {
  handleAccountUpdatedStripeWebhook,
  handlePaymentCompletedStripeWebhook,
};
