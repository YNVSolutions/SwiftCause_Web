import React from 'react';
import { CampaignGridProps } from '../types';
import { CampaignCard } from './CampaignCard';

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  campaigns,
  currency,
  onSelectCampaign,
  onViewDetails,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          currency={currency}
          onSelectAmount={(amount) => onSelectCampaign(campaign, amount)}
          onDonate={() => onSelectCampaign(campaign)}
          onCardClick={() => onViewDetails(campaign)}
        />
      ))}
    </div>
  );
};
