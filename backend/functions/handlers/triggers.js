const admin = require("firebase-admin");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {defineSecret} = require("firebase-functions/params");

// Define the Stripe secret
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

/**
 * Firestore trigger: Create Stripe account when new organization is created
 */
const createStripeAccountForNewOrg = onDocumentCreated(
    {
      document: "organizations/{orgId}",
      secrets: [stripeSecretKey],
    },
    async (event) => {
      const orgId = event.params.orgId;
      console.log(`Creating Stripe account for new organization: ${orgId}`);

      try {
        // Initialize Stripe with the secret
        const Stripe = require("stripe");
        const stripeClient = Stripe(stripeSecretKey.value());
        
        const account = await stripeClient.accounts.create({
          type: "express",
          metadata: {orgId},
        });

        await admin
            .firestore()
            .collection("organizations")
            .doc(orgId)
            .set(
                {
                  stripe: {
                    accountId: account.id,
                    chargesEnabled: false,
                    payoutsEnabled: false,
                  },
                },
                {merge: true},
            );

        console.log(`Stripe Express account created for ${orgId}: ${account.id}`);
      } catch (error) {
        console.error(
            `Error creating Stripe account for organization ${orgId}:`,
            error,
        );
      }
    },
);

module.exports = {
  createStripeAccountForNewOrg,
};
