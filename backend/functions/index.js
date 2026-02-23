const functions = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// Define secrets for v2 functions
const recaptchaSecretKey = defineSecret("RECAPTCHA_SECRET_KEY");
const sendgridApiKey = defineSecret("SENDGRID_API_KEY");
const sendgridFromEmail = defineSecret("SENDGRID_FROM_EMAIL");
const sendgridFromName = defineSecret("SENDGRID_FROM_NAME");

// Import handlers
const {createUser, updateUser, deleteUser} = require("./handlers/users");
const {sendDonationThankYouEmail} = require("./handlers/email");
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
const {
  createStripeAccountForNewOrg,
  sendWelcomeEmailForNewOrg,
} = require("./handlers/triggers");
const {verifySignupRecaptcha} = require("./handlers/signup");
const {kioskLogin} = require("./handlers/kiosk");

// Export all functions (backwards compatible)
exports.createUser = functions.https.onRequest(createUser);
exports.updateUser = functions.https.onRequest(updateUser);
exports.deleteUser = functions.https.onRequest(deleteUser);
exports.sendDonationThankYouEmail = onRequest(
    {secrets: [sendgridApiKey, sendgridFromEmail, sendgridFromName]},
    sendDonationThankYouEmail,
);
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
exports.sendWelcomeEmailForNewOrg = sendWelcomeEmailForNewOrg;
exports.kioskLogin = functions.https.onRequest(kioskLogin);

// Export v2 function with secret
exports.verifySignupRecaptcha = onRequest(
    {secrets: [recaptchaSecretKey]},
    verifySignupRecaptcha,
);
