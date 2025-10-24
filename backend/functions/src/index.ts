// Export all functions for Firebase deployment
export {
  handleStripeWebhook,
  createPaymentIntent,
} from './functions/payments';

export {
  getConnectionToken,
} from './functions/terminal';
