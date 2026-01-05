import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { stripe, db, auth } from '../../config';
import Stripe from 'stripe';

interface UpdatePaymentMethodRequest {
  subscriptionId: string;
  paymentMethodId: string;
}

interface UpdatePaymentMethodResponse {
  success: boolean;
}

/**
 * Updates the default payment method for a subscription.
 * Requires Firebase ID token in Authorization: Bearer <token>.
 */
export const updatePaymentMethod = functions.https.onRequest(
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

      const { subscriptionId, paymentMethodId }: UpdatePaymentMethodRequest = req.body || {};
      if (!subscriptionId || !paymentMethodId) {
        res.status(400).send({ error: 'Missing subscriptionId or paymentMethodId' });
        return;
      }

      // Fetch subscription to verify ownership and get customer
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer'],
      });

      const customerId =
        typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

      // Optional: ensure the subscription metadata donorId matches uid (best-effort)
      if (subscription.metadata?.donorId && subscription.metadata.donorId !== uid) {
        res.status(403).send({ error: 'Forbidden: subscription does not belong to this user' });
        return;
      }

      // Attach payment method to customer if not already
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId }).catch((err: any) => {
        if (err?.raw?.code !== 'resource_already_exists') {
          throw err;
        }
      });

      // Retrieve PM for card details
      const pm = (await stripe.paymentMethods.retrieve(paymentMethodId)) as Stripe.PaymentMethod;
      const card = pm.card;

      // Update subscription default payment method
      await stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId,
      });

      // Update customer invoice settings too
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      // Update Firestore subscription doc with payment method snippet and timestamp
      const subRef = db.collection('subscriptions').doc(subscriptionId);
      await subRef.set(
        {
          payment_method_id: paymentMethodId,
          payment_method_last4: card?.last4 ?? null,
          payment_method_brand: card?.brand ?? null,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      const response: UpdatePaymentMethodResponse = { success: true };
      res.status(200).send(response);
    } catch (err) {
      console.error('Error updating payment method:', err);
      res.status(500).send({
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    }
  }
);
