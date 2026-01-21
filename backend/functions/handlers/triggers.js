const admin = require("firebase-admin");
const {stripe} = require("../services/stripe");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

/**
 * Firestore trigger: Create Stripe account when new organization is created
 */
const createStripeAccountForNewOrg = onDocumentCreated(
    "organizations/{orgId}",
    async (event) => {
      const orgId = event.params.orgId;
      console.log(`Creating Stripe account for new organization: ${orgId}`);

      try {
        const account = await stripe.accounts.create({
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

        console.log(`Stripe Express account created for ${orgId}:
           ${account.id}`);
      } catch (error) {
        console.error(
            `Error creating Stripe account for organization
           ${orgId}:`,
            error,
        );
      }
    },
);

module.exports = {
  createStripeAccountForNewOrg,
};
