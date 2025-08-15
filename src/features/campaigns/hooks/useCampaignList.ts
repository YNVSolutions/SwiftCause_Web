import { useEffect, useMemo, useState } from 'react';
import { useCampaigns } from '../../../hooks/useCampaigns';
import { Campaign, KioskSession } from '../../../App';

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
  const { campaigns: rawCampaigns, loading, error, refresh } = useCampaigns();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isDetailedView, setIsDetailedView] = useState(true);

  useEffect(() => {
    if (!rawCampaigns) return;
    const mapped = (rawCampaigns || []).map((data: any) => ({
      id: data.id,
      title: data.title,
      description: data.description,
      goal: data.goalAmount,
      raised: data.collectedAmount,
      image: data.coverImageUrl,
      category: data.tags?.[0] || 'General',
      status: data.status,
      assignedKiosks: data.assignedKiosks || [],
      isGlobal: data.isGlobal ?? true,
      configuration: (data.configuration || {}) as any
    }));
    setCampaigns(mapped);
  }, [rawCampaigns]);

  const availableCampaigns = useMemo(() => {
    if (!kioskSession) return campaigns; // If no kiosk session, return all campaigns (e.g., for admin view)

    let filtered = campaigns.filter(c => {
      // Global campaigns are always available if showAllCampaigns is true, or if they are explicitly assigned
      if (kioskSession.settings?.showAllCampaigns && c.isGlobal) return true;

      // For non-global campaigns, or if showAllCampaigns is false, check if they are assigned to the current kiosk
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


