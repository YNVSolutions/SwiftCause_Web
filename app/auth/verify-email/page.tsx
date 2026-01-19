'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { EmailVerificationPendingScreen } from '@/views/auth/EmailVerificationPendingScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { Suspense } from 'react'
import { KioskLoading } from '@/shared/ui/KioskLoading'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resendVerificationEmail } = useAuth()
  
  const email = searchParams?.get('email') || ''

  const handleResendEmail = async () => {
    if (!email) {
      throw new Error('Email address is required')
    }
    await resendVerificationEmail(email)
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  if (!email) {
    router.push('/login')
    return null
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
