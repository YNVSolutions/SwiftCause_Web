import React from 'react';
import { PaymentScreen } from '../../../components/PaymentScreen';
import { Campaign, Donation, PaymentResult } from '../../../App';
import { usePayment } from '../hooks/usePayment';
import { getOrganizationById } from '../../../api/firestoreService';

interface PaymentContainerProps {
  campaign: Campaign;
  donation: Donation;
  onPaymentComplete: (result: PaymentResult) => void;
  onBack: () => void;
}

export function PaymentContainer({ campaign, donation, onPaymentComplete, onBack }: PaymentContainerProps) {
  const { isProcessing, error, handlePaymentSubmit: processPayment } = usePayment(onPaymentComplete);
  const [organizationCurrency, setOrganizationCurrency] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const fetchOrganizationCurrency = async () => {
      if (campaign.organizationId) {
        const organization = await getOrganizationById(campaign.organizationId);
        if (organization && organization.currency) {
          setOrganizationCurrency(organization.currency as string);
        }
      }
    };
    fetchOrganizationCurrency();
  }, [campaign.organizationId]);

  const submitPayment = async (amount: number, metadata: any, currency: string) => {
    await processPayment(amount, metadata, organizationCurrency || currency);
  };

  return (
    <PaymentScreen
      campaign={campaign}
      donation={donation}
      isProcessing={isProcessing}
      error={error}
      handlePaymentSubmit={submitPayment}
      onBack={onBack}
      organizationCurrency={organizationCurrency}
    />
  );
}


