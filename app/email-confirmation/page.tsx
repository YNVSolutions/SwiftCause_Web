'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { EmailConfirmationScreen } from '@/views/campaigns/EmailConfirmationScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { useState, useEffect, Suspense } from 'react'

function EmailConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userRole } = useAuth()
  const [transactionId, setTransactionId] = useState<string | null>(null)

  useEffect(() => {
    // Get transaction ID from URL params or sessionStorage
    if (searchParams) {
      const urlTransactionId = searchParams.get('transactionId')
      if (urlTransactionId) {
        setTransactionId(urlTransactionId)
        return
      }
    }
    
    // Fallback to sessionStorage
    const storedResult = sessionStorage.getItem('paymentResult')
    if (storedResult) {
      const result = JSON.parse(storedResult)
      setTransactionId(result.transactionId)
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
    return <div>Loading...</div>
  }

  return (
    <EmailConfirmationScreen
      transactionId={transactionId}
      onComplete={handleComplete}
    />
  )
}

export default function EmailConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailConfirmationContent />
    </Suspense>
  )
}
