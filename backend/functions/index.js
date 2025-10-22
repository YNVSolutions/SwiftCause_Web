const functions = require("firebase-functions");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

admin.initializeApp();

exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    const donationData = {
      campaignId: paymentIntent.metadata.campaignId || null,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      donorId: paymentIntent.metadata.donorId || null,
      donorName: paymentIntent.metadata.donorName || "Anonymous",
      timestamp: admin.firestore.Timestamp.now(),
      isGiftAid: paymentIntent.metadata.isGiftAid === "true",
      paymentStatus: "success",
      platform: paymentIntent.metadata.platform || "android",
      stripePaymentIntentId: paymentIntent.id,
    };

    await admin.firestore().collection("donations").add(donationData);
    console.log("Donation stored for:", paymentIntent.id);

    const campaignId = paymentIntent.metadata.campaignId;
    const campaignRef = admin.firestore()
        .collection("campaigns").doc(campaignId);

    await campaignRef.update({
      collectedAmount: admin.firestore.FieldValue
          .increment(paymentIntent.amount),

      donationCount: admin.firestore.FieldValue.increment(1),
      lastUpdated: admin.firestore.Timestamp.now(),
    });
    console.log("Campaign updated for donation:", campaignId);
  }

  res.status(200).send("OK");
});
exports.getConnectionToken = functions.https.onRequest(async (req, res) => {
  try {
    const connectionToken = await stripe.terminal.connectionTokens.create();
    res.status(200).json({secret: connectionToken.secret});
  } catch (err) {
    console.error("Error creating connection token:", err);
    res.status(500).json({error: "Unable to create connection token"});
  }
});


exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({error: "Unauthorized: Missing token"});
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name || "Anonymous";

    const userRef = admin.firestore().collection("users").doc(uid);
    const userDoc = await userRef.get();

    let customerId;

    if (userDoc.exists && userDoc.data().stripeCustomerId) {
      customerId = userDoc.data().stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: {firebaseUID: uid},
      });

      customerId = customer.id;
      await userRef.set({stripeCustomerId: customerId}, {merge: true});
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
        {customer: customerId},
        {apiVersion: "2022-11-15"},
    );

    const {amount, currency, metadata} = req.body;
    const {platform} = metadata || null;

    let paymentMethodTypes = ["card"];
    if (platform === "android_ttp") {
      paymentMethodTypes = ["card_present"];
    }

    if (!amount || !currency) {
      return res.status(400).send({error: "Missing amount or currency"});
    }

    const {campaignId, donorId, donorName, isGiftAid} =
      metadata;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      payment_method_types: paymentMethodTypes,
      metadata: {
        campaignId,
        donorId,
        donorName,
        isGiftAid: isGiftAid.toString(),
        platform,
      },
    });

    if (platform === "android_ttp") {
      res.status(200).send({
        paymentIntentId: paymentIntent.id,
        customer: customerId,
      });
    } else {
      res.status(200).send({
        paymentIntentClientSecret: paymentIntent.client_secret,
        customer: customerId,
        ephemeralKey: ephemeralKey.secret,
      });
    }
  } catch (err) {
    console.error("Error creating payment intent:", err);
    return res.status(500).send({error: err.message});
  }
});

