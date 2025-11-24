'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CampaignScreen } from '@/views/campaigns/CampaignScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { useState, useEffect, use } from 'react'
import { Campaign } from '@/shared/types'
import { getCampaignById } from '@/shared/api/firestoreService'
import { Donation } from '@/shared/types'

export default function CampaignPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentKioskSession } = useAuth()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [initialShowDetails, setInitialShowDetails] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Unwrap the params Promise
  const { campaignId } = use(params)

  useEffect(() => {
    if (searchParams) {
      const view = searchParams.get('view')
      setInitialShowDetails(view === 'overview')
    }
    
    // Fetch campaign data based on campaignId
    const fetchCampaign = async () => {
      if (!campaignId) return
      
      try {
        setLoading(true)
        setError(null)
        const campaignData = await getCampaignById(campaignId)
        
        if (campaignData) {
          setCampaign(campaignData as Campaign)
        } else {
          setError('Campaign not found')
        }
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError('Failed to load campaign. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCampaign()
  }, [searchParams, campaignId])

  const handleDonationSubmit = (donation: Donation) => {
    // Store donation data in sessionStorage or pass via URL
    const donationWithKiosk = {
      ...donation,
      kioskId: currentKioskSession?.kioskId,
    }
    sessionStorage.setItem('donation', JSON.stringify(donationWithKiosk))
    router.push(`/payment/${campaignId}`)
  }

  const handleBack = () => {
    router.push('/campaigns')
  }

  const handleViewChange = (view: 'overview' | 'donate') => {
    // Update URL to reflect view change
    const newUrl = view === 'overview' 
      ? `/campaign/${campaignId}?view=overview`
      : `/campaign/${campaignId}`
    router.push(newUrl)
  }

  if (loading) {
    return <div>Loading campaign...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>
  }

  if (!campaign) {
    return <div>No campaign data available</div>
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
