'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CampaignScreen } from '@/views/campaigns/CampaignScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { useState, useEffect } from 'react'
import { Campaign } from '@/shared/types'

export default function CampaignPage({ params }: { params: { campaignId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentKioskSession } = useAuth()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [initialShowDetails, setInitialShowDetails] = useState(false)

  useEffect(() => {
    if (searchParams) {
      const view = searchParams.get('view')
      setInitialShowDetails(view === 'overview')
    }
    
    // TODO: Fetch campaign data based on campaignId
    // For now, we'll need to implement this based on your existing campaign fetching logic
  }, [searchParams, params.campaignId])

  const handleDonationSubmit = (donation: any) => {
    // Store donation data in sessionStorage or pass via URL
    const donationWithKiosk = {
      ...donation,
      kioskId: currentKioskSession?.kioskId,
    }
    sessionStorage.setItem('donation', JSON.stringify(donationWithKiosk))
    router.push(`/payment/${params.campaignId}`)
  }

  const handleBack = () => {
    router.push('/campaigns')
  }

  const handleViewChange = (view: 'overview' | 'donate') => {
    // Update URL to reflect view change
    const newUrl = view === 'overview' 
      ? `/campaign/${params.campaignId}?view=overview`
      : `/campaign/${params.campaignId}`
    router.push(newUrl)
  }

  if (!campaign) {
    return <div>Loading campaign...</div>
  }

  return (
    <CampaignScreen
      campaign={campaign}
      initialShowDetails={initialShowDetails}
      onSubmit={handleDonationSubmit}
      onBack={handleBack}
      onViewChange={handleViewChange}
    />
  )
}
