// Export all functions for Firebase deployment
export {
  handleStripeWebhook,
  createPaymentIntent,
} from './functions/payments';

export {
  getConnectionToken,
} from './functions/terminal';

export {
  updateUser,
  createUser,
  deleteUser,
} from './functions/users';

export {
  createOnboardingLink,
  updateStripeAccountStatus,
} from './functions/stripe-onboarding';
