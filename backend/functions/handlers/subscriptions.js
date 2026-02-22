const admin = require("firebase-admin");
const {
  ensureStripeInitialized,
  getOrCreateCustomerByEmail,
} = require("../services/stripe");
const {verifyAuth} = require("../middleware/auth");
const cors = require("../middleware/cors");
const {createSubscriptionDoc} = require("../entities/subscription");

/**
 * Create recurring subscription
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const createRecurringSubscription = (req, res) => {
  cors(req, res, async () => {
    try {
      const stripeClient = ensureStripeInitialized();

      const {
        amount,
        interval, // 'month', 'year'
        campaignId,
        donor,
        paymentMethodId,
        metadata = {},
      } = req.body;

      // Validation
      if (!amount || !interval || !campaignId || !donor?.email) {
        return res.status(400).send({
          error: "Missing required fields: amount, interval, campaignId, donor.email",
        });
      }

      if (!["month", "year"].includes(interval)) {
        return res.status(400).send({
          error: "Invalid interval. Must be 'month' or 'year'",
        });
      }

      if (!paymentMethodId) {
        return res.status(400).send({
          error: "Missing paymentMethodId",
        });
      }

      // Get campaign and organization
      const campaignSnap = await admin
          .firestore()
          .collection("campaigns")
          .doc(campaignId)
          .get();

      if (!campaignSnap.exists) {
        return res.status(404).send({error: "Campaign not found"});
      }

      const campaignData = campaignSnap.data();
      const orgId = campaignData.organizationId;

      const orgSnap = await admin
          .firestore()
          .collection("organizations")
          .doc(orgId)
          .get();

      if (!orgSnap.exists) {
        return res.status(404).send({error: "Organization not found"});
      }

      const stripeAccountId = orgSnap.data().stripe?.accountId;
      if (!stripeAccountId) {
        return res.status(400).send({
          error: "Organization not onboarded with Stripe",
        });
      }

      // Get or create customer
      const customer = await getOrCreateCustomerByEmail(donor.email, {
        name: donor.name || "Anonymous",
        campaignId,
        organizationId: orgId,
      });

      // Attach payment method to customer
      await stripeClient.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      await stripeClient.customers.update(customer.id, {
        invoice_settings: {default_payment_method: paymentMethodId},
      });

      // Create price with inline product (per-subscription strategy)
      const price = await stripeClient.prices.create({
        unit_amount: amount,
        currency: "usd",
        recurring: {interval},
        product_data: {
          name: `Recurring donation to ${campaignData.title}`,
          metadata: {
            campaignId,
            organizationId: orgId,
          },
        },
      });

      // Create subscription
      const subscription = await stripeClient.subscriptions.create({
        customer: customer.id,
        items: [{price: price.id}],
        default_payment_method: paymentMethodId,
        collection_method: "charge_automatically",
        expand: ["latest_invoice.payment_intent"],
        transfer_data: {destination: stripeAccountId},
        metadata: {
          campaignId,
          organizationId: orgId,
          donorEmail: donor.email,
          donorName: donor.name || "Anonymous",
          platform: metadata.platform || "web",
          ...metadata,
        },
      });

      console.log("Subscription created:", {
        id: subscription.id,
        status: subscription.status,
        customer: customer.id,
      });

      // Save to Firestore
      await createSubscriptionDoc({
        stripeSubscriptionId: subscription.id,
        customerId: customer.id,
        campaignId,
        organizationId: orgId,
        interval,
        amount,
        currency: "usd",
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        metadata: {
          donorEmail: donor.email,
          donorName: donor.name || "Anonymous",
          platform: metadata.platform || "web",
        },
      });

      // Handle first invoice
      const latestInvoice = subscription.latest_invoice;

      if (latestInvoice?.payment_intent) {
        const paymentIntent = latestInvoice.payment_intent;
        return res.status(200).send({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent.client_secret,
          status: subscription.status,
          requiresAction: paymentIntent.status === "requires_action",
        });
      } else if (latestInvoice?.status === "paid") {
        return res.status(200).send({
          success: true,
          subscriptionId: subscription.id,
          message: "Subscription created and first payment completed",
          status: subscription.status,
        });
      }

      return res.status(200).send({
        subscriptionId: subscription.id,
        status: subscription.status,
      });
    } catch (error) {
      console.error("Error creating recurring subscription:", error);
      return res.status(500).send({error: error.message});
    }
  });
};

/**
 * Cancel recurring subscription
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const cancelRecurringSubscription = (req, res) => {
  cors(req, res, async () => {
    try {
      const stripeClient = ensureStripeInitialized();

      const {subscriptionId, cancelImmediately = false} = req.body;

      if (!subscriptionId) {
        return res.status(400).send({
          error: "Missing subscriptionId",
        });
      }

      // Get subscription from Firestore
      const subscriptionDoc = await admin
          .firestore()
          .collection("subscriptions")
          .doc(subscriptionId)
          .get();

      if (!subscriptionDoc.exists) {
        return res.status(404).send({error: "Subscription not found"});
      }

      const subscriptionData = subscriptionDoc.data();

      // Cancel in Stripe
      const canceledSubscription = await stripeClient.subscriptions.cancel(
          subscriptionData.stripeSubscriptionId,
          {
            prorate: !cancelImmediately,
            invoice_now: cancelImmediately,
          },
      );

      // Update in Firestore
      await admin
          .firestore()
          .collection("subscriptions")
          .doc(subscriptionId)
          .update({
            status: "canceled",
            canceledAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          });

      console.log("Subscription canceled:", subscriptionId);

      return res.status(200).send({
        success: true,
        message: "Subscription canceled successfully",
        subscription: {
          id: canceledSubscription.id,
          status: canceledSubscription.status,
          canceledAt: canceledSubscription.canceled_at,
        },
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      return res.status(500).send({error: error.message});
    }
  });
};

/**
 * Update subscription payment method
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const updateSubscriptionPaymentMethod = (req, res) => {
  cors(req, res, async () => {
    try {
      const stripeClient = ensureStripeInitialized();

      const {subscriptionId, paymentMethodId} = req.body;

      if (!subscriptionId || !paymentMethodId) {
        return res.status(400).send({
          error: "Missing subscriptionId or paymentMethodId",
        });
      }

      // Get subscription from Firestore
      const subscriptionDoc = await admin
          .firestore()
          .collection("subscriptions")
          .doc(subscriptionId)
          .get();

      if (!subscriptionDoc.exists) {
        return res.status(404).send({error: "Subscription not found"});
      }

      const subscriptionData = subscriptionDoc.data();

      // Attach new payment method to customer
      await stripeClient.paymentMethods.attach(paymentMethodId, {
        customer: subscriptionData.customerId,
      });

      // Update customer's default payment method
      await stripeClient.customers.update(subscriptionData.customerId, {
        invoice_settings: {default_payment_method: paymentMethodId},
      });

      // Update subscription's default payment method
      await stripeClient.subscriptions.update(
          subscriptionData.stripeSubscriptionId,
          {
            default_payment_method: paymentMethodId,
          },
      );

      console.log("Payment method updated for subscription:", subscriptionId);

      return res.status(200).send({
        success: true,
        message: "Payment method updated successfully",
      });
    } catch (error) {
      console.error("Error updating payment method:", error);
      return res.status(500).send({error: error.message});
    }
  });
};

module.exports = {
  createRecurringSubscription,
  cancelRecurringSubscription,
  updateSubscriptionPaymentMethod,
};
