import React, { useState } from 'react';
import { Campaign } from '@/shared/types';
import { GiftAidDetails } from '@/entities/giftAid/model/types';
import { ArrowLeft } from 'lucide-react';
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
    <div className="fixed inset-0 h-screen bg-gradient-to-b from-[#F1FAF6] via-white to-[#F1FAF6] overflow-hidden lg:overflow-y-auto">
      <button
        type="button"
        onClick={showDetails ? handleBackFromDetails : onBack}
        className="absolute left-4 sm:left-6 top-4 sm:top-5 z-20 inline-flex items-center gap-2 text-[#0E8F5A] hover:text-[#0C8050] text-sm font-medium hover:underline underline-offset-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-white/40 blur-3xl opacity-70" />
      <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-white/40 blur-3xl opacity-60" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white/40 blur-3xl opacity-90" />

      {/* Main Content */}
      <main className="relative z-10 h-full w-full flex items-center justify-center px-3 sm:px-4 pt-10 sm:pt-12">
        <div className="h-full w-full overflow-hidden">
          {/* Sliding Container - width is 200% to hold both panels */}
          <div
            className="flex transition-transform duration-500 ease-in-out h-full items-center"
            style={{
              width: '200%',
              transform: showDetails ? 'translateX(-50%)' : 'translateX(0)',
            }}
          >
            {/* Boost Panel */}
            <div className="w-1/2 px-3 sm:px-4 flex items-center justify-center">
              <div className="max-w-lg sm:max-w-xl md:max-w-3xl mx-auto w-full">
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
            <div className="w-1/2 px-3 sm:px-4 flex items-center justify-center">
              <div className="max-w-lg sm:max-w-xl md:max-w-3xl mx-auto w-full">
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
        </div>
      </main>
    </div>
  );
};
