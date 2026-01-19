'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { EmailVerificationSuccessScreen } from '@/views/auth/EmailVerificationSuccessScreen'
import { useState, useEffect, Suspense } from 'react'
import { authApi } from '@/features/auth-by-email/api/authApi'
import { KioskLoading } from '@/shared/ui/KioskLoading'

function EmailActionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const verifyEmail = async () => {
      const mode = searchParams?.get('mode')
      const oobCode = searchParams?.get('oobCode')

      // Only handle email verification
      if (mode !== 'verifyEmail') {
        setStatus('invalid')
        setErrorMessage('Invalid action type')
        return
      }

      if (!oobCode) {
        setStatus('invalid')
        setErrorMessage('Verification code is missing')
        return
      }

      try {
        await authApi.verifyEmailCode(oobCode)
        setStatus('success')
      } catch (error) {
        console.error('Email verification error:', error)
        
        if (error instanceof Error) {
          if (error.message.includes('expired')) {
            setStatus('invalid')
            setErrorMessage('This verification link has expired. Please request a new one.')
          } else if (error.message.includes('invalid')) {
            setStatus('invalid')
            setErrorMessage('This verification link is invalid.')
          } else {
            setStatus('error')
            setErrorMessage(error.message)
          }
        } else {
          setStatus('error')
          setErrorMessage('An unexpected error occurred during verification.')
        }
      }
    }

    verifyEmail()
  }, [searchParams])

  const handleContinueToLogin = () => {
    router.push('/login')
  }

  if (status === 'loading') {
    return <KioskLoading />
  }

  return (
    <EmailVerificationSuccessScreen
      status={status}
      errorMessage={errorMessage}
      onContinueToLogin={handleContinueToLogin}
    />
  )
}

export default function EmailActionPage() {
  return (
    <Suspense fallback={<KioskLoading />}>
      <EmailActionContent />
    </Suspense>
  )
}
