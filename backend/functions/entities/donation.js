const admin = require("firebase-admin");

/**
 * Create donation document (supports both one-time and recurring)
 * @param {object} donationData - Donation data
 * @return {Promise<object>} Firestore document reference
 */
const createDonationDoc = async (donationData) => {
  const {
    transactionId, // Use as doc ID for idempotency
    campaignId,
    organizationId,
    amount,
    currency = "usd",
    donorName = "Anonymous",
    donorEmail = null,
    donorPhone = null,
    donorMessage = null,
    isAnonymous = false,
    isGiftAid = false,
    isRecurring = false,
    recurringInterval = null,
    subscriptionId = null,
    invoiceId = null,
    kioskId = null,
    platform = "web",
    metadata = {},
  } = donationData;

  const donationRef = admin
      .firestore()
      .collection("donations")
      .doc(transactionId);

  // Check if already exists (idempotency)
  const existing = await donationRef.get();
  if (existing.exists) {
    console.log("Donation already exists:", transactionId);
    return donationRef;
  }

  await donationRef.set({
    campaignId,
    organizationId,
    amount,
    currency,
    donorName,
    donorEmail,
    donorPhone,
    donorMessage,
    isAnonymous,
    isGiftAid,
    isRecurring,
    recurringInterval: recurringInterval || null,
    subscriptionId: subscriptionId || null,
    invoiceId: invoiceId || null,
    kioskId: kioskId || null,
    platform,
    transactionId,
    paymentStatus: "success",
    timestamp: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now(),
    ...metadata,
  });

  console.log("Donation document created:", transactionId);

  // Update campaign stats
  if (campaignId) {
    const campaignRef = admin.firestore().collection("campaigns").doc(campaignId);
    await campaignRef.update({
      raised: admin.firestore.FieldValue.increment(amount),
      donationCount: admin.firestore.FieldValue.increment(1),
      lastUpdated: admin.firestore.Timestamp.now(),
    });
    console.log("Campaign stats updated for:", campaignId);
  }

  return donationRef;
};

module.exports = {
  createDonationDoc,
};
