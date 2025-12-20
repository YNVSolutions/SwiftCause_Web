'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CampaignScreen } from '@/views/campaigns/CampaignScreen'
import { GiftAidBoostScreen } from '@/views/campaigns/GiftAidBoostScreen'
import { GiftAidDetailsScreen } from '@/views/campaigns/GiftAidDetailsScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { useState, useEffect, use } from 'react'
import { Campaign, GiftAidDetails } from '@/shared/types'
import { getCampaignById } from '@/shared/api/firestoreService'

export default function CampaignPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentKioskSession } = useAuth()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [initialShowDetails, setInitialShowDetails] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [showGiftAidBoost, setShowGiftAidBoost] = useState(false)
  const [showGiftAidDetails, setShowGiftAidDetails] = useState(false)
  const [isCustomAmount, setIsCustomAmount] = useState(false)
  
  // Unwrap the params Promise
  const { campaignId } = use(params)

  useEffect(() => {
    if (searchParams) {
      const view = searchParams.get('view')
      const amount = searchParams.get('amount')
      const custom = searchParams.get('custom')
      
      setInitialShowDetails(view === 'overview')
      
      if (amount) {
        const amountNum = parseInt(amount)
        setSelectedAmount(amountNum)
        setShowGiftAidBoost(true)
        setIsCustomAmount(false)
      } else if (custom === 'true') {
        setSelectedAmount(25) // Default amount for custom
        setShowGiftAidBoost(true)
        setIsCustomAmount(true)
      }
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
    // Use router.back() to go to the actual previous page in history
    // This ensures consistent behavior with browser gestures
    router.back()
  }

  const handleViewChange = (view: 'overview' | 'donate') => {
    // Update URL to reflect view change
    const newUrl = view === 'overview' 
      ? `/campaign/${campaignId}?view=overview`
      : `/campaign/${campaignId}`
    router.push(newUrl)
  }

  const handleAcceptGiftAid = (finalAmount: number) => {
    setSelectedAmount(finalAmount)
    setShowGiftAidBoost(false)
    setShowGiftAidDetails(true)
  }

  const handleDeclineGiftAid = (finalAmount: number) => {
    if (campaign) {
      const donation = {
        campaignId: campaign.id,
        amount: finalAmount,
        isGiftAid: false,
        kioskId: currentKioskSession?.kioskId,
        donorName: "", // No gift aid, so no donor name
      }
      sessionStorage.setItem('donation', JSON.stringify(donation))
      router.push(`/payment/${campaignId}`)
    }
  }

  const handleBackFromGiftAid = () => {
    // Go back to the campaign donation screen (previous screen in workflow)
    setShowGiftAidBoost(false)
    setSelectedAmount(null)
    // Use router.back() to go to the actual previous page in history
    // This ensures consistent behavior with browser gestures
    router.back()
  }

  const handleGiftAidDetailsSubmit = (details: GiftAidDetails) => {
    if (selectedAmount && campaign) {
      const donation = {
        campaignId: campaign.id,
        amount: selectedAmount,
        isGiftAid: true,
        giftAidDetails: details,
        kioskId: currentKioskSession?.kioskId,
        donorName: `${details.firstName} ${details.surname}`, // Include donor name from gift aid
      }
      
      // Store donation object with Gift Aid details
      sessionStorage.setItem('donation', JSON.stringify(donation))
      
      // Store Gift Aid data separately for easy access
      sessionStorage.setItem('giftAidData', JSON.stringify(details))
      
      router.push(`/payment/${campaignId}`)
    }
  }

  const handleBackFromGiftAidDetails = () => {
    // Go back to Gift Aid Boost screen by updating state
    setShowGiftAidDetails(false)
    setShowGiftAidBoost(true)
    // Update URL to reflect the Gift Aid Boost screen
    router.replace(`/campaign/${campaignId}?amount=${selectedAmount}`)
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

  // Show Gift Aid details screen
  if (showGiftAidDetails && selectedAmount) {
    return (
      <GiftAidDetailsScreen
        campaign={campaign}
        amount={selectedAmount}
        onSubmit={handleGiftAidDetailsSubmit}
        onBack={handleBackFromGiftAidDetails}
        organizationCurrency={currentKioskSession?.organizationCurrency}
      />
    )
  }

  // Show Gift Aid boost screen if amount is selected
  if (showGiftAidBoost && selectedAmount) {
    return (
      <GiftAidBoostScreen
        campaign={campaign}
        amount={selectedAmount}
        isCustomAmount={isCustomAmount}
        onAcceptGiftAid={handleAcceptGiftAid}
        onDeclineGiftAid={handleDeclineGiftAid}
        onBack={handleBackFromGiftAid}
        organizationCurrency={currentKioskSession?.organizationCurrency}
      />
    )
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
