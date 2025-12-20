import React, { useState } from 'react';
import { Campaign, GiftAidDetails } from '@/shared/types';
import { KioskHeader } from '@/shared/components/KioskHeader';
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
      <KioskHeader title="Boost your donation" backText="Back" onBack={onBack} />

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
