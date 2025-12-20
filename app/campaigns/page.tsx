'use client'

import { useRouter } from 'next/navigation'
import { CampaignListContainer } from '@/features/campaigns'
import { useAuth } from '@/shared/lib/auth-provider'

export default function CampaignsPage() {
  const router = useRouter()
  const { currentKioskSession, handleLogout, refreshCurrentKioskSession } = useAuth()

  const handleSelectCampaign = (campaign: any, amount?: number) => {
    if (amount) {
      router.push(`/campaign/${campaign.id}?amount=${amount}`)
    } else {
      // This is the custom amount case
      router.push(`/campaign/${campaign.id}?custom=true`)
    }
  }

  const handleViewDetails = (campaign: any) => {
    router.push(`/campaign/${campaign.id}?view=overview`)
  }

  return (
    <CampaignListContainer
      onSelectCampaign={handleSelectCampaign}
      onViewDetails={handleViewDetails}
      kioskSession={currentKioskSession}
      onLogout={handleLogout}
      refreshCurrentKioskSession={refreshCurrentKioskSession}
    />
  )
}
