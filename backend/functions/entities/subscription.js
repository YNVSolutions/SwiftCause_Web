const admin = require("firebase-admin");

/**
 * Convert value to Firestore Timestamp
 * @param {number|Date|object} value - Value to convert
 * @return {object} Firestore Timestamp
 */
const toFirestoreTimestamp = (value) => {
  if (!value) {
    return admin.firestore.Timestamp.now();
  }
  if (typeof value === "number") {
    // Unix timestamp in seconds, convert to milliseconds
    return admin.firestore.Timestamp.fromMillis(value * 1000);
  }
  if (value instanceof Date) {
    return admin.firestore.Timestamp.fromDate(value);
  }
  if (value.seconds !== undefined) {
    // Already a Firestore Timestamp-like object
    return admin.firestore.Timestamp.fromMillis(value.seconds * 1000);
  }
  return admin.firestore.Timestamp.now();
};

/**
 * Calculate next payment date based on interval
 * @param {number} currentPeriodEnd - Unix timestamp in seconds
 * @param {string} interval - Subscription interval (month/year)
 * @param {number} intervalCount - Number of intervals
 * @return {object} Firestore Timestamp
 */
const calculateNextPaymentAt = (currentPeriodEnd, interval, intervalCount) => {
  if (!currentPeriodEnd) {
    return null;
  }
  // currentPeriodEnd is already the next payment date from Stripe
  return toFirestoreTimestamp(currentPeriodEnd);
};

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
    currentPeriodStart,
    metadata = {},
  } = subscriptionData;

  const subscriptionRef = admin
      .firestore()
      .collection("subscriptions")
      .doc(stripeSubscriptionId);

  const now = admin.firestore.Timestamp.now();
  const periodEndTimestamp = toFirestoreTimestamp(currentPeriodEnd);
  const startedAtTimestamp = currentPeriodStart ?
    toFirestoreTimestamp(currentPeriodStart) :
    now;

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
    currentPeriodEnd: periodEndTimestamp,
    startedAt: startedAtTimestamp,
    lastPaymentAt: null,
    nextPaymentAt: calculateNextPaymentAt(
        currentPeriodEnd,
        interval,
        intervalCount,
    ),
    canceledAt: null,
    cancelReason: null,
    createdAt: now,
    updatedAt: now,
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
const updateSubscriptionStatus = async (
    stripeSubscriptionId,
    status,
    updates = {},
) => {
  const subscriptionRef = admin
      .firestore()
      .collection("subscriptions")
      .doc(stripeSubscriptionId);

  // Normalize timestamp fields in updates
  const normalizedUpdates = {...updates};
  if (normalizedUpdates.currentPeriodEnd) {
    normalizedUpdates.currentPeriodEnd = toFirestoreTimestamp(
        normalizedUpdates.currentPeriodEnd,
    );
  }
  if (normalizedUpdates.lastPaymentAt) {
    normalizedUpdates.lastPaymentAt = toFirestoreTimestamp(
        normalizedUpdates.lastPaymentAt,
    );
  }
  if (normalizedUpdates.nextPaymentAt) {
    normalizedUpdates.nextPaymentAt = toFirestoreTimestamp(
        normalizedUpdates.nextPaymentAt,
    );
  }
  if (normalizedUpdates.canceledAt) {
    normalizedUpdates.canceledAt = toFirestoreTimestamp(
        normalizedUpdates.canceledAt,
    );
  }

  const updateData = {
    status,
    updatedAt: admin.firestore.Timestamp.now(),
    ...normalizedUpdates,
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
  toFirestoreTimestamp,
  calculateNextPaymentAt,
};
