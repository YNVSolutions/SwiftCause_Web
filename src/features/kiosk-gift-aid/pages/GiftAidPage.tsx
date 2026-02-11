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
    <div className="fixed inset-0 h-[100dvh] bg-gradient-to-b from-[#F1FAF6] via-white to-[#F1FAF6] overflow-hidden">
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
      <main className="relative z-10 h-full w-full flex items-center justify-center px-3 sm:px-4 py-8 sm:py-10 md:py-10">
        <div
          className="h-full w-full max-h-[calc(100vh-96px)] overflow-hidden"
          style={{ maxHeight: 'calc(100dvh - 96px)' }}
        >
          {/* Sliding Container - width is 200% to hold both panels */}
          <div
            className="flex transition-transform duration-500 ease-in-out h-full items-center"
            style={{
              width: '200%',
              transform: showDetails ? 'translateX(-50%)' : 'translateX(0)',
            }}
          >
            {/* Boost Panel */}
            <div className="w-1/2 px-3 sm:px-4 h-full flex items-center justify-center">
              <div className="max-w-lg sm:max-w-xl md:max-w-[46rem] mx-auto w-full h-full">
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
            <div className="w-1/2 px-3 sm:px-4 h-full flex items-center justify-center">
              <div className="max-w-lg sm:max-w-xl md:max-w-[46rem] mx-auto w-full h-full">
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
