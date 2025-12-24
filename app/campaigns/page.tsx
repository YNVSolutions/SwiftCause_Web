'use client';

import { useRouter } from 'next/navigation';
import { CampaignListContainer } from '@/features/kiosk-campaign-list';
import { useAuth } from '@/shared/lib/auth-provider';
import { Campaign } from '@/shared/types';

export default function CampaignsPage() {
  const router = useRouter();
  const { currentKioskSession, handleLogout, refreshCurrentKioskSession } = useAuth();

  // Predefined amount click - go directly to gift aid with selected amount
  const handleSelectCampaign = (campaign: Campaign, amount?: number) => {
    if (amount) {
      // Predefined amount selected - go straight to gift aid
      router.push(`/campaign/${campaign.id}?amount=${amount}&giftaid=true`);
    } else {
      // No amount (donate button) - go to details page
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
