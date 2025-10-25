import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { stripe, db, auth } from '../../config';
import { PaymentIntentRequest, CreatePaymentIntentResponse, PaymentMetadata } from '../../types';

export const createPaymentIntent = functions.https.onRequest(
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
          email: email,
          name: name,
          metadata: { firebaseUID: uid },
        });

        customerId = customer.id;
        await userRef.set({ stripeCustomerId: customerId }, { merge: true });
      }

      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: '2022-11-15' }
      );

      const { amount, currency, metadata }: PaymentIntentRequest = req.body;

      // Validation check for required fields
      if (!amount || !currency) {
        res.status(400).send({ error: 'Missing amount or currency' });
        return;
      }

      const { platform }: PaymentMetadata = metadata || { platform: 'android' } as PaymentMetadata;

      let paymentMethodTypes: string[] = ['card'];
      if (platform === 'android_ttp') {
        paymentMethodTypes = ['card_present'];
      }

      const { campaignId, donorId, donorName, isGiftAid } = metadata;

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        payment_method_types: paymentMethodTypes,
        metadata: {
          campaignId,
          donorId,
          donorName,
          isGiftAid: isGiftAid.toString(),
          platform,
        },
      });

      const response: CreatePaymentIntentResponse = {
        customer: customerId,
      };

      if (platform === 'android_ttp') {
        response.paymentIntentId = paymentIntent.id;
      } else {
        response.paymentIntentClientSecret = paymentIntent.client_secret || undefined;
        response.ephemeralKey = ephemeralKey.secret;
      }

      res.status(200).send(response);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      res.status(500).send({ 
        error: err instanceof Error ? err.message : 'Unknown error occurred' 
      });
    }
  }
);
