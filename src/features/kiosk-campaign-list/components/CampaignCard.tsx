import React from 'react';
import { formatCurrency, formatCurrencyFromMajor } from '@/shared/lib/currencyFormatter';
import { CampaignCardProps } from '../types';
import { getProgressPercentage } from '../lib/campaignUtils';

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  currency,
  onDonate,
  onCardClick,
}) => {
  const progress = getProgressPercentage(campaign.raised || 0, campaign.goal);

  const handleDonateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Go to details page
    onDonate();
  };

  // Format amount without decimals
  const formatRaised = (amount: number) => formatCurrency(amount, currency);
  const formatGoal = (amount: number) => formatCurrencyFromMajor(amount, currency);

  return (
    <div
      onClick={onCardClick}
      className="group bg-white rounded-[28px] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer h-[450px] w-full max-w-[380px] mx-auto"
    >
      {/* Hero Cover Image */}
      <div className="relative h-[245px] overflow-hidden flex-shrink-0">
        <img
          src={campaign.coverImageUrl || '/campaign-fallback.svg'}
          alt={campaign.title}
          className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        />
      </div>

      {/* Campaign Info */}
      <div className="px-4 pt-4 pb-4 flex flex-col h-[195px]">
        {/* Campaign Title - Dominant */}
        <h2 className="text-lg font-bold text-slate-900 mb-2 leading-tight line-clamp-2">
          {campaign.title}
        </h2>

        <div className="flex-1 flex flex-col justify-end">
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

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2.5">
            <div
              className="bg-[#0E8F5A] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Donate Button - Dominant CTA */}
          <button
            onClick={handleDonateClick}
            className="w-full h-12 rounded-full font-bold text-base text-white bg-[#0E8F5A] hover:bg-[#0C8050] transition-colors duration-200 flex items-center justify-center shadow-sm mt-1"
          >
            Donate
          </button>
        </div>
      </div>
    </div>
  );
};
