import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { NavigationHeader } from './shared/NavigationHeader';
import { 
  Heart, 
  ArrowRight, 
  Users, 
  Clock, 
  Share2,
  Gift,
  Percent,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Target
} from 'lucide-react';
import { Campaign, Donation } from '../App';

type CampaignView = 'overview' | 'donate';

interface CampaignScreenProps {
  campaign: Campaign;
  view?: CampaignView;
  onSubmit?: (donation: Donation) => void;
  onBack: () => void;
  onViewChange?: (view: CampaignView) => void;
}

interface DonorInfo {
  isAnonymous: boolean;
}

export function CampaignScreen({ 
  campaign, 
  view = 'overview', 
  onSubmit, 
  onBack,
  onViewChange 
}: CampaignScreenProps) {
  const [currentView, setCurrentView] = useState<CampaignView>(view);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'monthly' | 'quarterly' | 'yearly'>(
    campaign.configuration.defaultRecurringInterval
  );
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({
    isAnonymous: false
  });

  const config = campaign.configuration;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
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

  const handleViewChange = (newView: CampaignView) => {
    setCurrentView(newView);
    onViewChange?.(newView);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount() || !onSubmit) return;

    const donation: Donation = {
      campaignId: campaign.id,
      amount: getCurrentAmount(),
      isRecurring,
      recurringInterval: isRecurring ? recurringInterval : undefined,
      isAnonymous: donorInfo.isAnonymous
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

  const estimatedDonors = Math.floor(campaign.raised / 25);

  // Mock recent donations for display
  const recentDonations = [
    { name: 'Sarah M.', amount: 100, time: '2 minutes ago', isAnonymous: false },
    { name: 'Anonymous', amount: 50, time: '5 minutes ago', isAnonymous: true },
    { name: 'Michael C.', amount: 250, time: '12 minutes ago', isAnonymous: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationHeader
        title={currentView === 'overview' ? 'Campaign Details' : 'Make a Donation'}
        onBack={currentView === 'donate' ? () => handleViewChange('overview') : onBack}
        backLabel={currentView === 'donate' ? 'Back to Details' : 'Back to Campaigns'}
      />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {currentView === 'overview' ? (
          <>
            {/* Campaign Preview */}
            <Card className="mb-6">
              <div className="flex">
                <div className="w-32 h-32 sm:w-40 sm:h-40 relative overflow-hidden flex-shrink-0 rounded-l-lg">
                  <ImageWithFallback 
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs">
                    {campaign.category}
                  </Badge>
                </div>
                
                <div className="flex-1 p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h1 className="text-xl sm:text-2xl font-semibold mb-2">{campaign.title}</h1>
                      <p className="text-gray-600 line-clamp-2 mb-3">{campaign.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(!showDetails)}
                      className="ml-2 flex-shrink-0"
                    >
                      {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{formatCurrency(campaign.raised)} of {formatCurrency(campaign.goal)}</span>
                    </div>
                    <Progress value={getProgressPercentage(campaign.raised, campaign.goal)} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{getProgressPercentage(campaign.raised, campaign.goal).toFixed(1)}% funded</span>
                      <span>{estimatedDonors.toLocaleString()} donors</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Expandable Details */}
            {showDetails && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Campaign</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        This campaign represents a critical need in our global community. Your support will directly 
                        impact the lives of those who need it most, providing essential resources and creating 
                        lasting positive change.
                      </p>
                      <p>
                        Every donation, regardless of size, contributes to meaningful progress. Together, we can 
                        achieve our goal and make a real difference in the world.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>How Your Donation Helps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1">
                        <span className="font-medium">$25</span>
                        <span className="text-muted-foreground">Basic support package</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="font-medium">$50</span>
                        <span className="text-muted-foreground">Extended assistance</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="font-medium">$100</span>
                        <span className="text-muted-foreground">Comprehensive care</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="font-medium">$250</span>
                        <span className="text-muted-foreground">Community impact</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                          <div>
                            <p className="text-xs text-muted-foreground">Campaign Started</p>
                            <p className="text-sm">January 15, 2024</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-4 w-4 text-indigo-600" />
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm">Global Impact</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Donation CTA */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Ready to make a difference?</h2>
                    <p className="text-gray-600">
                      Choose your donation amount and help us reach our goal of {formatCurrency(campaign.goal)}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => handleViewChange('donate')} 
                    size="lg" 
                    className="w-full max-w-md mx-auto h-14 text-lg"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Select Donation Amount
                  </Button>
                  
                  <p className="text-sm text-gray-500">
                    Safe and secure payment processing
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Donation Selection View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Campaign Info Sidebar */}
            <Card className="lg:col-span-1">
              <div className="aspect-[16/10] relative overflow-hidden rounded-t-lg">
                <ImageWithFallback 
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 text-gray-800">
                  {campaign.category}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">{campaign.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                
                {config.showProgressBar && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Raised: {formatCurrency(campaign.raised)}</span>
                      <span>Goal: {formatCurrency(campaign.goal)}</span>
                    </div>
                    <Progress value={getProgressPercentage(campaign.raised, campaign.goal)} className="h-2" />
                    <p className="text-sm text-gray-600">{getProgressPercentage(campaign.raised, campaign.goal).toFixed(1)}% funded</p>
                  </div>
                )}

                {config.showDonorCount && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{estimatedDonors.toLocaleString()} donors</span>
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
                      {recentDonations.slice(0, 3).map((donation, index) => (
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
              </CardContent>
            </Card>

            {/* Donation Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Heart className="mr-3 h-6 w-6 text-indigo-600" />
                  {config.primaryCTAText}
                </CardTitle>
                <p className="text-muted-foreground">
                  Choose your donation amount and support this important cause
                </p>
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
                            selectedAmount === amount ? 'bg-indigo-600 hover:bg-indigo-700' : ''
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

                  {/* Anonymous donation option */}
                  {config.enableAnonymousDonations && (
                    <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id="anonymous"
                        checked={donorInfo.isAnonymous}
                        onCheckedChange={(checked) => setDonorInfo({ isAnonymous: checked as boolean })}
                      />
                      <Label htmlFor="anonymous" className="text-sm">Make this donation anonymous</Label>
                    </div>
                  )}

                  {/* Summary */}
                  {isValidAmount() && (
                    <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
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
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={!isValidAmount()}
                    size="lg" 
                    className="w-full h-14 text-base bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Gift className="mr-2 h-5 w-5" />
                    Continue to Payment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}