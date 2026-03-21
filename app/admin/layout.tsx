'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/lib/auth-provider'
import { Loader } from '@/shared/ui/Loader'
import { useEffect } from 'react'
import { logPasswordChangeAuditEvent } from '@/features/auth-by-email/lib/passwordChangeAudit'
import { getRotationBannerMessage } from '@/features/auth-by-email/lib/passwordRotationPolicy'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { userRole, isLoadingAuth, passwordRotationStatus, isPasswordRotationExpired } = useAuth()

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!userRole || (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'manager' && userRole !== 'operator' && userRole !== 'viewer')) {
        router.push('/login')
        return
      }

      if (isPasswordRotationExpired) {
        router.push('/change-password?reason=rotation-expired')
      }
    }
  }, [userRole, isLoadingAuth, router, isPasswordRotationExpired])

  useEffect(() => {
    if (!userRole || isLoadingAuth || passwordRotationStatus === 'ok') return
    const dedupeKey = `rotation-status-logged-${passwordRotationStatus}`
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(dedupeKey)) return

    void logPasswordChangeAuditEvent({
      eventType: 'password_rotation_status',
      status: passwordRotationStatus,
      metadata: {
        source: 'admin-layout',
      },
    })

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(dedupeKey, '1')
    }
  }, [isLoadingAuth, passwordRotationStatus, userRole])

  if (isLoadingAuth) {
    return <Loader />
  }

  if (
    !userRole ||
    (userRole !== 'admin' &&
      userRole !== 'super_admin' &&
      userRole !== 'manager' &&
      userRole !== 'operator' &&
      userRole !== 'viewer')
  ) {
    return null // Will redirect to login
  }

  const bannerMessage = getRotationBannerMessage(passwordRotationStatus)

  return (
    <>
      {bannerMessage && passwordRotationStatus !== 'expired' && (
        <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          {bannerMessage}
        </div>
      )}
      {children}
    </>
  )
}
