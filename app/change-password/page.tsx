'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader } from '@/shared/ui/Loader'
import { useAuth } from '@/shared/lib/auth-provider'
import { ChangePasswordScreen } from '../../src/views/auth/ChangePasswordScreen'

export default function ChangePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userRole, isLoadingAuth, passwordRotationStatus } = useAuth()

  // Restrict this UI to authenticated admin-like users (kiosk users do not have a password to change).
  const allowedRoles = ['admin', 'super_admin', 'manager', 'operator', 'viewer']

  useEffect(() => {
    if (isLoadingAuth) return
    if (!userRole || !allowedRoles.includes(userRole)) {
      router.push('/login')
    }
  }, [isLoadingAuth, router, userRole])

  if (isLoadingAuth) {
    return <Loader />
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Loader />
  }

  return (
    <ChangePasswordScreen
      reason={searchParams.get('reason') ?? undefined}
      rotationStatus={passwordRotationStatus}
    />
  )
}

