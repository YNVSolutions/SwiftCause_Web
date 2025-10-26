'use client'

import { useRouter } from 'next/navigation'
import CampaignManagement from '@/views/admin/CampaignManagement'
import { useAuth } from '@/shared/lib/auth-provider'

export default function AdminCampaignsPage() {
  const router = useRouter()
  const { currentAdminSession, hasPermission, handleLogout } = useAuth()

  const handleNavigate = (screen: string) => {
    router.push(`/admin/${screen}`)
  }

  if (!currentAdminSession) {
    return null
  }

  return (
    <CampaignManagement
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userSession={currentAdminSession}
      hasPermission={hasPermission}
    />
  )
}
