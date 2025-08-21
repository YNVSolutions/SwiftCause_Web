import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, CreditCard, Shield, Lock, CreditCard as CreditCardIcon } from 'lucide-react';
import { Campaign, Donation, PaymentResult } from '../App';
import PaymentForm from './PaymentForm';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown } from "lucide-react";

interface PaymentScreenProps {
  campaign: Campaign;
  donation: Donation;
  isProcessing: boolean;
  error: string | null;
  handlePaymentSubmit: (amount: number, metadata: any, currency: string) => Promise<void>;
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

  const [isAnonymous, setIsAnonymous] = React.useState(true);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');

  const handleSubmit = async () => {
    const metadata = {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      donationAmount: donation.amount,
      isRecurring: donation.isRecurring,
      isAnonymous: isAnonymous,
      ...(isAnonymous ? {} : { name, email, phone }),
    };
    await handlePaymentSubmit(donation.amount, metadata, 'USD');
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10">
        {/* Mobile-first layout: stack on small screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
          {/* Payment Form - Priority on mobile */}
          <Card className="lg:order-1">
            <CardHeader className="p-6 sm:p-8 pb-4">
              <CardTitle className="flex items-center text-xl sm:text-2xl font-bold mb-1">
                <CreditCard className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                Payment Information
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600">
                Complete your donation securely
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 sm:p-8 pt-0">
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-3">
                  <p className="text-base sm:text-lg font-medium">Select Payment Method</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card 
                      className={`cursor-pointer border-primary ring-2 ring-primary transition-all duration-200 hover:shadow-lg`}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-5">
                        <CreditCardIcon className="h-9 w-9 mb-3 text-indigo-600" />
                        <span className="text-base font-medium">Card</span>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <PaymentForm 
                  loading={isProcessing}
                  error={error}
                  onSubmit={handleSubmit}
                />

                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg text-sm sm:text-base">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-green-700 leading-relaxed">
                    Your payment information is encrypted and secure. We use industry-standard security measures.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary - Condensed on mobile */}
          <Card className="lg:order-2">
            <CardHeader className="p-6 sm:p-8 pb-4">
              <CardTitle className="text-xl sm:text-2xl font-bold mb-1">Donation Summary</CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 sm:p-8 pt-0 space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <span className="text-sm sm:text-base text-muted-foreground">Campaign:</span>
                  <span className="text-base sm:text-lg text-right font-medium max-w-[65%]">{campaign.title}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-muted-foreground">Category:</span>
                  <Badge variant="secondary" className="text-sm px-3 py-1">{campaign.category}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-muted-foreground">Donation Amount:</span>
                  <span className="text-lg sm:text-2xl font-bold text-indigo-700">{formatCurrency(donation.amount)}</span>
                </div>
                
                {donation.isRecurring && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-muted-foreground">Frequency:</span>
                    <Badge variant="outline" className="text-sm px-3 py-1">Monthly</Badge>
                  </div>
                )}
                
              </div>
              
              <hr className="mb-6 border-gray-200"/>
              
              <div className="flex justify-between text-lg sm:text-2xl font-bold mb-6 text-gray-900">
                <span>Total:</span>
                <span>{formatCurrency(donation.amount)}</span>
              </div>
              
              <div className="space-y-5 pt-6 border-t border-gray-200">
                <h4 className="text-xl font-bold text-gray-800">Donor Information</h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Sharing your details is completely optional. You can choose to stay anonymous.
                </p>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => {
                      setIsAnonymous(!!checked);
                      if (checked) {
                        setName('');
                        setEmail('');
                        setPhone('');
                      }
                    }}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="anonymous" className="text-lg font-medium cursor-pointer text-gray-800">
                    Donate Anonymously
                  </Label>
                </div>

                <Collapsible open={!isAnonymous} onOpenChange={(open) => !open && setIsAnonymous(true)} className="space-y-4">
                  <CollapsibleTrigger asChild className="w-full">
                    <Button variant="outline" className="w-full justify-between pr-4 pl-4 py-3 text-base font-medium rounded-lg">
                      <span>Your Details (Optional)</span>
                      {!isAnonymous && <ChevronDown className="h-5 w-5 ml-2 text-gray-600" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-2 p-3 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-base font-medium">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 p-3 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-base font-medium">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-2 p-3 text-base"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}