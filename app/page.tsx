'use client'

import { useRouter } from 'next/navigation'
import { HomePage } from '@/views/home/HomePage'
import { useAuth } from '@/shared/lib/auth-provider'
import { Loader } from '@/shared/ui/Loader'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const { userRole, isLoadingAuth } = useAuth()
  

  useEffect(() => {
    if (!isLoadingAuth) {
      if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'manager' || userRole === 'operator' || userRole === 'viewer') {
        router.push('/admin')
      } else if (userRole === 'kiosk') {
        router.push('/campaigns')
      }
    }
  }, [userRole, isLoadingAuth, router])

  if (isLoadingAuth) {
    return <Loader />
  }

  const handleNavigate = (screen: string) => {
    router.push(`/${screen}`)
  }

  const handleLogin = () => {
    router.push('/login')
  }

  const handleSignup = () => {
    router.push('/signup')
  }

  return (
    <HomePage 
      onLogin={handleLogin} 
      onSignup={handleSignup} 
      onNavigate={handleNavigate} 
    />
  )
}
