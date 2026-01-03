'use client'

import { useRouter } from 'next/navigation'
import { BankDetails } from '@/views/admin/BankDetails'
import { useAuth } from '@/shared/lib/auth-provider'

export default function AdminBankDetailsPage() {
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
    <BankDetails
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userSession={currentAdminSession}
      hasPermission={hasPermission}
    />
  )
}
