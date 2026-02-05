'use client'

import { useRouter } from 'next/navigation'
import { AboutPage } from '@/views/home/AboutPage'

const returnMap: Record<string, string> = {
  home: '/',
  terms: '/terms',
  contact: '/contact',
  docs: '/docs',
  signup: '/signup',
  login: '/login',
}

export default function AboutPageClient({ from }: { from?: string }) {
  const router = useRouter()
  const returnTo = (from && returnMap[from]) || '/'

  const safePush = (path: string) => {
    Promise.resolve(router.push(path)).catch(() => {
      // Ignore dev-time navigation timeouts
    })
  }

  const handleBack = () => {
    if (from) {
      safePush(returnTo)
    } else {
      try {
        router.back()
      } catch {
        // no-op
      }
    }
  }

  const handleNavigate = (screen: string) => {
    if (screen === 'home') {
      safePush('/')
    } else {
      safePush(`/${screen}`)
    }
  }

  return <AboutPage onNavigate={handleNavigate} onBack={handleBack} />
}
