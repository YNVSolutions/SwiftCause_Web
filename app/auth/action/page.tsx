'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { authApi } from '@/features/auth-by-email/api/authApi'
import { logPasswordResetAuditEvent } from '@/features/auth-by-email/lib/passwordResetAudit'
import { KioskLoading } from '@/shared/ui/KioskLoading'
import { EmailVerificationSuccessScreen } from '@/views/auth/EmailVerificationSuccessScreen'
import { ResetPasswordScreen } from '@/views/auth/ResetPasswordScreen'

export const dynamic = 'force-dynamic'

type EmailActionStatus = 'loading' | 'ready' | 'success' | 'error' | 'invalid'
type ActionMode = 'verifyEmail' | 'resetPassword' | 'unknown'

function EmailActionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<EmailActionStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [actionMode, setActionMode] = useState<ActionMode>('unknown')
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  useEffect(() => {
    const handleEmailAction = async () => {
      const mode = searchParams?.get('mode')
      const oobCode = searchParams?.get('oobCode')

      const getVerificationTokenData = () => {
        const continueUrlRaw = searchParams?.get('continueUrl')
        if (!continueUrlRaw) return null

        try {
          const continueUrl = new URL(continueUrlRaw)
          const uid = continueUrl.searchParams.get('verify_uid')
          const token = continueUrl.searchParams.get('verify_token')
          if (!uid || !token) return null
          return { uid, token }
        } catch {
          return null
        }
      }

      if (mode === 'verifyEmail') {
        setActionMode('verifyEmail')

        if (!oobCode) {
          setStatus('invalid')
          setErrorMessage('Verification code is missing')
          return
        }

        try {
          await authApi.verifyEmailCode(oobCode)
          const verificationTokenData = getVerificationTokenData()
          if (verificationTokenData) {
            await authApi.completeEmailVerification(
              verificationTokenData.uid,
              verificationTokenData.token,
            )
          }
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

        return
      }

      if (mode === 'resetPassword') {
        setActionMode('resetPassword')

        if (!oobCode) {
          setStatus('invalid')
          setErrorMessage('This password reset link is missing required information.')
          await logPasswordResetAuditEvent({
            eventType: 'password_reset_confirm',
            status: 'invalid_link',
            metadata: {
              reason: 'missing_oob_code',
            },
          })
          return
        }

        try {
          const email = await authApi.verifyPasswordResetCode(oobCode)
          setResetEmail(email)
          setStatus('ready')
        } catch (error: unknown) {
          const errorCode =
            error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
              ? error.code
              : 'unknown'

          setStatus('invalid')
          setErrorMessage('This password reset link is invalid, expired, or already used.')
          await logPasswordResetAuditEvent({
            eventType: 'password_reset_confirm',
            status: 'invalid_link',
            errorCode,
          })
        }

        return
      }

      setActionMode('unknown')
      setStatus('invalid')
      setErrorMessage('Invalid action type')
    }

    handleEmailAction()
  }, [searchParams])

  const handleContinueToLogin = () => {
    router.push('/login')
  }

  const handlePasswordReset = async (newPassword: string) => {
    const oobCode = searchParams?.get('oobCode')

    if (!oobCode) {
      setStatus('invalid')
      setErrorMessage('This password reset link is invalid or expired.')
      return
    }

    setIsResettingPassword(true)
    setErrorMessage('')

    await logPasswordResetAuditEvent({
      eventType: 'password_reset_confirm',
      status: 'attempted',
      email: resetEmail,
    })

    try {
      await authApi.confirmPasswordReset(oobCode, newPassword)
      setStatus('success')
      await logPasswordResetAuditEvent({
        eventType: 'password_reset_confirm',
        status: 'completed',
        email: resetEmail,
      })
    } catch (error: unknown) {
      const errorCode =
        error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
          ? error.code
          : 'unknown'

      if (errorCode === 'auth/expired-action-code' || errorCode === 'auth/invalid-action-code') {
        setStatus('invalid')
        setErrorMessage('This password reset link is invalid, expired, or already used.')
      } else if (errorCode === 'auth/weak-password') {
        setStatus('error')
        setErrorMessage('Choose a stronger password and try again.')
      } else {
        setStatus('error')
        setErrorMessage('We could not reset your password right now. Please request a new reset link and try again.')
      }

      await logPasswordResetAuditEvent({
        eventType: 'password_reset_confirm',
        status: 'failed',
        email: resetEmail,
        errorCode,
      })
    } finally {
      setIsResettingPassword(false)
    }
  }

  if (status === 'loading') {
    return <KioskLoading />
  }

  if (actionMode === 'resetPassword') {
    return (
      <ResetPasswordScreen
        status={status === 'ready' ? 'ready' : status}
        loading={isResettingPassword}
        email={resetEmail}
        errorMessage={errorMessage}
        onSubmit={handlePasswordReset}
        onBackToLogin={handleContinueToLogin}
      />
    )
  }

  return (
    <EmailVerificationSuccessScreen
      status={status === 'ready' ? 'error' : status}
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
