'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SignupScreen } from '@/views/auth/SignupScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { useToast } from '@/shared/ui/ToastProvider'
import { SignupFormData } from '@/shared/types'

export default function Signup() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleSignup } = useAuth()
  const { showToast } = useToast()
  const stepParam = Number(searchParams.get('step'))
  const initialStep = Number.isFinite(stepParam) ? Math.min(Math.max(stepParam, 1), 3) : 1

  const handleSignupWithToast = async (signupData: SignupFormData) => {
    try {
      const email = await handleSignup(signupData)
      showToast('Account created! Please check your email to verify your account.', 'success', 4000)
      
      // Small delay for toast to be visible
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Redirect to email verification page
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
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

  const handleViewTerms = (step: number) => {
    const safeStep = Math.min(Math.max(step, 1), 3)
    router.push(`/terms?from=signup&step=${safeStep}`)
  }

  return (
    <SignupScreen
      onSignup={handleSignupWithToast}
      onBack={handleBack}
      onLogin={handleLogin}
      onViewTerms={handleViewTerms}
      initialStep={initialStep}
    />
  )
}
