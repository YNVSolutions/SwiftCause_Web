import React from 'react';
import { Button } from '@/shared/ui/button';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { CampaignListLayoutProps } from '../types';
import { getTop3Amounts, getProgressPercentage } from '../lib/campaignUtils';

export const CampaignListLayout: React.FC<CampaignListLayoutProps> = ({
  campaigns,
  currency,
  onSelectCampaign,
}) => {
  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const top3Amounts = getTop3Amounts(campaign);
        const progress = getProgressPercentage(campaign.raised || 0, campaign.goal);

        return (
          <div
            key={campaign.id}
            className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col md:flex-row"
          >
            {/* Campaign Image */}
            <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0">
              <img
                src={campaign.coverImageUrl || '/campaign-fallback.svg'}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
              {/* Progress Bar Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 md:hidden">
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Campaign Info */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {campaign.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>

                {/* Progress bar for desktop */}
                <div className="hidden md:block mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {progress.toFixed(0)}% of goal reached
                  </p>
                </div>
              </div>

              {/* Donation Amount Buttons */}
              <div className="flex flex-wrap gap-2">
                {top3Amounts.map((amount, index) => (
                  <Button
                    key={index}
                    onClick={() => onSelectCampaign(campaign, amount)}
                    className="h-10 bg-gray-100 hover:bg-gray-200 text-blue-600 font-semibold rounded-xl border-0 transition-all duration-200 text-sm"
                  >
                    💙 {formatCurrency(amount, currency)}
                  </Button>
                ))}
                <Button
                  onClick={() => onSelectCampaign(campaign)}
                  className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Custom
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
