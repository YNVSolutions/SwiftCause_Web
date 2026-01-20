# Stripe Webhook - Payment Success Handler

## Answer: YES ✅

**There IS a backend function that gets called after payment succeeds!**

---

## The Webhook Function

### Function Name: `handleStripeWebhook`

**File:** `backend/functions/src/functions/payments/handleStripeWebhook.ts`

**Deployed URL:** 
```
https://us-central1-swiftcause-app.cloudfunctions.net/handleStripeWebhook
```

**Exported in:** `backend/functions/src/index.ts` (Line 3)

---

## What Happens After Payment Succeeds

### Complete Flow:

```
1. User completes payment on frontend
   ↓
2. Stripe processes the payment
   ↓
3. Stripe sends webhook event to your backend
   ↓
4. handleStripeWebhook function receives event
   ↓
5. Function verifies webhook signature
   ↓
6. If event is 'payment_intent.succeeded':
   ├─→ Creates donation record in Firestore
   ├─→ Updates campaign's collected amount
   ├─→ Increments campaign's donation count
   └─→ Updates campaign's last updated timestamp
   ↓
7. Returns 200 OK to Stripe
```

---

## What the Webhook Does

### Line 28-42: Creates Donation Record

```typescript
const donationData: DonationData = {
  campaignId: paymentIntent.metadata.campaignId || null,
  amount: paymentIntent.amount,
  currency: paymentIntent.currency,
  donorId: paymentIntent.metadata.donorId || null,
  donorName: paymentIntent.metadata.donorName || 'Anonymous',
  timestamp: admin.firestore.Timestamp.now(),
  isGiftAid: paymentIntent.metadata.isGiftAid === 'true',
  paymentStatus: 'success',
  platform: paymentIntent.metadata.platform || 'android',
  stripePaymentIntentId: paymentIntent.id,
};

await db.collection('donations').add(donationData);
```

**Creates a document in:** `donations` collection

### Line 44-52: Updates Campaign Statistics

```typescript
const campaignRef = db.collection('campaigns').doc(campaignId);

await campaignRef.update({
  collectedAmount: admin.firestore.FieldValue.increment(paymentIntent.amount),
  donationCount: admin.firestore.FieldValue.increment(1),
  lastUpdated: admin.firestore.Timestamp.now(),
});
```

**Updates:**
- `collectedAmount` - Adds donation amount
- `donationCount` - Increments by 1
- `lastUpdated` - Sets current timestamp

---

## Data Stored in Firestore

### Donations Collection

Each successful payment creates a document with:

```javascript
{
  campaignId: "campaign_123",
  amount: 5000,                    // Amount in cents (£50.00)
  currency: "gbp",
  donorId: "user_456",
  donorName: "John Smith",
  timestamp: Timestamp,
  isGiftAid: true,
  paymentStatus: "success",
  platform: "android",
  stripePaymentIntentId: "pi_xxxxx"
}
```

### Campaigns Collection Update

The campaign document gets updated:

```javascript
{
  // ... other campaign fields
  collectedAmount: 15000,          // Incremented by donation amount
  donationCount: 3,                // Incremented by 1
  lastUpdated: Timestamp           // Updated to current time
}
```

---

## Security Features

### 1. Webhook Signature Verification (Line 16-21)

```typescript
event = stripe.webhooks.constructEvent(
  req.rawBody,
  sig,
  endpointSecret
);
```

**Purpose:** Ensures the webhook actually came from Stripe, not a malicious actor

**How it works:**
- Stripe signs each webhook with a secret
- Your function verifies the signature
- If signature is invalid, request is rejected

### 2. Environment Variable

**Required:** `STRIPE_WEBHOOK_SECRET`

This secret is obtained from Stripe Dashboard when you configure the webhook endpoint.

---

## Webhook Configuration in Stripe

### Setup Steps:

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/webhooks

2. **Add Endpoint:**
   ```
   https://us-central1-swiftcause-app.cloudfunctions.net/handleStripeWebhook
   ```

3. **Select Events to Listen:**
   - ✅ `payment_intent.succeeded`

4. **Copy Webhook Secret:**
   - Format: `whsec_xxxxxxxxxxxxx`

5. **Set in Firebase:**
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_xxxxx"
   ```

---

## Why Use Webhooks?

### Instead of Frontend-Only Processing:

| Approach | Reliability | Security | Accuracy |
|----------|-------------|----------|----------|
| **Frontend only** | ❌ User might close browser | ❌ Can be manipulated | ❌ Might miss events |
| **Webhook** | ✅ Always executes | ✅ Server-side verified | ✅ Never misses events |

### Benefits:

1. **Reliability:** Even if user closes browser, donation is recorded
2. **Security:** Server-side verification prevents fraud
3. **Accuracy:** Single source of truth from Stripe
4. **Async Processing:** Doesn't block user experience
5. **Retry Logic:** Stripe retries failed webhooks automatically

---

## Event Types Handled

Currently handles:
- ✅ `payment_intent.succeeded` - Payment successful

Could also handle (not currently implemented):
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.canceled` - Payment canceled
- `charge.refunded` - Refund processed
- `charge.dispute.created` - Dispute opened

---

## Testing the Webhook

### 1. Using Stripe CLI (Recommended)

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local function
stripe listen --forward-to http://localhost:5001/swiftcause-app/us-central1/handleStripeWebhook

# Trigger test event
stripe trigger payment_intent.succeeded
```

### 2. Using Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select `payment_intent.succeeded`
5. Click "Send test webhook"

### 3. Real Payment Test

1. Make a test donation with card `4242 4242 4242 4242`
2. Check Stripe Dashboard → Events
3. Look for `payment_intent.succeeded` event
4. Verify webhook was sent (should show 200 response)
5. Check Firestore:
   - New document in `donations` collection
   - Updated `collectedAmount` in campaign

---

## Monitoring Webhooks

### Check Webhook Status:

**Stripe Dashboard:**
- Go to: https://dashboard.stripe.com/webhooks
- Click on your endpoint
- View recent deliveries
- Check response codes

**Firebase Logs:**
```bash
firebase functions:log --only handleStripeWebhook
```

### Successful Webhook:
```
✓ Webhook received: payment_intent.succeeded
✓ Donation created: doc_id_123
✓ Campaign updated: campaign_456
✓ Response: 200 OK
```

### Failed Webhook:
```
✗ Webhook Error: Invalid signature
✗ Response: 400 Bad Request
```

---

## Error Handling

### Line 22-25: Signature Verification Error
```typescript
catch (err) {
  console.error('Webhook Error:', err);
  res.status(400).send(`Webhook Error: ${err.message}`);
  return;
}
```

### Line 54-58: Database Error
```typescript
catch (error) {
  console.error('Error processing donation:', error);
  res.status(500).send('Error processing donation');
  return;
}
```

**Stripe's Retry Logic:**
- If webhook returns non-200 status, Stripe retries
- Retries with exponential backoff
- Up to 3 days of retries
- You can manually retry from dashboard

---

## Metadata Passed to Webhook

From Payment Intent creation, these metadata fields are available:

```typescript
metadata: {
  campaignId: "campaign_123",
  campaignTitle: "Save the Ocean",
  donationAmount: "50",
  organizationId: "org_456",
  isRecurring: "false",
  isGiftAid: "true",
  kioskId: "kiosk_789",
  donorName: "John Smith",
  // ... Gift Aid details if applicable
}
```

**Note:** Webhook currently uses:
- `campaignId`
- `donorId`
- `donorName`
- `isGiftAid`
- `platform`

---

## Deployment Status

### Check if Deployed:

```bash
firebase functions:list
```

Should show:
```
✓ handleStripeWebhook (us-central1)
  https://us-central1-swiftcause-app.cloudfunctions.net/handleStripeWebhook
```

### Deploy/Update:

```bash
cd backend/functions
npm run build
firebase deploy --only functions:handleStripeWebhook
```

---

## Important Notes

### 1. Webhook Secret Required
The function needs `STRIPE_WEBHOOK_SECRET` environment variable set:
```bash
firebase functions:config:get
```

If not set:
```bash
firebase functions:config:set stripe.webhook_secret="whsec_xxxxx"
firebase deploy --only functions
```

### 2. Idempotency
Stripe may send the same webhook multiple times. Consider adding idempotency:
- Check if `stripePaymentIntentId` already exists in donations
- Skip if already processed

### 3. Webhook Endpoint Must Be HTTPS
- ✅ Firebase Functions are automatically HTTPS
- ✅ No additional configuration needed

---

## Summary

**YES, there is a backend function called after payment succeeds:**

1. **Function:** `handleStripeWebhook`
2. **Trigger:** Stripe sends `payment_intent.succeeded` event
3. **Actions:**
   - Creates donation record in Firestore
   - Updates campaign statistics
   - Verifies webhook signature for security
4. **Reliability:** Executes even if user closes browser
5. **Status:** Already implemented and exported

**To verify it's working:**
- Check Stripe Dashboard → Webhooks
- Make a test donation
- Check Firestore for new donation document
- Check campaign's `collectedAmount` increased
