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
  const formatAmount = (amount: number) => formatCurrency(amount || 0);

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
      giftAidAccepted: donation.giftAidAccepted || false, // Include explicit Gift Aid acceptance status
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
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden font-lexend" aria-busy={isProcessing}>
      <button
        onClick={isProcessing ? undefined : onBack}
        disabled={isProcessing}
        className="absolute left-6 top-5 z-20 inline-flex items-center gap-2 text-[#0E8F5A] hover:text-[#0C8050] text-sm font-medium hover:underline underline-offset-4 disabled:opacity-60"
        title="Back"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
        Back
      </button>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pt-0 pb-6">
        <div className="w-full max-w-2xl">
            <div className="bg-[#FFFBF7] rounded-[18px] border border-gray-200/50 shadow-[0_10px_28px_rgba(15,23,42,0.08)] overflow-hidden">
              {/* Campaign Header */}
              <div className="bg-[#0E8F5A] text-white px-6 py-4 text-center">
                <div className="text-center">
                  <p className="text-white/85 text-[12px] uppercase tracking-wide mb-0.5 font-medium">Donating to</p>
                  <h2 className="text-[20px] lg:text-[24px] font-semibold tracking-[-0.01em] leading-[1.25]">{campaign.title}</h2>
                </div>
                <div className="flex justify-center mt-2.5">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
              </div>

            <div className="p-6 lg:p-7 bg-[#FFFBF7]">
              {/* Donation Summary Section */}
              <div className="mb-6">
                <div className="space-y-4">
                  {/* Donation Amount */}
                  <div className="flex justify-between items-center">
                    <span className="text-[16px] text-slate-700 font-normal">Donation Amount</span>
                    <span className="text-[20px] font-semibold text-slate-900">
                      {formatAmount(donation.amount)}
                    </span>
                  </div>

                  {/* Gift Aid Section */}
                  {isGiftAid && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-[#0E8F5A]" />
                        <span className="text-[16px] text-[#0E8F5A] font-semibold">Gift Aid (25%)</span>
                      </div>
                      <span className="text-[18px] font-semibold text-[#0E8F5A]">
                        +{formatAmount(giftAidAmount)}
                      </span>
                    </div>
                  )}

                  {/* Total Impact */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-[18px] font-semibold text-slate-900">Total Impact</span>
                      <span className="text-[22px] font-semibold text-[#0E8F5A]">
                        {formatAmount(totalImpact)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gift Aid Declaration Details */}
                {isGiftAid && giftAidDetails && (
                  <div className="mt-4 p-4 bg-gray-100/50 border border-gray-200/30 rounded-xl">
                    <div className="space-y-1.5">
                      <p className="text-[14px] text-slate-700 font-normal leading-[1.55]">
                        <span className="font-semibold text-slate-900">Declaration:</span> I confirm I have paid enough UK Income/Capital Gains 
                        Tax to cover all my Gift Aid donations.
                      </p>
                      <p className="text-[14px] text-slate-700 font-normal leading-[1.55]">
                        <span className="font-semibold text-slate-900">Details:</span> {giftAidDetails.firstName} {giftAidDetails.surname}, {giftAidDetails.postcode}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Section */}
              <div className="mb-5">
                <div className="flex items-center mb-4">
                  <Lock className="h-4 w-4 text-[#0E8F5A] mr-2" />
                  <h2 className="text-[16px] font-semibold text-slate-900">Payment Method</h2>
                </div>

                {/* Payment Form - Always mounted to keep Stripe Elements alive */}
                <div className="bg-gray-100/50 border border-gray-200/30 rounded-xl p-5">
                  <PaymentForm 
                    loading={isProcessing}
                    error={error}
                    onSubmit={handleSubmit}
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="text-center text-slate-500 text-[13px] font-normal">
                <p>Your payment information is encrypted and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
