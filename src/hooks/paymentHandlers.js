const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getPaymentConfig } = require("../services/settingsService");

exports.createPaymentIntent = async (data, context) => {

  const config = await getPaymentConfig();
  const currency = config.defaultCurrency || "usd";


  const paymentIntent = await stripe.paymentIntents.create({
    amount: data.amount,
    currency,
  });

  return { clientSecret: paymentIntent.client_secret };
};