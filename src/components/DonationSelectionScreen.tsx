import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  ArrowLeft, 
  Heart, 
  ArrowRight, 
  Users, 
  Clock, 
  Share2,
  Gift,
  Percent
} from 'lucide-react';
import { Campaign, Donation } from '../App';

interface DonationSelectionScreenProps {
  campaign: Campaign;
  onSubmit: (donation: Donation) => void;
  onBack: () => void;
}

interface DonorInfo {
  email: string;
  name: string;
  phone: string;
  address: string;
  message: string;
  isAnonymous: boolean;
}

export function DonationSelectionScreen({ campaign, onSubmit, onBack }: DonationSelectionScreenProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'monthly' | 'quarterly' | 'yearly'>(
    campaign.configuration.defaultRecurringInterval
  );
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({
    email: '',
    name: '',
    phone: '',
    address: '',
    message: '',
    isAnonymous: false
  });

  const [isGiftAid, setIsGiftAid] = useState(false);

  const config = campaign.configuration;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCurrentAmount = () => {
    if (selectedAmount !== null) return selectedAmount;
    const custom = parseFloat(customAmount);
    return isNaN(custom) ? 0 : custom;
  };

  const isValidAmount = () => {
    const amount = getCurrentAmount();
    if (!config.allowCustomAmount && selectedAmount === null) return false;
    return amount >= (config.minCustomAmount || 1) && 
           amount <= (config.maxCustomAmount || 10000);
  };

  const getDiscountedAmount = () => {
    const amount = getCurrentAmount();
    if (isRecurring && config.recurringDiscount) {
      return amount * (1 - (config.recurringDiscount / 100));
    }
    return amount;
  };

  const getThemeClasses = () => {
    switch (config.theme) {
      case 'vibrant':
        return {
          gradient: 'from-purple-500 via-pink-500 to-red-500',
          button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
          accent: 'text-purple-600'
        };
      case 'minimal':
        return {
          gradient: 'from-gray-100 to-gray-200',
          button: 'bg-gray-900 hover:bg-gray-800',
          accent: 'text-gray-700'
        };
      case 'elegant':
        return {
          gradient: 'from-indigo-100 via-blue-50 to-purple-100',
          button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
          accent: 'text-indigo-600'
        };
      default:
        return {
          gradient: 'from-blue-50 to-indigo-100',
          button: 'bg-indigo-600 hover:bg-indigo-700',
          accent: 'text-blue-600'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount()) return;

    const donation: Donation = {
      campaignId: campaign.id,
      amount: getCurrentAmount(),
      isRecurring,
      recurringInterval: isRecurring ? recurringInterval : undefined,
      isAnonymous: donorInfo.isAnonymous,
      isGiftAid: isGiftAid,
    };

    onSubmit(donation);
  };

  const handlePresetSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const updateDonorInfo = (updates: Partial<DonorInfo>) => {
    setDonorInfo(prev => ({ ...prev, ...updates }));
  };

  const progress = (campaign.raised / campaign.goal) * 100;

  // Mock recent donations for display
  const recentDonations = [
    { name: 'Sarah M.', amount: 100, time: '2 minutes ago', isAnonymous: false },
    { name: 'Anonymous', amount: 50, time: '5 minutes ago', isAnonymous: true },
    { name: 'Michael C.', amount: 250, time: '12 minutes ago', isAnonymous: false },
    { name: 'Anonymous', amount: 75, time: '18 minutes ago', isAnonymous: true },
    { name: 'Emily R.', amount: 200, time: '23 minutes ago', isAnonymous: false }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeClasses.gradient}`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <Button variant="ghost" onClick={onBack} className="p-2 sm:p-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">Back to Campaign</span>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Campaign Info */}
          <Card className="lg:col-span-1">
            <div className="aspect-[16/10] relative overflow-hidden rounded-t-lg">
              <ImageWithFallback 
                src={campaign.coverImageUrl}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-white/90 text-gray-800">
                {campaign.category}
              </Badge>
              {config.urgencyMessage && (
                <Badge className="absolute top-4 right-4 bg-orange-500 text-white">
                  {config.urgencyMessage}
                </Badge>
              )}
            </div>
            
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">{campaign.title}</h2>
              <p className="text-gray-600 mb-4">{campaign.description}</p>
              
              {config.showProgressBar && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Raised: {formatCurrency(campaign.raised)}</span>
                    <span>Goal: {formatCurrency(campaign.goal)}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-600">{progress.toFixed(1)}% funded</p>
                </div>
              )}

              {config.showDonorCount && (
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>1,247 donors</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{formatCurrency(151)} avg</span>
                  </div>
                </div>
              )}

              {config.showRecentDonations && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Recent Donations</h4>
                  <div className="space-y-2">
                    {recentDonations.slice(0, config.maxRecentDonations).map((donation, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {donation.isAnonymous ? 'Anonymous' : donation.name}
                        </span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(donation.amount)}</div>
                          <div className="text-xs text-gray-500">{donation.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {config.enableSocialSharing && (
                <div className="border-t pt-4 mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Campaign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donation Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Heart className={`mr-3 h-6 w-6 ${themeClasses.accent}`} />
                {config.primaryCTAText}
              </CardTitle>
              <CardDescription>
                Choose your donation amount and support this important cause
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Donation Amounts */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Select Amount</Label>
                  
                  {/* Preset Amounts */}
                  <div className={`grid ${
                    config.predefinedAmounts.length <= 3 ? 'grid-cols-3' :
                    config.predefinedAmounts.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' :
                    'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                  } gap-3`}>
                    {config.predefinedAmounts.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={selectedAmount === amount ? "default" : "outline"}
                        onClick={() => handlePresetSelect(amount)}
                        className={`h-14 flex flex-col ${
                          selectedAmount === amount ? themeClasses.button : ''
                        }`}
                      >
                        <span className="text-lg font-semibold">{formatCurrency(amount)}</span>
                        {config.enableRecurring && isRecurring && config.recurringDiscount && (
                          <span className="text-xs opacity-75">
                            {formatCurrency(amount * (1 - config.recurringDiscount / 100))} after discount
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  {config.allowCustomAmount && (
                    <div className="space-y-2">
                      <Label htmlFor="customAmount">Custom Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="customAmount"
                          type="number"
                          min={config.minCustomAmount}
                          max={config.maxCustomAmount}
                          step="0.01"
                          placeholder={`${config.minCustomAmount} - ${config.maxCustomAmount}`}
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="pl-8 h-12"
                          inputMode="decimal"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Enter between {formatCurrency(config.minCustomAmount)} and {formatCurrency(config.maxCustomAmount)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Recurring Donation */}
                {config.enableRecurring && (
                  <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label htmlFor="recurring" className="text-base font-medium flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Make this a recurring donation
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Create lasting impact with ongoing support
                          {config.recurringDiscount && (
                            <span className="text-green-600 font-medium ml-1">
                              (Save {config.recurringDiscount}%!)
                            </span>
                          )}
                        </p>
                      </div>
                      <Switch
                        id="recurring"
                        checked={isRecurring}
                        onCheckedChange={setIsRecurring}
                      />
                    </div>

                    {isRecurring && config.recurringIntervals.length > 1 && (
                      <div>
                        <Label>Recurring Frequency</Label>
                        <Select value={recurringInterval} onValueChange={(value: any) => setRecurringInterval(value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {config.recurringIntervals.map(interval => (
                              <SelectItem key={interval} value={interval} className="capitalize">
                                {interval}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {/* Anonymous donation option only */}
                {/* Gift Aid option */}
                <div className="flex items-center space-x-2 p-3 bg-green-50/50 rounded-lg">
                  <Checkbox
                    id="giftAid"
                    checked={isGiftAid}
                    onCheckedChange={(checked) => setIsGiftAid(checked as boolean)}
                  />
                  <Label htmlFor="giftAid" className="text-sm flex-1">
                    Yes, add Gift Aid. I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations in that tax year it is my responsibility to pay any difference.
                  </Label>
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
 
                {config.enableAnonymousDonations && (
                  <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Checkbox
                      id="anonymous"
                      checked={donorInfo.isAnonymous}
                      onCheckedChange={(checked) => updateDonorInfo({ isAnonymous: checked as boolean })}
                    />
                    <Label htmlFor="anonymous" className="text-sm">Make this donation anonymous</Label>
                  </div>
                )}

                {/* Summary */}
                {isValidAmount() && (
                  <div className={`p-4 rounded-lg border-2 ${
                    config.theme === 'vibrant' ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' :
                    config.theme === 'minimal' ? 'bg-gray-50 border-gray-200' :
                    config.theme === 'elegant' ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Your donation:</span>
                      <div className="text-right">
                        <div className="text-xl font-semibold">
                          {formatCurrency(getDiscountedAmount())}
                        </div>
                        {isRecurring && config.recurringDiscount && getCurrentAmount() !== getDiscountedAmount() && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatCurrency(getCurrentAmount())}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-sm">
                      {isRecurring && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span className="capitalize">{recurringInterval}</span>
                        </Badge>
                      )}
                      {isRecurring && config.recurringDiscount && (
                        <Badge variant="secondary" className="flex items-center space-x-1 bg-green-100 text-green-800">
                          <Percent className="w-3 h-3" />
                          <span>{config.recurringDiscount}% saved</span>
                        </Badge>
                      )}
                      {donorInfo.isAnonymous && (
                        <Badge variant="secondary">Anonymous</Badge>
                      )}
                      {isGiftAid && (
                        <Badge variant="secondary" className="flex items-center space-x-1 bg-green-100 text-green-800">
                          <Gift className="w-3 h-3" />
                          <span>Gift Aid</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={!isValidAmount()}
                  size="lg" 
                  className={`w-full h-14 text-base ${themeClasses.button}`}
                >
                  <Gift className="mr-2 h-5 w-5" />
                  Continue to Payment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {config.secondaryCTAText && (
                  <Button 
                    type="button"
                    variant="outline" 
                    size="lg" 
                    className="w-full h-12"
                    onClick={onBack}
                  >
                    {config.secondaryCTAText}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}