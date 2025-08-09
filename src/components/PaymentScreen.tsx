import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, CreditCard, Shield, Lock } from 'lucide-react';
import { Campaign, Donation, PaymentResult } from '../App';
import { ApiClient } from '../utils/supabase/client';

interface PaymentScreenProps {
  campaign: Campaign;
  donation: Donation;
  onPaymentComplete: (result: PaymentResult) => void;
  onBack: () => void;
}

export function PaymentScreen({ campaign, donation, onPaymentComplete, onBack }: PaymentScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would process payment with a payment provider here
      // For demo purposes, we'll simulate a 95% success rate
      const success = Math.random() > 0.05;
      
      if (success) {
        // Submit donation to Supabase
        const result = await ApiClient.createDonation({
          ...donation,
          donorName: cardData.name,
          paymentMethod: paymentMethod === 'card' ? 'Credit Card' : 
                        paymentMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'
        });
        
        if (result.success) {
          onPaymentComplete({
            success: true,
            transactionId: result.transactionId
          });
        } else {
          throw new Error('Failed to process donation');
        }
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      onPaymentComplete({
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
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
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-sm sm:text-base">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-11 sm:h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'card' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cardName" className="text-sm sm:text-base">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        type="text"
                        placeholder="John Doe"
                        value={cardData.name}
                        onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        disabled={isProcessing}
                        className="h-11 sm:h-12"
                        autoComplete="cc-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-sm sm:text-base">Card Number</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.number}
                        onChange={(e) => setCardData(prev => ({ 
                          ...prev, 
                          number: formatCardNumber(e.target.value) 
                        }))}
                        maxLength={19}
                        required
                        disabled={isProcessing}
                        className="h-11 sm:h-12"
                        autoComplete="cc-number"
                        inputMode="numeric"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry" className="text-sm sm:text-base">Expiry Date</Label>
                        <Input
                          id="expiry"
                          type="text"
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={(e) => setCardData(prev => ({ 
                            ...prev, 
                            expiry: formatExpiry(e.target.value) 
                          }))}
                          maxLength={5}
                          required
                          disabled={isProcessing}
                          className="h-11 sm:h-12"
                          autoComplete="cc-exp"
                          inputMode="numeric"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-sm sm:text-base">CVV</Label>
                        <Input
                          id="cvv"
                          type="text"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={(e) => setCardData(prev => ({ 
                            ...prev, 
                            cvv: e.target.value.replace(/\D/g, '').substring(0, 4) 
                          }))}
                          maxLength={4}
                          required
                          disabled={isProcessing}
                          className="h-11 sm:h-12"
                          autoComplete="cc-csc"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="p-3 sm:p-4 border rounded-lg text-center">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      You will be redirected to PayPal to complete your donation
                    </p>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="p-3 sm:p-4 border rounded-lg text-center">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Bank transfer instructions will be provided after confirmation
                    </p>
                  </div>
                )}

                <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-green-700">
                    Your payment information is encrypted and secure. We use industry-standard security measures.
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
                      Processing...
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
                  <span className="text-sm sm:text-lg">{formatCurrency(donation.amount)}</span>
                </div>
                
                {donation.isRecurring && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Frequency:</span>
                    <Badge variant="outline" className="text-xs">Monthly</Badge>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Processing Fee:</span>
                  <span className="text-xs sm:text-sm">{formatCurrency(donation.amount * 0.029)}</span>
                </div>
              </div>
              
              <hr />
              
              <div className="flex justify-between text-sm sm:text-lg">
                <span>Total:</span>
                <span>{formatCurrency(donation.amount + (donation.amount * 0.029))}</span>
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