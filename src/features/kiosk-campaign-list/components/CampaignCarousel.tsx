import React from 'react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { CampaignCarouselProps } from '../types';
import { getTop3Amounts, getProgressPercentage } from '../lib/campaignUtils';

export const CampaignCarousel: React.FC<CampaignCarouselProps> = ({
  campaigns,
  currency,
  onSelectCampaign,
  onViewDetails,
}) => {
  if (campaigns.length === 0) return null;

  // Format amount without decimals
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency).replace(/\.00$/, '');
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="space-y-6">
        {campaigns.map((campaign) => {
          const top3Amounts = getTop3Amounts(campaign);
          const progress = getProgressPercentage(campaign.raised || 0, campaign.goal);

          const handleAmountClick = (e: React.MouseEvent, amount: number) => {
            e.stopPropagation();
            onSelectCampaign(campaign, amount);
          };

          const handleDonateClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            onViewDetails(campaign);
          };

          return (
            <div
              key={campaign.id}
              onClick={() => onViewDetails(campaign)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200"
            >
              {/* Campaign Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={campaign.coverImageUrl || '/campaign-fallback.svg'}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Campaign Info */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-2">
                  {campaign.title}
                </h2>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {campaign.description}
                </p>

                {/* Progress Info */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#0A0A0A]">
                    {formatAmount(campaign.raised || 0)} / {formatAmount(campaign.goal)}
                  </span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>

                {/* Progress Bar - Black */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div
                    className="bg-[#0A0A0A] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Amount Buttons - Soft green background */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {top3Amounts.map((amount, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleAmountClick(e, amount)}
                      className="h-12 rounded-xl bg-[#E6FBF2] text-[#159A6F] font-medium text-base hover:bg-[#d0f5e6] transition-colors duration-200"
                    >
                      {formatAmount(amount)}
                    </button>
                  ))}
                </div>

                {/* Donate Button */}
                <button
                  onClick={handleDonateClick}
                  className="w-full h-12 rounded-xl font-medium text-white transition-colors duration-200"
                  style={{ backgroundColor: '#159A6F' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#128A62')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#159A6F')}
                >
                  Donate
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
