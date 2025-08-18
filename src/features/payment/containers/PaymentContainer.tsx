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

  return (
    <PaymentScreen
      campaign={campaign}
      donation={donation}
      isProcessing={isProcessing}
      error={error}
      handlePaymentSubmit={handlePaymentSubmit}
      onBack={onBack}
    />
  );
}


