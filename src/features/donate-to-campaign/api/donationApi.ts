import { donationApi as entityDonationApi } from '../../../entities/donation';
import { Donation } from '../../../entities/donation';

export const donationApi = {
  // Create donation
  async createDonation(donation: Omit<Donation, 'id'>): Promise<string> {
    try {
      return await entityDonationApi.createDonation(donation);
    } catch (error) {
      console.error('Error creating donation:', error);
      throw error;
    }
  },

  // Get donations by campaign
  async getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
    try {
      return await entityDonationApi.getDonationsByCampaign(campaignId);
    } catch (error) {
      console.error('Error fetching donations by campaign:', error);
      throw error;
    }
  },

  // Get donations by kiosk
  async getDonationsByKiosk(kioskId: string): Promise<Donation[]> {
    try {
      return await entityDonationApi.getDonationsByKiosk(kioskId);
    } catch (error) {
      console.error('Error fetching donations by kiosk:', error);
      throw error;
    }
  }
};
