import React from 'react';
import { PaymentScreen } from '../../../components/PaymentScreen';
import { Campaign, Donation, PaymentResult } from '../../../App';
import { usePayment } from '../hooks/usePayment';

interface PaymentContainerProps {
  campaign: Campaign;
  donation: Donation;
  onPaymentComplete: (result: PaymentResult) => void;
  onBack: () => void;
}

export function PaymentContainer({ campaign, donation, onPaymentComplete, onBack }: PaymentContainerProps) {
  const {
    isProcessing,
    error,
    handlePaymentSubmit,
  } = usePayment(onPaymentComplete);

  const handleSubmit = async () => {
    // Assuming donation.amount is the amount to be sent
    const metadata = {
      campaignId: campaign.id,
      donorId: "", // Placeholder: Need to get actual donor ID if available
      donorName: donation.donorName || "Anonymous",
      donorEmail: donation.donorEmail || "",
      donorPhone: donation.donorPhone || "",
      donorMessage: donation.donorMessage || "",
      isAnonymous: donation.isAnonymous || false,
      isGiftAid: donation.isGiftAid ? donation.isGiftAid.toString() : "false",
      isRecurring: donation.isRecurring || false,
      recurringInterval: donation.recurringInterval || "",
      kioskId: donation.kioskId || "",
      platform: donation.kioskId ? "kiosk" : "web", // Determine platform based on kioskId presence
    };
    handlePaymentSubmit(donation.amount, metadata, "GBP");
  };

  return (
    <PaymentScreen
      campaign={campaign}
      donation={donation}
      isProcessing={isProcessing}
      error={error}
      handlePaymentSubmit={handleSubmit}
      onBack={onBack}
    />
  );
}


