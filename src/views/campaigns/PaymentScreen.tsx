import { CheckCircle, Lock, Heart, ArrowLeft } from 'lucide-react';
import { Campaign, Donation } from '../../shared/types';
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
    return formatCurrency(amount, organizationCurrency || 'GBP').replace(/\.00$/, '');
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
    await handlePaymentSubmit(donation.amount, metadata, organizationCurrency || 'GBP'); 
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-green-50 via-white to-emerald-50/70 relative overflow-hidden" aria-busy={isProcessing}>
      <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-green-100 blur-3xl opacity-70" />
      <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-emerald-100 blur-3xl opacity-60" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-green-50 blur-3xl opacity-90" />

      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-12 xl:px-16 py-4">
        <div className="flex items-start gap-4">
          <button
            onClick={isProcessing ? undefined : onBack}
            title="Back"
            aria-label="Back"
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-green-200 bg-white/90 text-green-700 shadow-sm hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-60"
            disabled={isProcessing}
          >
            <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.4} />
          </button>
          <div className="text-left">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Complete Donation</h1>
            <p className="text-sm text-gray-600">Review your impact and complete payment.</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white/90 rounded-3xl border border-green-100 shadow-xl overflow-hidden">
            {/* Campaign Header */}
            <div className="bg-linear-to-r from-green-600 to-emerald-600 text-white px-6 py-5 text-center">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/85 text-xs uppercase tracking-wide mb-1">Donating to</p>
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
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-lg text-green-700 font-medium">Gift Aid (25%)</span>
                      </div>
                      <span className="text-xl font-bold text-green-700">
                        +{formatAmount(giftAidAmount)}
                      </span>
                    </div>
                  )}

                  {/* Total Impact */}
                  <div className="pt-5 border-t border-green-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-[#0A0A0A]">Total Impact</span>
                      <span className="text-3xl font-bold text-green-700">
                        {formatAmount(totalImpact)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gift Aid Declaration Details */}
                {isGiftAid && giftAidDetails && (
                  <div className="mt-6 p-5 bg-green-50/70 border border-green-100 rounded-2xl">
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
                  <Lock className="h-5 w-5 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold text-[#0A0A0A]">Payment Method</h2>
                </div>

                {/* Payment Form - Always mounted to keep Stripe Elements alive */}
                <div className="bg-green-50/60 border border-green-100 rounded-2xl p-6">
                  <PaymentForm 
                    loading={isProcessing}
                    error={error}
                    onSubmit={handleSubmit}
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="text-center text-gray-500 text-xs">
                <p>Your payment information is encrypted and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
