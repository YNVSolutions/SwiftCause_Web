const functions = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// Define secrets for v2 functions
const recaptchaSecretKey = defineSecret("RECAPTCHA_SECRET_KEY");

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
const {verifySignupRecaptcha} = require("./handlers/signup");
const {kioskLogin} = require("./handlers/kiosk");
const {sendEmail} = require("./services/sendgrid");

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
exports.kioskLogin = functions.https.onRequest(kioskLogin);

// Export SendGrid email function
exports.sendEmail = sendEmail;

// Export v2 function with secret
exports.verifySignupRecaptcha = onRequest(
    {secrets: [recaptchaSecretKey]},
    verifySignupRecaptcha,
);
