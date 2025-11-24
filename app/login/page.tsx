'use client'

import { useRouter } from 'next/navigation'
import { LoginScreen } from '@/views/auth/LoginScreen'
import { useAuth } from '@/shared/lib/auth-provider'
import { useToast } from '@/shared/ui/ToastProvider'
import { UserRole, KioskSession, AdminSession } from '@/shared/types'

export default function Login() {
  const router = useRouter()
  const { handleLogin } = useAuth()
  const { showToast } = useToast()

  const handleGoBackToHome = () => {
    router.push('/')
  }

  const handleLoginWithToast = async (role: UserRole, sessionData?: KioskSession | AdminSession) => {
    try {
      await handleLogin(role, sessionData)
      showToast('Sign in successful', 'success')
      
      // Navigate based on role
      if (role === 'admin' || role === 'super_admin' || role === 'manager' || role === 'operator' || role === 'viewer') {
        router.push('/admin')
      } else if (role === 'kiosk') {
        router.push('/campaigns')
      }
    } catch {
      showToast('Login failed', 'error')
    }
  }

  return (
    <LoginScreen
      onLogin={handleLoginWithToast}
      onGoBackToHome={handleGoBackToHome}
    />
  )
}
