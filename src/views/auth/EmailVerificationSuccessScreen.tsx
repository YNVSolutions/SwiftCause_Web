'use client'

import React from 'react'
import { Button } from '@/shared/ui/button'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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
        return <CheckCircle className="w-16 h-16 text-green-600" />
      case 'error':
        return <XCircle className="w-16 h-16 text-red-600" />
      case 'invalid':
        return <AlertCircle className="w-16 h-16 text-yellow-600" />
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
        return 'Your email has been successfully verified. You can now log in to your account.'
      case 'error':
        return errorMessage || 'An error occurred while verifying your email. Please try again or contact support.'
      case 'invalid':
        return 'This verification link is invalid or has expired. Please request a new verification email.'
    }
  }

  const getBgColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-100'
      case 'error':
        return 'bg-red-100'
      case 'invalid':
        return 'bg-yellow-100'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-24 h-24 ${getBgColor()} rounded-full flex items-center justify-center`}>
              {getIcon()}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {getTitle()}
          </h1>

          {/* Message */}
          <p className="text-center text-gray-600 mb-8">
            {getMessage()}
          </p>

          {/* Action Button */}
          <Button
            onClick={onContinueToLogin}
            className="w-full"
            variant={status === 'success' ? 'default' : 'outline'}
          >
            {status === 'success' ? 'Continue to Login' : 'Back to Login'}
          </Button>
        </div>
      </div>
    </div>
  )
}
