import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env from multiple possible locations (functions folder + repo root)
const envCandidates = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
  // repository root (four levels up from lib/config)
  path.resolve(__dirname, '../../../../.env.local'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error('Missing STRIPE_SECRET_KEY for Stripe initialization.');
}

export const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-05-28.basil',
});

export const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
