import React from 'react';
import { CampaignListScreen } from '../../../components/CampaignListScreen';
import { Campaign, KioskSession } from '../../../App';
import { useCampaignList } from '../hooks/useCampaignList';

interface CampaignListContainerProps {
  onSelectCampaign: (campaign: Campaign) => void;
  onViewDetails: (campaign: Campaign) => void;
  kioskSession?: KioskSession | null;
}

export function CampaignListContainer({ onSelectCampaign, onViewDetails, kioskSession }: CampaignListContainerProps) {
  const { loading, error, isDetailedView, setIsDetailedView, availableCampaigns, isDefaultCampaign } = useCampaignList(kioskSession);

  return (
    <CampaignListScreen
      loading={loading}
      error={error}
      campaigns={availableCampaigns}
      isDetailedView={isDetailedView}
      onViewToggle={setIsDetailedView}
      onSelectCampaign={onSelectCampaign}
      onViewDetails={onViewDetails}
      isDefaultCampaign={isDefaultCampaign}
      kioskSession={kioskSession}
    />
  );
}


