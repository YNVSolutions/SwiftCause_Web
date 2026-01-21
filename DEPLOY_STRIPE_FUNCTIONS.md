# Deploy Stripe Onboarding Functions

## Issue
Getting 404 error when clicking "Setup Stripe Account" button:
```
POST https://createonboardinglink-j2f5w4qwxq-uc.a.run.app/ 404 (Not Found)
```

This happened because the Firebase Cloud Function for Stripe onboarding didn't exist.

## Solution
Created the missing Firebase Cloud Functions for Stripe Connect onboarding.

## New Functions Created

### 1. `createOnboardingLink`
**Location:** `backend/functions/src/functions/stripe-onboarding/createOnboardingLink.ts`

**Purpose:** Creates a Stripe Connect onboarding link for organizations

**Features:**
- Authenticates the user via Firebase Auth token
- Verifies user has access to the organization
- Creates a Stripe Connect account if it doesn't exist
- Generates an onboarding link that redirects to official Stripe page
- Saves Stripe account ID to organization document
- Returns the onboarding URL to redirect the user

### 2. `updateStripeAccountStatus`
**Location:** `backend/functions/src/functions/stripe-onboarding/updateStripeAccountStatus.ts`

**Purpose:** Updates the organization's Stripe account status

**Features:**
- Retrieves current account status from Stripe API
- Updates `chargesEnabled` and `payoutsEnabled` in Firestore
- Can be called manually or via webhook to sync status

## Frontend Changes

Updated the following files to use the correct function URL:
- `src/views/admin/BankDetails.tsx`
- `src/views/admin/AdminDashboard.tsx`

Changed from:
```typescript
'https://createonboardinglink-j2f5w4qwxq-uc.a.run.app'
```

To:
```typescript
'https://us-central1-swiftcause-app.cloudfunctions.net/createOnboardingLink'
```

## Deployment Steps

### 1. Navigate to backend functions directory
```bash
cd backend/functions
```

### 2. Install dependencies (if needed)
```bash
npm install
```

### 3. Build TypeScript
```bash
npm run build
```

### 4. Deploy to Firebase
```bash
npm run deploy
```

Or deploy only the new functions:
```bash
firebase deploy --only functions:createOnboardingLink,functions:updateStripeAccountStatus
```

### 5. Verify deployment
After deployment, you should see:
```
✔  functions[createOnboardingLink(us-central1)] Successful create operation.
✔  functions[updateStripeAccountStatus(us-central1)] Successful create operation.
```

## How It Works

### Onboarding Flow
1. User clicks "Setup Stripe Account" in Bank Details page
2. Frontend calls `createOnboardingLink` Cloud Function
3. Function creates/retrieves Stripe Connect account
4. Function generates onboarding link
5. User is redirected to **official Stripe onboarding page**
6. User completes Stripe account setup
7. Stripe redirects back to app with status
8. Organization document is updated with account status

### Database Structure
After onboarding, the organization document will have:
```typescript
{
  stripe: {
    accountId: "acct_xxxxx",           // Stripe Connect account ID
    chargesEnabled: false,              // Initially false
    payoutsEnabled: false,              // Initially false
    detailsSubmitted: true,             // After completing onboarding
    createdAt: Timestamp,
    updatedAt: Timestamp
  }
}
```

### Status Updates
To manually update the status after Stripe reviews the account:
```typescript
// Call from frontend
const response = await fetch(
  'https://us-central1-swiftcause-app.cloudfunctions.net/updateStripeAccountStatus',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ orgId: organizationId }),
  }
);
```

## Testing

After deployment:

1. **Not Set Up State:**
   - Go to Bank Details page
   - Should see "Setup Stripe Account" button
   - Click button → Should redirect to Stripe onboarding

2. **Under Review State:**
   - Complete Stripe onboarding
   - Return to app
   - Should show "Under Review" message
   - `chargesEnabled: true`, `payoutsEnabled: false`

3. **Fully Set Up State:**
   - After Stripe approves account
   - Call `updateStripeAccountStatus` or wait for webhook
   - Should show "Account Setup Successfully"
   - Both `chargesEnabled` and `payoutsEnabled` are `true`

## Environment Variables

Make sure these are set in your Firebase Functions environment:
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx  # or sk_live_xxxxx for production
```

Check with:
```bash
firebase functions:config:get
```

Set with:
```bash
firebase functions:config:set stripe.secret_key="sk_test_xxxxx"
```

## Troubleshooting

### 404 Error persists
- Ensure functions are deployed: `firebase deploy --only functions`
- Check function name matches: `createOnboardingLink` (camelCase)
- Verify Firebase project ID in URL

### Authentication Error
- Ensure user is logged in
- Check Firebase Auth token is valid
- Verify user has organizationId in their document

### Stripe API Error
- Check STRIPE_SECRET_KEY is set correctly
- Verify Stripe account has Connect enabled
- Check Stripe API version compatibility
