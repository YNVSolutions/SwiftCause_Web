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
      <div className="fixed inset-0 bg-white overflow-hidden flex flex-col">
        {/* Custom Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center max-w-4xl mx-auto">
            <div className="p-2 mr-4 opacity-50">
              <ArrowLeft className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Boost your donation</h1>
          </div>
        </div>
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E8F5A] mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your choice...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-screen bg-white overflow-hidden flex flex-col">
      {/* Custom Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex-shrink-0">
        <div className="flex items-center max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="p-2 mr-4 rounded-full border border-gray-200 bg-transparent shadow-sm hover:bg-white/30"
            disabled={isLoading}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Boost your donation</h1>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="flex justify-center w-full max-h-full items-center">
          <Card className="w-full max-w-2xl !bg-[#FCFCFA] shadow-[0_10px_30px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden max-h-full flex flex-col border border-gray-200/50">
            <CardContent className="p-2 text-center flex flex-col justify-between min-h-0 overflow-hidden !bg-[#FCFCFA]">
              {/* Icon */}
              <div className="flex justify-center mb-0.5">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowUp className="w-4 h-4 text-green-600" />
                </div>
              </div>

              {/* Main Message */}
              <div className="mb-1.5">
                {isCustomAmount ? (
                  <div className="space-y-1.5">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 leading-tight">
                      Turn your donation into{' '}
                      <span className="text-green-600">
                        {isValidAmount ? formatCurrency(totalWithGiftAid, organizationCurrency) : '$0.00'}
                      </span>{' '}
                      for free?
                    </h1>
                    
                    {/* Custom Amount Input */}
                    <div className="max-w-xs mx-auto">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-semibold">
                          $
                        </span>
                        <Input
                          type="number"
                          min="1"
                          max="10000"
                          step="0.01"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-8 h-9 text-center text-lg font-black border-2 border-gray-300 focus:border-[#0E8F5A] rounded-xl bg-[#FCFCFA]"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-[9px] text-gray-500 mt-0.5">Enter amount between £1 - £10,000</p>
                    </div>
                  </div>
                ) : (
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 leading-tight">
                    Turn your {formatCurrency(currentAmount, organizationCurrency)} into{' '}
                    <span className="text-green-600">
                      {formatCurrency(totalWithGiftAid, organizationCurrency)}
                    </span>{' '}
                    for free?
                  </h1>
                )}
                
                <div className="text-gray-600 text-xs leading-tight">
                  <p className="mb-0">
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
              <div className="mb-1.5 p-1.5 bg-gray-100/50 rounded-lg border border-gray-200/30">
                <p className="text-[9px] text-gray-600 mb-0">Donating to:</p>
                <p className="font-semibold text-gray-900 text-xs">{campaign.title}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1">
                <Button
                  onClick={handleAcceptGiftAid}
                  disabled={!isValidAmount || isLoading}
                  className="w-full h-9 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Yes, Boost My Donation'}
                </Button>
                
                <Button
                  onClick={handleDeclineGiftAid}
                  disabled={!isValidAmount || isLoading}
                  variant="ghost"
                  className="w-full h-8 text-gray-500 hover:text-gray-700 font-medium text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : `No, continue with ${isValidAmount ? formatCurrency(currentAmount, organizationCurrency) : '$0.00'}`}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-0.5 text-[10px] text-gray-400 leading-none opacity-60">
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
