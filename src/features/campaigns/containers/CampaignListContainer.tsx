import { CampaignListScreen } from '../../../views/campaigns/CampaignListScreen';
import { Campaign, KioskSession } from '../../../shared/types';
import { useCampaignList } from '../hooks/useCampaignList';

interface CampaignListContainerProps {
  onSelectCampaign: (campaign: Campaign, amount?: number) => void;
  onViewDetails: (campaign: Campaign) => void;
  kioskSession?: KioskSession | null;
  onLogout: () => void;
  refreshCurrentKioskSession: () => Promise<void>;
}

export function CampaignListContainer({ onSelectCampaign, onViewDetails, kioskSession, onLogout, refreshCurrentKioskSession }: CampaignListContainerProps) {
  const { loading, error, isDetailedView, setIsDetailedView, availableCampaigns, isDefaultCampaign, refreshCampaigns, layoutMode, autoRotateCampaigns, rotationInterval } = useCampaignList(kioskSession);

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
      onLogout={onLogout}
      refreshCampaigns={refreshCampaigns}
      layoutMode={layoutMode}
      autoRotateCampaigns={autoRotateCampaigns}
      rotationInterval={rotationInterval}
      refreshCurrentKioskSession={refreshCurrentKioskSession}
    />
  );
}


