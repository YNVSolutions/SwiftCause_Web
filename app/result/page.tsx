'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ResultScreen } from '@/views/campaigns/ResultScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { useState, useEffect, Suspense } from 'react'
import { PaymentResult } from '@/shared/types'
import { KioskLoading } from '@/shared/ui/KioskLoading'

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userRole } = useAuth()
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)

  useEffect(() => {
    // Get payment result from sessionStorage or URL params
    const storedResult = sessionStorage.getItem('paymentResult')
    if (storedResult) {
      setPaymentResult(JSON.parse(storedResult))
    } else if (searchParams) {
      // Fallback to URL params
      const success = searchParams.get('success')
      const transactionId = searchParams.get('transactionId')
      if (success && transactionId) {
        setPaymentResult({
          success: success === 'true',
          transactionId: transactionId
        })
      }
    }
  }, [searchParams])

  const handleEmailConfirmation = () => {
    router.push('/email-confirmation')
  }

  const handleReturnToStart = () => {
    // Clear stored data
    sessionStorage.removeItem('donation')
    sessionStorage.removeItem('paymentResult')
    
    if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'manager' || userRole === 'operator' || userRole === 'viewer') {
      router.push('/admin')
    } else {
      router.push('/campaigns')
    }
  }

  const handleRetry = () => {
    try {
      const storedDonation = sessionStorage.getItem('donation')
      if (storedDonation) {
        const donation = JSON.parse(storedDonation) as { campaignId?: string }
        if (donation?.campaignId) {
          router.push(`/payment/${donation.campaignId}`)
          return
        }
      }
    } catch {
      // Fall through to campaign list
    }

    router.push('/campaigns')
  }

  if (!paymentResult) {
    return (
      <KioskLoading message="Loading result..." />
    );
  }

  return (
    <ResultScreen
      result={paymentResult}
      onEmailConfirmation={paymentResult.success ? handleEmailConfirmation : undefined}
      onReturnToStart={handleReturnToStart}
      onRetry={paymentResult.success ? undefined : handleRetry}
    />
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <KioskLoading />
    }>
      <ResultContent />
    </Suspense>
  )
}
