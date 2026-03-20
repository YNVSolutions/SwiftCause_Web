const admin = require('firebase-admin');
const { ensureStripeInitialized } = require('../services/stripe');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const toStringOrNull = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toBoolean = (value) => value === true || value === 'true' || value === '1';

const deriveRecurringInterval = (subscription) => {
  if (!subscription) return null;
  if (subscription.interval === 'year') return 'yearly';
  if (subscription.intervalCount === 3) return 'quarterly';
  return 'monthly';
};

const looksRecurring = (donation) => {
  if (donation.isRecurring === true) return true;
  if (toStringOrNull(donation.subscriptionId)) return true;
  if (toStringOrNull(donation.recurringInterval)) return true;
  if (toStringOrNull(donation.invoiceId)) return true;
  if (toStringOrNull(donation.source) === 'stripe_webhook_recurring') return true;
  return false;
};

const loadSubscriptionsMap = async () => {
  const snapshot = await db.collection('subscriptions').get();
  const map = new Map();
  snapshot.forEach((doc) => {
    map.set(doc.id, doc.data());
  });
  return map;
};

const resolveSubscriptionFromStripe = async (donation, stripeClient) => {
  if (!stripeClient) return { subscriptionId: null, invoiceId: null };

  try {
    const existingInvoiceId = toStringOrNull(donation.invoiceId);
    if (existingInvoiceId) {
      const invoice = await stripeClient.invoices.retrieve(existingInvoiceId);
      const invoiceSub = toStringOrNull(invoice.subscription);
      return {
        subscriptionId: invoiceSub,
        invoiceId: existingInvoiceId,
      };
    }

    const transactionId = toStringOrNull(donation.transactionId) || toStringOrNull(donation.id);
    if (!transactionId) return { subscriptionId: null, invoiceId: null };

    if (transactionId.startsWith('in_')) {
      const invoice = await stripeClient.invoices.retrieve(transactionId);
      return {
        subscriptionId: toStringOrNull(invoice.subscription),
        invoiceId: transactionId,
      };
    }

    if (transactionId.startsWith('pi_')) {
      const paymentIntent = await stripeClient.paymentIntents.retrieve(transactionId);
      const invoiceId = toStringOrNull(paymentIntent.invoice);
      if (!invoiceId) return { subscriptionId: null, invoiceId: null };

      const invoice = await stripeClient.invoices.retrieve(invoiceId);
      return {
        subscriptionId: toStringOrNull(invoice.subscription),
        invoiceId,
      };
    }
  } catch (error) {
    console.warn(
      'Stripe lookup failed for donation:',
      donation.transactionId || donation.id,
      error.message,
    );
  }

  return { subscriptionId: null, invoiceId: null };
};

const backfillDonations = async (subscriptionsMap, stripeClient) => {
  const donationsSnap = await db.collection('donations').get();
  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  let unresolved = 0;

  let batch = db.batch();
  let batchOps = 0;

  for (const doc of donationsSnap.docs) {
    scanned += 1;
    const donation = doc.data() || {};

    if (!looksRecurring(donation)) {
      skipped += 1;
      continue;
    }

    let subscriptionId = toStringOrNull(donation.subscriptionId);
    let resolvedInvoiceId = toStringOrNull(donation.invoiceId);
    let subscription = subscriptionId ? subscriptionsMap.get(subscriptionId) : null;

    if (!subscription) {
      const recovered = await resolveSubscriptionFromStripe(donation, stripeClient);
      if (recovered.subscriptionId) {
        subscriptionId = recovered.subscriptionId;
        resolvedInvoiceId = resolvedInvoiceId || recovered.invoiceId;
        subscription = subscriptionsMap.get(subscriptionId) || null;
      }
    }

    if (!subscription) {
      unresolved += 1;
      continue;
    }

    const updates = {};
    const resolvedCampaignId =
      toStringOrNull(donation.campaignId) || toStringOrNull(subscription.campaignId);
    const resolvedOrganizationId =
      toStringOrNull(donation.organizationId) || toStringOrNull(subscription.organizationId);
    const resolvedInterval =
      toStringOrNull(donation.recurringInterval) || deriveRecurringInterval(subscription);
    const resolvedDonorName =
      toStringOrNull(donation.donorName) ||
      toStringOrNull(subscription.donorName) ||
      toStringOrNull(subscription.metadata?.donorName);
    const resolvedDonorEmail =
      toStringOrNull(donation.donorEmail) ||
      toStringOrNull(subscription.donorEmail) ||
      toStringOrNull(subscription.metadata?.donorEmail);
    const resolvedDonorPhone =
      toStringOrNull(donation.donorPhone) ||
      toStringOrNull(subscription.donorPhone) ||
      toStringOrNull(subscription.metadata?.donorPhone);
    const resolvedPlatform =
      toStringOrNull(donation.platform) || toStringOrNull(subscription.metadata?.platform);
    const resolvedCampaignTitle =
      toStringOrNull(donation.campaignTitleSnapshot) ||
      toStringOrNull(subscription.metadata?.campaignTitle);
    const resolvedGiftAid = toBoolean(subscription.metadata?.isGiftAid);

    if (donation.isRecurring !== true) updates.isRecurring = true;
    if (!toStringOrNull(donation.subscriptionId) && subscriptionId)
      updates.subscriptionId = subscriptionId;
    if (!toStringOrNull(donation.invoiceId) && resolvedInvoiceId)
      updates.invoiceId = resolvedInvoiceId;
    if (!toStringOrNull(donation.recurringInterval) && resolvedInterval)
      updates.recurringInterval = resolvedInterval;
    if (!toStringOrNull(donation.campaignId) && resolvedCampaignId)
      updates.campaignId = resolvedCampaignId;
    if (!toStringOrNull(donation.organizationId) && resolvedOrganizationId)
      updates.organizationId = resolvedOrganizationId;
    if (!toStringOrNull(donation.donorName) && resolvedDonorName)
      updates.donorName = resolvedDonorName;
    if (!toStringOrNull(donation.donorEmail) && resolvedDonorEmail)
      updates.donorEmail = resolvedDonorEmail;
    if (!toStringOrNull(donation.donorPhone) && resolvedDonorPhone)
      updates.donorPhone = resolvedDonorPhone;
    if (!toStringOrNull(donation.platform) && resolvedPlatform) updates.platform = resolvedPlatform;
    if (!toStringOrNull(donation.campaignTitleSnapshot) && resolvedCampaignTitle)
      updates.campaignTitleSnapshot = resolvedCampaignTitle;
    if (donation.isGiftAid !== true && resolvedGiftAid) updates.isGiftAid = true;

    if (Object.keys(updates).length === 0) {
      skipped += 1;
      continue;
    }

    updates.backfilledAt = admin.firestore.FieldValue.serverTimestamp();
    updates.backfillVersion = 'recurring-v1';

    batch.update(doc.ref, updates);
    batchOps += 1;
    updated += 1;

    if (batchOps >= 400) {
      await batch.commit();
      batch = db.batch();
      batchOps = 0;
    }
  }

  if (batchOps > 0) {
    await batch.commit();
  }

  return { scanned, updated, skipped, unresolved };
};

const backfillGiftAidDeclarations = async () => {
  const giftAidSnap = await db.collection('giftAidDeclarations').get();
  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  let unresolved = 0;

  let batch = db.batch();
  let batchOps = 0;

  for (const doc of giftAidSnap.docs) {
    scanned += 1;
    const declaration = doc.data() || {};
    const donationId = toStringOrNull(declaration.donationId) || doc.id;
    const donationDoc = await db.collection('donations').doc(donationId).get();

    if (!donationDoc.exists) {
      unresolved += 1;
      continue;
    }

    const donation = donationDoc.data() || {};
    const updates = {};

    if (!toStringOrNull(declaration.organizationId) && toStringOrNull(donation.organizationId)) {
      updates.organizationId = donation.organizationId;
    }
    if (!toStringOrNull(declaration.campaignId) && toStringOrNull(donation.campaignId)) {
      updates.campaignId = donation.campaignId;
    }
    if (
      !toStringOrNull(declaration.campaignTitle) &&
      toStringOrNull(donation.campaignTitleSnapshot)
    ) {
      updates.campaignTitle = donation.campaignTitleSnapshot;
    }

    if (Object.keys(updates).length === 0) {
      skipped += 1;
      continue;
    }

    updates.updatedAt = new Date().toISOString();
    updates.backfillVersion = 'gift-aid-v1';

    batch.update(doc.ref, updates);
    batchOps += 1;
    updated += 1;

    if (batchOps >= 400) {
      await batch.commit();
      batch = db.batch();
      batchOps = 0;
    }
  }

  if (batchOps > 0) {
    await batch.commit();
  }

  return { scanned, updated, skipped, unresolved };
};

const run = async () => {
  console.log('Starting recurring donation + gift aid backfill...');
  const subscriptionsMap = await loadSubscriptionsMap();
  console.log(`Loaded subscriptions: ${subscriptionsMap.size}`);

  let stripeClient = null;
  try {
    stripeClient = ensureStripeInitialized();
    console.log('Stripe initialized for deep recurring backfill lookups.');
  } catch (error) {
    console.warn(
      'Stripe not initialized. Backfill will skip Stripe-based recovery:',
      error.message,
    );
  }

  const donationResult = await backfillDonations(subscriptionsMap, stripeClient);
  const giftAidResult = await backfillGiftAidDeclarations();

  console.log('Backfill complete.');
  console.log('Donations:', donationResult);
  console.log('GiftAid:', giftAidResult);
  process.exit(0);
};

run().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
