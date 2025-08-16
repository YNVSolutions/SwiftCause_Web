import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';


admin.initializeApp();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});


interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  campaignId: string;
  donationData: {
    donorEmail?: string;
    donorName?: string;
    isRecurring?: boolean;
    recurringInterval?: string;
    kioskId?: string;
  };
}


interface CreatePaymentIntentResponse {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}


export const createPaymentIntent = functions.https.onCall(
  async (request): Promise<CreatePaymentIntentResponse> => {
    try {
      const data = request.data as CreatePaymentIntentRequest;
      const { amount, currency, campaignId, donationData } = data;

     
      if (!amount || !currency || !campaignId) {
        return {
          success: false,
          error: 'Missing required fields: amount, currency, campaignId'
        };
      }

      if (amount <= 0) {
        return {
          success: false,
          error: 'Amount must be greater than 0'
        };
      }


      const amountInCents = Math.round(amount * 100);


      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          campaignId: campaignId,
          donorEmail: donationData.donorEmail || '',
          donorName: donationData.donorName || '',
          isRecurring: donationData.isRecurring ? 'true' : 'false',
          recurringInterval: donationData.recurringInterval || '',
          kioskId: donationData.kioskId || '',
        },
        description: `Donation to campaign: ${campaignId}`,
      });

   
      console.log('Payment intent created:', {
        paymentIntentId: paymentIntent.id,
        amount: amountInCents,
        currency: currency,
        campaignId: campaignId
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret || undefined,
        paymentIntentId: paymentIntent.id
      };

    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment intent'
      };
    }
  }
);


export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig as string, endpointSecret || '');
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      
    
      console.log('Payment metadata:', paymentIntent.metadata);
      break;
    }
    
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id);
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});
