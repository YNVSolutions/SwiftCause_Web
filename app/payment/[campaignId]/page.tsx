'use client'

import { useRouter } from 'next/navigation'
import { PaymentContainer } from '@/features/payment'
import { useState, useEffect, use } from 'react'
import { Campaign, Donation } from '@/shared/types'
import { getCampaignById, storeGiftAidDeclaration } from '@/shared/api/firestoreService'
import { KioskLoading } from '@/shared/ui/KioskLoading'

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

  const handlePaymentComplete = async (result: { success: boolean; message?: string; transactionId?: string }) => {
    // Store payment result
    sessionStorage.setItem('paymentResult', JSON.stringify(result))
    
    // If payment successful and Gift Aid data exists, store it to Firebase
    if (result.success && result.transactionId) {
      try {
        const completeGiftAidData = sessionStorage.getItem('completeGiftAidData');
        if (completeGiftAidData) {
          const giftAidData = JSON.parse(completeGiftAidData);
          const { submitGiftAidDeclaration } = await import('@/entities/giftAid');
          await submitGiftAidDeclaration(
            giftAidData,
            result.transactionId,
            campaignId,
            campaign?.title || 'Unknown Campaign'
          );
          
          // Clean up session storage after successful storage
          sessionStorage.removeItem('completeGiftAidData');
          sessionStorage.removeItem('giftAidData');
        }
      } catch (error) {
        console.error('Error storing Gift Aid declaration:', error);
        // Don't block the user flow if Gift Aid storage fails
      }
    }
    
    // Navigate to result page
    router.push('/result')
  }

  const handleBack = () => {
    try {
      const backPath = sessionStorage.getItem('paymentBackPath')
      if (backPath) {
        router.push(backPath)
        return
      }
    } catch {
      // Fall back to history back
    }

    // Use router.back() to go to the actual previous page in history
    // This ensures consistent behavior with browser gestures
    router.back()
  }

  if (loading) {
    return (
      <KioskLoading
        message="Preparing payment..."
        submessage="Loading donation details."
      />
    )
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
