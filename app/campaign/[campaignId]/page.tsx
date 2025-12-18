'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CampaignScreen } from '@/views/campaigns/CampaignScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { useState, useEffect, use } from 'react'
import { Campaign } from '@/shared/types'
import { getCampaignById } from '@/shared/api/firestoreService'

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

  const handleDonationSubmit = (donation: any) => {
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="text-gray-700 text-base sm:text-lg font-medium">Loading campaign...</p>
          <p className="text-gray-500 text-sm">Fetching the latest details.</p>
        </div>
      </div>
    )
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
