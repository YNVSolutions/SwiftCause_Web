import React from 'react';
import { Button } from '../../shared/ui/button';
import { Card, CardContent } from '../../shared/ui/card';
import { CheckCircle, Lock } from 'lucide-react';
import {CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { ArrowLeft, CreditCard, Shield, CreditCard as CreditCardIcon, Loader2 } from 'lucide-react';
import { Campaign, Donation } from '../../shared/types';
import PaymentForm from '../../widgets/payment-flow/PaymentForm';
import { formatCurrency } from '../../shared/lib/currencyFormatter';
import { Label } from '../../shared/ui/label';
import { Input } from '../../shared/ui/input';
import { Collapsible, CollapsibleContent } from "../../shared/ui/collapsible";
import { Textarea } from "../../shared/ui/textarea";

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

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <Button variant="ghost" disabled className="mb-2 sm:mb-4 p-2 sm:p-3 opacity-60">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Back to Donation</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
            <p className="text-gray-700 text-base sm:text-lg font-medium">Processing your donation...</p>
            <p className="text-gray-500 text-sm">This usually takes only a moment.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" aria-busy={isProcessing}>
      {/* Mobile-optimized header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button variant="ghost" onClick={onBack} disabled={isProcessing} className="p-3">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span className="text-lg font-medium">Complete Donation</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <Card className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-12">
            {/* Donation Summary Section */}
            <div className="mb-12">
              <div className="space-y-6">
                {/* Donation Amount */}
                <div className="flex justify-between items-center">
                  <span className="text-xl text-gray-600">Donation Amount</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(donation.amount, organizationCurrency || 'USD')}
                  </span>
                </div>

                {/* Gift Aid Section */}
                {isGiftAid && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-xl text-green-600 font-medium">Gift Aid (25%)</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      +{formatCurrency(giftAidAmount, organizationCurrency || 'USD')}
                    </span>
                  </div>
                )}

                {/* Total Impact */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">Total Impact</span>
                    <span className="text-4xl font-bold text-blue-600">
                      {formatCurrency(totalImpact, organizationCurrency || 'USD')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gift Aid Declaration Details */}
              {isGiftAid && giftAidDetails && (
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      <span className="font-semibold">Declaration:</span> I confirm I have paid enough UK Income/Capital Gains 
                      Tax to cover all my Gift Aid donations. This is my own money and I 
                      am not receiving anything in return.
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Details:</span> {giftAidDetails.firstName} {giftAidDetails.surname}, {giftAidDetails.postcode}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <Lock className="h-6 w-6 text-gray-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
              </div>

              {/* Payment Form - Highlighted and Focused */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
                <PaymentForm 
                  loading={isProcessing}
                  error={error}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="text-center text-gray-500 text-sm">
              <p>Your payment information is encrypted and secure. We use industry-standard security measures.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
