'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ResultScreen } from '@/views/campaigns/ResultScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { useState, useEffect, Suspense } from 'react'
import { PaymentResult } from '@/shared/types'

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

  if (!paymentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50/70 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="text-gray-900 text-lg font-medium">Loading result...</p>
        </div>
      </div>
    );
  }

  return (
    <ResultScreen
      result={paymentResult}
      onEmailConfirmation={paymentResult.success ? handleEmailConfirmation : undefined}
      onReturnToStart={handleReturnToStart}
    />
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50/70 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="text-gray-900 text-lg font-medium">Loading...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
