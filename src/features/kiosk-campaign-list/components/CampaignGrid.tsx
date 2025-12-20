import React from 'react';
import { CampaignGridProps } from '../types';
import { CampaignCard } from './CampaignCard';

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  campaigns,
  currency,
  onSelectCampaign,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          currency={currency}
          onSelectAmount={(amount) => onSelectCampaign(campaign, amount)}
          onSelectCustom={() => onSelectCampaign(campaign)}
        />
      ))}
    </div>
  );
};
