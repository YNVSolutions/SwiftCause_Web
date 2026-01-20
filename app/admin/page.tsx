'use client'

import { useRouter } from 'next/navigation'
import { AdminDashboard } from '@/views/admin/AdminDashboard'
import { useAuth } from '@/shared/lib/auth-provider'
import { useEffect } from 'react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { currentAdminSession, hasPermission, handleLogout, handleOrganizationSwitch } = useAuth()

  // Check email verification
  useEffect(() => {
    if (currentAdminSession && currentAdminSession.user.emailVerified === false) {
      router.push(`/auth/verify-email?email=${encodeURIComponent(currentAdminSession.user.email)}`)
    }
  }, [currentAdminSession, router])

  const handleNavigate = (screen: string) => {
    if (screen === 'admin' || screen === 'admin-dashboard') {
      router.push('/admin')
    } else {
      const route = screen.replace('admin-', '')
      router.push(`/admin/${route}`)
    }
  }

  if (!currentAdminSession) {
    return null
  }

  // Don't render if email not verified
  if (currentAdminSession.user.emailVerified === false) {
    return null
  }

  return (
    <AdminDashboard
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userSession={currentAdminSession}
      hasPermission={hasPermission}
      onOrganizationSwitch={handleOrganizationSwitch}
    />
  )
}
