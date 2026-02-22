const admin = require("firebase-admin");

/**
 * Check if webhook event has already been processed (idempotency)
 * @param {string} eventId - Stripe event ID
 * @return {Promise<boolean>} True if event was already processed
 */
const isEventProcessed = async (eventId) => {
  const eventRef = admin.firestore().collection("webhook_events").doc(eventId);
  const doc = await eventRef.get();
  return doc.exists;
};

/**
 * Mark webhook event as processed
 * @param {string} eventId - Stripe event ID
 * @param {string} eventType - Type of webhook event
 * @param {object} metadata - Additional metadata to store
 * @return {Promise<void>}
 */
const markEventProcessed = async (eventId, eventType, metadata = {}) => {
  await admin.firestore().collection("webhook_events").doc(eventId).set({
    eventId,
    eventType,
    processedAt: admin.firestore.Timestamp.now(),
    ...metadata,
  });
};

module.exports = {
  isEventProcessed,
  markEventProcessed,
};
