import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Campaign, GiftAidDetails } from '@/shared/types';
import { GiftAidBoostPanel, GiftAidDetailsPanel } from '../components';

interface GiftAidPageProps {
  campaign: Campaign;
  amount: number;
  isCustomAmount: boolean;
  currency: string;
  onAcceptGiftAid: (details: GiftAidDetails) => void;
  onDeclineGiftAid: (amount: number) => void;
  onBack: () => void;
}

export const GiftAidPage: React.FC<GiftAidPageProps> = ({
  campaign,
  amount,
  isCustomAmount,
  currency,
  onAcceptGiftAid,
  onDeclineGiftAid,
  onBack,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [customAmountValue, setCustomAmountValue] = useState(amount.toString());
  const [finalAmount, setFinalAmount] = useState(amount);

  const currentAmount = isCustomAmount ? parseFloat(customAmountValue) || 0 : amount;

  const handleAcceptBoost = () => {
    setFinalAmount(currentAmount);
    setShowDetails(true);
  };

  const handleDecline = () => {
    onDeclineGiftAid(currentAmount);
  };

  const handleDetailsSubmit = (details: GiftAidDetails) => {
    onAcceptGiftAid(details);
  };

  const handleBackFromDetails = () => {
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="w-5/6 mx-auto flex items-center">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#0A0A0A]" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-[#0A0A0A]">Boost your donation</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8 overflow-hidden">
        {/* Sliding Container - width is 200% to hold both panels */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: '200%',
            transform: showDetails ? 'translateX(-50%)' : 'translateX(0)',
          }}
        >
          {/* Boost Panel */}
          <div className="w-1/2 px-4">
            <div className="max-w-xl mx-auto">
              <GiftAidBoostPanel
                amount={amount}
                isCustomAmount={isCustomAmount}
                customAmountValue={customAmountValue}
                onCustomAmountChange={setCustomAmountValue}
                currency={currency}
                campaignTitle={campaign.title}
                onAccept={handleAcceptBoost}
                onDecline={handleDecline}
              />
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-1/2 px-4">
            <div className="max-w-xl mx-auto">
              <GiftAidDetailsPanel
                amount={finalAmount}
                currency={currency}
                campaignTitle={campaign.title}
                organizationId={campaign.organizationId || ''}
                onSubmit={handleDetailsSubmit}
                onBack={handleBackFromDetails}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
