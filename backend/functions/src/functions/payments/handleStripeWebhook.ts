import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
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

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

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

      try {
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
      } catch (error) {
        console.error('Error processing donation:', error);
        res.status(500).send('Error processing donation');
        return;
      }
    }

    res.status(200).send('OK');
  }
);
