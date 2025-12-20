import React from 'react';
import { Button } from '@/shared/ui/button';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { CampaignCarouselProps } from '../types';
import { getTop3Amounts, getProgressPercentage } from '../lib/campaignUtils';

export const CampaignCarousel: React.FC<CampaignCarouselProps> = ({
  campaigns,
  currency,
  onSelectCampaign,
}) => {
  if (campaigns.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-8">
        {campaigns.map((campaign) => {
          const top3Amounts = getTop3Amounts(campaign);
          const progress = getProgressPercentage(campaign.raised || 0, campaign.goal);

          return (
            <div
              key={campaign.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Campaign Image */}
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                  src={campaign.coverImageUrl || '/campaign-fallback.svg'}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                {/* Progress Bar Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
                  <div className="w-full bg-white/30 rounded-full h-3">
                    <div
                      className="bg-white h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Info */}
              <div className="p-6 md:p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {campaign.title}
                </h2>
                <p className="text-gray-600 mb-8 text-lg">{campaign.description}</p>

                {/* Donation Amount Buttons */}
                <div className="space-y-4">
                  {/* Top 3 predefined amounts */}
                  <div className="grid grid-cols-3 gap-4">
                    {top3Amounts.map((amount, index) => (
                      <Button
                        key={index}
                        onClick={() => onSelectCampaign(campaign, amount)}
                        className="h-14 bg-gray-100 hover:bg-gray-200 text-blue-600 font-semibold rounded-xl border-0 transition-all duration-200 text-lg"
                      >
                        💙 {formatCurrency(amount, currency)}
                      </Button>
                    ))}
                  </div>

                  {/* Custom Amount Button */}
                  <Button
                    onClick={() => onSelectCampaign(campaign)}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 text-lg"
                  >
                    Custom Amount or Monthly
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
