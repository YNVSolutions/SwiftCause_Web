import { Campaign } from '../model';
import { CampaignCard } from './CampaignCard';

interface CampaignListProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onViewDetails: (campaign: Campaign) => void;
  layoutMode?: 'grid' | 'list' | 'carousel';
  className?: string;
}

export function CampaignList({ 
  campaigns, 
  onSelectCampaign, 
  onViewDetails, 
  layoutMode = 'grid',
  className = ''
}: CampaignListProps) {
  if (layoutMode === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onSelect={() => onSelectCampaign(campaign)}
            onViewDetails={() => onViewDetails(campaign)}
            variant="list"
          />
        ))}
      </div>
    );
  }

  if (layoutMode === 'carousel') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onSelect={() => onSelectCampaign(campaign)}
            onViewDetails={() => onViewDetails(campaign)}
            variant="carousel"
          />
        ))}
      </div>
    );
  }

  // Default grid layout
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onSelect={() => onSelectCampaign(campaign)}
          onViewDetails={() => onViewDetails(campaign)}
          variant="grid"
        />
      ))}
    </div>
  );
}
