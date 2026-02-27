const admin = require("firebase-admin");
const {stripe, ensureStripeInitialized} = require("../services/stripe");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {defineSecret} = require("firebase-functions/params");
const {sendOrganizationWelcomeEmail} = require("../services/email");

const sendgridApiKey = defineSecret("SENDGRID_API_KEY");
const sendgridFromEmail = defineSecret("SENDGRID_FROM_EMAIL");
const sendgridFromName = defineSecret("SENDGRID_FROM_NAME");

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
 * Firestore trigger: Send organization welcome email after the org admin user
 * is verified. This avoids emailing before signup verification is complete.
 */
const sendWelcomeEmailForNewOrg = onDocumentUpdated(
    {
      document: "users/{uid}",
      secrets: [sendgridApiKey, sendgridFromEmail, sendgridFromName],
    },
    async (event) => {
      const beforeData = event.data?.before?.data() || {};
      const afterData = event.data?.after?.data() || {};
      const uid = event.params.uid;

      if (!afterData || typeof afterData !== "object") return;
      if (afterData.role !== "admin" && afterData.role !== "super_admin") return;
      if (afterData.emailVerified !== true) return;
      if (beforeData.emailVerified === true) return;
      if (afterData.welcomeEmailSentAt) return;

      const recipientEmail = typeof afterData.email === "string" ?
        afterData.email.trim() :
        "";
      const orgId = typeof afterData.organizationId === "string" ?
        afterData.organizationId.trim() :
        "";

      if (!recipientEmail || !orgId) {
        console.warn("Skipping welcome email (missing email/orgId)", {uid});
        return;
      }

      try {
        const orgSnap = await admin
            .firestore()
            .collection("organizations")
            .doc(orgId)
            .get();

        const orgData = orgSnap.exists ? (orgSnap.data() || {}) : {};
        const organizationName = orgData.name || orgData.organizationName || orgId;

        const result = await sendOrganizationWelcomeEmail({
          to: recipientEmail,
          organizationName,
          recipientName: afterData.username || afterData.displayName || null,
          organizationId: orgId,
          uid,
        });

        await admin
            .firestore()
            .collection("users")
            .doc(uid)
            .set(
                {
                  welcomeEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
                  welcomeEmailRecipient: recipientEmail,
                },
                {merge: true},
            );

        console.log("Organization welcome email sent", {
          uid,
          orgId,
          to: recipientEmail,
          statusCode: result?.statusCode || null,
        });
      } catch (error) {
        console.error("Failed to send organization welcome email:", {
          uid,
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
