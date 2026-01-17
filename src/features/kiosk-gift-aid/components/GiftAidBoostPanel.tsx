import React from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';

interface GiftAidBoostPanelProps {
  amount: number;
  isCustomAmount: boolean;
  customAmountValue: string;
  onCustomAmountChange: (value: string) => void;
  currency: string;
  campaignTitle: string;
  onBack: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export const GiftAidBoostPanel: React.FC<GiftAidBoostPanelProps> = ({
  amount,
  isCustomAmount,
  customAmountValue,
  onCustomAmountChange,
  currency,
  campaignTitle,
  onBack,
  onAccept,
  onDecline,
}) => {
  const currentAmount = isCustomAmount ? parseFloat(customAmountValue) || 0 : amount;
  const giftAidAmount = currentAmount * 0.25;
  const totalWithGiftAid = currentAmount + giftAidAmount;
  const isValidAmount = currentAmount > 0 && currentAmount <= 10000;

  const formatAmount = (amt: number) => {
    return formatCurrency(amt, currency).replace(/\.00$/, '');
  };

  const getCurrencySymbol = () => {
    if (currency === 'GBP') return '\\u00a3';
    if (currency === 'EUR') return '\\u20ac';
    return '$';
  };

  return (
    <div className="bg-white/90 rounded-3xl border border-green-100 shadow-xl p-6 lg:p-8 flex flex-col max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute -top-20 -right-16 h-40 w-40 rounded-full bg-green-100 blur-3xl opacity-60" />
      <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-emerald-100 blur-3xl opacity-70" />
      <div className="relative z-10">
        <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4">
          <button
            onClick={onBack}
            title="Back"
            aria-label="Back"
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-green-200 bg-white/90 text-green-700 shadow-sm hover:bg-green-50 hover:border-green-300 transition-colors"
          >
            <ArrowUp className="h-4 w-4 rotate-[-90deg]" strokeWidth={2.4} />
          </button>
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Boost your donation
            </h1>
            <p className="text-sm text-gray-600">
              Turn your gift into even more impact in seconds.
            </p>
          </div>
          <div className="h-9 w-9" aria-hidden="true" />
        </div>
        <div className="h-px bg-green-100 my-4" />
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-6 relative z-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
          <ArrowUp className="w-8 h-8 text-green-700" />
        </div>
      </div>

      {/* Main Message */}
      <div className="text-center mb-6 grow relative z-10">
        {isCustomAmount ? (
          <div className="space-y-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#0A0A0A] mb-3">
              Turn your donation into{' '}
              <span className="text-green-700">
                {isValidAmount ? formatAmount(totalWithGiftAid) : formatAmount(0)}
              </span>{' '}
              for free
              <span className="text-green-600">.</span>
            </h1>

            {/* Custom Amount Input */}
            <div className="max-w-sm mx-auto">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-medium">
                  {getCurrencySymbol()}
                </span>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={customAmountValue}
                  onChange={(e) => onCustomAmountChange(e.target.value)}
                  className="w-full h-16 pl-12 pr-4 text-center text-4xl font-bold border-2 border-green-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white"
                  placeholder="0"
                />
              </div>
              <p className="text-base text-gray-500 mt-3">
                Enter amount between {getCurrencySymbol()}1 - {getCurrencySymbol()}10,000
              </p>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl lg:text-4xl font-bold text-[#0A0A0A] mb-6">
            Turn your {formatAmount(currentAmount)} into{' '}
            <span className="text-green-700">{formatAmount(totalWithGiftAid)}</span> for free
            <span className="text-green-600">.</span>
          </h1>
        )}
      </div>

      {/* Campaign Info */}
      <div className="mb-5 p-4 bg-green-50/70 border border-green-100 rounded-2xl text-center relative z-10">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-green-700 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Donating to
        </div>
        <p className="font-semibold text-[#0A0A0A] text-lg">{campaignTitle}</p>
      </div>

      {/* UK Taxpayer Info - moved below donating to box */}
      <p className="text-gray-600 text-base leading-relaxed text-center mb-6 relative z-10">
        Are you a UK Taxpayer? We can reclaim{' '}
        <span className="font-semibold text-[#0A0A0A]">25%</span>{' '}
        <span className="font-semibold text-[#0A0A0A]">
          ({isValidAmount ? formatAmount(giftAidAmount) : formatAmount(0)})
        </span>{' '}
        from the government at no cost to you.
      </p>

      {/* Action Buttons */}
      <div className="space-y-3 relative z-10">
        <button
          onClick={onAccept}
          disabled={!isValidAmount}
          className="w-full h-14 rounded-xl font-semibold text-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200/70"
        >
          Yes, Boost My Donation
        </button>

        <button
          onClick={onDecline}
          disabled={!isValidAmount}
          className="w-full h-12 text-green-700 hover:text-green-800 font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          No, continue with {isValidAmount ? formatAmount(currentAmount) : formatAmount(0)}
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-center relative z-10">
        <p className="text-sm text-gray-500 leading-relaxed">
          Gift Aid allows UK charities to reclaim tax on donations made by UK taxpayers, increasing
          the value of donations at no extra cost to the donor.
        </p>
      </div>
    </div>
  );
};


