import React from 'react';
import { formatCurrency, formatCurrencyFromMajor } from '@/shared/lib/currencyFormatter';
import { CampaignCardProps } from '../types';
import { getTop3Amounts, getProgressPercentage } from '../lib/campaignUtils';

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  currency,
  onSelectAmount,
  onDonate,
  onCardClick,
}) => {
  const top3Amounts = getTop3Amounts(campaign);
  const progress = getProgressPercentage(campaign.raised || 0, campaign.goal);

  const handleAmountClick = (e: React.MouseEvent, amount: number) => {
    e.stopPropagation();
    onSelectAmount(amount);
  };

  const handleDonateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Go to details page
    onDonate();
  };

  // Format amount without decimals
  const formatRaised = (amount: number) => formatCurrency(amount, currency);
  const formatPredefined = (amount: number) => formatCurrencyFromMajor(amount, currency);
  const formatGoal = (amount: number) => formatCurrencyFromMajor(amount, currency);

  return (
    <div
      onClick={onCardClick}
      className="group bg-white rounded-[28px] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer h-[460px] w-full max-w-[380px] mx-auto"
    >
      {/* Hero Cover Image */}
      <div className="relative h-[280px] overflow-hidden flex-shrink-0">
        <img
          src={campaign.coverImageUrl || '/campaign-fallback.svg'}
          alt={campaign.title}
          className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        />
      </div>

      {/* Campaign Info */}
      <div className="px-5 pt-5 pb-4 flex flex-col h-[180px]">
        {/* Campaign Title - Dominant */}
        <h2 className="text-lg font-bold text-slate-900 mb-3 leading-tight line-clamp-2">
          {campaign.title}
        </h2>

<<<<<<< HEAD
        {/* Progress Section - De-emphasized */}
        <div className="flex-1 flex flex-col justify-end">
          {/* Progress Info */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-500">
              Raised: {formatAmount(campaign.raised || 0)}
            </span>
            <span className="text-[#0E8F5A] font-bold text-sm">{Math.round(progress)}%</span>
          </div>
=======
        {/* Progress Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium text-gray-900">
            {formatRaised(campaign.raised || 0)}
          </span>
          <span className="text-xs text-gray-500">
            Goal {formatGoal(campaign.goal)}
          </span>
          <span className="text-green-700 font-medium">{Math.round(progress)}%</span>
        </div>
>>>>>>> fix/ui-data

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
              className="bg-[#0E8F5A] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

<<<<<<< HEAD
          {/* Target Amount - De-emphasized */}
          <p className="text-xs text-slate-400 mb-4">
            Target: {formatAmount(campaign.goal)}
          </p>
=======
        {/* Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {top3Amounts.map((amount, index) => (
            <button
              key={index}
              onClick={(e) => handleAmountClick(e, amount)}
              className="h-11 rounded-lg bg-green-50 text-green-700 border border-green-200 font-medium text-sm hover:bg-green-100 hover:border-green-300 transition-colors duration-200"
            >
              {formatPredefined(amount)}
            </button>
          ))}
        </div>
>>>>>>> fix/ui-data

          {/* Donate Button - Dominant CTA */}
          <button
            onClick={handleDonateClick}
            className="w-full h-[54px] rounded-full font-bold text-base text-white bg-[#0E8F5A] hover:bg-[#0C8050] transition-colors duration-200 flex items-center justify-center shadow-sm"
          >
            Donate
          </button>
        </div>
      </div>
    </div>
  );
};
