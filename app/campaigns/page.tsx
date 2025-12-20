'use client';

import { useRouter } from 'next/navigation';
import { CampaignListContainer } from '@/features/kiosk-campaign-list';
import { useAuth } from '@/shared/lib/auth-provider';
import { Campaign } from '@/shared/types';

export default function CampaignsPage() {
  const router = useRouter();
  const { currentKioskSession, handleLogout, refreshCurrentKioskSession } = useAuth();

  // All interactions go to details page
  const handleSelectCampaign = (campaign: Campaign, amount?: number) => {
    // Go to details page, optionally with preselected amount
    if (amount) {
      router.push(`/campaign/${campaign.id}?preselect=${amount}`);
    } else {
      router.push(`/campaign/${campaign.id}`);
    }
  };

  // View campaign details (card click or donate button)
  const handleViewDetails = (campaign: Campaign) => {
    router.push(`/campaign/${campaign.id}`);
  };

  return (
    <CampaignListContainer
      kioskSession={currentKioskSession}
      onSelectCampaign={handleSelectCampaign}
      onViewDetails={handleViewDetails}
      onLogout={handleLogout}
      refreshCurrentKioskSession={refreshCurrentKioskSession}
    />
  );
}
