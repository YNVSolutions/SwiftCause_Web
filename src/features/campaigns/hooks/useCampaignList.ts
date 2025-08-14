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
}

export function useCampaignList(kioskSession?: KioskSession | null): UseCampaignListReturn {
  const { campaigns: rawCampaigns, loading, error } = useCampaigns();
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
    if (!kioskSession) return campaigns;
    const assignedCampaigns = campaigns.filter(c => c.isGlobal || (c.assignedKiosks && c.assignedKiosks.includes(kioskSession.kioskId)));
    const { maxCampaignsDisplay } = kioskSession.settings || { maxCampaignsDisplay: 6 };
    return maxCampaignsDisplay && assignedCampaigns.length > maxCampaignsDisplay
      ? assignedCampaigns.slice(0, maxCampaignsDisplay)
      : assignedCampaigns;
  }, [campaigns, kioskSession]);

  const isDefaultCampaign = (campaignId: string) => {
    if (!kioskSession) return false;
    return kioskSession.assignedCampaigns[0] === campaignId;
  };

  const layoutMode: 'grid' | 'list' | 'carousel' = (kioskSession?.settings?.displayMode as any) || 'grid';

  return { campaigns, loading, error, isDetailedView, setIsDetailedView, availableCampaigns, isDefaultCampaign, layoutMode };
}


