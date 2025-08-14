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
    paymentMethod,
    setPaymentMethod,
    cardData,
    setCardData,
    handleSubmit,
    formatCardNumber,
    formatExpiry
  } = usePayment(campaign, donation, onPaymentComplete);

  return (
    <PaymentScreen
      campaign={campaign}
      donation={donation}
      isProcessing={isProcessing}
      paymentMethod={paymentMethod}
      onPaymentMethodChange={setPaymentMethod}
      cardData={cardData}
      onCardDataChange={setCardData}
      onFormatCardNumber={formatCardNumber}
      onFormatExpiry={formatExpiry}
      onSubmit={handleSubmit}
      onBack={onBack}
    />
  );
}


