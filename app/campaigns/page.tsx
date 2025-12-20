'use client';

import { useRouter } from 'next/navigation';
import { CampaignListContainer } from '@/features/kiosk-campaign-list';
import { useAuth } from '@/shared/lib/auth-provider';
import { Campaign } from '@/shared/types';

export default function CampaignsPage() {
  const router = useRouter();
  const { currentKioskSession, handleLogout, refreshCurrentKioskSession } = useAuth();

  // Donate with predefined amount - skip details, go straight to gift aid
  const handleSelectCampaign = (campaign: Campaign, amount?: number) => {
    if (amount) {
      // Predefined amount selected - go to gift aid with amount
      router.push(`/campaign/${campaign.id}?amount=${amount}&giftaid=true`);
    } else {
      // Donate button clicked (no amount) - go to gift aid with custom amount input
      router.push(`/campaign/${campaign.id}?giftaid=true&custom=true`);
    }
  };

  // View campaign details (card click)
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
