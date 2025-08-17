import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, CreditCard, Shield, Lock, CreditCard as CreditCardIcon } from 'lucide-react';
import { Campaign, Donation, PaymentResult } from '../App';
import PaymentForm from './PaymentForm';

interface PaymentScreenProps {
  campaign: Campaign;
  donation: Donation;
  isProcessing: boolean;
  error: string | null;
  handlePaymentSubmit: () => Promise<void>;
  onBack: () => void;
}

export function PaymentScreen({ campaign, donation, isProcessing, error, handlePaymentSubmit, onBack }: PaymentScreenProps) {

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
                Payment Information
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Complete your donation securely
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-medium mb-2">Select Payment Method</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Card 
                      className={`cursor-pointer border-primary ring-2 ring-primary`}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4">
                        <CreditCardIcon className="h-8 w-8 mb-2" />
                        <span className="text-sm font-medium">Card</span>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <PaymentForm 
                  loading={isProcessing}
                  error={error}
                  onSubmit={handlePaymentSubmit}
                />

                <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-green-700">
                    Your payment information is encrypted and secure. We use industry-standard security measures.
                  </span>
                </div>

              </div>
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
                  <span className="text-sm sm:text-lg">{formatCurrency(donation.amount)}</span>
                </div>
                
                {donation.isRecurring && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Frequency:</span>
                    <Badge variant="outline" className="text-xs">Monthly</Badge>
                  </div>
                )}
                
              </div>
              
              <hr />
              
              <div className="flex justify-between text-sm sm:text-lg">
                <span>Total:</span>
                <span>{formatCurrency(donation.amount)}</span>
              </div>
              
              <div className="text-xs sm:text-sm text-muted-foreground">
                <p>
                  Your donation helps make a real difference. Thank you for your generosity!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}