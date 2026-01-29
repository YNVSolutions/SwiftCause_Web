'use client'

import React, { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import Image from 'next/image'

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
    <div className="min-h-screen bg-[#fcf9f1] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#064e3b]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#11d452]/5 rounded-full blur-3xl -ml-10 -mb-10"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image src="/logo.png" alt="SwiftCause logo" width={48} height={48} className="rounded-xl" />
          <span className="font-bold text-2xl tracking-tight text-[#064e3b] uppercase">SwiftCause</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-200">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-[#11d452]/10 border-2 border-[#11d452]/20 rounded-full flex items-center justify-center">
              <Mail className="w-16 h-16 text-[#11d452]" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-[#0a2e16] mb-3">
            Verify Your Email
          </h1>

          {/* Description */}
          <p className="text-center text-slate-600 text-lg mb-6">
            We've sent a verification email to:
          </p>

          {/* Email Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <p className="text-center font-semibold text-[#0a2e16] break-all">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-[#11d452]/5 border border-[#11d452]/20 rounded-xl p-5 mb-6">
            <p className="text-sm text-[#0a2e16] leading-relaxed">
              Please check your inbox and click the verification link to activate your account.
              Don't forget to check your spam folder!
            </p>
          </div>

          {/* Success Message */}
          {resendSuccess && (
            <div className="bg-[#11d452]/10 border border-[#11d452]/30 rounded-xl p-4 mb-4">
              <p className="text-sm text-[#0a2e16] text-center font-medium">
                ✓ Verification email sent successfully!
              </p>
            </div>
          )}

          {/* Error Message */}
          {resendError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-700 text-center font-medium">
                {resendError}
              </p>
            </div>
          )}

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="w-full py-4 px-6 rounded-xl font-bold text-base transition-all bg-[#064e3b] text-white hover:bg-[#053426] hover:shadow-lg hover:shadow-[#11d452]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none mb-3 flex items-center justify-center gap-2"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Resend Verification Email
              </>
            )}
          </button>

          {/* Back to Login */}
          <button
            onClick={onBackToLogin}
            className="w-full py-4 px-6 rounded-xl font-bold text-base transition-all bg-white text-[#064e3b] hover:bg-slate-50 border-2 border-[#064e3b] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Login
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-slate-600 mt-6">
          Already verified?{' '}
          <button
            onClick={onBackToLogin}
            className="text-[#064e3b] hover:text-[#053426] font-semibold hover:underline"
          >
            Try logging in
          </button>
        </p>

        {/* Copyright */}
        <p className="text-center text-slate-500 text-sm mt-4">
          © 2024 SwiftCause. All rights reserved.
        </p>
      </div>
    </div>
  )
}
