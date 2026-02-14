import { giftAidApi } from '../api';
import { GiftAidDetails, GiftAidDeclaration } from '../model/types';
import { getCampaignById } from '../../../shared/api/firestoreService';

export async function submitGiftAidDeclaration(
  giftAidDetails: GiftAidDetails,
  donationId: string,
  campaignId: string,
  campaignTitle: string
): Promise<string> {
  // VALIDATION: Check if Gift Aid is enabled for this campaign
  try {
    const campaign = await getCampaignById(campaignId);
    if (!campaign || !campaign.configuration.giftAidEnabled) {
      throw new Error(`Gift Aid is not enabled for campaign ${campaignId}. Cannot create Gift Aid declaration.`);
    }
  } catch (error) {
    console.error('Error validating campaign Gift Aid status:', error);
    throw new Error(`Failed to validate Gift Aid eligibility for campaign ${campaignId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const mappedDeclaration: Omit<GiftAidDeclaration, 'id' | 'createdAt' | 'updatedAt' | 'classification' | 'pendingReasons'> = {
    donorFirstName: giftAidDetails.firstName,
    donorSurname: giftAidDetails.surname,
    donorHouseNumber: giftAidDetails.houseNumber || '',
    donorAddressLine1: giftAidDetails.addressLine1,
    donorAddressLine2: giftAidDetails.addressLine2 || '',
    donorTown: giftAidDetails.town,
    donorPostcode: giftAidDetails.postcode,
    
    declarationText: giftAidDetails.declarationText,
    declarationDate: giftAidDetails.declarationDate,
    ukTaxpayerConfirmation: giftAidDetails.ukTaxpayerConfirmation,
    
    donationAmount: giftAidDetails.donationAmount,
    giftAidAmount: Math.round(giftAidDetails.donationAmount * 0.25),
    
    donationDate: giftAidDetails.donationDate,
    taxYear: giftAidDetails.taxYear,
    
    campaignId: campaignId,
    campaignTitle: campaignTitle,
    organizationId: giftAidDetails.organizationId,
    
    donationId: donationId,
    giftAidStatus: 'pending'
  };

  // Classification will be automatically applied by giftAidApi.createGiftAidDeclaration
  return await giftAidApi.createGiftAidDeclaration(mappedDeclaration as Omit<GiftAidDeclaration, 'id' | 'createdAt' | 'updatedAt'>);
}