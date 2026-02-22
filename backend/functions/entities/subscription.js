const admin = require("firebase-admin");

/**
 * Create subscription document in Firestore
 * @param {object} subscriptionData - Subscription data
 * @return {Promise<object>} Firestore document reference
 */
const createSubscriptionDoc = async (subscriptionData) => {
  const {
    stripeSubscriptionId,
    customerId,
    campaignId,
    organizationId,
    interval,
    amount,
    currency = "usd",
    status,
    currentPeriodEnd,
    metadata = {},
  } = subscriptionData;

  const subscriptionRef = admin
      .firestore()
      .collection("subscriptions")
      .doc(stripeSubscriptionId);

  await subscriptionRef.set({
    stripeSubscriptionId,
    customerId,
    campaignId,
    organizationId,
    interval,
    amount,
    currency,
    status,
    currentPeriodEnd: admin.firestore.Timestamp.fromDate(
        new Date(currentPeriodEnd * 1000),
    ),
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    ...metadata,
  });

  console.log("Subscription document created:", stripeSubscriptionId);
  return subscriptionRef;
};

/**
 * Update subscription status
 * @param {string} stripeSubscriptionId - Stripe subscription ID
 * @param {string} status - New status
 * @param {object} updates - Additional fields to update
 * @return {Promise<void>}
 */
const updateSubscriptionStatus = async (stripeSubscriptionId, status, updates = {}) => {
  const subscriptionRef = admin
      .firestore()
      .collection("subscriptions")
      .doc(stripeSubscriptionId);

  const updateData = {
    status,
    updatedAt: admin.firestore.Timestamp.now(),
    ...updates,
  };

  await subscriptionRef.update(updateData);
  console.log("Subscription status updated:", stripeSubscriptionId, status);
};

/**
 * Get subscription by Stripe ID
 * @param {string} stripeSubscriptionId - Stripe subscription ID
 * @return {Promise<object|null>} Subscription data or null
 */
const getSubscriptionByStripeId = async (stripeSubscriptionId) => {
  const doc = await admin
      .firestore()
      .collection("subscriptions")
      .doc(stripeSubscriptionId)
      .get();

  return doc.exists ? {id: doc.id, ...doc.data()} : null;
};

module.exports = {
  createSubscriptionDoc,
  updateSubscriptionStatus,
  getSubscriptionByStripeId,
};
