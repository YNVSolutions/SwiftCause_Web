# Quick Deployment Guide for Stripe Functions

## Your Function URL
```
https://us-central1-swiftcause-app.cloudfunctions.net/createOnboardingLink
```

This URL is already configured in your frontend code. Now you just need to deploy the backend functions.

## Deploy Steps

### Option 1: Deploy All Functions (Recommended)
```bash
cd backend/functions
npm run build
npm run deploy
```

### Option 2: Deploy Only Stripe Functions (Faster)
```bash
cd backend/functions
npm run build
firebase deploy --only functions:createOnboardingLink,functions:updateStripeAccountStatus
```

### Option 3: Deploy Including User Functions
```bash
cd backend/functions
npm run build
firebase deploy --only functions:createOnboardingLink,functions:updateStripeAccountStatus,functions:updateUser,functions:createUser,functions:deleteUser
```

## Expected Output

After successful deployment, you should see:
```
✔  functions[createOnboardingLink(us-central1)] Successful create operation.
✔  functions[updateStripeAccountStatus(us-central1)] Successful create operation.

Function URL (createOnboardingLink(us-central1)):
https://us-central1-swiftcause-app.cloudfunctions.net/createOnboardingLink
```

## Verify Deployment

### 1. Check Firebase Console
- Go to: https://console.firebase.google.com
- Select your project: `swiftcause-app`
- Navigate to: Functions
- You should see `createOnboardingLink` and `updateStripeAccountStatus` listed

### 2. Test the Function
After deployment:
1. Go to your app's Bank Details page
2. Click "Setup Stripe Account" button
3. Should redirect to Stripe's official onboarding page
4. No more 404 error!

## Troubleshooting

### Build Errors
If you get TypeScript errors during build:
```bash
cd backend/functions
npm install
npm run build
```

### Deployment Errors

**Error: "Firebase CLI not found"**
```bash
npm install -g firebase-tools
firebase login
```

**Error: "Project not initialized"**
```bash
cd backend
firebase use swiftcause-app
```

**Error: "Insufficient permissions"**
```bash
firebase login
# Make sure you're logged in with the correct Google account
```

### Environment Variables

Make sure Stripe secret key is configured:
```bash
# Check current config
firebase functions:config:get

# Set Stripe key if not set
firebase functions:config:set stripe.secret_key="your_stripe_secret_key"

# After setting config, redeploy
npm run deploy
```

## What Happens After Deployment

1. **Setup Stripe Account button** → Calls `createOnboardingLink`
2. Function creates/retrieves Stripe Connect account
3. Function generates onboarding URL
4. User redirects to **Stripe's official page**
5. User completes account setup on Stripe
6. Stripe redirects back to your app
7. Organization document updates with Stripe status

## Database Updates

After successful onboarding, your organization document will have:
```javascript
{
  stripe: {
    accountId: "acct_xxxxxxxxxxxxx",
    chargesEnabled: false,  // Initially false, true after Stripe review
    payoutsEnabled: false,  // Initially false, true after Stripe review
    createdAt: Timestamp,
    updatedAt: Timestamp
  }
}
```

## Next Steps After Deployment

1. Test the onboarding flow
2. Complete Stripe account setup
3. Wait for Stripe to review and enable charges/payouts
4. The Bank Details page will automatically update to show the correct status

## Need Help?

If deployment fails or you get errors, check:
- Firebase project is correct: `swiftcause-app`
- You have deployment permissions
- All dependencies are installed: `npm install`
- TypeScript compiles without errors: `npm run build`
