const admin = require("firebase-admin");
const cors = require("../middleware/cors");
const {
  sendDonationThankYouEmail: sendDonationThankYouEmailViaSendGrid,
  sendContactConfirmationEmail: sendContactConfirmationEmailViaSendGrid,
} = require("../services/email");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeString = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getDonationWithRetry = async (transactionId, attempts = 6, delayMs = 500) => {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const donationRef = admin.firestore().collection("donations").doc(transactionId);
    const donationSnap = await donationRef.get();
    if (donationSnap.exists) {
      return donationSnap;
    }

    if (attempt < attempts) {
      await sleep(delayMs);
    }
  }

  return null;
};

/**
 * Send donation thank-you email via SendGrid (replaces Firestore mail queue).
 * Validates that the provided transactionId corresponds to an existing donation.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const sendDonationThankYouEmail = (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({error: "Method not allowed"});
      }

      const email = normalizeString(req.body?.email);
      const transactionId = normalizeString(req.body?.transactionId);

      if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).send({error: "A valid email is required."});
      }

      if (!transactionId) {
        return res.status(400).send({error: "transactionId is required."});
      }

      const donationSnap = await getDonationWithRetry(transactionId);

      if (!donationSnap || !donationSnap.exists) {
        return res.status(409).send({
          error: "Donation is still processing. Please retry in a few seconds.",
        });
      }

      const donationData = donationSnap.data() || {};
      const organizationId = normalizeString(donationData.organizationId) || "";
      const campaignName =
        normalizeString(req.body?.campaignName) ||
        normalizeString(donationData.campaignTitleSnapshot);
      let organizationName = null;

      if (organizationId) {
        try {
          const orgSnap = await admin
              .firestore()
              .collection("organizations")
              .doc(organizationId)
              .get();
          if (orgSnap.exists) {
            const orgData = orgSnap.data() || {};
            organizationName =
              normalizeString(orgData.name) ||
              normalizeString(orgData.organizationName);
          }
        } catch (orgError) {
          console.warn("Failed to resolve organization name for receipt email:", {
            transactionId,
            organizationId,
            error: orgError.message,
          });
        }
      }

      const emailResult = await sendDonationThankYouEmailViaSendGrid({
        to: email,
        donorName: normalizeString(donationData.donorName) || "Donor",
        campaignName,
        organizationName,
        amount: typeof donationData.amount === "number" ? donationData.amount : null,
        currency: normalizeString(donationData.currency) || "",
        donationId: transactionId,
        organizationId,
      });

      console.log("Donation thank-you email sent", {
        transactionId,
        email,
        statusCode: emailResult?.statusCode || null,
      });

      return res.status(200).send({
        success: true,
        message: "Thank-you email sent.",
      });
    } catch (error) {
      console.error("Error sending donation thank-you email:", error);
      return res.status(500).send({
        error: error.message || "Failed to send thank-you email.",
      });
    }
  });
};

/**
 * Send contact form confirmation email via SendGrid.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const sendContactConfirmationEmail = (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({error: "Method not allowed"});
      }

      const email = normalizeString(req.body?.email);
      const firstName = normalizeString(req.body?.firstName);
      const message = normalizeString(req.body?.message);

      if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).send({error: "A valid email is required."});
      }

      if (!message) {
        return res.status(400).send({error: "message is required."});
      }

      const emailResult = await sendContactConfirmationEmailViaSendGrid({
        to: email,
        firstName,
        message,
      });

      console.log("Contact confirmation email sent", {
        email,
        statusCode: emailResult?.statusCode || null,
      });

      return res.status(200).send({success: true});
    } catch (error) {
      console.error("Error sending contact confirmation email:", error);
      return res.status(500).send({
        error: error.message || "Failed to send contact confirmation email.",
      });
    }
  });
};

module.exports = {
  sendDonationThankYouEmail,
  sendContactConfirmationEmail,
};
