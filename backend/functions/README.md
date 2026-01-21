# Firebase Functions - Refactored Structure

## Directory Structure

```
functions/
├── index.js                    # Main entry point - exports all functions
├── handlers/                   # Request handlers
│   ├── users.js               # User management (create, delete)
│   ├── payments.js            # Payment intents and onboarding
│   ├── webhooks.js            # Stripe webhook handlers
│   └── triggers.js            # Firestore triggers
├── middleware/                 # Reusable middleware
│   ├── auth.js                # Authentication & authorization
│   └── cors.js                # CORS configuration
└── services/                   # External service integrations
    └── stripe.js              # Stripe API client
```

## Exported Functions

All functions maintain backwards compatibility with the original implementation:

### HTTP Functions
- `createUser` - Create new user with role-based access
- `deleteUser` - Delete user by ID
- `handleAccountUpdatedStripeWebhook` - Process Stripe account updates
- `handlePaymentCompletedStripeWebhook` - Process successful payments
- `createOnboardingLink` - Generate Stripe onboarding URL
- `createKioskPaymentIntent` - Create payment for kiosk donations
- `createPaymentIntent` - Create payment for authenticated users

### Firestore Triggers
- `createStripeAccountForNewOrg` - Auto-create Stripe account for new organizations

## Benefits of This Structure

1. **Separation of Concerns** - Each file has a single responsibility
2. **Easier Testing** - Mock individual modules independently
3. **Better Maintainability** - Find and update code faster
4. **Code Reuse** - Shared middleware and services
5. **Scalability** - Easy to add new handlers without bloating files

## Migration Notes

- Original `index.js` backed up as `index.backup.js`
- All function names and signatures remain identical
- No changes needed to Firebase deployment configuration
- Environment variables work exactly as before
