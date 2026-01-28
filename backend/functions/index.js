const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// Import handlers
const {createUser, updateUser, deleteUser} = require("./handlers/users");
const {
  handleAccountUpdatedStripeWebhook,
  handlePaymentCompletedStripeWebhook,
} = require("./handlers/webhooks");
const {
  createOnboardingLink,
  createKioskPaymentIntent,
  createPaymentIntent,
  createExpressDashboardLink,
} = require("./handlers/payments");
const {createStripeAccountForNewOrg} = require("./handlers/triggers");

// Export all functions (backwards compatible)
exports.createUser = functions.https.onRequest(createUser);
exports.updateUser = functions.https.onRequest(updateUser);
exports.deleteUser = functions.https.onRequest(deleteUser);
exports.handleAccountUpdatedStripeWebhook = functions.https.onRequest(
    handleAccountUpdatedStripeWebhook,
);
exports.handlePaymentCompletedStripeWebhook = functions.https.onRequest(
    handlePaymentCompletedStripeWebhook,
);
exports.createOnboardingLink = functions.https.onRequest(createOnboardingLink);
exports.createKioskPaymentIntent = functions.https.onRequest(
    createKioskPaymentIntent,
);
exports.createPaymentIntent = functions.https.onRequest(createPaymentIntent);
exports.createExpressDashboardLink = functions.https.onRequest(
    createExpressDashboardLink,
);
exports.createStripeAccountForNewOrg = createStripeAccountForNewOrg;
