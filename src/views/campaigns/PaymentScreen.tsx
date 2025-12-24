import React from 'react';
import { CheckCircle, Lock, Heart } from 'lucide-react';
import { Campaign, Donation } from '../../shared/types';
import { KioskHeader } from '../../shared/components/KioskHeader';
import PaymentForm from '../../widgets/payment-flow/PaymentForm';
import { formatCurrency } from '../../shared/lib/currencyFormatter';

interface PaymentScreenProps {
  campaign: Campaign;
  donation: Donation;
  isProcessing: boolean;
  error: string | null;
  handlePaymentSubmit: (amount: number, metadata: any, currency: string) => Promise<void>;
  onBack: () => void;
  organizationCurrency?: string;
}

export function PaymentScreen({ campaign, donation, isProcessing, error, handlePaymentSubmit, onBack, organizationCurrency }: PaymentScreenProps) {

  // Get Gift Aid details from donation or sessionStorage as fallback
  const giftAidDetails = donation.giftAidDetails || (() => {
    try {
      const storedGiftAidData = sessionStorage.getItem('giftAidData');
      return storedGiftAidData ? JSON.parse(storedGiftAidData) : null;
    } catch {
      return null;
    }
  })();
  
  const isGiftAid = donation.isGiftAid || false;
  const giftAidAmount = isGiftAid ? donation.amount * 0.25 : 0;
  const totalImpact = donation.amount + giftAidAmount;

  // Format amount without decimals
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, organizationCurrency || 'USD').replace(/\.00$/, '');
  };

  const handleSubmit = async () => {
    // Store complete Gift Aid data in sessionStorage for backup
    if (isGiftAid && giftAidDetails) {
      sessionStorage.setItem('completeGiftAidData', JSON.stringify(giftAidDetails));
    }
    
    const metadata = {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      donationAmount: donation.amount,
      organizationId: campaign.organizationId,
      isRecurring: donation.isRecurring,
      isGiftAid: isGiftAid,
      kioskId: donation.kioskId || null,
      // Add donor name if gift aid is provided, otherwise empty string
      donorName: isGiftAid && giftAidDetails ? `${giftAidDetails.firstName} ${giftAidDetails.surname}` : "",
      ...(isGiftAid && giftAidDetails ? {
        // Legacy Gift Aid fields (keeping for backward compatibility)
        giftAidName: `${giftAidDetails.firstName} ${giftAidDetails.surname}`,
        giftAidPostcode: giftAidDetails.postcode,
        giftAidAmount: giftAidAmount.toString(),
        totalImpact: totalImpact.toString(),
        
        // Essential Gift Aid Data (split into multiple fields to stay under 500 char limit)
        giftAidFirstName: giftAidDetails.firstName,
        giftAidSurname: giftAidDetails.surname,
        giftAidConsent: giftAidDetails.giftAidConsent.toString(),
        giftAidTaxpayer: giftAidDetails.ukTaxpayerConfirmation.toString(),
        giftAidDeclarationDate: giftAidDetails.declarationDate,
        giftAidDonationDate: giftAidDetails.donationDate,
        giftAidTaxYear: giftAidDetails.taxYear,
        giftAidOrganizationId: giftAidDetails.organizationId,
        giftAidTimestamp: giftAidDetails.timestamp
      } : {})
    };
    console.log('PaymentScreen - handleSubmit: Final metadata object', metadata);
    await handlePaymentSubmit(donation.amount, metadata, organizationCurrency || 'USD'); 
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA]" aria-busy={isProcessing}>
      <KioskHeader title="Complete Donation" backText="Back" onBack={isProcessing ? undefined : onBack} />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Campaign Header */}
            <div className="bg-[#159A6F] text-white p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-7 h-7" />
                </div>
              </div>
              <p className="text-white/80 text-sm mb-1">Donating to</p>
              <h2 className="text-xl lg:text-2xl font-bold">{campaign.title}</h2>
            </div>

            <div className="p-8 lg:p-10">
              {/* Donation Summary Section */}
              <div className="mb-10">
                <div className="space-y-5">
                  {/* Donation Amount */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-gray-600">Donation Amount</span>
                    <span className="text-2xl font-bold text-[#0A0A0A]">
                      {formatAmount(donation.amount)}
                    </span>
                  </div>

                  {/* Gift Aid Section */}
                  {isGiftAid && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-[#159A6F]" />
                        <span className="text-lg text-[#159A6F] font-medium">Gift Aid (25%)</span>
                      </div>
                      <span className="text-xl font-bold text-[#159A6F]">
                        +{formatAmount(giftAidAmount)}
                      </span>
                    </div>
                  )}

                  {/* Total Impact */}
                  <div className="pt-5 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-[#0A0A0A]">Total Impact</span>
                      <span className="text-3xl font-bold text-[#159A6F]">
                        {formatAmount(totalImpact)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gift Aid Declaration Details */}
                {isGiftAid && giftAidDetails && (
                  <div className="mt-6 p-5 bg-[#E6FBF2] rounded-xl">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-[#0A0A0A]">Declaration:</span> I confirm I have paid enough UK Income/Capital Gains 
                        Tax to cover all my Gift Aid donations.
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-[#0A0A0A]">Details:</span> {giftAidDetails.firstName} {giftAidDetails.surname}, {giftAidDetails.postcode}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Section */}
              <div className="mb-6">
                <div className="flex items-center mb-5">
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-[#0A0A0A]">Payment Method</h2>
                </div>

                {/* Payment Form - Always mounted to keep Stripe Elements alive */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <PaymentForm 
                    loading={isProcessing}
                    error={error}
                    onSubmit={handleSubmit}
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="text-center text-gray-400 text-xs">
                <p>Your payment information is encrypted and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
