'use client'

import { useRouter } from 'next/navigation'
import { SignupScreen } from '@/views/auth/SignupScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { useToast } from '@/shared/ui/ToastProvider'
import { SignupFormData } from '@/shared/types'

export default function Signup() {
  const router = useRouter()
  const { handleSignup } = useAuth()
  const { showToast } = useToast()

  const handleSignupWithToast = async (signupData: SignupFormData) => {
    try {
      await handleSignup(signupData)
      showToast('Signup successful', 'success')
      router.push('/login')
    } catch (error) {
      if (error instanceof Error) {
        showToast(`Signup failed: ${error.message}`, 'error', 3500)
      } else {
        showToast('Signup failed due to an unknown error.', 'error', 3500)
      }
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleLogin = () => {
    router.push('/login')
  }

  const handleViewTerms = () => {
    router.push('/terms')
  }

  return (
    <SignupScreen
      onSignup={handleSignupWithToast}
      onBack={handleBack}
      onLogin={handleLogin}
      onViewTerms={handleViewTerms}
    />
  )
}
