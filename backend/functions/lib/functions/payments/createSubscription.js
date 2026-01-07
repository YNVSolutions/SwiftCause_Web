"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscription = void 0;
const functions = __importStar(require("firebase-functions"));
const config_1 = require("../../config");
const INTERVAL_MAP = {
    monthly: { interval: 'month', interval_count: 1 },
    quarterly: { interval: 'month', interval_count: 3 },
    yearly: { interval: 'year', interval_count: 1 },
};
const DEFAULT_CURRENCY = 'eur';
exports.createSubscription = functions.https.onRequest(async (req, res) => {
    var _a;
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).send({ error: 'Unauthorized: Missing token' });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await config_1.auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const email = decodedToken.email || '';
        const name = decodedToken.name || 'Anonymous';
        const { campaignId, interval, amount, currency = DEFAULT_CURRENCY, paymentMethodId, isGiftAid = false, platform = 'web', } = req.body;
        if (!campaignId || !interval || !amount || !paymentMethodId) {
            res.status(400).send({ error: 'Missing required fields' });
            return;
        }
        if (!INTERVAL_MAP[interval]) {
            res.status(400).send({ error: 'Invalid interval' });
            return;
        }
        if (amount <= 0) {
            res.status(400).send({ error: 'Amount must be greater than zero' });
            return;
        }
        const userRef = config_1.db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        let customerId;
        if (userDoc.exists && ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.stripeCustomerId)) {
            customerId = userDoc.data().stripeCustomerId;
        }
        else {
            const customer = await config_1.stripe.customers.create({
                email,
                name,
                metadata: { firebaseUID: uid },
            });
            customerId = customer.id;
            await userRef.set({ stripeCustomerId: customerId }, { merge: true });
        }
        // Attach payment method to customer if not already
        await config_1.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId }).catch((err) => {
            var _a;
            // If already attached, ignore error
            const rawCode = typeof err === 'object' && err !== null && 'raw' in err
                ? (_a = err.raw) === null || _a === void 0 ? void 0 : _a.code
                : undefined;
            if (rawCode !== 'resource_already_exists') {
                throw err;
            }
        });
        // Ensure invoice settings default payment method
        await config_1.stripe.customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethodId } });
        const priceId = await getOrCreateRecurringPrice({
            campaignId,
            amount,
            currency,
            interval,
        });
        const subscription = await config_1.stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_settings: {
                save_default_payment_method: 'on_subscription',
            },
            default_payment_method: paymentMethodId,
            metadata: {
                campaignId,
                donorId: uid,
                isGiftAid: isGiftAid ? 'true' : 'false',
                platform,
                interval,
            },
            expand: ['latest_invoice.payment_intent', 'default_payment_method'],
        });
        const latestInvoice = subscription.latest_invoice;
        const paymentIntent = latestInvoice === null || latestInvoice === void 0 ? void 0 : latestInvoice.payment_intent;
        const response = {
            subscriptionId: subscription.id,
            status: subscription.status,
        };
        if (paymentIntent && paymentIntent.status === 'requires_action' && paymentIntent.client_secret) {
            response.paymentIntentClientSecret = paymentIntent.client_secret;
        }
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Error creating subscription:', err);
        res.status(500).send({
            error: err instanceof Error ? err.message : 'Unknown error occurred',
        });
    }
});
async function getOrCreateRecurringPrice(params) {
    var _a, _b;
    const { campaignId, amount, currency, interval } = params;
    const { interval: stripeInterval, interval_count } = INTERVAL_MAP[interval];
    const campaignRef = config_1.db.collection('campaigns').doc(campaignId);
    const campaignDoc = await campaignRef.get();
    let productId = (_a = campaignDoc.data()) === null || _a === void 0 ? void 0 : _a.billingProductId;
    if (!productId) {
        // Create a product for this campaign
        const campaignName = campaignDoc.exists ? ((_b = campaignDoc.data()) === null || _b === void 0 ? void 0 : _b.title) || `Campaign ${campaignId}` : `Campaign ${campaignId}`;
        const product = await config_1.stripe.products.create({
            name: `Recurring - ${campaignName}`,
            metadata: { campaignId },
        });
        productId = product.id;
        await campaignRef.set({ billingProductId: productId }, { merge: true });
    }
    // Try to find an existing price matching amount/currency/interval
    const prices = await config_1.stripe.prices.list({
        product: productId,
        active: true,
        type: 'recurring',
        currency,
        limit: 100,
    });
    const existing = prices.data.find((p) => {
        var _a, _b;
        return p.unit_amount === amount &&
            p.currency === currency &&
            ((_a = p.recurring) === null || _a === void 0 ? void 0 : _a.interval) === stripeInterval &&
            ((_b = p.recurring) === null || _b === void 0 ? void 0 : _b.interval_count) === interval_count;
    });
    if (existing) {
        return existing.id;
    }
    const price = await config_1.stripe.prices.create({
        product: productId,
        currency,
        unit_amount: amount,
        recurring: { interval: stripeInterval, interval_count },
        metadata: { campaignId, interval },
        nickname: `${interval}-${amount}-${currency}`,
    });
    return price.id;
}
//# sourceMappingURL=createSubscription.js.map