import * as functions from 'firebase-functions';
import { enqueueDonationThankYouEmail, DonationRecord } from './emailHelper';

export const onDonationCreated = functions.firestore
  .document('donations/{donationId}')
  .onCreate(async (snapshot, context) => {
    const donation = snapshot.data() as DonationRecord | undefined;

    if (!donation) {
      return;
    }

    await enqueueDonationThankYouEmail(donation, context.params.donationId);
  });
