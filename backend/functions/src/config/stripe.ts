import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
