'use client'

import React from 'react'
import { Button } from '@/shared/ui/button'
import { CheckCircle, XCircle, AlertCircle, Home } from 'lucide-react'
import Image from 'next/image'

interface EmailVerificationSuccessScreenProps {
  status: 'success' | 'error' | 'invalid'
  errorMessage?: string
  onContinueToLogin: () => void
}

export const EmailVerificationSuccessScreen: React.FC<EmailVerificationSuccessScreenProps> = ({
  status,
  errorMessage,
  onContinueToLogin,
}) => {
  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-20 h-20 text-[#11d452]" strokeWidth={1.5} />
      case 'error':
        return <XCircle className="w-20 h-20 text-red-500" strokeWidth={1.5} />
      case 'invalid':
        return <AlertCircle className="w-20 h-20 text-amber-500" strokeWidth={1.5} />
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'Email Verified!'
      case 'error':
        return 'Verification Failed'
      case 'invalid':
        return 'Invalid Link'
    }
  }

  const getMessage = () => {
    switch (status) {
      case 'success':
        return 'Your email has been successfully verified. You can now log in to your account and start managing your campaigns.'
      case 'error':
        return errorMessage || 'An error occurred while verifying your email. Please try again or contact support.'
      case 'invalid':
        return 'This verification link is invalid or has expired. Please request a new verification email from the login page.'
    }
  }

  const getBgColor = () => {
    switch (status) {
      case 'success':
        return 'bg-[#11d452]/10'
      case 'error':
        return 'bg-red-50'
      case 'invalid':
        return 'bg-amber-50'
    }
  }

  const getBorderColor = () => {
    switch (status) {
      case 'success':
        return 'border-[#11d452]/20'
      case 'error':
        return 'border-red-200'
      case 'invalid':
        return 'border-amber-200'
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
            <div className={`w-32 h-32 ${getBgColor()} ${getBorderColor()} border-2 rounded-full flex items-center justify-center transition-all`}>
              {getIcon()}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-[#0a2e16] mb-4">
            {getTitle()}
          </h1>

          {/* Message */}
          <p className="text-center text-slate-600 text-lg mb-10 leading-relaxed">
            {getMessage()}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onContinueToLogin}
              className={`w-full py-4 px-6 rounded-xl font-bold text-base transition-all ${
                status === 'success'
                  ? 'bg-[#064e3b] text-white hover:bg-[#053426] hover:shadow-lg hover:shadow-[#11d452]/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {status === 'success' ? 'Continue to Login' : 'Back to Login'}
            </button>

            {status !== 'success' && (
              <a
                href="/"
                className="w-full py-4 px-6 rounded-xl font-bold text-base transition-all bg-white text-[#064e3b] hover:bg-slate-50 border-2 border-[#064e3b] flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © 2024 SwiftCause. All rights reserved.
        </p>
      </div>
    </div>
  )
}
