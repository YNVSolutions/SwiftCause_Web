import { giftAidApi } from '../api';
import { GiftAidDetails, GiftAidDeclaration } from '../model/types';

export async function submitGiftAidDeclaration(
  giftAidDetails: GiftAidDetails,
  donationId: string,
  campaignId: string,
  campaignTitle: string
): Promise<string> {
  const mappedDeclaration: Omit<GiftAidDeclaration, 'id' | 'createdAt' | 'updatedAt'> = {
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

  return await giftAidApi.createGiftAidDeclaration(mappedDeclaration);
}