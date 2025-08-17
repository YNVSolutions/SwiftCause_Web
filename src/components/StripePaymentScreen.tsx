import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, CreditCard, Shield, Lock, AlertCircle } from 'lucide-react';
import { Campaign, Donation, PaymentResult } from '../App';
import { useStripePayment } from '../features/payment/hooks/useStripePayment';

interface StripePaymentScreenProps {
  campaign: Campaign;
  donation: Donation;
  onPaymentComplete: (result: PaymentResult) => void;
  onBack: () => void;
}

export function StripePaymentScreen({ 
  campaign, 
  donation, 
  onPaymentComplete, 
  onBack 
}: StripePaymentScreenProps) {
  const {
    isProcessing,
    error,
    handleSubmit,
    PaymentElement
  } = useStripePayment(campaign, donation, onPaymentComplete);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile-optimized header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <Button variant="ghost" onClick={onBack} disabled={isProcessing} className="mb-2 sm:mb-4 p-2 sm:p-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">Back to Donation</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile-first layout: stack on small screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Payment Form - Priority on mobile */}
          <Card className="lg:order-1">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center text-base sm:text-xl">
                <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Secure Payment
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Complete your donation with Stripe's secure payment system
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-3 sm:p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Error Display */}
                {error && (
                  <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-red-700">
                      {error}
                    </span>
                  </div>
                )}

                {/* Stripe Payment Element */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-gray-700">
                    Payment Information
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 sm:p-4 bg-white">
                    <PaymentElement 
                      options={{
                        layout: 'tabs',
                        defaultValues: {
                          billingDetails: {
                            name: donation.donorName || '',
                            email: donation.donorEmail || '',
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-green-700">
                    Your payment information is encrypted and secure. We use Stripe's industry-standard security measures.
                  </span>
                </div>

                <Button 
                  type="submit" 
                  disabled={isProcessing}
                  size="lg" 
                  className="w-full h-12 sm:h-14 text-sm sm:text-base"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Complete Donation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary - Condensed on mobile */}
          <Card className="lg:order-2">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-xl">Donation Summary</CardTitle>
            </CardHeader>
            
            <CardContent className="p-3 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs sm:text-sm text-muted-foreground">Campaign:</span>
                  <span className="text-xs sm:text-sm text-right max-w-[60%]">{campaign.title}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Category:</span>
                  <Badge variant="secondary" className="text-xs">{campaign.category}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Donation Amount:</span>
                  <span className="text-sm sm:text-lg font-semibold">{formatCurrency(donation.amount)}</span>
                </div>
                
                {donation.isRecurring && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Frequency:</span>
                    <Badge variant="outline" className="text-xs">
                      {donation.recurringInterval === 'monthly' ? 'Monthly' : 
                       donation.recurringInterval === 'quarterly' ? 'Quarterly' : 'Yearly'}
                    </Badge>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Processing Fee:</span>
                  <span className="text-xs sm:text-sm">{formatCurrency(donation.amount * 0.029 + 0.30)}</span>
                </div>
              </div>
              
              <hr />
              
              <div className="flex justify-between text-sm sm:text-lg font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(donation.amount + (donation.amount * 0.029) + 0.30)}</span>
              </div>
              
              <div className="text-xs sm:text-sm text-muted-foreground">
                <p>
                  Your donation helps make a real difference. Thank you for your generosity!
                </p>
              </div>

              {/* Stripe Powered Badge */}
              <div className="flex items-center justify-center pt-2">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>Powered by</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.831 3.47 1.426 3.47 2.338 0 .914-.796 1.431-2.127 1.431-1.72 0-4.516-.924-6.378-2.168l-.9 5.555C7.466 22.95 9.848 24 13.164 24c2.38 0 4.437-.624 5.84-1.813 1.404-1.188 2.184-3.027 2.184-5.348 0-4.407-2.458-6.222-7.212-7.689zM24 16.716V0h-5.98v16.716H24z"/>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
