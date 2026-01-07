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
exports.updatePaymentMethod = void 0;
const functions = __importStar(require("firebase-functions"));
const config_1 = require("../../config");
/**
 * Updates the default payment method for a subscription.
 * Requires Firebase ID token in Authorization: Bearer <token>.
 */
exports.updatePaymentMethod = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c;
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).send({ error: 'Unauthorized: Missing token' });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await config_1.auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const { subscriptionId, paymentMethodId } = req.body || {};
        if (!subscriptionId || !paymentMethodId) {
            res.status(400).send({ error: 'Missing subscriptionId or paymentMethodId' });
            return;
        }
        // Fetch subscription to verify ownership and get customer
        const subscription = await config_1.stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['customer'],
        });
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        // Optional: ensure the subscription metadata donorId matches uid (best-effort)
        if (((_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.donorId) && subscription.metadata.donorId !== uid) {
            res.status(403).send({ error: 'Forbidden: subscription does not belong to this user' });
            return;
        }
        // Attach payment method to customer if not already
        await config_1.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId }).catch((err) => {
            var _a;
            const rawCode = typeof err === 'object' && err !== null && 'raw' in err
                ? (_a = err.raw) === null || _a === void 0 ? void 0 : _a.code
                : undefined;
            if (rawCode !== 'resource_already_exists') {
                throw err;
            }
        });
        // Retrieve PM for card details
        const pm = (await config_1.stripe.paymentMethods.retrieve(paymentMethodId));
        const card = pm.card;
        // Update subscription default payment method
        await config_1.stripe.subscriptions.update(subscriptionId, {
            default_payment_method: paymentMethodId,
        });
        // Update customer invoice settings too
        await config_1.stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });
        // Update Firestore subscription doc with payment method snippet and timestamp
        const subRef = config_1.db.collection('subscriptions').doc(subscriptionId);
        await subRef.set({
            payment_method_id: paymentMethodId,
            payment_method_last4: (_b = card === null || card === void 0 ? void 0 : card.last4) !== null && _b !== void 0 ? _b : null,
            payment_method_brand: (_c = card === null || card === void 0 ? void 0 : card.brand) !== null && _c !== void 0 ? _c : null,
            updatedAt: new Date(),
        }, { merge: true });
        const response = { success: true };
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Error updating payment method:', err);
        res.status(500).send({
            error: err instanceof Error ? err.message : 'Unknown error occurred',
        });
    }
});
//# sourceMappingURL=updatePaymentMethod.js.map