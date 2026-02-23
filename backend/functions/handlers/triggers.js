const admin = require("firebase-admin");
const {stripe, ensureStripeInitialized} = require("../services/stripe");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {sendOrganizationWelcomeEmail} = require("../services/email");

/**
 * Firestore trigger: Create Stripe account when new organization is created
 */
const createStripeAccountForNewOrg = onDocumentCreated(
    "organizations/{orgId}",
    async (event) => {
      const orgId = event.params.orgId;
      console.log(`Creating Stripe account for new organization: ${orgId}`);

      try {
        // Check if Stripe is initialized
        if (!stripe) {
          console.warn(`Stripe not initialized. Skipping account creation for ${orgId}`);
          return;
        }
        
        const stripeClient = ensureStripeInitialized();
        
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

/**
 * Firestore trigger: Send organization welcome email when a new org is created.
 * Looks up an admin user in the same organization because org docs do not
 * currently store a contact email.
 */
const sendWelcomeEmailForNewOrg = onDocumentCreated(
    "organizations/{orgId}",
    async (event) => {
      const orgId = event.params.orgId;
      const orgData = event.data?.data() || {};
      const organizationName = orgData.name || orgData.organizationName || orgId;

      try {
        const usersSnap = await admin
            .firestore()
            .collection("users")
            .where("organizationId", "==", orgId)
            .limit(10)
            .get();

        if (usersSnap.empty) {
          console.warn("No users found for organization welcome email:", orgId);
          return;
        }

        const candidates = usersSnap.docs
            .map((doc) => doc.data() || {})
            .filter((user) => typeof user.email === "string" && user.email.trim());

        if (candidates.length === 0) {
          console.warn("No email recipient found for organization welcome email:", orgId);
          return;
        }

        const adminCandidate = candidates.find((user) =>
          user.role === "admin" || user.role === "super_admin");
        const recipient = adminCandidate || candidates[0];

        const result = await sendOrganizationWelcomeEmail({
          to: recipient.email.trim(),
          organizationName,
          recipientName: recipient.username || recipient.displayName || null,
          organizationId: orgId,
        });

        console.log("Organization welcome email sent", {
          orgId,
          to: recipient.email,
          statusCode: result?.statusCode || null,
        });
      } catch (error) {
        console.error("Failed to send organization welcome email:", {
          orgId,
          error: error.message,
        });
      }
    },
);

module.exports = {
  createStripeAccountForNewOrg,
  sendWelcomeEmailForNewOrg,
};
