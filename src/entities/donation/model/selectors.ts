import { Donation } from './types';

export const selectDonationsByCampaign = (donations: Donation[], campaignId: string) =>
  donations.filter(donation => donation.campaignId === campaignId);

export const selectDonationsByKiosk = (donations: Donation[], kioskId: string) =>
  donations.filter(donation => donation.kioskId === kioskId);

export const selectDonationsByOrganization = (donations: Donation[], organizationId: string) =>
  donations.filter(donation => donation.organizationId === organizationId);

export const selectTotalDonationAmount = (donations: Donation[]) =>
  donations.reduce((total, donation) => total + donation.amount, 0);

export const selectRecurringDonations = (donations: Donation[]) =>
  donations.filter(donation => donation.isRecurring);

export const selectAnonymousDonations = (donations: Donation[]) =>
  donations.filter(donation => donation.isAnonymous);

export const selectDonationsByDateRange = (donations: Donation[], startDate: string, endDate: string) =>
  donations.filter(donation => {
    if (!donation.timestamp) return false;
    return donation.timestamp >= startDate && donation.timestamp <= endDate;
  });
