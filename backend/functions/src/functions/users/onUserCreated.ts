import * as functions from 'firebase-functions';
import { enqueueWelcomeEmail } from '../donations/emailHelper';

/**
 * Sends a welcome email via the Firestore email extension when a user signs up.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  if (!email) return;

  const name = user.displayName || undefined;
  await enqueueWelcomeEmail(email, name);
});
