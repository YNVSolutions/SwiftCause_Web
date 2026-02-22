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

/**
 * Get or create Stripe customer by email
 * @param {string} email - Customer email
 * @param {object} metadata - Additional customer metadata
 * @return {Promise<object>} Stripe customer object
 */
const getOrCreateCustomerByEmail = async (email, metadata = {}) => {
  const stripeClient = ensureStripeInitialized();
  
  // Search for existing customer
  const customers = await stripeClient.customers.list({
    email: email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  return await stripeClient.customers.create({
    email,
    metadata,
  });
};

/**
 * Get recurring price by interval for a product
 * @param {string} productId - Stripe product ID
 * @param {string} interval - Billing interval (month, year)
 * @return {Promise<object|null>} Stripe price object or null
 */
const getRecurringPriceByInterval = async (productId, interval) => {
  const stripeClient = ensureStripeInitialized();
  
  const prices = await stripeClient.prices.list({
    product: productId,
    active: true,
    type: "recurring",
  });

  return prices.data.find(
      (price) => price.recurring && price.recurring.interval === interval,
  ) || null;
};

/**
 * Create Stripe subscription
 * @param {object} params - Subscription parameters
 * @return {Promise<object>} Stripe subscription object
 */
const createStripeSubscription = async ({
  customerId,
  priceId,
  quantity = 1,
  metadata = {},
  stripeAccountId = null,
  paymentMethodId = null,
}) => {
  const stripeClient = ensureStripeInitialized();
  
  const subscriptionParams = {
    customer: customerId,
    items: [{price: priceId, quantity}],
    metadata,
    expand: ["latest_invoice.payment_intent"],
    collection_method: "charge_automatically",
  };

  if (stripeAccountId) {
    subscriptionParams.transfer_data = {destination: stripeAccountId};
  }

  if (paymentMethodId) {
    subscriptionParams.default_payment_method = paymentMethodId;
  }

  return await stripeClient.subscriptions.create(subscriptionParams);
};

/**
 * Verify webhook signature
 * @param {Buffer} rawBody - Raw request body
 * @param {string} signature - Stripe signature header
 * @param {string} secret - Webhook secret
 * @return {object} Verified Stripe event
 */
const verifyWebhookSignature = (rawBody, signature, secret) => {
  const stripeClient = ensureStripeInitialized();
  return stripeClient.webhooks.constructEvent(rawBody, signature, secret);
};

module.exports = {
  stripe,
  getWebhookSecrets,
  ensureStripeInitialized,
  getOrCreateCustomerByEmail,
  getRecurringPriceByInterval,
  createStripeSubscription,
  verifyWebhookSignature,
};
