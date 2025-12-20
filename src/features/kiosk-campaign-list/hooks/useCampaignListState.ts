import { useState, useCallback, useMemo, useEffect } from 'react';
import { Campaign, KioskSession } from '@/shared/types';
import { useCampaigns } from '@/entities/campaign';
import { CampaignListState, CampaignLayoutMode } from '../types';
import { paginateCampaigns } from '../lib/campaignUtils';

const CAMPAIGNS_PER_PAGE = 6;

interface UseCampaignListStateProps {
  kioskSession: KioskSession | null;
}

interface UseCampaignListStateReturn {
  state: CampaignListState;
  actions: {
    setPage: (page: number) => void;
    refresh: () => Promise<void>;
  };
  filteredCampaigns: Campaign[];
}

export function useCampaignListState({
  kioskSession,
}: UseCampaignListStateProps): UseCampaignListStateReturn {
  const { campaigns: rawCampaigns, loading, error, refresh } = useCampaigns(
    kioskSession?.organizationId
  );

  const [currentPage, setCurrentPage] = useState(1);

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

  // Get paginated campaigns
  const { campaigns: paginatedCampaigns, totalPages } = useMemo(() => {
    return paginateCampaigns(filteredCampaigns, currentPage, CAMPAIGNS_PER_PAGE);
  }, [filteredCampaigns, currentPage]);

  // Determine layout mode from kiosk settings
  const layoutMode: CampaignLayoutMode =
    (kioskSession?.settings?.displayMode as CampaignLayoutMode) || 'grid';

  // Reset page when campaigns change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCampaigns.length]);

  const state: CampaignListState = {
    campaigns: paginatedCampaigns,
    loading,
    error,
    currentPage,
    totalPages,
    layoutMode,
  };

  const actions = {
    setPage: useCallback((page: number) => {
      setCurrentPage(page);
    }, []),
    refresh,
  };

  return { state, actions, filteredCampaigns };
}
