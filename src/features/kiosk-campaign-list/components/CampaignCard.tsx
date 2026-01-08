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
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      {/* Campaign Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={campaign.coverImageUrl || '/campaign-fallback.svg'}
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      </div>

      {/* Campaign Info */}
      <div className="p-8">
        {/* Title */}
        <h2 className="text-xl font-semibold text-[#0A0A0A] mb-5 line-clamp-2 min-h-[56px]">
          {campaign.title}
        </h2>

        {/* Progress Info */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-[#0A0A0A]">
            {formatAmount(campaign.raised || 0)} / {formatAmount(campaign.goal)}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>

        {/* Progress Bar - Black */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-[#0A0A0A] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Amount Buttons - Soft green background */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {top3Amounts.map((amount, index) => (
            <button
              key={index}
              onClick={(e) => handleAmountClick(e, amount)}
              className="h-14 rounded-xl bg-[#E6FBF2] text-[#159A6F] font-medium text-base hover:bg-[#d0f5e6] transition-colors duration-200"
            >
              {formatAmount(amount)}
            </button>
          ))}
        </div>

        {/* Donate Button */}
        <button
          onClick={handleDonateClick}
          className="w-full h-14 rounded-xl font-medium text-white transition-colors duration-200"
          style={{ backgroundColor: '#159A6F' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#128A62')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#159A6F')}
        >
          Donate
        </button>
      </div>
    </div>
  );
};
