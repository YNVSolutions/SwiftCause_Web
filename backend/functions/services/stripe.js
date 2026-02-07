const {defineSecret} = require("firebase-functions/params");

// Define Stripe secrets
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecretAccount = defineSecret("STRIPE_WEBHOOK_SECRET_ACCOUNT");
const stripeWebhookSecretPayment = defineSecret("STRIPE_WEBHOOK_SECRET_PAYMENT");

/**
 * Get Stripe client instance
 * Must be called within a function that has stripeSecretKey bound
 */
const getStripeClient = () => {
  const Stripe = require("stripe");
  return Stripe(stripeSecretKey.value());
};

module.exports = {
  getStripeClient,
  stripeSecretKey,
  stripeWebhookSecretAccount,
  stripeWebhookSecretPayment,
};
