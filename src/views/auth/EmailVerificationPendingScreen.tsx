'use client'

import React, { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'

interface EmailVerificationPendingScreenProps {
  email: string
  onResendEmail: () => Promise<void>
  onBackToLogin: () => void
}

export const EmailVerificationPendingScreen: React.FC<EmailVerificationPendingScreenProps> = ({
  email,
  onResendEmail,
  onBackToLogin,
}) => {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const handleResend = async () => {
    if (cooldown > 0) return

    setIsResending(true)
    setResendError(null)
    setResendSuccess(false)

    try {
      await onResendEmail()
      setResendSuccess(true)
      
      // Start 60 second cooldown
      setCooldown(60)
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      setResendError(error instanceof Error ? error.message : 'Failed to resend email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Verify Your Email
          </h1>

          {/* Description */}
          <p className="text-center text-gray-600 mb-6">
            We've sent a verification email to:
          </p>

          {/* Email Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-center font-medium text-gray-900 break-all">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Please check your inbox and click the verification link to activate your account.
              Don't forget to check your spam folder!
            </p>
          </div>

          {/* Success Message */}
          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 text-center">
                ✓ Verification email sent successfully!
              </p>
            </div>
          )}

          {/* Error Message */}
          {resendError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 text-center">
                {resendError}
              </p>
            </div>
          )}

          {/* Resend Button */}
          <Button
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="w-full mb-4"
            variant="default"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Verification Email
              </>
            )}
          </Button>

          {/* Back to Login */}
          <Button
            onClick={onBackToLogin}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already verified?{' '}
          <button
            onClick={onBackToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Try logging in
          </button>
        </p>
      </div>
    </div>
  )
}
