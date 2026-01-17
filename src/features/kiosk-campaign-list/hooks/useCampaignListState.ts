import { useMemo } from 'react';
import { KioskSession } from '@/shared/types';
import { useCampaigns } from '@/entities/campaign';
import { CampaignListState, CampaignLayoutMode } from '../types';

interface UseCampaignListStateProps {
  kioskSession: KioskSession | null;
}

interface UseCampaignListStateReturn {
  state: CampaignListState;
  actions: {
    refresh: () => Promise<void>;
  };
}

export function useCampaignListState({
  kioskSession,
}: UseCampaignListStateProps): UseCampaignListStateReturn {
  const {
    campaigns: rawCampaigns,
    loading,
    error,
    refresh,
  } = useCampaigns(kioskSession?.organizationId);

  // Filter campaigns based on kiosk assignments
  const filteredCampaigns = useMemo(() => {
    if (!rawCampaigns) return [];
    if (!kioskSession) return rawCampaigns;

    let filtered = rawCampaigns.filter((c) => {
      if (c.isGlobal) return true;
      return kioskSession.assignedCampaigns?.includes(c.id);
    });

    // Prioritize default campaign
    const defaultCampaignId = kioskSession.defaultCampaign;
    if (defaultCampaignId) {
      filtered = filtered.sort((a, b) => {
        if (a.id === defaultCampaignId) return -1;
        if (b.id === defaultCampaignId) return 1;
        return 0;
      });
    }

    // Apply max display limit
    const maxDisplay = kioskSession.settings?.maxCampaignsDisplay;
    if (maxDisplay && filtered.length > maxDisplay) {
      filtered = filtered.slice(0, maxDisplay);
    }

    return filtered;
  }, [rawCampaigns, kioskSession]);

  // Determine layout mode from kiosk settings
  const layoutMode: CampaignLayoutMode =
    (kioskSession?.settings?.displayMode as CampaignLayoutMode) || 'grid';

  const state: CampaignListState = {
    campaigns: filteredCampaigns,
    loading,
    error,
    layoutMode,
  };

  const actions = {
    refresh,
  };

  return { state, actions };
}
