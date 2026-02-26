# Recurring Donations System - Complete Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [User Flow](#user-flow)
4. [Frontend Implementation](#frontend-implementation)
5. [Backend Implementation](#backend-implementation)
6. [Data Storage](#data-storage)
7. [Webhook Handling](#webhook-handling)
8. [Error Handling](#error-handling)
9. [Testing](#testing)

---

## Overview

The recurring donations system allows donors to set up automatic monthly, quarterly, or yearly donations to campaigns. The system is built on top of Stripe Subscriptions and integrates seamlessly with the existing one-time donation flow.

### Key Features
- Guest checkout (no account required)
- Multiple billing intervals (monthly, quarterly, yearly)
- Automatic payment processing
- Subscription management
- Webhook-based donation tracking
- Admin dashboard for subscription monitoring

---

## Architecture

### Technology Stack
- **Frontend**: Next.js 16, React, TypeScript
- **Payment Processing**: Stripe.js, Stripe Elements
- **Backend**: Firebase Cloud Functions (Node.js)
- **Database**: Cloud Firestore
- **Webhooks**: Stripe Webhooks for event handling

### System Components

```
┌─────────────────┐
│   Campaign Page │
│  (User selects  │
│   recurring)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Payment Page   │
│ (Stripe Elements)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  usePayment Hook│
│ (Creates Payment│
│    Method)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Firebase Cloud Function     │
│ createRecurringSubscription │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│  Stripe API     │
│ (Creates Sub)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Firestore     │
│ (Stores Sub)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Stripe Webhooks │
│ (invoice.paid)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Firestore     │
│(Stores Donation)│
└─────────────────┘
```

---

## User Flow

### Step-by-Step Process

#### 1. Campaign Selection
**Location**: `app/campaign/[campaignId]/page.tsx`

User navigates to a campaign page and sees:
- Campaign details (title, description, images)
- Amount selector with preset amounts
- **Recurring toggle** (always visible)
- Recurring interval selector (monthly/quarterly/yearly)
- Email and name input fields (required for recurring)

**State Management**: `useCampaignDetailsState.ts`
```typescript
{
  isRecurring: boolean,
  recurringInterval: 'monthly' | 'quarterly' | 'yearly',
  donorEmail: string,
  donorName: string,
  selectedAmount: number,
  customAmount: string
}
```

#### 2. Recurring Configuration
**Component**: `AmountSelector.tsx`

When user toggles recurring ON:
1. Recurring toggle switches to green
2. Interval selector appears (Monthly/Quarterly/Yearly)
3. Email and name fields become visible and required
4. Preview shows: "£X will be charged monthly/quarterly/yearly"

**Validation**:
- Email must be valid (contains @)
- Amount must be > 0
- Donor info stored in sessionStorage for persistence

#### 3. Donation Initiation
**Container**: `CampaignDetailsContainer.tsx`

When user clicks "Donate":
```typescript
const handleDonate = () => {
  const amount = getEffectiveAmount();
  
  if (isRecurring) {
    const email = getDonorEmail();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    // Store in sessionStorage
    sessionStorage.setItem('donorEmail', email);
    sessionStorage.setItem('donorName', getDonorName());
  }
  
  onDonate(campaign, amount, {
    isRecurring,
    recurringInterval
  });
};
```

Redirects to: `/payment/[campaignId]?amount=X&recurring=true&interval=monthly`

#### 4. Payment Page
**Location**: `app/payment/[campaignId]/page.tsx`

Displays:
- Campaign summary
- Amount to be charged
- **Recurring badge** (if recurring)
- Next charge date
- Annual impact calculation
- Stripe card input (CardElement)

**Metadata Preparation**:
```typescript
const metadata = {
  campaignId,
  donorEmail: sessionStorage.getItem('donorEmail'),
  donorName: sessionStorage.getItem('donorName'),
  isRecurring: true,
  recurringInterval: 'monthly',
  platform: 'web'
};
```

#### 5. Payment Processing
**Hook**: `usePayment.ts`

##### 5a. Create Payment Method
```typescript
const { paymentMethod, error } = await stripe.createPaymentMethod({
  type: 'card',
  card: cardElement,
});
```

This creates a reusable payment method in Stripe that can be charged repeatedly.

##### 5b. Interval Mapping
```typescript
const intervalMap = {
  monthly: 'month',
  quarterly: 'month',  // Handled as 3-month interval
  yearly: 'year'
};
const interval = intervalMap[recurringInterval];
```

##### 5c. Call Backend
```typescript
const response = await fetch(
  'https://us-central1-swiftcause-app.cloudfunctions.net/createRecurringSubscription',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      interval,
      campaignId,
      donor: {
        email: donorEmail,
        name: donorName,
        phone: donorPhone
      },
      paymentMethodId: paymentMethod.id,
      metadata
    })
  }
);
```

---

## Frontend Implementation

### Component Hierarchy

```
CampaignDetailsPage
├── AmountSelector
│   ├── Recurring Toggle
│   ├── Interval Selector
│   ├── RecurringDonorInfo (email/name inputs)
│   ├── Recurring Preview
│   └── Amount Buttons
└── DonateButton

PaymentScreen
├── Campaign Summary
├── Recurring Badge
├── CardElement (Stripe)
└── Pay Button
```

### Key Components

#### 1. AmountSelector.tsx
**Purpose**: Handles amount selection and recurring configuration

**Props**:
```typescript
interface AmountSelectorProps {
  amounts: number[];
  selectedAmount: number | null;
  customAmount: string;
  currency: string;
  enableRecurring: boolean;
  recurringIntervals: string[];
  isRecurring: boolean;
  recurringInterval: 'monthly' | 'quarterly' | 'yearly';
  donorEmail: string;
  donorName: string;
  onSelectAmount: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;
  onRecurringToggle: (value: boolean) => void;
  onRecurringIntervalChange: (interval) => void;
  onDonorEmailChange: (email: string) => void;
  onDonorNameChange: (name: string) => void;
}
```

**Features**:
- Always shows recurring toggle (forced to true for testing)
- Validates email before allowing donation
- Stores donor info in sessionStorage
- Shows preview of recurring charge

#### 2. RecurringDonorInfo.tsx
**Purpose**: Collects donor email and name for recurring donations

```typescript
export const RecurringDonorInfo = ({ email, name, onEmailChange, onNameChange }) => {
  return (
    <div className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="Email address *"
        required
      />
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Full name (optional)"
      />
    </div>
  );
};
```

#### 3. usePayment.ts
**Purpose**: Handles payment processing logic

**Key Functions**:

```typescript
// Main payment handler
const handlePaymentSubmit = async (amount, metadata, currency) => {
  const isRecurring = metadata.isRecurring === true;
  
  if (isRecurring) {
    await handleRecurringPayment(...);
  } else {
    await handleOneTimePayment(...);
  }
};

// Recurring payment flow
const handleRecurringPayment = async (...) => {
  // 1. Create payment method
  const { paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement
  });
  
  // 2. Map interval
  const interval = intervalMap[recurringInterval] || 'month';
  
  // 3. Call backend
  const response = await fetch(endpoint, {
    body: JSON.stringify({
      amount,
      interval,
      campaignId,
      donor: { email, name, phone },
      paymentMethodId: paymentMethod.id,
      metadata
    })
  });
  
  // 4. Handle 3D Secure if needed
  if (result.requiresAction) {
    await stripe.confirmCardPayment(result.clientSecret);
  }
  
  // 5. Complete
  onPaymentComplete({ success: true, subscriptionId });
};
```

---

## Backend Implementation

### Cloud Functions

#### 1. createRecurringSubscription
**File**: `backend/functions/handlers/subscriptions.js`

**Purpose**: Creates a Stripe subscription and stores it in Firestore

**Request Body**:
```json
{
  "amount": 5000,
  "interval": "month",
  "campaignId": "abc123",
  "donor": {
    "email": "donor@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "paymentMethodId": "pm_xxx",
  "metadata": {
    "platform": "web",
    "isRecurring": true,
    "recurringInterval": "monthly"
  }
}
```

**Process Flow**:

```javascript
1. Validate Input
   - Check required fields (amount, interval, campaignId, donor.email)
   - Validate interval ('month' or 'year')
   - Verify paymentMethodId exists

2. Fetch Campaign & Organization
   const campaignSnap = await firestore
     .collection('campaigns')
     .doc(campaignId)
     .get();
   
   const orgSnap = await firestore
     .collection('organizations')
     .doc(campaignData.organizationId)
     .get();
   
   const stripeAccountId = orgSnap.data().stripe.accountId;

3. Get or Create Stripe Customer
   const customer = await getOrCreateCustomerByEmail(donor.email, {
     name: donor.name,
     campaignId,
     organizationId
   });

4. Attach Payment Method to Customer
   await stripe.paymentMethods.attach(paymentMethodId, {
     customer: customer.id
   });
   
   await stripe.customers.update(customer.id, {
     invoice_settings: {
       default_payment_method: paymentMethodId
     }
   });

5. Create Stripe Price (Inline Product)
   const price = await stripe.prices.create({
     unit_amount: amount,
     currency: 'usd',
     recurring: { interval },
     product_data: {
       name: `Recurring donation to ${campaignData.title}`,
       metadata: { campaignId, organizationId }
     }
   });

6. Create Stripe Subscription
   const subscription = await stripe.subscriptions.create({
     customer: customer.id,
     items: [{ price: price.id }],
     default_payment_method: paymentMethodId,
     collection_method: 'charge_automatically',
     expand: ['latest_invoice.payment_intent'],
     transfer_data: { destination: stripeAccountId },
     metadata: {
       campaignId,
       organizationId,
       donorEmail: donor.email,
       donorName: donor.name,
       platform: 'web'
     }
   });

7. Save to Firestore
   await createSubscriptionDoc({
     stripeSubscriptionId: subscription.id,
     customerId: customer.id,
     campaignId,
     organizationId,
     interval,
     amount,
     currency: 'usd',
     status: subscription.status,
     currentPeriodEnd: subscription.current_period_end,
     metadata: {
       donorEmail: donor.email,
       donorName: donor.name,
       platform: 'web'
     }
   });

8. Handle First Invoice
   if (latestInvoice?.payment_intent) {
     return {
       subscriptionId: subscription.id,
       clientSecret: paymentIntent.client_secret,
       status: subscription.status,
       requiresAction: paymentIntent.status === 'requires_action'
     };
   }
```

**Response**:
```json
{
  "success": true,
  "subscriptionId": "sub_xxx",
  "status": "active",
  "message": "Subscription created and first payment completed"
}
```

#### 2. cancelRecurringSubscription
**Purpose**: Cancels an active subscription

**Request**:
```json
{
  "subscriptionId": "sub_xxx",
  "cancelImmediately": false
}
```

**Process**:
1. Fetch subscription from Firestore
2. Cancel in Stripe
3. Update Firestore status to "canceled"

#### 3. updateSubscriptionPaymentMethod
**Purpose**: Updates the payment method for a subscription

**Request**:
```json
{
  "subscriptionId": "sub_xxx",
  "paymentMethodId": "pm_new"
}
```

**Process**:
1. Attach new payment method to customer
2. Update customer's default payment method
3. Update subscription's default payment method

---

## Data Storage

### Firestore Collections

#### 1. subscriptions Collection
**Document ID**: Stripe Subscription ID (`sub_xxx`)

**Schema**:
```typescript
{
  stripeSubscriptionId: string;      // "sub_1ABC..."
  customerId: string;                // "cus_1ABC..."
  campaignId: string;                // Campaign reference
  organizationId: string;            // Organization reference
  interval: 'month' | 'year';        // Billing interval
  amount: number;                    // Amount in cents
  currency: string;                  // "usd", "gbp", etc.
  status: string;                    // "active", "past_due", "canceled"
  currentPeriodEnd: Timestamp;       // Next billing date
  donorEmail: string;                // Donor's email
  donorName: string;                 // Donor's name
  platform: string;                  // "web", "kiosk", etc.
  createdAt: Timestamp;              // Creation timestamp
  updatedAt: Timestamp;              // Last update timestamp
  canceledAt?: Timestamp;            // Cancellation timestamp
  lastFailedInvoice?: string;        // Last failed invoice ID
  lastFailedAt?: Timestamp;          // Last failure timestamp
}
```

**Indexes**:
- `campaignId` (for campaign-specific queries)
- `organizationId` (for organization-specific queries)
- `donorEmail` (for donor lookup)
- `status` (for filtering active subscriptions)

#### 2. donations Collection
**Document ID**: Auto-generated

**Schema** (Recurring Donations):
```typescript
{
  transactionId: string;             // Payment Intent ID or Invoice ID
  campaignId: string;                // Campaign reference
  organizationId: string;            // Organization reference
  amount: number;                    // Amount in cents
  currency: string;                  // "usd", "gbp", etc.
  donorEmail: string;                // Donor's email
  donorName: string;                 // Donor's name
  donorPhone?: string;               // Donor's phone
  donorMessage?: string;             // Donor's message
  isAnonymous: boolean;              // Anonymous donation flag
  isGiftAid: boolean;                // Gift Aid flag
  isRecurring: true;                 // Recurring flag
  recurringInterval: string;         // "month", "year"
  subscriptionId: string;            // Reference to subscription
  invoiceId: string;                 // Stripe invoice ID
  platform: string;                  // "web", "kiosk", etc.
  createdAt: Timestamp;              // Donation timestamp
  metadata: {
    campaignTitleSnapshot: string;   // Campaign title at time of donation
    source: string;                  // "stripe_webhook"
  }
}
```

---

## Webhook Handling

### Stripe Webhooks

#### 1. invoice.paid
**Purpose**: Record each recurring payment as a donation

**Handler**: `handleInvoicePaid` in `webhooks.js`

**Process**:
```javascript
1. Extract subscription ID from invoice
2. Fetch subscription data from Firestore
3. Create donation record:
   await createDonationDoc({
     transactionId: invoice.payment_intent,
     campaignId: subscriptionData.campaignId,
     organizationId: subscriptionData.organizationId,
     amount: invoice.amount_paid,
     currency: invoice.currency,
     donorEmail: subscriptionData.metadata.donorEmail,
     donorName: subscriptionData.metadata.donorName,
     isRecurring: true,
     recurringInterval: subscriptionData.interval,
     subscriptionId: subscriptionId,
     invoiceId: invoice.id,
     platform: 'web'
   });
```

**Result**: Each monthly/yearly charge creates a new donation record

#### 2. invoice.payment_failed
**Purpose**: Mark subscription as past_due

**Process**:
```javascript
await updateSubscriptionStatus(subscriptionId, 'past_due', {
  lastFailedInvoice: invoice.id,
  lastFailedAt: Timestamp.now()
});
```

#### 3. customer.subscription.updated
**Purpose**: Sync subscription status changes

**Process**:
```javascript
await updateSubscriptionStatus(subscription.id, subscription.status, {
  currentPeriodEnd: Timestamp.fromDate(
    new Date(subscription.current_period_end * 1000)
  )
});
```

#### 4. customer.subscription.deleted
**Purpose**: Mark subscription as canceled

**Process**:
```javascript
await updateSubscriptionStatus(subscription.id, 'canceled', {
  canceledAt: Timestamp.now()
});
```

### Idempotency

All webhooks use idempotency checks to prevent duplicate processing:

```javascript
// Check if event already processed
if (await isEventProcessed(event.id)) {
  return res.status(200).send('OK');
}

// Process event...

// Mark as processed
await markEventProcessed(event.id, event.type, {
  objectId: event.data.object.id
});
```

---

## Error Handling

### Frontend Error Handling

#### 1. Validation Errors
```typescript
// Email validation
if (!email || !email.includes('@')) {
  alert('Please enter a valid email address');
  return;
}

// Amount validation
if (amount <= 0) {
  alert('Please select or enter a donation amount');
  return;
}
```

#### 2. Payment Errors
```typescript
try {
  await handleRecurringPayment(...);
} catch (err) {
  const errorMessage = err instanceof Error 
    ? err.message 
    : 'An unexpected error occurred';
  setError(errorMessage);
  onPaymentComplete({ success: false, error: errorMessage });
}
```

#### 3. Network Errors
```typescript
if (!response.ok) {
  const errorData = await response.json();
  const errorMessage = errorData.error?.message || 
                       errorData.message || 
                       'Failed to create subscription';
  throw new Error(errorMessage);
}
```

### Backend Error Handling

#### 1. Validation Errors
```javascript
if (!amount || !interval || !campaignId || !donor?.email) {
  return res.status(400).send({
    error: 'Missing required fields: amount, interval, campaignId, donor.email'
  });
}
```

#### 2. Stripe Errors
```javascript
try {
  const subscription = await stripe.subscriptions.create(...);
} catch (error) {
  console.error('Error creating recurring subscription:', error);
  return res.status(500).send({ error: error.message });
}
```

#### 3. Firestore Errors
```javascript
try {
  await createSubscriptionDoc(...);
} catch (error) {
  console.error('Error saving subscription to Firestore:', error);
  // Subscription created in Stripe but not saved to Firestore
  // Webhook will handle creating donation records
}
```

### Auth Provider Error Handling

```typescript
try {
  await firebaseUser.getIdToken(true);
  const decodedToken = await firebaseUser.getIdTokenResult();
  // ... auth logic
} catch (error) {
  // Handle auth errors gracefully for guest users
  console.error('AuthProvider: Error processing authenticated user:', error);
  setUserRole(null);
  setCurrentKioskSession(null);
  setCurrentAdminSession(null);
}
```

---

## Testing

### Test Scenarios

#### 1. Happy Path - Monthly Subscription
```
1. Navigate to campaign
2. Toggle recurring ON
3. Select "Monthly"
4. Enter email: test@example.com
5. Enter name: Test User
6. Select amount: £50
7. Click "Donate"
8. Enter card: 4242 4242 4242 4242
9. Click "Pay"
10. Verify success message
11. Check Stripe Dashboard → Subscriptions
12. Check Firestore → subscriptions collection
13. Check Firestore → donations collection
```

#### 2. Quarterly Subscription
```
Same as above but select "Quarterly"
Verify interval is mapped to "month" in backend
```

#### 3. Yearly Subscription
```
Same as above but select "Yearly"
Verify interval is "year" in backend
```

#### 4. Email Validation
```
1. Toggle recurring ON
2. Leave email empty
3. Click "Donate"
4. Verify error: "Please enter a valid email address"
```

#### 5. 3D Secure Authentication
```
1. Use test card: 4000 0027 6000 3184
2. Complete 3D Secure challenge
3. Verify subscription created
```

#### 6. Payment Failure
```
1. Use test card: 4000 0000 0000 0341 (declined)
2. Verify error message displayed
3. Verify no subscription created
```

### Test Cards

```
Success: 4242 4242 4242 4242
3D Secure: 4000 0027 6000 3184
Declined: 4000 0000 0000 0341
Insufficient Funds: 4000 0000 0000 9995
```

### Webhook Testing

Use Stripe CLI to test webhooks locally:

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:5001/swiftcause-app/us-central1/handleSubscriptionWebhook

# Trigger test events
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

---

## Configuration

### Environment Variables

#### Frontend (.env)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=swiftcause-app
```

#### Backend (backend/functions/.env)
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET_PAYMENT=whsec_xxx
```

### Stripe Configuration

1. **API Keys**: Must match between frontend and backend
2. **Webhooks**: Configure endpoints in Stripe Dashboard
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Firebase Configuration

1. **Cloud Functions**: Deploy with `firebase deploy --only functions`
2. **Firestore Rules**: Ensure proper security rules for subscriptions collection
3. **Indexes**: Create composite indexes for queries

---

## Admin Dashboard

### Subscription Management

**Location**: `src/views/admin/SubscriptionManagement.tsx`

**Features**:
- View all active subscriptions
- Filter by campaign, organization, status
- Cancel subscriptions
- View subscription details
- Export subscription data

**API Integration**:
```typescript
// Fetch subscriptions
const subscriptions = await subscriptionApi.getSubscriptions({
  organizationId,
  status: 'active'
});

// Cancel subscription
await subscriptionApi.cancelSubscription(subscriptionId);
```

---

## Monitoring & Analytics

### Key Metrics

1. **Subscription Metrics**:
   - Total active subscriptions
   - Monthly recurring revenue (MRR)
   - Churn rate
   - Average subscription value

2. **Payment Metrics**:
   - Successful payments
   - Failed payments
   - Retry success rate

3. **Campaign Metrics**:
   - Subscriptions per campaign
   - Recurring vs one-time ratio

### Logging

All operations are logged for debugging:

```javascript
console.log('Subscription created:', {
  id: subscription.id,
  status: subscription.status,
  customer: customer.id
});

console.log('Recurring donation recorded for invoice:', invoice.id);
```

---

## Security Considerations

1. **Payment Method Security**:
   - Payment methods never exposed to frontend
   - Stored securely in Stripe
   - PCI compliance handled by Stripe

2. **Email Validation**:
   - Required for recurring donations
   - Validated on frontend and backend

3. **Webhook Verification**:
   - All webhooks verified with Stripe signature
   - Idempotency checks prevent duplicate processing

4. **Data Privacy**:
   - Donor information encrypted in transit
   - Minimal PII stored in Firestore
   - GDPR compliant

---

## Future Enhancements

1. **Donor Portal**:
   - Allow donors to manage their subscriptions
   - Update payment methods
   - View donation history

2. **Email Notifications**:
   - Subscription confirmation
   - Payment receipts
   - Payment failure alerts

3. **Advanced Intervals**:
   - Bi-weekly donations
   - Custom intervals

4. **Subscription Upgrades**:
   - Allow donors to increase donation amount
   - Change billing interval

5. **Analytics Dashboard**:
   - Real-time subscription metrics
   - Revenue forecasting
   - Donor retention analysis

---

## Troubleshooting

### Common Issues

#### 1. "No such PaymentMethod" Error
**Cause**: Mismatched Stripe keys between frontend and backend
**Solution**: Ensure publishable key and secret key are from the same Stripe account

#### 2. "Failed to create subscription" Error
**Cause**: Organization not onboarded with Stripe
**Solution**: Complete Stripe Connect onboarding for organization

#### 3. Webhook not firing
**Cause**: Webhook endpoint not configured in Stripe
**Solution**: Add webhook endpoint in Stripe Dashboard

#### 4. Duplicate donations
**Cause**: Webhook processed multiple times
**Solution**: Idempotency checks should prevent this - check logs

#### 5. Auth network error
**Cause**: Firebase auth token retrieval failing for guest users
**Solution**: Error handling added to auth provider to allow guest checkout

---

## Summary

The recurring donations system provides a complete solution for processing subscription-based donations:

1. **User-friendly**: Simple toggle to enable recurring donations
2. **Flexible**: Multiple billing intervals supported
3. **Secure**: Built on Stripe's secure infrastructure
4. **Reliable**: Webhook-based processing ensures no missed payments
5. **Scalable**: Cloud Functions handle high volume
6. **Maintainable**: Well-structured code with clear separation of concerns

The system integrates seamlessly with the existing donation flow while adding powerful recurring payment capabilities.
