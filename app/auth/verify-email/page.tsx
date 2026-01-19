'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { EmailVerificationPendingScreen } from '@/views/auth/EmailVerificationPendingScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { Suspense, useEffect, useState } from 'react'
import { KioskLoading } from '@/shared/ui/KioskLoading'

export const dynamic = 'force-dynamic'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resendVerificationEmail } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  const email = searchParams?.get('email') || ''

  useEffect(() => {
    if (!email && !isRedirecting) {
      setIsRedirecting(true)
      router.push('/login')
    }
  }, [email, router, isRedirecting])

  const handleResendEmail = async () => {
    if (!email) {
      throw new Error('Email address is required')
    }
    await resendVerificationEmail(email)
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  if (!email || isRedirecting) {
    return <KioskLoading />
  }

  return (
    <EmailVerificationPendingScreen
      email={email}
      onResendEmail={handleResendEmail}
      onBackToLogin={handleBackToLogin}
    />
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<KioskLoading />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
