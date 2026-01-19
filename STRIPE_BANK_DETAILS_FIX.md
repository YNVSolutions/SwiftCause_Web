# Stripe Bank Details Setup - Fixed

## Changes Made

### Issue
The Bank Details page wasn't properly checking the Stripe account status based on both `chargesEnabled` and `payoutsEnabled` fields in the organization's Stripe document.

### Solution

Updated `src/views/admin/BankDetails.tsx` to properly handle three states:

#### 1. **Not Set Up** (Both `chargesEnabled` and `payoutsEnabled` are `false`)
- Shows amber warning box: "Account Not Set Up"
- Displays "Setup Stripe Account" button
- Clicking the button redirects to official Stripe onboarding page

#### 2. **Under Review** (`chargesEnabled` is `true`, but `payoutsEnabled` is `false`)
- Shows blue info box: "Under Review"
- Message: "Your Stripe account is being reviewed. Payouts will be enabled shortly. You can already accept donations."
- No action button (waiting for Stripe review)

#### 3. **Fully Set Up** (Both `chargesEnabled` and `payoutsEnabled` are `true`)
- Shows green success box: "Account Setup Successfully"
- Message: "Your Stripe account is fully configured and ready to accept donations and process payouts."
- Displays status indicators for both Charges and Payouts

## How It Works

### Stripe Onboarding Flow
1. User clicks "Setup Stripe Account" button
2. Frontend calls Firebase Cloud Function: `createonboardinglink-j2f5w4qwxq-uc.a.run.app`
3. Cloud Function creates a Stripe Connect onboarding link
4. User is redirected to **official Stripe page** to complete account setup
5. After completion, Stripe redirects back to the app
6. Organization document is updated with `chargesEnabled` and `payoutsEnabled` status
7. Bank Details page automatically reflects the new status

### Database Structure
The organization document in Firestore should have:
```typescript
{
  stripe: {
    accountId: string,
    chargesEnabled: boolean,  // Can accept payments
    payoutsEnabled: boolean   // Can receive payouts
  }
}
```

## Testing
1. **Not Set Up**: Set both fields to `false` - Should show "Setup Stripe Account" button
2. **Under Review**: Set `chargesEnabled: true`, `payoutsEnabled: false` - Should show "Under Review"
3. **Fully Set Up**: Set both to `true` - Should show "Account Setup Successfully"

The button properly redirects to Stripe's official onboarding page for account setup.
