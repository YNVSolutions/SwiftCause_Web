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
      // Check email verification for admin users
      if (role === 'admin' || role === 'super_admin' || role === 'manager' || role === 'operator' || role === 'viewer') {
        const adminSession = sessionData as AdminSession
        if (adminSession && adminSession.user.emailVerified === false) {
          showToast('Please verify your email before logging in', 'error', 4000)
          router.push(`/auth/verify-email?email=${encodeURIComponent(adminSession.user.email)}`)
          return
        }
      }

      await handleLogin(role, sessionData)
      
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
