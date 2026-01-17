import React from 'react';
import { CampaignGridProps } from '../types';
import { CampaignCard } from './CampaignCard';

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  campaigns,
  currency,
  onSelectCampaign,
  onViewDetails,
}) => {
  const getFloatStyle = (seedValue: string) => {
    let hash = 0;
    for (let i = 0; i < seedValue.length; i += 1) {
      hash = (hash * 31 + seedValue.charCodeAt(i)) % 100000;
    }
    const x = (hash % 7) - 3;
    const y = (Math.floor(hash / 7) % 7) - 3;
    const duration = 6 + (hash % 5);
    const delay = (hash % 30) / 10;
    return {
      '--float-x': `${x}px`,
      '--float-y': `${y}px`,
      '--float-duration': `${duration}s`,
      '--float-delay': `${delay}s`,
    } as React.CSSProperties;
  };

  return (
    <>
      <style>{`
        .campaign-float {
          animation-name: campaignFloat;
          animation-duration: var(--float-duration, 7s);
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-delay: var(--float-delay, 0s);
          will-change: transform;
        }
        @keyframes campaignFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(var(--float-x, 0px), var(--float-y, 0px)); }
        }
      `}</style>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="campaign-float" style={getFloatStyle(campaign.id)}>
            <CampaignCard
              campaign={campaign}
              currency={currency}
              onSelectAmount={(amount) => onSelectCampaign(campaign, amount)}
              onDonate={() => onViewDetails(campaign)}
              onCardClick={() => onViewDetails(campaign)}
            />
          </div>
        ))}
      </div>
    </>
  );
};
