/**
 * Cloud Functions Configuration
 * Dynamically generates function URLs based on the current Firebase project
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const REGION = 'us-central1';

export const getFunctionUrl = (functionName: string): string => {
  // Cloud Run URL format: https://[function-name]-[hash].a.run.app
  return `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${functionName}`;
};

export const FUNCTION_URLS = {
  verifySignupRecaptcha: getFunctionUrl('verifySignupRecaptcha'),
  createKioskPaymentIntent: getFunctionUrl('createKioskPaymentIntent'),
  createExpressDashboardLink: getFunctionUrl('createExpressDashboardLink'),
  createOnboardingLink: getFunctionUrl('createOnboardingLink'),
  createPaymentIntent: getFunctionUrl('createPaymentIntent'),
  kioskLogin: getFunctionUrl('kioskLogin'),
  createUser: getFunctionUrl('createUser'),
  updateUser: getFunctionUrl('updateUser'),
  deleteUser: getFunctionUrl('deleteUser'),
} as const;

export default FUNCTION_URLS;
