import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe, db, auth } from '../../config';
import {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  RecurringInterval,
} from '../../types';

type IntervalMap = {
  [key in RecurringInterval]: { interval: Stripe.Price.Recurring.Interval; interval_count: number };
};

const INTERVAL_MAP: IntervalMap = {
  monthly: { interval: 'month', interval_count: 1 },
  quarterly: { interval: 'month', interval_count: 3 },
  yearly: { interval: 'year', interval_count: 1 },
};

const DEFAULT_CURRENCY = 'eur';

export const createSubscription = functions.https.onRequest(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).send({ error: 'Unauthorized: Missing token' });
        return;
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const email = decodedToken.email || '';
      const name = decodedToken.name || 'Anonymous';

      const {
        campaignId,
        interval,
        amount,
        currency = DEFAULT_CURRENCY,
        paymentMethodId,
        isGiftAid = false,
        platform = 'web',
      }: CreateSubscriptionRequest = req.body;

      if (!campaignId || !interval || !amount || !paymentMethodId) {
        res.status(400).send({ error: 'Missing required fields' });
        return;
      }

      if (!INTERVAL_MAP[interval]) {
        res.status(400).send({ error: 'Invalid interval' });
        return;
      }

      if (amount <= 0) {
        res.status(400).send({ error: 'Amount must be greater than zero' });
        return;
      }

      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      let customerId: string;
      if (userDoc.exists && userDoc.data()?.stripeCustomerId) {
        customerId = userDoc.data()!.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email,
          name,
          metadata: { firebaseUID: uid },
        });
        customerId = customer.id;
        await userRef.set({ stripeCustomerId: customerId }, { merge: true });
      }

      // Attach payment method to customer if not already
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId }).catch((err: any) => {
        // If already attached, ignore error
        if (err?.raw?.code !== 'resource_already_exists') {
          throw err;
        }
      });

      // Ensure invoice settings default payment method
      await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethodId } });

      const priceId = await getOrCreateRecurringPrice({
        campaignId,
        amount,
        currency,
        interval,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        default_payment_method: paymentMethodId,
        metadata: {
          campaignId,
          donorId: uid,
          isGiftAid: isGiftAid ? 'true' : 'false',
          platform,
          interval,
        },
        expand: ['latest_invoice.payment_intent', 'default_payment_method'],
      });

      const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
      const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent | null;

      const response: CreateSubscriptionResponse = {
        subscriptionId: subscription.id,
        status: subscription.status,
      };

      if (paymentIntent && paymentIntent.status === 'requires_action' && paymentIntent.client_secret) {
        response.paymentIntentClientSecret = paymentIntent.client_secret;
      }

      res.status(200).send(response);
    } catch (err) {
      console.error('Error creating subscription:', err);
      res.status(500).send({
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    }
  }
);

interface PriceLookupParams {
  campaignId: string;
  amount: number;
  currency: string;
  interval: RecurringInterval;
}

async function getOrCreateRecurringPrice(params: PriceLookupParams): Promise<string> {
  const { campaignId, amount, currency, interval } = params;
  const { interval: stripeInterval, interval_count } = INTERVAL_MAP[interval];

  const campaignRef = db.collection('campaigns').doc(campaignId);
  const campaignDoc = await campaignRef.get();

  let productId = campaignDoc.data()?.billingProductId as string | undefined;

  if (!productId) {
    // Create a product for this campaign
    const campaignName = campaignDoc.exists ? campaignDoc.data()?.title || `Campaign ${campaignId}` : `Campaign ${campaignId}`;
    const product = await stripe.products.create({
      name: `Recurring - ${campaignName}`,
      metadata: { campaignId },
    });
    productId = product.id;
    await campaignRef.set({ billingProductId: productId }, { merge: true });
  }

  // Try to find an existing price matching amount/currency/interval
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    type: 'recurring',
    currency,
    limit: 100,
  });

  const existing = prices.data.find(
    (p) =>
      p.unit_amount === amount &&
      p.currency === currency &&
      p.recurring?.interval === stripeInterval &&
      p.recurring?.interval_count === interval_count
  );

  if (existing) {
    return existing.id;
  }

  const price = await stripe.prices.create({
    product: productId,
    currency,
    unit_amount: amount,
    recurring: { interval: stripeInterval, interval_count },
    metadata: { campaignId, interval },
    nickname: `${interval}-${amount}-${currency}`,
  });

  return price.id;
}
