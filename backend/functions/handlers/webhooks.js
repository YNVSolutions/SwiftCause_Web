const admin = require("firebase-admin");
const {stripe, getWebhookSecrets, ensureStripeInitialized} = require("../services/stripe");

/**
 * Handle Stripe account.updated webhook
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @return {Promise<void>} Promise that resolves when complete
 */
const handleAccountUpdatedStripeWebhook = async (req, res) => {
  let event;

  try {
    // Ensure Stripe is initialized
    const stripeClient = ensureStripeInitialized();
    
    const sig = req.headers["stripe-signature"];
    const {account: endpointSecretAccount} = getWebhookSecrets();
    event = stripeClient.webhooks.constructEvent(
        req.rawBody,
        sig,
        endpointSecretAccount,
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "account.updated") {
    const account = event.data.object;
    const orgId = account.metadata.orgId;

    if (orgId) {
      const chargesEnabled = account.charges_enabled;
      const payoutsEnabled = account.payouts_enabled;

      await admin
          .firestore()
          .collection("organizations")
          .doc(orgId)
          .set(
              {
                stripe: {
                  chargesEnabled: chargesEnabled,
                  payoutsEnabled: payoutsEnabled,
                },
              },
              {merge: true},
          );
      console.log(`Stripe account status updated for organization ${orgId}:
        Charges Enabled: ${chargesEnabled}, 
        Payouts Enabled: ${payoutsEnabled}`);
    } else {
      console.warn(
          "Received account.updated webhook without orgId in metadata.",
          account.id,
      );
    }
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send("OK");
};

/**
 * Handle Stripe payment_intent.succeeded webhook
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @return {Promise<void>} Promise that resolves when complete
 */
const handlePaymentCompletedStripeWebhook = async (req, res) => {
  let event;

  try {
    // Ensure Stripe is initialized
    const stripeClient = ensureStripeInitialized();
    
    const sig = req.headers["stripe-signature"];
    const {payment: endpointSecretPayment} = getWebhookSecrets();
    event = stripeClient.webhooks.constructEvent(
        req.rawBody,
        sig,
        endpointSecretPayment,
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    // Check if donation already exists (idempotency)
    const donationRef = admin.firestore().collection("donations").doc(paymentIntent.id);
    const existingDonation = await donationRef.get();
    
    if (existingDonation.exists) {
      console.log("Webhook retry ignored - donation already exists:", paymentIntent.id);
      res.status(200).send("OK");
      return;
    }

    const donationData = {
      campaignId: paymentIntent.metadata.campaignId || null,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      donorName: paymentIntent.metadata.donorName || "Anonymous",
      donorEmail: paymentIntent.metadata.donorEmail || null,
      donorPhone: paymentIntent.metadata.donorPhone || null,
      donorMessage: paymentIntent.metadata.donorMessage || null,
      isAnonymous: paymentIntent.metadata.isAnonymous === "true",
      isGiftAid: paymentIntent.metadata.isGiftAid === "true",
      isRecurring: paymentIntent.metadata.isRecurring === "true",
      recurringInterval: paymentIntent.metadata.recurringInterval || null,
      kioskId: paymentIntent.metadata.kioskId || null,
      transactionId: paymentIntent.id,
      timestamp: admin.firestore.Timestamp.now(),
      platform: paymentIntent.metadata.platform || "unknown",
      organizationId: paymentIntent.metadata.organizationId || null,
      paymentStatus: "success",
    };

    await donationRef.set(donationData);
    console.log("Donation stored for:", paymentIntent.id);

    const campaignId = paymentIntent.metadata.campaignId;
    if (campaignId) {
      const campaignRef = admin
          .firestore()
          .collection("campaigns")
          .doc(campaignId);
      await campaignRef.update({
        raised: admin.firestore.FieldValue.increment(paymentIntent.amount),
        donationCount: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.Timestamp.now(),
      });
      console.log("Campaign updated for donation:", campaignId);
    }
  }
  res.status(200).send("OK");
};

module.exports = {
  handleAccountUpdatedStripeWebhook,
  handlePaymentCompletedStripeWebhook,
};
