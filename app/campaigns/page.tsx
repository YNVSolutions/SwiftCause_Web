'use client'

import { useRouter } from 'next/navigation'
import { CampaignListContainer } from '@/features/campaigns'
import { useAuth } from '@/shared/lib/auth-provider'

export default function CampaignsPage() {
  const router = useRouter()
  const { currentKioskSession, handleLogout, refreshCurrentKioskSession } = useAuth()

  const handleSelectCampaign = (campaign: any) => {
    router.push(`/campaign/${campaign.id}`)
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
