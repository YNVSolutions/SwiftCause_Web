'use client'

import { useRouter } from 'next/navigation'
import { AdminDashboard } from '@/views/admin/AdminDashboard'
import { useAuth } from '@/shared/lib/auth-provider'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { currentAdminSession, hasPermission, handleLogout, handleOrganizationSwitch } = useAuth()

  const handleNavigate = (screen: string) => {
    if (screen === 'admin' || screen === 'admin-dashboard') {
      router.push('/admin')
    } else {
      const route = screen.replace('admin-', '')
      router.push(`/admin/${route}`)
    }
  }

  if (!currentAdminSession) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!currentAdminSession.user.organizationId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Organization Not Found</h2>
          <p className="text-gray-600 mb-6">Your account is not associated with an organization. Please contact support for assistance.</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
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
