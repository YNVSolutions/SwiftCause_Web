import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { stripe, db, auth } from '../../config';

interface BillingPortalRequest {
  returnUrl?: string;
}

interface BillingPortalResponse {
  url: string;
}

/**
 * Creates a Stripe Billing Portal session for the authenticated user.
 * Requires Firebase ID token in Authorization: Bearer <token>.
 */
export const createBillingPortalSession = functions.https.onRequest(
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

      const { returnUrl }: BillingPortalRequest = req.body || {};

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

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || undefined,
      });

      const response: BillingPortalResponse = { url: session.url };
      res.status(200).send(response);
    } catch (err) {
      console.error('Error creating billing portal session:', err);
      res.status(500).send({
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    }
  }
);
