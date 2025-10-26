'use client'

import { useRouter } from 'next/navigation'
import { DonationManagement } from '@/views/admin/DonationManagement'
import { useAuth } from '@/shared/lib/auth-provider'

export default function AdminDonationsPage() {
  const router = useRouter()
  const { currentAdminSession, hasPermission, handleLogout } = useAuth()

  const handleNavigate = (screen: string) => {
    router.push(`/admin/${screen}`)
  }

  if (!currentAdminSession) {
    return null
  }

  return (
    <DonationManagement
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userSession={currentAdminSession}
      hasPermission={hasPermission}
    />
  )
}
