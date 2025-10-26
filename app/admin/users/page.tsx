'use client'

import { useRouter } from 'next/navigation'
import { UserManagement } from '@/views/admin/UserManagement'
import { useAuth } from '@/shared/lib/auth-provider'

export default function AdminUsersPage() {
  const router = useRouter()
  const { currentAdminSession, hasPermission, handleLogout } = useAuth()

  const handleNavigate = (screen: string) => {
    router.push(`/admin/${screen}`)
  }

  if (!currentAdminSession) {
    return null
  }

  return (
    <UserManagement
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userSession={currentAdminSession}
      hasPermission={hasPermission}
    />
  )
}
