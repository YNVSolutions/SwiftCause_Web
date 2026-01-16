'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/lib/auth-provider'
import { Loader } from '@/shared/ui/Loader'
import { useEffect } from 'react'

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { userRole, isLoadingAuth } = useAuth()

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!userRole || (userRole !== 'kiosk' && userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'manager' && userRole !== 'operator' && userRole !== 'viewer')) {
        router.push('/login')
      }
    }
  }, [userRole, isLoadingAuth, router])

  if (isLoadingAuth) {
    return <Loader />
  }

  if (!userRole || (userRole !== 'kiosk' && userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'manager' && userRole !== 'operator' && userRole !== 'viewer')) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <style>{`
        .kiosk-bg-animate {
          background-size: 320% 320%;
          animation: kioskBackgroundShift 8s ease-in-out infinite;
          filter: saturate(1.1);
        }
        @keyframes kioskBackgroundShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .kiosk-bg-orb {
          animation: kioskOrbFloat 8s ease-in-out infinite;
        }
        .kiosk-bg-orb.delay {
          animation-delay: 1.2s;
        }
        .kiosk-bg-orb.slow {
          animation-duration: 12s;
        }
        @keyframes kioskOrbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-26px) scale(1.08); }
        }
      `}</style>
      <div className="absolute inset-0 kiosk-bg-animate bg-gradient-to-b from-green-100 via-white to-emerald-100/70" />
      <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-green-200 blur-3xl opacity-70 kiosk-bg-orb" />
      <div className="absolute top-1/3 -left-28 h-80 w-80 rounded-full bg-emerald-200 blur-3xl opacity-60 kiosk-bg-orb delay" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-green-100 blur-3xl opacity-90 kiosk-bg-orb slow" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
