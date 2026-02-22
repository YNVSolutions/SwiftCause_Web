const admin = require("firebase-admin");
const {stripe, getWebhookSecrets, ensureStripeInitialized} = require("../services/stripe");
const {createDonationDoc} = require("../entities/donation");
const {
  updateSubscriptionStatus,
  getSubscriptionByStripeId,
} = require("../entities/subscription");
const {isEventProcessed, markEventProcessed} = require("../shared/firestore");

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

  // Idempotency check
  if (await isEventProcessed(event.id)) {
    console.log("Event already processed:", event.id);
    return res.status(200).send("OK");
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    // Use entity to create donation
    await createDonationDoc({
      transactionId: paymentIntent.id,
      campaignId: paymentIntent.metadata.campaignId || null,
      organizationId: paymentIntent.metadata.organizationId || null,
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
      platform: paymentIntent.metadata.platform || "unknown",
    });

    // Mark event as processed
    await markEventProcessed(event.id, event.type, {
      paymentIntentId: paymentIntent.id,
    });
  }

  res.status(200).send("OK");
};

/**
 * Handle subscription lifecycle events
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @return {Promise<void>} Promise that resolves when complete
 */
const handleSubscriptionWebhook = async (req, res) => {
  let event;

  try {
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

  // Idempotency check
  if (await isEventProcessed(event.id)) {
    console.log("Event already processed:", event.id);
    return res.status(200).send("OK");
  }

  try {
    switch (event.type) {
      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await markEventProcessed(event.id, event.type, {
      objectId: event.data.object.id,
    });

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Webhook processing failed");
  }
};

/**
 * Handle invoice.paid - create recurring donation record
 * @param {object} invoice - Stripe invoice object
 * @return {Promise<void>}
 */
const handleInvoicePaid = async (invoice) => {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) {
    console.log("Invoice not associated with subscription:", invoice.id);
    return;
  }

  const subscriptionData = await getSubscriptionByStripeId(subscriptionId);
  if (!subscriptionData) {
    console.warn("Subscription not found in Firestore:", subscriptionId);
    return;
  }

  // Create donation record for this recurring payment
  await createDonationDoc({
    transactionId: invoice.payment_intent || invoice.id,
    campaignId: subscriptionData.campaignId,
    organizationId: subscriptionData.organizationId,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    donorEmail: subscriptionData.metadata?.donorEmail || null,
    donorName: subscriptionData.metadata?.donorName || "Anonymous",
    isRecurring: true,
    recurringInterval: subscriptionData.interval,
    subscriptionId: subscriptionId,
    invoiceId: invoice.id,
    platform: subscriptionData.metadata?.platform || "web",
  });

  console.log("Recurring donation recorded for invoice:", invoice.id);
};

/**
 * Handle invoice.payment_failed
 * @param {object} invoice - Stripe invoice object
 * @return {Promise<void>}
 */
const handleInvoicePaymentFailed = async (invoice) => {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  await updateSubscriptionStatus(subscriptionId, "past_due", {
    lastFailedInvoice: invoice.id,
    lastFailedAt: admin.firestore.Timestamp.now(),
  });

  console.log("Subscription payment failed:", subscriptionId);
};

/**
 * Handle customer.subscription.created
 * @param {object} subscription - Stripe subscription object
 * @return {Promise<void>}
 */
const handleSubscriptionCreated = async (subscription) => {
  const existing = await getSubscriptionByStripeId(subscription.id);
  if (!existing) {
    console.warn(
        "Subscription created webhook but no Firestore doc:",
        subscription.id,
    );
  } else {
    console.log("Subscription created confirmed:", subscription.id);
  }
};

/**
 * Handle customer.subscription.updated
 * @param {object} subscription - Stripe subscription object
 * @return {Promise<void>}
 */
const handleSubscriptionUpdated = async (subscription) => {
  await updateSubscriptionStatus(subscription.id, subscription.status, {
    currentPeriodEnd: admin.firestore.Timestamp.fromDate(
        new Date(subscription.current_period_end * 1000),
    ),
  });

  console.log("Subscription updated:", subscription.id, subscription.status);
};

/**
 * Handle customer.subscription.deleted
 * @param {object} subscription - Stripe subscription object
 * @return {Promise<void>}
 */
const handleSubscriptionDeleted = async (subscription) => {
  await updateSubscriptionStatus(subscription.id, "canceled", {
    canceledAt: admin.firestore.Timestamp.now(),
  });

  console.log("Subscription canceled:", subscription.id);
};

module.exports = {
  handleAccountUpdatedStripeWebhook,
  handlePaymentCompletedStripeWebhook,
  handleSubscriptionWebhook,
};
