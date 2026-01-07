ggimport * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { stripe, db, auth } from '../../config';
import { SetupIntentRequest, SetupIntentResponse } from '../../types';

/**
 * Creates a Stripe SetupIntent for saving a payment method before starting a subscription.
 * Authenticated via Firebase ID token (Bearer token).
 */
export const createSetupIntent = functions.https.onRequest(
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

      const { campaignId, interval }: SetupIntentRequest = req.body || {};

      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        metadata: {
          firebaseUID: uid,
          campaignId: campaignId || '',
          interval: interval || '',
        },
      });

      const response: SetupIntentResponse = {
        clientSecret: setupIntent.client_secret as string,
        customerId,
      };

      res.status(200).send(response);
    } catch (err) {
      console.error('Error creating setup intent:', err);
      res.status(500).send({
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    }
  }
);
