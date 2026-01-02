import { db } from '../../config';

export interface DonationRecord {
  donorEmail?: string;
  donorName?: string;
  campaignId?: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  stripePaymentIntentId?: string;
}

const formatCurrency = (amount?: number, currency?: string): string => {
  if (typeof amount !== 'number') return '';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

export const enqueueDonationThankYouEmail = async (
  donation: DonationRecord,
  donationId: string
): Promise<void> => {
  const donorEmail = donation.donorEmail;
  if (!donorEmail) {
    return;
  }

  const donorName = donation.donorName || 'Friend';
  const transactionRef =
    donation.transactionId || donation.stripePaymentIntentId || donationId;

  let campaignName = 'our cause';
  if (donation.campaignId) {
    try {
      const campaignSnap = await db
        .collection('campaigns')
        .doc(donation.campaignId)
        .get();

      if (campaignSnap.exists) {
        const title = (campaignSnap.data() as { title?: string })?.title;
        if (title) {
          campaignName = title;
        }
      }
    } catch (err) {
      console.error('Failed to fetch campaign for donation email', {
        donationId,
        campaignId: donation.campaignId,
        error: err,
      });
    }
  }

  const amountLabel = formatCurrency(donation.amount, donation.currency);
  const amountLine = amountLabel
    ? `Your donation of ${amountLabel} was received.`
    : 'Your donation was received.';

  const emailDoc = {
    to: [donorEmail],
    message: {
      subject: `Thank you for supporting ${campaignName}!`,
      text: `Hi ${donorName},\n\n${amountLine}\n\nWe appreciate your support for ${campaignName}.\n\nReference: ${transactionRef}\n\nWith gratitude,\nSwiftCause Team`,
      html: `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <p>Hi ${donorName},</p>
    <p>${amountLine}</p>
    <p>We appreciate your support for <strong>${campaignName}</strong>.</p>
    <p><strong>Reference:</strong> ${transactionRef}</p>
    <p>With gratitude,<br/>SwiftCause Team</p>
  </body>
</html>`,
    },
    metadata: {
      donationId,
      campaignId: donation.campaignId || null,
      transactionId: transactionRef,
    },
  };

  await db.collection('mail').add(emailDoc);
};
