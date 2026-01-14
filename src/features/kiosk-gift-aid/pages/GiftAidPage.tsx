import React, { useState } from 'react';
import { Campaign, GiftAidDetails } from '@/shared/types';
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50/70 relative overflow-hidden">
      <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-green-100 blur-3xl opacity-70" />
      <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-emerald-100 blur-3xl opacity-60" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-green-50 blur-3xl opacity-90" />

      <div className="relative z-10">
        <header className="w-full max-w-6xl mx-auto px-6 lg:px-12 xl:px-16 py-4">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              title="Back"
              aria-label="Back"
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-green-200 bg-white/90 text-green-700 shadow-sm hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.4} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Boost your donation
              </h1>
              <p className="text-sm text-gray-600">
                Turn your gift into even more impact in seconds.
              </p>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="py-6 overflow-hidden relative z-10">
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
