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
  const { isProcessing, error, handlePaymentSubmit: processPayment } = usePayment(onPaymentComplete);

  const submitPayment = async (amount: number, metadata: any, currency: string) => {
    await processPayment(amount, metadata, currency);
  };

  return (
    <PaymentScreen
      campaign={campaign}
      donation={donation}
      isProcessing={isProcessing}
      error={error}
      handlePaymentSubmit={submitPayment}
      onBack={onBack}
    />
  );
}


