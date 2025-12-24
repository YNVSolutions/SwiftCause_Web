import React from 'react';
import { ArrowUp } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';

interface GiftAidBoostPanelProps {
  amount: number;
  isCustomAmount: boolean;
  customAmountValue: string;
  onCustomAmountChange: (value: string) => void;
  currency: string;
  campaignTitle: string;
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
    if (currency === 'GBP') return '£';
    if (currency === 'EUR') return '€';
    return '$';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-10 lg:p-14 h-full flex flex-col max-w-2xl mx-auto">
      {/* Icon */}
      <div className="flex justify-center mb-10">
        <div className="w-24 h-24 bg-[#E6FBF2] rounded-full flex items-center justify-center">
          <ArrowUp className="w-12 h-12 text-[#159A6F]" />
        </div>
      </div>

      {/* Main Message */}
      <div className="text-center mb-10 grow">
        {isCustomAmount ? (
          <div className="space-y-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#0A0A0A] mb-4">
              Turn your donation into{' '}
              <span className="text-[#159A6F]">
                {isValidAmount ? formatAmount(totalWithGiftAid) : formatAmount(0)}
              </span>{' '}
              for free?
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
                  className="w-full h-18 pl-12 pr-4 text-center text-4xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#159A6F] focus:ring-1 focus:ring-[#159A6F]"
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
            <span className="text-[#159A6F]">{formatAmount(totalWithGiftAid)}</span> for free?
          </h1>
        )}
      </div>

      {/* Campaign Info */}
      <div className="mb-6 p-5 bg-gray-50 rounded-xl text-center">
        <p className="text-sm text-gray-500 mb-1">Donating to:</p>
        <p className="font-semibold text-[#0A0A0A] text-lg">{campaignTitle}</p>
      </div>

      {/* UK Taxpayer Info - moved below donating to box */}
      <p className="text-gray-600 text-xl leading-relaxed text-center mb-10">
        Are you a UK Taxpayer? We can reclaim{' '}
        <span className="font-semibold text-[#0A0A0A]">25%</span>{' '}
        <span className="font-semibold text-[#0A0A0A]">
          ({isValidAmount ? formatAmount(giftAidAmount) : formatAmount(0)})
        </span>{' '}
        from the government at no cost to you.
      </p>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={onAccept}
          disabled={!isValidAmount}
          className="w-full h-16 rounded-xl font-semibold text-lg text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: isValidAmount ? '#159A6F' : '#9CA3AF' }}
          onMouseEnter={(e) => {
            if (isValidAmount) e.currentTarget.style.backgroundColor = '#128A62';
          }}
          onMouseLeave={(e) => {
            if (isValidAmount) e.currentTarget.style.backgroundColor = '#159A6F';
          }}
        >
          Yes, Boost My Donation
        </button>

        <button
          onClick={onDecline}
          disabled={!isValidAmount}
          className="w-full h-12 text-gray-500 hover:text-gray-700 font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          No, continue with {isValidAmount ? formatAmount(currentAmount) : formatAmount(0)}
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-10 text-center">
        <p className="text-sm text-gray-400 leading-relaxed">
          Gift Aid allows UK charities to reclaim tax on donations made by UK taxpayers, increasing
          the value of donations at no extra cost to the donor.
        </p>
      </div>
    </div>
  );
};
