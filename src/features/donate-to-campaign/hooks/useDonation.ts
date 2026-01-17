import { useState, useCallback } from 'react';
import { Donation } from '../../../entities/donation';
import { DonationFormData } from '../model';
import { donationApi } from '../api';

export function useDonation() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDonation = useCallback(async (
    campaignId: string,
    formData: DonationFormData,
    kioskId?: string,
    organizationId?: string
  ): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const donation: Omit<Donation, 'id'> = {
        campaignId,
        amount: formData.amount,
        isRecurring: formData.isRecurring,
        recurringInterval: formData.recurringInterval,
        donorEmail: formData.donorEmail,
        donorName: formData.donorName,
        donorPhone: formData.donorPhone,
        donorMessage: formData.donorMessage,
        isAnonymous: formData.isAnonymous,
        isGiftAid: formData.isGiftAid,
        kioskId,
        organizationId,
        timestamp: new Date().toISOString()
      };

      const donationId = await donationApi.createDonation(donation);
      return donationId;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create donation');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    error,
    createDonation
  };
}
