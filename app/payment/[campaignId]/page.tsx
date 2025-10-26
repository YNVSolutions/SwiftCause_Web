'use client'

import { useRouter } from 'next/navigation'
import { PaymentContainer } from '@/features/payment'
import { useState, useEffect } from 'react'
import { Campaign, Donation } from '@/shared/types'

export default function PaymentPage({ params }: { params: { campaignId: string } }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [donation, setDonation] = useState<Donation | null>(null)

  useEffect(() => {
    // Get donation data from sessionStorage
    const storedDonation = sessionStorage.getItem('donation')
    if (storedDonation) {
      setDonation(JSON.parse(storedDonation))
    }
    
    // TODO: Fetch campaign data based on campaignId
    // For now, we'll need to implement this based on your existing campaign fetching logic
  }, [params.campaignId])

  const handlePaymentComplete = (result: any) => {
    // Store payment result and navigate to result page
    sessionStorage.setItem('paymentResult', JSON.stringify(result))
    router.push('/result')
  }

  const handleBack = () => {
    router.push(`/campaign/${params.campaignId}`)
  }

  if (!campaign || !donation) {
    return <div>Loading payment...</div>
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
