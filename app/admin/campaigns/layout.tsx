'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/lib/auth-provider'
import { Loader } from '@/shared/ui/Loader'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { userRole, isLoadingAuth } = useAuth()

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!userRole || (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'manager' && userRole !== 'operator' && userRole !== 'viewer')) {
        router.push('/login')
      }
    }
  }, [userRole, isLoadingAuth, router])

  if (isLoadingAuth) {
    return <Loader />
  }

  if (!userRole || (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'manager' && userRole !== 'operator' && userRole !== 'viewer')) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
