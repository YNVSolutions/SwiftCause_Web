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
    intervalCount = 1,
    amount,
    currency = "usd",
    status,
    currentPeriodEnd,
    startedAt = null,
    lastPaymentAt = null,
    nextPaymentAt = null,
    cancelReason = null,
    metadata = {},
  } = subscriptionData;

  const subscriptionRef = admin
      .firestore()
      .collection("subscriptions")
      .doc(stripeSubscriptionId);

  // Convert currentPeriodEnd to Firestore Timestamp
  // currentPeriodEnd is a Unix timestamp in seconds from Stripe
  let periodEndTimestamp;
  if (typeof currentPeriodEnd === 'number') {
    // It's a Unix timestamp in seconds, convert to milliseconds then to Timestamp
    periodEndTimestamp = admin.firestore.Timestamp.fromMillis(currentPeriodEnd * 1000);
  } else if (currentPeriodEnd instanceof Date) {
    // It's already a Date object
    periodEndTimestamp = admin.firestore.Timestamp.fromDate(currentPeriodEnd);
  } else {
    // Fallback to current time
    periodEndTimestamp = admin.firestore.Timestamp.now();
  }

  const toTimestampOrNull = (value) => {
    if (!value) return null;
    if (typeof value === "number") {
      return admin.firestore.Timestamp.fromMillis(value * 1000);
    }
    if (value instanceof Date) {
      return admin.firestore.Timestamp.fromDate(value);
    }
    return null;
  };

  const startedAtTimestamp = toTimestampOrNull(startedAt);
  const lastPaymentAtTimestamp = toTimestampOrNull(lastPaymentAt);
  const nextPaymentAtTimestamp = toTimestampOrNull(nextPaymentAt);

  await subscriptionRef.set({
    stripeSubscriptionId,
    customerId,
    campaignId,
    organizationId,
    interval,
    intervalCount,
    amount,
    currency,
    status,
    donorEmail: metadata.donorEmail || null,
    donorName: metadata.donorName || null,
    donorPhone: metadata.donorPhone || null,
    startedAt: startedAtTimestamp,
    lastPaymentAt: lastPaymentAtTimestamp,
    nextPaymentAt: nextPaymentAtTimestamp || periodEndTimestamp,
    cancelReason: cancelReason || null,
    currentPeriodEnd: periodEndTimestamp,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    metadata: metadata,
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
