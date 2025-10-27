'use client'

import { useRouter } from 'next/navigation'
import { PaymentContainer } from '@/features/payment'
import { useState, useEffect, use } from 'react'
import { Campaign, Donation } from '@/shared/types'
import { getCampaignById } from '@/shared/api/firestoreService'

export default function PaymentPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [donation, setDonation] = useState<Donation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Unwrap the params Promise
  const { campaignId } = use(params)

  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId) return

      try {
        setLoading(true)
        setError(null)

        // Get donation data from sessionStorage
        const storedDonation = sessionStorage.getItem('donation')
        if (storedDonation) {
          setDonation(JSON.parse(storedDonation))
        }
        
        // Fetch campaign data based on campaignId
        const campaignData = await getCampaignById(campaignId)
        
        if (campaignData) {
          setCampaign(campaignData as Campaign)
        } else {
          setError('Campaign not found')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [campaignId])

  const handlePaymentComplete = (result: any) => {
    // Store payment result and navigate to result page
    sessionStorage.setItem('paymentResult', JSON.stringify(result))
    router.push('/result')
  }

  const handleBack = () => {
    router.push(`/campaign/${campaignId}`)
  }

  if (loading) {
    return <div>Loading payment...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>
  }

  if (!campaign || !donation) {
    return <div>No data available</div>
  }

  return (
    <PaymentContainer
      campaign={campaign}
      donation={donation}
      onPaymentComplete={handlePaymentComplete}
      onBack={handleBack}
    />
  )
}
