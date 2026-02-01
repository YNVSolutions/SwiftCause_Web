const dotenv = require("dotenv");
dotenv.config();

// Initialize Stripe only if API key is available
let stripe = null;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (stripeSecretKey) {
  stripe = require("stripe")(stripeSecretKey);
} else {
  console.warn("STRIPE_SECRET_KEY not found. Stripe functionality will be disabled.");
}

const getWebhookSecrets = () => ({
  account: process.env.STRIPE_WEBHOOK_SECRET_ACCOUNT,
  payment: process.env.STRIPE_WEBHOOK_SECRET_PAYMENT,
});

// Helper to check if Stripe is initialized
const ensureStripeInitialized = () => {
  if (!stripe) {
    throw new Error("Stripe is not initialized. Please configure STRIPE_SECRET_KEY.");
  }
  return stripe;
};

module.exports = {
  stripe,
  getWebhookSecrets,
  ensureStripeInitialized,
};
