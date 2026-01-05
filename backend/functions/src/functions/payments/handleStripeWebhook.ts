import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe, endpointSecret, db, admin } from '../../config';
import { DonationData } from '../../types';

export const handleStripeWebhook = functions.https.onRequest(
  async (req: Request, res: Response): Promise<void> => {
    let event: Stripe.Event;

    try {
      const sig = req.headers['stripe-signature'] as string;
      if (!sig) {
        throw new Error('Missing stripe-signature header');
      }
      
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        endpointSecret
      );
    } catch (err) {
      console.error('Webhook Error:', err);
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return;
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handleOneTimeDonation(paymentIntent);
          break;
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await upsertSubscription(subscription);
          break;
        }
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const succeeded = event.type === 'invoice.payment_succeeded';
          await upsertInvoice(invoice, succeeded);
          break;
        }
        default:
          // Ignore other events for now
          break;
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).send('Error processing webhook');
      return;
    }

    res.status(200).send('OK');
  }
);

async function handleOneTimeDonation(paymentIntent: Stripe.PaymentIntent) {
  const donationData: DonationData = {
    campaignId: paymentIntent.metadata.campaignId || null,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    donorId: paymentIntent.metadata.donorId || null,
    donorName: paymentIntent.metadata.donorName || 'Anonymous',
    timestamp: admin.firestore.Timestamp.now(),
    isGiftAid: paymentIntent.metadata.isGiftAid === 'true',
    paymentStatus: 'success',
    platform: paymentIntent.metadata.platform || 'android',
    stripePaymentIntentId: paymentIntent.id,
  };

  await db.collection('donations').add(donationData);
  const campaignId = paymentIntent.metadata.campaignId;
  if (campaignId) {
    const campaignRef = db.collection('campaigns').doc(campaignId);

    await campaignRef.update({
      collectedAmount: admin.firestore.FieldValue.increment(paymentIntent.amount),
      donationCount: admin.firestore.FieldValue.increment(1),
      lastUpdated: admin.firestore.Timestamp.now(),
    });
  }
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const docRef = db.collection('subscriptions').doc(subscription.id);

  // default_payment_method can be a string or expanded object
  const defaultPaymentMethod = subscription.default_payment_method as Stripe.PaymentMethod | string | null;
  const card =
    defaultPaymentMethod && typeof defaultPaymentMethod === 'object' && defaultPaymentMethod.card
      ? defaultPaymentMethod.card
      : undefined;

  await docRef.set(
    {
      customerId: subscription.customer,
      donorId: subscription.metadata?.donorId ?? null,
      campaignId: subscription.metadata?.campaignId ?? null,
      status: subscription.status,
      interval: subscription.items.data[0]?.plan?.interval ?? null,
      interval_count: subscription.items.data[0]?.plan?.interval_count ?? null,
      priceId: subscription.items.data[0]?.price?.id ?? null,
      amount: subscription.items.data[0]?.price?.unit_amount ?? null,
      currency: subscription.items.data[0]?.price?.currency ?? null,
      current_period_end: subscription.current_period_end,
      latest_invoice_id: subscription.latest_invoice ?? null,
      platform: subscription.metadata?.platform ?? null,
      isGiftAid: subscription.metadata?.isGiftAid === 'true',
      metadata: subscription.metadata ?? {},
      payment_method_id:
        typeof subscription.default_payment_method === 'string'
          ? subscription.default_payment_method
          : subscription.default_payment_method?.id ?? null,
      payment_method_last4: card?.last4 ?? null,
      payment_method_brand: card?.brand ?? null,
      createdAt: admin.firestore.Timestamp.fromMillis(subscription.created * 1000),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    { merge: true }
  );
}

async function upsertInvoice(invoice: Stripe.Invoice, succeeded: boolean) {
  const docRef = db.collection('donations').doc(invoice.id);
  const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : null;
  const paymentIntentId =
    typeof invoice.payment_intent === 'string'
      ? invoice.payment_intent
      : invoice.payment_intent?.id ?? null;

  const donation = {
    subscriptionId,
    invoiceId: invoice.id,
    paymentIntentId,
    amount: invoice.amount_paid ?? invoice.amount_due ?? 0,
    currency: invoice.currency,
    status: succeeded ? 'succeeded' : 'failed',
    customerId: invoice.customer,
    donorId: invoice.metadata?.donorId ?? null,
    campaignId: invoice.metadata?.campaignId ?? null,
    isGiftAid: invoice.metadata?.isGiftAid === 'true',
    platform: invoice.metadata?.platform ?? null,
    error: succeeded
      ? null
      : {
          code: invoice.last_finalization_error?.code,
          message: invoice.last_finalization_error?.message,
        },
    receipt_url: invoice.hosted_invoice_url ?? null,
    hosted_invoice_url: invoice.hosted_invoice_url ?? null,
    createdAt: admin.firestore.Timestamp.fromMillis(
      ((invoice.created ?? Math.floor(Date.now() / 1000)) as number) * 1000
    ),
    updatedAt: admin.firestore.Timestamp.now(),
  };

  const existing = await docRef.get();
  const alreadySucceeded = existing.exists && existing.data()?.status === 'succeeded';

  await docRef.set(donation, { merge: true });

  // Increment campaign totals only once per successful invoice
  if (succeeded && !alreadySucceeded) {
    const campaignId = invoice.metadata?.campaignId;
    if (campaignId) {
      const campaignRef = db.collection('campaigns').doc(campaignId);
      await campaignRef.update({
        collectedAmount: admin.firestore.FieldValue.increment(donation.amount),
        donationCount: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.Timestamp.now(),
      });
    }
  }
}
