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
exports.handleStripeWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const config_1 = require("../../config");
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    let event;
    try {
        const sig = req.headers['stripe-signature'];
        if (!sig) {
            throw new Error('Missing stripe-signature header');
        }
        event = config_1.stripe.webhooks.constructEvent(req.rawBody, sig, config_1.endpointSecret);
    }
    catch (err) {
        console.error('Webhook Error:', err);
        res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        return;
    }
    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                await handleOneTimeDonation(paymentIntent);
                break;
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await upsertSubscription(subscription);
                break;
            }
            case 'invoice.payment_succeeded':
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const succeeded = event.type === 'invoice.payment_succeeded';
                await upsertInvoice(invoice, succeeded);
                break;
            }
            default:
                // Ignore other events for now
                break;
        }
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Error processing webhook');
        return;
    }
    res.status(200).send('OK');
});
async function handleOneTimeDonation(paymentIntent) {
    const donationData = {
        campaignId: paymentIntent.metadata.campaignId || null,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        donorId: paymentIntent.metadata.donorId || null,
        donorName: paymentIntent.metadata.donorName || 'Anonymous',
        timestamp: config_1.admin.firestore.Timestamp.now(),
        isGiftAid: paymentIntent.metadata.isGiftAid === 'true',
        paymentStatus: 'success',
        platform: paymentIntent.metadata.platform || 'android',
        stripePaymentIntentId: paymentIntent.id,
    };
    await config_1.db.collection('donations').add(donationData);
    const campaignId = paymentIntent.metadata.campaignId;
    if (campaignId) {
        const campaignRef = config_1.db.collection('campaigns').doc(campaignId);
        await campaignRef.update({
            collectedAmount: config_1.admin.firestore.FieldValue.increment(paymentIntent.amount),
            donationCount: config_1.admin.firestore.FieldValue.increment(1),
            lastUpdated: config_1.admin.firestore.Timestamp.now(),
        });
    }
}
async function upsertSubscription(subscription) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
    const docRef = config_1.db.collection('subscriptions').doc(subscription.id);
    // default_payment_method can be a string or expanded object
    const defaultPaymentMethod = subscription.default_payment_method;
    const card = defaultPaymentMethod && typeof defaultPaymentMethod === 'object' && defaultPaymentMethod.card
        ? defaultPaymentMethod.card
        : undefined;
    const currentPeriodEnd = (_b = (_a = subscription.current_period_end) !== null && _a !== void 0 ? _a : subscription.currentPeriodEnd) !== null && _b !== void 0 ? _b : null;
    await docRef.set({
        customerId: subscription.customer,
        donorId: (_d = (_c = subscription.metadata) === null || _c === void 0 ? void 0 : _c.donorId) !== null && _d !== void 0 ? _d : null,
        campaignId: (_f = (_e = subscription.metadata) === null || _e === void 0 ? void 0 : _e.campaignId) !== null && _f !== void 0 ? _f : null,
        status: subscription.status,
        interval: (_j = (_h = (_g = subscription.items.data[0]) === null || _g === void 0 ? void 0 : _g.plan) === null || _h === void 0 ? void 0 : _h.interval) !== null && _j !== void 0 ? _j : null,
        interval_count: (_m = (_l = (_k = subscription.items.data[0]) === null || _k === void 0 ? void 0 : _k.plan) === null || _l === void 0 ? void 0 : _l.interval_count) !== null && _m !== void 0 ? _m : null,
        priceId: (_q = (_p = (_o = subscription.items.data[0]) === null || _o === void 0 ? void 0 : _o.price) === null || _p === void 0 ? void 0 : _p.id) !== null && _q !== void 0 ? _q : null,
        amount: (_t = (_s = (_r = subscription.items.data[0]) === null || _r === void 0 ? void 0 : _r.price) === null || _s === void 0 ? void 0 : _s.unit_amount) !== null && _t !== void 0 ? _t : null,
        currency: (_w = (_v = (_u = subscription.items.data[0]) === null || _u === void 0 ? void 0 : _u.price) === null || _v === void 0 ? void 0 : _v.currency) !== null && _w !== void 0 ? _w : null,
        current_period_end: currentPeriodEnd,
        latest_invoice_id: (_x = subscription.latest_invoice) !== null && _x !== void 0 ? _x : null,
        platform: (_z = (_y = subscription.metadata) === null || _y === void 0 ? void 0 : _y.platform) !== null && _z !== void 0 ? _z : null,
        isGiftAid: ((_0 = subscription.metadata) === null || _0 === void 0 ? void 0 : _0.isGiftAid) === 'true',
        metadata: (_1 = subscription.metadata) !== null && _1 !== void 0 ? _1 : {},
        payment_method_id: typeof subscription.default_payment_method === 'string'
            ? subscription.default_payment_method
            : (_3 = (_2 = subscription.default_payment_method) === null || _2 === void 0 ? void 0 : _2.id) !== null && _3 !== void 0 ? _3 : null,
        payment_method_last4: (_4 = card === null || card === void 0 ? void 0 : card.last4) !== null && _4 !== void 0 ? _4 : null,
        payment_method_brand: (_5 = card === null || card === void 0 ? void 0 : card.brand) !== null && _5 !== void 0 ? _5 : null,
        createdAt: config_1.admin.firestore.Timestamp.fromMillis(subscription.created * 1000),
        updatedAt: config_1.admin.firestore.Timestamp.now(),
    }, { merge: true });
}
async function upsertInvoice(invoice, succeeded) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    const extendedInvoice = invoice;
    const docRef = config_1.db.collection('donations').doc(invoice.id || 'unknown-invoice');
    const subscriptionId = typeof extendedInvoice.subscription === 'string'
        ? extendedInvoice.subscription
        : null;
    const paymentIntentId = typeof extendedInvoice.payment_intent === 'string'
        ? extendedInvoice.payment_intent
        : (_b = (_a = extendedInvoice.payment_intent) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null;
    const donation = {
        subscriptionId,
        invoiceId: invoice.id,
        paymentIntentId,
        amount: (_d = (_c = invoice.amount_paid) !== null && _c !== void 0 ? _c : invoice.amount_due) !== null && _d !== void 0 ? _d : 0,
        currency: invoice.currency,
        status: succeeded ? 'succeeded' : 'failed',
        customerId: invoice.customer,
        donorId: (_f = (_e = invoice.metadata) === null || _e === void 0 ? void 0 : _e.donorId) !== null && _f !== void 0 ? _f : null,
        campaignId: (_h = (_g = invoice.metadata) === null || _g === void 0 ? void 0 : _g.campaignId) !== null && _h !== void 0 ? _h : null,
        isGiftAid: ((_j = invoice.metadata) === null || _j === void 0 ? void 0 : _j.isGiftAid) === 'true',
        platform: (_l = (_k = invoice.metadata) === null || _k === void 0 ? void 0 : _k.platform) !== null && _l !== void 0 ? _l : null,
        error: succeeded
            ? null
            : {
                code: (_m = invoice.last_finalization_error) === null || _m === void 0 ? void 0 : _m.code,
                message: (_o = invoice.last_finalization_error) === null || _o === void 0 ? void 0 : _o.message,
            },
        receipt_url: (_p = invoice.hosted_invoice_url) !== null && _p !== void 0 ? _p : null,
        hosted_invoice_url: (_q = invoice.hosted_invoice_url) !== null && _q !== void 0 ? _q : null,
        createdAt: config_1.admin.firestore.Timestamp.fromMillis(((_r = invoice.created) !== null && _r !== void 0 ? _r : Math.floor(Date.now() / 1000)) * 1000),
        updatedAt: config_1.admin.firestore.Timestamp.now(),
    };
    const existing = await docRef.get();
    const alreadySucceeded = existing.exists && ((_s = existing.data()) === null || _s === void 0 ? void 0 : _s.status) === 'succeeded';
    await docRef.set(donation, { merge: true });
    // Increment campaign totals only once per successful invoice
    if (succeeded && !alreadySucceeded) {
        const campaignId = (_t = invoice.metadata) === null || _t === void 0 ? void 0 : _t.campaignId;
        if (campaignId) {
            const campaignRef = config_1.db.collection('campaigns').doc(campaignId);
            await campaignRef.update({
                collectedAmount: config_1.admin.firestore.FieldValue.increment(donation.amount),
                donationCount: config_1.admin.firestore.FieldValue.increment(1),
                lastUpdated: config_1.admin.firestore.Timestamp.now(),
            });
        }
    }
    // Maintain failure count on subscription doc
    if (subscriptionId) {
        const subRef = config_1.db.collection('subscriptions').doc(subscriptionId);
        if (succeeded) {
            await subRef.set({
                failure_count: 0,
                lastPaymentError: null,
                updatedAt: config_1.admin.firestore.Timestamp.now(),
            }, { merge: true });
        }
        else {
            await subRef.set({
                failure_count: config_1.admin.firestore.FieldValue.increment(1),
                lastPaymentError: (_v = (_u = invoice.last_finalization_error) === null || _u === void 0 ? void 0 : _u.message) !== null && _v !== void 0 ? _v : null,
                updatedAt: config_1.admin.firestore.Timestamp.now(),
            }, { merge: true });
        }
    }
    // Optional: upsert a dedicated invoices collection
    const invoicesRef = config_1.db.collection('invoices').doc(invoice.id || 'unknown-invoice');
    await invoicesRef.set({
        stripeInvoiceId: invoice.id,
        subscriptionId,
        customerId: invoice.customer,
        amount: (_x = (_w = invoice.amount_paid) !== null && _w !== void 0 ? _w : invoice.amount_due) !== null && _x !== void 0 ? _x : 0,
        currency: invoice.currency,
        status: invoice.status,
        paidAt: invoice.status === 'paid' ? config_1.admin.firestore.Timestamp.now() : null,
        hostedInvoiceUrl: (_y = invoice.hosted_invoice_url) !== null && _y !== void 0 ? _y : null,
        createdAt: config_1.admin.firestore.Timestamp.fromMillis(((_z = invoice.created) !== null && _z !== void 0 ? _z : Math.floor(Date.now() / 1000)) * 1000),
        updatedAt: config_1.admin.firestore.Timestamp.now(),
    }, { merge: true });
}
//# sourceMappingURL=handleStripeWebhook.js.map