import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { stripe, db, auth } from '../../config';

/**
 * Updates the Stripe account status for an organization
 * Checks if charges and payouts are enabled
 */
export const updateStripeAccountStatus = functions.https.onRequest(
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
      const stripeAccountId = orgData?.stripe?.accountId;

      if (!stripeAccountId) {
        res.status(400).json({ error: 'No Stripe account found for this organization' });
        return;
      }

      // Retrieve account details from Stripe
      const account = await stripe.accounts.retrieve(stripeAccountId);

      // Update organization with current status
      await db.collection('organizations').doc(orgId).set(
        {
          stripe: {
            accountId: stripeAccountId,
            chargesEnabled: account.charges_enabled || false,
            payoutsEnabled: account.payouts_enabled || false,
            detailsSubmitted: account.details_submitted || false,
            updatedAt: new Date(),
          },
        },
        { merge: true }
      );

      res.status(200).json({
        success: true,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      });
    } catch (error: any) {
      console.error('Error updating Stripe account status:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to update account status',
        details: error.raw?.message || error.toString()
      });
    }
  }
);
