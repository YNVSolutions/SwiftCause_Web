import * as functions from 'firebase-functions';
import { enqueueDonationThankYouEmail, DonationRecord } from './emailHelper';

export const onDonationUpdated = functions.firestore
  .document('donations/{donationId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as DonationRecord | undefined;
    const after = change.after.data() as DonationRecord | undefined;

    if (!after) {
      return;
    }

    const beforeEmail = before?.donorEmail;
    const afterEmail = after.donorEmail;

    // Only fire when donorEmail was missing and is now set.
    if (!afterEmail || beforeEmail === afterEmail) {
      return;
    }

    await enqueueDonationThankYouEmail(after, context.params.donationId);
  });
