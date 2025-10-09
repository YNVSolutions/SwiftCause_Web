import { Campaign } from './types';

export const selectCampaignById = (campaigns: Campaign[], id: string) =>
  campaigns.find(campaign => campaign.id === id);

export const selectActiveCampaigns = (campaigns: Campaign[]) =>
  campaigns.filter(campaign => campaign.status === 'active');

export const selectCampaignsByOrganization = (campaigns: Campaign[], organizationId: string) =>
  campaigns.filter(campaign => campaign.organizationId === organizationId);

export const selectGlobalCampaigns = (campaigns: Campaign[]) =>
  campaigns.filter(campaign => campaign.isGlobal);

export const selectCampaignsByKiosk = (campaigns: Campaign[], kioskId: string) =>
  campaigns.filter(campaign => 
    campaign.assignedKiosks?.includes(kioskId) || campaign.isGlobal
  );

export const selectCampaignProgress = (campaign: Campaign) => {
  if (campaign.goal <= 0) return 0;
  return Math.min((campaign.raised / campaign.goal) * 100, 100);
};

export const selectCampaignIsCompleted = (campaign: Campaign) =>
  campaign.status === 'completed' || selectCampaignProgress(campaign) >= 100;
