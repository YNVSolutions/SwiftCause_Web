import React, { useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Checkbox } from '../../../shared/ui/checkbox';
import { Textarea } from '../../../shared/ui/textarea';
import { Campaign } from '../../../entities/campaign';
import { DonationFormData, RecurringInterval, getRecurringIntervalLabel } from '../model';
import { Calendar, CalendarDays, CalendarRange, Check } from 'lucide-react';

interface DonationFormProps {
  campaign: Campaign;
  onSubmit: (formData: DonationFormData) => void;
  onBack: () => void;
  predefinedAmounts?: number[];
  allowCustomAmount?: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  suggestedAmounts?: number[];
  enableRecurring?: boolean;
  recurringIntervals?: RecurringInterval[];
  defaultRecurringInterval?: RecurringInterval;
  requiredFields?: ("email" | "name" | "phone" | "address")[];
  optionalFields?: ("email" | "name" | "phone" | "address" | "message")[];
  enableAnonymousDonations?: boolean;
  enableGiftAid?: boolean;
}

export function DonationForm({
  campaign,
  onSubmit,
  onBack,
  predefinedAmounts = [10, 25, 50, 100],
  allowCustomAmount = true,
  minCustomAmount = 1,
  maxCustomAmount = 10000,
  enableRecurring = false,
  recurringIntervals = [RecurringInterval.MONTHLY, RecurringInterval.QUARTERLY, RecurringInterval.YEARLY],
  defaultRecurringInterval = RecurringInterval.MONTHLY,
  requiredFields = ["email"],
  optionalFields = ["name", "message"],
  enableAnonymousDonations = true,
  enableGiftAid = false
}: DonationFormProps) {
  const [formData, setFormData] = useState<DonationFormData>({
    amount: predefinedAmounts[0] || 10,
    isRecurring: false,
    recurringInterval: defaultRecurringInterval,
    isAnonymous: false,
    isGiftAid: false
  });

  const [customAmount, setCustomAmount] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);

  const handleAmountChange = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
    setUseCustomAmount(false);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount >= minCustomAmount && amount <= maxCustomAmount) {
      setFormData(prev => ({ ...prev, amount }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFieldRequired = (field: string) => requiredFields.includes(field as any);
  const isFieldOptional = (field: string) => optionalFields.includes(field as any);

  const getIntervalIcon = (interval: RecurringInterval) => {
    switch (interval) {
      case RecurringInterval.MONTHLY:
        return <Calendar className="w-5 h-5" />;
      case RecurringInterval.QUARTERLY:
        return <CalendarDays className="w-5 h-5" />;
      case RecurringInterval.YEARLY:
        return <CalendarRange className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getIntervalDescription = (interval: RecurringInterval) => {
    switch (interval) {
      case RecurringInterval.MONTHLY:
        return 'Charged every month';
      case RecurringInterval.QUARTERLY:
        return 'Charged every 3 months';
      case RecurringInterval.YEARLY:
        return 'Charged once per year';
      default:
        return 'Charged every month';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donate to {campaign.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Selection */}
          <div className="space-y-4">
            <Label>Donation Amount</Label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={formData.amount === amount && !useCustomAmount ? "default" : "outline"}
                  onClick={() => handleAmountChange(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            
            {allowCustomAmount && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant={useCustomAmount ? "default" : "outline"}
                  onClick={() => setUseCustomAmount(true)}
                >
                  Custom Amount
                </Button>
                {useCustomAmount && (
                  <Input
                    type="number"
                    placeholder={`Enter amount (${minCustomAmount}-${maxCustomAmount})`}
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    min={minCustomAmount}
                    max={maxCustomAmount}
                  />
                )}
              </div>
            )}
          </div>

          {/* Recurring Donation */}
          {enableRecurring && (
            <div className="space-y-4">
              <Label className="text-lg font-medium">Donation Type</Label>
              
              {/* One-time vs Recurring Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* One-time Donation Tile */}
                <div
                  className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    !formData.isRecurring
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md transform scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, isRecurring: false }))}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      !formData.isRecurring ? 'border-blue-500 bg-blue-500 shadow-sm' : 'border-gray-300'
                    }`}>
                      {!formData.isRecurring && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${!formData.isRecurring ? 'text-blue-800' : 'text-gray-900'}`}>
                        One-time Donation
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Make a single donation today</div>
                    </div>
                  </div>
                  {!formData.isRecurring && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Recurring Donation Tile */}
                <div
                  className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    formData.isRecurring
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md transform scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    isRecurring: true,
                    recurringInterval: RecurringInterval.MONTHLY 
                  }))}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      formData.isRecurring ? 'border-purple-500 bg-purple-500 shadow-sm' : 'border-gray-300'
                    }`}>
                      {formData.isRecurring && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${formData.isRecurring ? 'text-purple-800' : 'text-gray-900'}`}>
                        Recurring Donation
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Ongoing support that makes a difference</div>
                    </div>
                  </div>
                  {formData.isRecurring && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recurring Interval Selection */}
              {formData.isRecurring && (
                <div className="space-y-3 mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
                  <Label className="text-base font-medium text-gray-900">Choose Frequency</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {recurringIntervals.map((interval) => (
                      <div
                        key={interval}
                        className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                          formData.recurringInterval === interval
                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-md transform scale-105'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, recurringInterval: interval }))}
                      >
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`p-3 rounded-full transition-all duration-200 ${
                            formData.recurringInterval === interval 
                              ? 'bg-green-500 text-white shadow-lg' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                            {getIntervalIcon(interval)}
                          </div>
                          <div>
                            <div className={`font-semibold ${
                              formData.recurringInterval === interval ? 'text-green-800' : 'text-gray-900'
                            }`}>
                              {getRecurringIntervalLabel(interval)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{getIntervalDescription(interval)}</div>
                          </div>
                          {formData.recurringInterval === interval && (
                            <div className="absolute -top-2 -right-2">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Recurring Benefits */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-blue-900 mb-1">Why choose recurring donations?</div>
                        <ul className="text-blue-800 space-y-1">
                          <li>• Helps us plan and budget more effectively</li>
                          <li>• Creates sustainable impact over time</li>
                          <li>• You can cancel or modify anytime</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Donor Information */}
          {!formData.isAnonymous && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Donor Information</h3>
              
              {isFieldRequired('email') && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.donorEmail || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, donorEmail: e.target.value }))}
                    required
                  />
                </div>
              )}

              {isFieldOptional('name') && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.donorName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, donorName: e.target.value }))}
                  />
                </div>
              )}

              {isFieldOptional('phone') && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.donorPhone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, donorPhone: e.target.value }))}
                  />
                </div>
              )}

              {isFieldOptional('message') && (
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.donorMessage || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, donorMessage: e.target.value }))}
                    placeholder="Leave a message (optional)"
                  />
                </div>
              )}
            </div>
          )}

          {/* Anonymous Donation */}
          {enableAnonymousDonations && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAnonymous: !!checked }))}
              />
              <Label htmlFor="anonymous">Donate anonymously</Label>
            </div>
          )}

          {/* Gift Aid */}
          {enableGiftAid && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="giftAid"
                checked={formData.isGiftAid}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isGiftAid: !!checked }))}
              />
              <Label htmlFor="giftAid">I would like to add Gift Aid to my donation</Label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue to Payment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
