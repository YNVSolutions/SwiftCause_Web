'use client'

import { useRouter } from 'next/navigation'
import { CampaignListContainer } from '@/features/kiosk-campaign-list'
import { useAuth } from '@/shared/lib/auth-provider'
import { Campaign } from '@/shared/types'

export default function CampaignsPage() {
  const router = useRouter()
  const { currentKioskSession, handleLogout, refreshCurrentKioskSession } = useAuth()

  const handleSelectCampaign = (campaign: Campaign, amount?: number) => {
    if (amount) {
      router.push(`/campaign/${campaign.id}?amount=${amount}`)
    } else {
      router.push(`/campaign/${campaign.id}?custom=true`)
    }
  }

  return (
    <CampaignListContainer
      kioskSession={currentKioskSession}
      onSelectCampaign={handleSelectCampaign}
      onLogout={handleLogout}
      refreshCurrentKioskSession={refreshCurrentKioskSession}
    />
  )
}
