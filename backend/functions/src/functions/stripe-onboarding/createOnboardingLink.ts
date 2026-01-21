import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { stripe, db, auth } from '../../config';

/**
 * Creates a Stripe Connect onboarding link for an organization
 * This allows organizations to set up their Stripe account to receive payouts
 */
export const createOnboardingLink = functions.https.onRequest(
  async (req: Request, res: Response): Promise<void> => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      // Verify authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;

      // Get organization ID from request
      const { orgId } = req.body;
      if (!orgId) {
        res.status(400).json({ error: 'Organization ID is required' });
        return;
      }

      // Verify user has access to this organization
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userData = userDoc.data();
      if (userData?.organizationId !== orgId) {
        res.status(403).json({ error: 'User does not have access to this organization' });
        return;
      }

      // Get organization document
      const orgDoc = await db.collection('organizations').doc(orgId).get();
      if (!orgDoc.exists) {
        res.status(404).json({ error: 'Organization not found' });
        return;
      }

      const orgData = orgDoc.data();
      let stripeAccountId = orgData?.stripe?.accountId;

      // Create Stripe Connect account if it doesn't exist
      if (!stripeAccountId) {
        const account = await stripe.accounts.create({
          type: 'standard',
          email: userData?.email || decodedToken.email,
          metadata: {
            organizationId: orgId,
            organizationName: orgData?.name || 'Unknown',
          },
        });

        stripeAccountId = account.id;

        // Save the account ID to the organization
        await db.collection('organizations').doc(orgId).set(
          {
            stripe: {
              accountId: stripeAccountId,
              chargesEnabled: false,
              payoutsEnabled: false,
              createdAt: new Date(),
            },
          },
          { merge: true }
        );
      }

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${req.headers.origin || 'http://localhost:3000'}/#/admin-bank-details?stripe_status=refresh`,
        return_url: `${req.headers.origin || 'http://localhost:3000'}/#/admin-bank-details?stripe_status=success`,
        type: 'account_onboarding',
      });

      res.status(200).json({ url: accountLink.url });
    } catch (error: unknown) {
      console.error('Error creating Stripe onboarding link:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create onboarding link';
      const errorDetails =
        error && typeof error === 'object' && 'raw' in error
          ? String((error as { raw?: { message?: unknown } }).raw?.message ?? '')
          : String(error);
      res.status(500).json({
        error: errorMessage,
        details: errorDetails || errorMessage,
      });
    }
  }
);
