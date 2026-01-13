import React from 'react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
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

  // Get middle amount for donate button
  const middleAmount = top3Amounts.length >= 2 ? top3Amounts[1] : top3Amounts[0] || 25;

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
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency).replace(/\.00$/, '');
  };

  return (
    <div
      onClick={onCardClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-green-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Campaign Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={campaign.coverImageUrl || '/campaign-fallback.svg'}
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Campaign Info */}
      <div className="p-6">
        {/* Title */}
        <h2 className="text-lg font-semibold text-[#0A0A0A] mb-3 line-clamp-1">
          {campaign.title}
        </h2>

        {/* Progress Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium text-gray-900">
            {formatAmount(campaign.raised || 0)}
          </span>
          <span className="text-xs text-gray-500">
            Goal {formatAmount(campaign.goal)}
          </span>
          <span className="text-green-700 font-medium">{Math.round(progress)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-green-100 rounded-full h-2 mb-5">
          <div
            className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {top3Amounts.map((amount, index) => (
            <button
              key={index}
              onClick={(e) => handleAmountClick(e, amount)}
              className="h-11 rounded-lg bg-green-50 text-green-700 border border-green-200 font-medium text-sm hover:bg-green-100 hover:border-green-300 transition-colors duration-200"
            >
              {formatAmount(amount)}
            </button>
          ))}
        </div>

        {/* Donate Button */}
        <button
          onClick={handleDonateClick}
          className="w-full h-12 rounded-lg font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200/60 transition-all duration-200"
        >
          Donate
        </button>
      </div>
    </div>
  );
};
