import { useEffect, useMemo, useState } from 'react';
import { useCampaigns, Campaign } from '../../../entities/campaign';
import { KioskSession } from '../../../shared/types';

export interface UseCampaignListReturn {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  isDetailedView: boolean;
  setIsDetailedView: (value: boolean) => void;
  availableCampaigns: Campaign[];
  isDefaultCampaign: (campaignId: string) => boolean;
  layoutMode: 'grid' | 'list' | 'carousel';
  refreshCampaigns: () => Promise<void>;
  autoRotateCampaigns: boolean;
  rotationInterval: number;
}

export function useCampaignList(kioskSession?: KioskSession | null): UseCampaignListReturn {
  const { campaigns: rawCampaigns, loading, error, refresh } = useCampaigns(kioskSession?.organizationId);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isDetailedView, setIsDetailedView] = useState(true);

  useEffect(() => {
    if (!rawCampaigns) return;
    setCampaigns(rawCampaigns);
  }, [rawCampaigns]);

  const availableCampaigns = useMemo(() => {
    if (!kioskSession) return campaigns; 

    const showGlobals = kioskSession.settings?.showAllCampaigns ?? false;
    let filtered = campaigns.filter(c => {
      if (c.isGlobal) return showGlobals;
      return kioskSession.assignedCampaigns?.includes(c.id);
    });

    // Prioritize the default campaign by moving it to the front of the array
    const defaultCampaignId = kioskSession.defaultCampaign;
    if (defaultCampaignId) {
      filtered = filtered.sort((a, b) => {
        if (a.id === defaultCampaignId) return -1;
        if (b.id === defaultCampaignId) return 1;
        return 0;
      });
    }

    // Do not hard-limit here—UI pagination/rotation should decide how many to show.
    return filtered;
  }, [campaigns, kioskSession]);

  const isDefaultCampaign = (campaignId: string) => {
    if (!kioskSession) return false;
    return kioskSession.defaultCampaign === campaignId;
  };

  const layoutMode: 'grid' | 'list' | 'carousel' = kioskSession?.settings?.displayMode || 'grid';
  const autoRotateCampaigns: boolean = kioskSession?.settings?.autoRotateCampaigns ?? false;
  const rotationInterval: number = kioskSession?.settings?.rotationInterval ?? 30;

  return { campaigns, loading, error, isDetailedView, setIsDetailedView, availableCampaigns, isDefaultCampaign, layoutMode, refreshCampaigns: refresh, autoRotateCampaigns, rotationInterval };
}
