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
exports.createSetupIntent = void 0;
const functions = __importStar(require("firebase-functions"));
const config_1 = require("../../config");
/**
 * Creates a Stripe SetupIntent for saving a payment method before starting a subscription.
 * Authenticated via Firebase ID token (Bearer token).
 */
exports.createSetupIntent = functions.https.onRequest(async (req, res) => {
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
        const { campaignId, interval } = req.body || {};
        const setupIntent = await config_1.stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ['card'],
            metadata: {
                firebaseUID: uid,
                campaignId: campaignId || '',
                interval: interval || '',
            },
        });
        const response = {
            clientSecret: setupIntent.client_secret,
            customerId,
        };
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Error creating setup intent:', err);
        res.status(500).send({
            error: err instanceof Error ? err.message : 'Unknown error occurred',
        });
    }
});
//# sourceMappingURL=createSetupIntent.js.map