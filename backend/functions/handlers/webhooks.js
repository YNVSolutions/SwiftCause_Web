const admin = require("firebase-admin");
const {
  stripe,
  getWebhookSecrets,
  ensureStripeInitialized,
  verifyWebhookSignatureWithAnySecret,
} = require("../services/stripe");
const {createDonationDoc} = require("../entities/donation");
const {
  updateSubscriptionStatus,
  getSubscriptionByStripeId,
} = require("../entities/subscription");
const {
  claimWebhookEvent,
  markEventProcessed,
  markEventFailed,
} = require("../shared/firestore");

const DEFAULT_GIFT_AID_DECLARATION_TEXT = "I confirm I have paid enough UK Income or Capital Gains Tax to cover all my Gift Aid donations in this tax year.";

const toBoolean = (value) => value === true || value === "true" || value === "1";

const toStringOrNull = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const parseIsoDate = (value) => {
  const normalized = toStringOrNull(value);
  if (!normalized) return null;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const getDonationDateFromPaymentIntent = (paymentIntent, metadata) => {
  const metadataDonationDate = parseIsoDate(metadata.giftAidDonationDate);
  if (metadataDonationDate) return metadataDonationDate;
  if (typeof paymentIntent.created === "number") {
    return new Date(paymentIntent.created * 1000).toISOString();
  }
  return new Date().toISOString();
};

const getTaxYear = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const startYear = month >= 3 ? year : year - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYearShort}`;
};

const createGiftAidDeclarationIfNeeded = async ({
  paymentIntent,
  metadata,
  campaignId,
  campaignTitleSnapshot,
  organizationId,
}) => {
  const isGiftAid = toBoolean(metadata.isGiftAid);
  if (!isGiftAid) return;

  const donationId = paymentIntent.id;
  const giftAidRef = admin.firestore().collection("giftAidDeclarations").doc(donationId);
  const existingGiftAid = await giftAidRef.get();

  if (existingGiftAid.exists) {
    return;
  }

  const donorFirstName = toStringOrNull(metadata.giftAidFirstName);
  const donorSurname = toStringOrNull(metadata.giftAidSurname);
  const donorName = toStringOrNull(metadata.donorName);
  const parsedNames = donorName ? donorName.split(" ").filter(Boolean) : [];
  const fallbackFirstName = parsedNames[0] || "Anonymous";
  const fallbackSurname = parsedNames.slice(1).join(" ") || "Donor";

  const donationDate = getDonationDateFromPaymentIntent(paymentIntent, metadata);
  const declarationDate = parseIsoDate(metadata.giftAidDeclarationDate) || donationDate;
  const now = new Date().toISOString();
  const resolvedOrganizationId =
    toStringOrNull(organizationId) ||
    toStringOrNull(metadata.giftAidOrganizationId) ||
    toStringOrNull(metadata.organizationId) ||
    null;

  const giftAidData = {
    id: donationId,
    donationId,
    donorFirstName: donorFirstName || fallbackFirstName,
    donorSurname: donorSurname || fallbackSurname,
    donorHouseNumber: toStringOrNull(metadata.giftAidHouseNumber) || "",
    donorAddressLine1: toStringOrNull(metadata.giftAidAddressLine1) || "",
    donorAddressLine2: toStringOrNull(metadata.giftAidAddressLine2) || "",
    donorTown: toStringOrNull(metadata.giftAidTown) || "",
    donorPostcode: toStringOrNull(metadata.giftAidPostcode) || "",
    declarationText:
      toStringOrNull(metadata.giftAidDeclarationText) ||
      DEFAULT_GIFT_AID_DECLARATION_TEXT,
    declarationDate,
    ukTaxpayerConfirmation: toBoolean(metadata.giftAidTaxpayer),
    donationAmount: paymentIntent.amount,
    giftAidAmount: Math.round(paymentIntent.amount * 0.25),
    campaignId: campaignId || null,
    campaignTitle: campaignTitleSnapshot || "Deleted Campaign",
    organizationId: resolvedOrganizationId,
    donationDate,
    taxYear:
      toStringOrNull(metadata.giftAidTaxYear) ||
      getTaxYear(donationDate) ||
      "unknown",
    giftAidStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await giftAidRef.set(giftAidData);
};

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
    event = verifyWebhookSignatureWithAnySecret(
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
    event = verifyWebhookSignatureWithAnySecret(
        req.rawBody,
        sig,
        endpointSecretPayment,
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Atomic idempotency claim
  const claimed = await claimWebhookEvent(event.id, event.type, {
    objectId: event.data?.object?.id || null,
  });
  if (!claimed) {
    console.log("Event already claimed/processed:", event.id);
    return res.status(200).send("OK");
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata || {};
      const campaignId = toStringOrNull(metadata.campaignId);
      let resolvedCampaignId = campaignId;
      let organizationId = toStringOrNull(metadata.organizationId);
      let campaignTitleSnapshot = toStringOrNull(metadata.campaignTitle) || "Deleted Campaign";
      let campaignExists = false;
      let resolvedIsRecurring = toBoolean(metadata.isRecurring);
      let resolvedRecurringInterval = toStringOrNull(metadata.recurringInterval);
      let resolvedSubscriptionId = toStringOrNull(metadata.subscriptionId);
      let resolvedInvoiceId = toStringOrNull(paymentIntent.invoice);
      let resolvedDonorName = toStringOrNull(metadata.donorName) || "Anonymous";
      let resolvedDonorEmail = toStringOrNull(metadata.donorEmail);
      let resolvedDonorPhone = toStringOrNull(metadata.donorPhone);
      let resolvedPlatform = toStringOrNull(metadata.platform) || "unknown";

      if (campaignId) {
        const campaignRef = admin.firestore().collection("campaigns").doc(campaignId);
        const campaignSnap = await campaignRef.get();

        if (campaignSnap.exists) {
          campaignExists = true;
          const campaignData = campaignSnap.data() || {};
          campaignTitleSnapshot =
            toStringOrNull(campaignData.title) || campaignTitleSnapshot;
          organizationId =
            toStringOrNull(campaignData.organizationId) || organizationId;
        } else {
          console.warn("Campaign not found for payment intent:", paymentIntent.id, campaignId);
        }
      }

      // Enrich recurring signals for subscription-driven payment intents.
      // Some first-invoice payment_intent payloads don't carry recurring metadata directly.
      if (resolvedInvoiceId) {
        try {
          const invoice = await stripeClient.invoices.retrieve(resolvedInvoiceId);
          const stripeSubscriptionId = typeof invoice.subscription === "string" ?
            invoice.subscription :
            null;

          if (stripeSubscriptionId) {
            resolvedIsRecurring = true;
            resolvedSubscriptionId = stripeSubscriptionId;

            const subscriptionData = await getSubscriptionByStripeId(stripeSubscriptionId);
            if (subscriptionData) {
              resolvedRecurringInterval = subscriptionData.interval === "year" ?
                "yearly" :
                subscriptionData.intervalCount === 3 ?
                  "quarterly" :
                  "monthly";
              resolvedCampaignId =
                toStringOrNull(subscriptionData.campaignId) ||
                resolvedCampaignId;

              campaignTitleSnapshot =
                toStringOrNull(subscriptionData.metadata?.campaignTitle) ||
                campaignTitleSnapshot;
              organizationId =
                toStringOrNull(subscriptionData.organizationId) ||
                organizationId;
              resolvedDonorName =
                toStringOrNull(subscriptionData.donorName) ||
                toStringOrNull(subscriptionData.metadata?.donorName) ||
                resolvedDonorName;
              resolvedDonorEmail =
                toStringOrNull(subscriptionData.donorEmail) ||
                toStringOrNull(subscriptionData.metadata?.donorEmail) ||
                resolvedDonorEmail;
              resolvedDonorPhone =
                toStringOrNull(subscriptionData.donorPhone) ||
                toStringOrNull(subscriptionData.metadata?.donorPhone) ||
                resolvedDonorPhone;
              resolvedPlatform =
                toStringOrNull(subscriptionData.metadata?.platform) ||
                resolvedPlatform;
            }
          }
        } catch (invoiceLookupError) {
          console.warn("Unable to enrich recurring metadata for payment intent:", paymentIntent.id, invoiceLookupError.message);
        }
      }

      // Use entity to create donation with recurring support
      await createDonationDoc({
        transactionId: paymentIntent.id,
        campaignId: resolvedCampaignId || null,
        organizationId: organizationId || null,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        donorName: resolvedDonorName,
        donorEmail: resolvedDonorEmail,
        donorPhone: resolvedDonorPhone,
        donorMessage: toStringOrNull(metadata.donorMessage),
        isAnonymous: toBoolean(metadata.isAnonymous),
        isGiftAid: toBoolean(metadata.isGiftAid),
        isRecurring: resolvedIsRecurring,
        recurringInterval: resolvedRecurringInterval,
        subscriptionId: resolvedSubscriptionId,
        invoiceId: resolvedInvoiceId,
        kioskId: toStringOrNull(metadata.kioskId),
        platform: resolvedPlatform,
        metadata: {
          campaignTitleSnapshot,
          source: "stripe_webhook",
        },
      });

      // Create Gift Aid declaration if needed
      await createGiftAidDeclarationIfNeeded({
        paymentIntent,
        metadata,
        campaignId: resolvedCampaignId,
        campaignTitleSnapshot,
        organizationId,
      });

      await markEventProcessed(event.id, {
        paymentIntentId: paymentIntent.id,
      });
    } else {
      await markEventProcessed(event.id, {
        message: "Unhandled in payment endpoint",
      });
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing payment webhook:", error);
    await markEventFailed(event.id, error.message);
    res.status(500).send("Webhook processing failed");
  }
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

    event = verifyWebhookSignatureWithAnySecret(
        req.rawBody,
        sig,
        endpointSecretPayment,
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Atomic idempotency claim
  const claimed = await claimWebhookEvent(event.id, event.type, {
    objectId: event.data?.object?.id || null,
  });
  if (!claimed) {
    console.log("Event already claimed/processed:", event.id);
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
    await markEventProcessed(event.id, {
      objectId: event.data.object.id,
    });

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing webhook:", error);
    await markEventFailed(event.id, error.message);
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

  // Map interval back to UI format for consistency
  const recurringInterval =
    subscriptionData.interval === "year" ?
      "yearly" :
      subscriptionData.intervalCount === 3 ?
        "quarterly" :
        "monthly";

  // Create donation record for this recurring payment
  await createDonationDoc({
    transactionId: invoice.payment_intent || invoice.id,
    campaignId: subscriptionData.campaignId,
    organizationId: subscriptionData.organizationId,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    donorEmail: subscriptionData.donorEmail ||
      subscriptionData.metadata?.donorEmail ||
      null,
    donorName: subscriptionData.donorName ||
      subscriptionData.metadata?.donorName ||
      "Anonymous",
    donorPhone: subscriptionData.donorPhone ||
      subscriptionData.metadata?.donorPhone ||
      null,
    isGiftAid: toBoolean(subscriptionData.metadata?.isGiftAid),
    isRecurring: true,
    recurringInterval: recurringInterval,
    subscriptionId: subscriptionId,
    invoiceId: invoice.id,
    platform: subscriptionData.metadata?.platform || "web",
    metadata: {
      campaignTitleSnapshot:
        subscriptionData.metadata?.campaignTitle || "Recurring Donation",
      source: "stripe_webhook_recurring",
    },
  });

  // Ensure Gift Aid declarations are also created for recurring payments when metadata includes Gift Aid details.
  await createGiftAidDeclarationIfNeeded({
    paymentIntent: {
      id: invoice.payment_intent || invoice.id,
      amount: invoice.amount_paid,
      created: invoice.created,
    },
    metadata: subscriptionData.metadata || {},
    campaignId: subscriptionData.campaignId,
    campaignTitleSnapshot:
      subscriptionData.metadata?.campaignTitle || "Recurring Donation",
    organizationId: subscriptionData.organizationId,
  });

  // Update subscription analytics: lastPaymentAt
  await updateSubscriptionStatus(subscriptionId, "active", {
    lastPaymentAt: admin.firestore.Timestamp.fromDate(
        new Date((invoice.status_transitions?.paid_at || invoice.created) * 1000),
    ),
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

  const updated = await updateSubscriptionStatus(subscriptionId, "past_due", {
    lastFailedInvoice: invoice.id,
    lastFailedAt: admin.firestore.Timestamp.now(),
  });

  if (!updated) {
    console.warn("Skipping payment_failed update for missing subscription:", subscriptionId);
    return;
  }

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
  const stripeClient = ensureStripeInitialized();
  let effectiveSubscription = subscription;

  if (!(typeof subscription.current_period_end === "number" &&
      Number.isFinite(subscription.current_period_end))) {
    try {
      effectiveSubscription = await stripeClient.subscriptions.retrieve(subscription.id);
    } catch (error) {
      console.warn(
          "Failed to fetch full subscription for update event:",
          subscription.id,
          error.message,
      );
    }
  }

  const updateFields = {};
  if (typeof effectiveSubscription.current_period_end === "number" &&
      Number.isFinite(effectiveSubscription.current_period_end)) {
    const nextPaymentAt = admin.firestore.Timestamp.fromDate(
        new Date(effectiveSubscription.current_period_end * 1000),
    );
    updateFields.currentPeriodEnd = nextPaymentAt;
    updateFields.nextPaymentAt = nextPaymentAt;
  } else {
    console.warn(
        "subscription.updated missing current_period_end, updating status only:",
        effectiveSubscription.id || subscription.id,
    );
  }

  const updated = await updateSubscriptionStatus(
      effectiveSubscription.id || subscription.id,
      effectiveSubscription.status || subscription.status || "active",
      updateFields,
  );

  if (!updated) {
    console.warn("Skipping subscription.updated for missing subscription:", subscription.id);
    return;
  }

  console.log("Subscription updated:", subscription.id, subscription.status);
};


/**
 * Handle customer.subscription.deleted
 * @param {object} subscription - Stripe subscription object
 * @return {Promise<void>}
 */
const handleSubscriptionDeleted = async (subscription) => {
  const cancellationDetails = subscription.cancellation_details || {};
  const cancelReason =
    cancellationDetails.reason ||
    cancellationDetails.feedback ||
    cancellationDetails.comment ||
    subscription.metadata?.cancelReason ||
    "unknown";

  const updated = await updateSubscriptionStatus(subscription.id, "canceled", {
    canceledAt: subscription.canceled_at ?
      admin.firestore.Timestamp.fromDate(new Date(subscription.canceled_at * 1000)) :
      admin.firestore.Timestamp.now(),
    cancelReason: cancelReason,
  });

  if (!updated) {
    console.warn("Skipping subscription.deleted for missing subscription:", subscription.id);
    return;
  }

  console.log("Subscription canceled:", subscription.id);
};

module.exports = {
  handleAccountUpdatedStripeWebhook,
  handlePaymentCompletedStripeWebhook,
  handleSubscriptionWebhook,
};
