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
            // Go to details page
            onViewDetails(campaign);
          };

          return (
            <div
              key={campaign.id}
              onClick={() => onViewDetails(campaign)}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-green-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Campaign Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={campaign.coverImageUrl || '/campaign-fallback.svg'}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                  <span className="text-sm text-green-700 font-medium">{Math.round(progress)}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-green-100 rounded-full h-2 mb-6">
                  <div
                    className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Amount Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {top3Amounts.map((amount, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleAmountClick(e, amount)}
                      className="h-12 rounded-xl bg-green-50 text-green-700 border border-green-200 font-medium text-base hover:bg-green-100 hover:border-green-300 transition-colors duration-200"
                    >
                      {formatAmount(amount)}
                    </button>
                  ))}
                </div>

                {/* Donate Button */}
                <button
                  onClick={handleDonateClick}
                  className="w-full h-12 rounded-xl font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200/60 transition-all duration-200"
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
