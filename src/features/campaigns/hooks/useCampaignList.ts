import { useEffect, useMemo, useState } from 'react';
import { useCampaigns } from '../../../shared/lib/hooks/useCampaigns';
import { Campaign, KioskSession } from '../../../shared/types';

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

    let filtered = campaigns.filter(c => {
      if (c.isGlobal) return true;
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

    const { maxCampaignsDisplay } = kioskSession.settings || { maxCampaignsDisplay: 6 };
    return maxCampaignsDisplay && filtered.length > maxCampaignsDisplay
      ? filtered.slice(0, maxCampaignsDisplay)
      : filtered;
  }, [campaigns, kioskSession]);

  const isDefaultCampaign = (campaignId: string) => {
    if (!kioskSession) return false;
    return kioskSession.defaultCampaign === campaignId;
  };

  const layoutMode: 'grid' | 'list' | 'carousel' = (kioskSession?.settings?.displayMode as any) || 'grid';
  const autoRotateCampaigns: boolean = kioskSession?.settings?.autoRotateCampaigns ?? false;
  const rotationInterval: number = kioskSession?.settings?.rotationInterval ?? 30;

  return { campaigns, loading, error, isDetailedView, setIsDetailedView, availableCampaigns, isDefaultCampaign, layoutMode, refreshCampaigns: refresh, autoRotateCampaigns, rotationInterval };
}


