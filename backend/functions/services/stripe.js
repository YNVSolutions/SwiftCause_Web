const dotenv = require("dotenv");
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const getWebhookSecrets = () => ({
  account: process.env.STRIPE_WEBHOOK_SECRET_ACCOUNT,
  payment: process.env.STRIPE_WEBHOOK_SECRET_PAYMENT,
});

module.exports = {
  stripe,
  getWebhookSecrets,
};
