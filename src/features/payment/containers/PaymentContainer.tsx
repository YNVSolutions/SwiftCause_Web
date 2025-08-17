import React from 'react';
import { PaymentScreen } from '../../../components/PaymentScreen';
import { Campaign, Donation, PaymentResult } from '../../../App';
import { usePayment } from '../hooks/usePayment';

interface PaymentContainerProps {
  campaign: Campaign;
  donation: Donation;
  onPaymentComplete: (result: PaymentResult) => void;
  onBack: () => void;
  onPaymentSuccess: (paymentIntentId: string) => void;
}

export function PaymentContainer({ campaign, donation, onPaymentComplete, onBack, onPaymentSuccess }: PaymentContainerProps) {
  const {
    isProcessing,
    paymentMethod,
    setPaymentMethod,
  } = usePayment(campaign, donation, onPaymentComplete);

  return (
    <PaymentScreen
      campaign={campaign}
      donation={donation}
      isProcessing={isProcessing}
      paymentMethod={paymentMethod}
      onPaymentMethodChange={setPaymentMethod}
      onBack={onBack}
      onPaymentSuccess={onPaymentSuccess}
    />
  );
}


