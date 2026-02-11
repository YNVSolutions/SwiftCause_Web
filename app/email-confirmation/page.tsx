'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { EmailConfirmationScreen } from '@/views/campaigns/EmailConfirmationScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { useState, useEffect, Suspense } from 'react'
import { KioskLoading } from '@/shared/ui/KioskLoading'

function EmailConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userRole } = useAuth()
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [campaignTitle, setCampaignTitle] = useState<string>('')

  useEffect(() => {
    // Get transaction ID from URL params or sessionStorage
    if (searchParams) {
      const urlTransactionId = searchParams.get('transactionId')
      const urlCampaignTitle = searchParams.get('campaignTitle')
      if (urlTransactionId) {
        setTransactionId(urlTransactionId)
        if (urlCampaignTitle) {
          setCampaignTitle(urlCampaignTitle)
        }
        return
      }
      if (urlCampaignTitle) {
        setCampaignTitle(urlCampaignTitle)
      }
    }
    
    // Fallback to sessionStorage
    const storedResult = sessionStorage.getItem('paymentResult')
    if (storedResult) {
      const result = JSON.parse(storedResult)
      setTransactionId(result.transactionId)
      if (result.campaignTitle) {
        setCampaignTitle(result.campaignTitle)
      }
    }
  }, [searchParams])

  const handleComplete = () => {
    // Clear stored data
    sessionStorage.removeItem('donation')
    sessionStorage.removeItem('paymentResult')
    
    if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'manager' || userRole === 'operator' || userRole === 'viewer') {
      router.push('/admin')
    } else {
      router.push('/campaigns')
    }
  }

  if (!transactionId) {
    return (
      <KioskLoading />
    );
  }

  return (
    <EmailConfirmationScreen
      transactionId={transactionId}
      campaignName={campaignTitle || undefined}
      onComplete={handleComplete}
    />
  )
}

export default function EmailConfirmationPage() {
  return (
    <Suspense
      fallback={
        <KioskLoading />
      }
    >
      <EmailConfirmationContent />
    </Suspense>
  );
}
