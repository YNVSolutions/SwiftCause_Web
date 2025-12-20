import React from 'react';
import { Button } from '@/shared/ui/button';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { CampaignCardProps } from '../types';
import { getTop3Amounts, getProgressPercentage } from '../lib/campaignUtils';

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  currency,
  onSelectAmount,
  onSelectCustom,
}) => {
  const top3Amounts = getTop3Amounts(campaign);
  const progress = getProgressPercentage(campaign.raised || 0, campaign.goal);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
      {/* Campaign Image */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        <img
          src={campaign.coverImageUrl || '/campaign-fallback.svg'}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        {/* Progress Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="w-full bg-white/30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {campaign.title}
        </h2>
        <p className="text-gray-600 mb-6 line-clamp-3">{campaign.description}</p>

        {/* Donation Amount Buttons */}
        <div className="space-y-3">
          {/* Top 3 predefined amounts */}
          <div className="grid grid-cols-3 gap-2">
            {top3Amounts.map((amount, index) => (
              <Button
                key={index}
                onClick={() => onSelectAmount(amount)}
                className="h-10 bg-gray-100 hover:bg-gray-200 text-blue-600 font-semibold rounded-xl border-0 transition-all duration-200 text-sm"
              >
                💙 {formatCurrency(amount, currency)}
              </Button>
            ))}
          </div>

          {/* Custom Amount Button */}
          <Button
            onClick={onSelectCustom}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
          >
            Custom Amount or Monthly
          </Button>
        </div>
      </div>
    </div>
  );
};
