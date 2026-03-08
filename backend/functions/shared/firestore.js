const admin = require("firebase-admin");

/**
 * Atomically acquire a webhook event lock.
 * Returns false if the event already exists (already processing or processed).
 * @param {string} eventId - Stripe event ID
 * @param {string} eventType - Type of webhook event
 * @param {object} metadata - Additional metadata to store
 * @return {Promise<boolean>} True if acquired
 */
const claimWebhookEvent = async (eventId, eventType, metadata = {}) => {
  const eventRef = admin.firestore().collection("webhook_events").doc(eventId);
  return admin.firestore().runTransaction(async (tx) => {
    const snapshot = await tx.get(eventRef);

    if (!snapshot.exists) {
      tx.set(eventRef, {
        eventId,
        eventType,
        status: "processing",
        attempts: 1,
        claimedAt: admin.firestore.Timestamp.now(),
        ...metadata,
      });
      return true;
    }

    const data = snapshot.data() || {};
    if (data.status === "failed") {
      tx.set(eventRef, {
        status: "processing",
        attempts: (Number(data.attempts) || 1) + 1,
        claimedAt: admin.firestore.Timestamp.now(),
        ...metadata,
      }, {merge: true});
      return true;
    }

    return false;
  });
};

/**
 * Mark a claimed webhook event as processed.
 * @param {string} eventId - Stripe event ID
 * @param {object} metadata - Additional metadata to store
 * @return {Promise<void>}
 */
const markEventProcessed = async (eventId, metadata = {}) => {
  await admin.firestore().collection("webhook_events").doc(eventId).set({
    status: "processed",
    processedAt: admin.firestore.Timestamp.now(),
    ...metadata,
  }, {merge: true});
};

/**
 * Mark a claimed webhook event as failed.
 * @param {string} eventId - Stripe event ID
 * @param {string} message - Error message
 * @return {Promise<void>}
 */
const markEventFailed = async (eventId, message) => {
  await admin.firestore().collection("webhook_events").doc(eventId).set({
    status: "failed",
    failedAt: admin.firestore.Timestamp.now(),
    error: message || "unknown",
  }, {merge: true});
};

module.exports = {
  claimWebhookEvent,
  markEventProcessed,
  markEventFailed,
};
