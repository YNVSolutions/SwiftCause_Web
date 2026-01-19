import { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Card, CardContent } from '../../shared/ui/card';
import { ArrowUp, ArrowLeft } from 'lucide-react';
import { Campaign } from '../../shared/types';
import { formatCurrency } from '../../shared/lib/currencyFormatter';

interface GiftAidBoostScreenProps {
  campaign: Campaign;
  amount: number;
  isCustomAmount?: boolean;
  onAcceptGiftAid: (finalAmount: number) => void;
  onDeclineGiftAid: (finalAmount: number) => void;
  onBack: () => void;
  organizationCurrency?: string;
}

export function GiftAidBoostScreen({
  campaign,
  amount,
  isCustomAmount = false,
  onAcceptGiftAid,
  onDeclineGiftAid,
  onBack,
  organizationCurrency = 'USD'
}: GiftAidBoostScreenProps) {
  const [customAmount, setCustomAmount] = useState(amount.toString());
  const [isLoading, setIsLoading] = useState(false);
  const currentAmount = isCustomAmount ? parseFloat(customAmount) || 0 : amount;
  const giftAidAmount = currentAmount * 0.25; // 25% Gift Aid
  const totalWithGiftAid = currentAmount + giftAidAmount;

  const isValidAmount = currentAmount > 0 && currentAmount <= 10000;

  const handleAcceptGiftAid = async () => {
    setIsLoading(true);
    // Process immediately without artificial delay
    onAcceptGiftAid(currentAmount);
  };

  const handleDeclineGiftAid = async () => {
    setIsLoading(true);
    // Process immediately without artificial delay
    onDeclineGiftAid(currentAmount);
  };

  // Show loading screen when processing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Custom Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center max-w-4xl mx-auto">
            <div className="p-2 mr-4 opacity-50">
              <ArrowLeft className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Boost your donation</h1>
          </div>
        </div>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your choice...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Custom Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="p-2 mr-4"
            disabled={isLoading}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Boost your donation</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowUp className="w-10 h-10 text-green-600" />
                </div>
              </div>

              {/* Main Message */}
              <div className="mb-8">
                {isCustomAmount ? (
                  <div className="space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                      Turn your donation into{' '}
                      <span className="text-green-600">
                        {isValidAmount ? formatCurrency(totalWithGiftAid, organizationCurrency) : '$0.00'}
                      </span>{' '}
                      for free?
                    </h1>
                    
                    {/* Custom Amount Input */}
                    <div className="max-w-xs mx-auto">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">
                          $
                        </span>
                        <Input
                          type="number"
                          min="1"
                          max="10000"
                          step="0.01"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-8 h-16 text-center text-3xl font-black border-2 border-gray-300 focus:border-blue-500 rounded-xl"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Enter amount between £1 - £10,000</p>
                    </div>
                  </div>
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    Turn your {formatCurrency(currentAmount, organizationCurrency)} into{' '}
                    <span className="text-green-600">
                      {formatCurrency(totalWithGiftAid, organizationCurrency)}
                    </span>{' '}
                    for free?
                  </h1>
                )}
                
                <div className="text-gray-600 text-lg leading-relaxed">
                  <p className="mb-2">
                    Are you a UK Taxpayer? We can reclaim{' '}
                    <span className="font-semibold text-gray-900">25%</span>{' '}
                    <span className="font-semibold text-gray-900">
                      ({isValidAmount ? formatCurrency(giftAidAmount, organizationCurrency) : '$0.00'})
                    </span>{' '}
                    from the government at no cost to you.
                  </p>
                </div>
              </div>

              {/* Campaign Info */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Donating to:</p>
                <p className="font-semibold text-gray-900">{campaign.title}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={handleAcceptGiftAid}
                  disabled={!isValidAmount || isLoading}
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Yes, Boost My Donation'}
                </Button>
                
                <Button
                  onClick={handleDeclineGiftAid}
                  disabled={!isValidAmount || isLoading}
                  variant="ghost"
                  className="w-full h-12 text-gray-500 hover:text-gray-700 font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : `No, continue with ${isValidAmount ? formatCurrency(currentAmount, organizationCurrency) : '$0.00'}`}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 text-xs text-gray-500 leading-relaxed">
                <p>
                  Gift Aid allows UK charities to reclaim tax on donations made by UK taxpayers, 
                  increasing the value of donations at no extra cost to the donor.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}