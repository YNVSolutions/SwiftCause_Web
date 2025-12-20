import React, { useCallback } from 'react';
import { Campaign, KioskSession } from '@/shared/types';
import { CampaignListPage } from '../pages';
import { useCampaignListState } from '../hooks';

interface CampaignListContainerProps {
  kioskSession: KioskSession | null;
  onSelectCampaign: (campaign: Campaign, amount?: number) => void;
  onLogout: () => void;
  refreshCurrentKioskSession: () => Promise<void>;
}

/**
 * Container component that connects the CampaignListPage to state and actions.
 * Handles all business logic and passes pure state to the presentational component.
 */
export const CampaignListContainer: React.FC<CampaignListContainerProps> = ({
  kioskSession,
  onSelectCampaign,
  onLogout,
}) => {
  const { state, actions } = useCampaignListState({ kioskSession });

  const handleSelectCampaign = useCallback(
    (campaign: Campaign, amount?: number) => {
      onSelectCampaign(campaign, amount);
    },
    [onSelectCampaign]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      actions.setPage(page);
    },
    [actions]
  );

  return (
    <CampaignListPage
      state={state}
      kioskSession={kioskSession}
      onSelectCampaign={handleSelectCampaign}
      onPageChange={handlePageChange}
      onLogout={onLogout}
    />
  );
};
