const admin = require("firebase-admin");
const cors = require("../middleware/cors");
const {sendDonationThankYouEmail: sendDonationThankYouEmailViaSendGrid} =
  require("../services/email");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeString = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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

      const donationRef = admin.firestore().collection("donations").doc(transactionId);
      const donationSnap = await donationRef.get();

      if (!donationSnap.exists) {
        return res.status(404).send({error: "Donation not found."});
      }

      const donationData = donationSnap.data() || {};
      const campaignName =
        normalizeString(req.body?.campaignName) ||
        normalizeString(donationData.campaignTitleSnapshot);

      const emailResult = await sendDonationThankYouEmailViaSendGrid({
        to: email,
        donorName: normalizeString(donationData.donorName) || "Donor",
        campaignName,
        amount: typeof donationData.amount === "number" ? donationData.amount : null,
        currency: normalizeString(donationData.currency) || "",
        donationId: transactionId,
        organizationId: normalizeString(donationData.organizationId) || "",
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

module.exports = {
  sendDonationThankYouEmail,
};
