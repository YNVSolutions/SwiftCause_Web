const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// Import secrets from services/utils
const {stripeSecretKey} = require("./services/stripe");
const {recaptchaSecretKey} = require("./utils/recaptcha");

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

// Export v2 functions with appropriate secrets

// User management functions (no secrets needed - just auth)
exports.createUser = onRequest(createUser);
exports.updateUser = onRequest(updateUser);
exports.deleteUser = onRequest(deleteUser);

// Webhook handlers (already exported as v2 functions with secrets)
exports.handleAccountUpdatedStripeWebhook = handleAccountUpdatedStripeWebhook;
exports.handlePaymentCompletedStripeWebhook = handlePaymentCompletedStripeWebhook;

// Payment functions (need Stripe secret)
exports.createOnboardingLink = onRequest(
    {secrets: [stripeSecretKey]},
    createOnboardingLink,
);

exports.createKioskPaymentIntent = onRequest(
    {secrets: [stripeSecretKey]},
    createKioskPaymentIntent,
);

exports.createPaymentIntent = onRequest(
    {secrets: [stripeSecretKey]},
    createPaymentIntent,
);

exports.createExpressDashboardLink = onRequest(
    {secrets: [stripeSecretKey]},
    createExpressDashboardLink,
);

// Firestore trigger (already exported as v2 function with secrets)
exports.createStripeAccountForNewOrg = createStripeAccountForNewOrg;

// Kiosk login (no secrets needed - just Firestore)
exports.kioskLogin = onRequest(kioskLogin);

// Signup verification (needs reCAPTCHA secret)
exports.verifySignupRecaptcha = onRequest(
    {secrets: [recaptchaSecretKey]},
    verifySignupRecaptcha,
);
