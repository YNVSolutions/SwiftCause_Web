'use client'

import { useRouter } from 'next/navigation'
import { KioskManagement } from '@/views/admin/KioskManagement'
import { useAuth } from '@/shared/lib/auth-provider'

export default function AdminKiosksPage() {
  const router = useRouter()
  const { currentAdminSession, hasPermission, handleLogout } = useAuth()

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

  return (
    <KioskManagement
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userSession={currentAdminSession}
      hasPermission={hasPermission}
    />
  )
}
