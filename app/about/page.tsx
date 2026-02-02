'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { AboutPage } from '@/views/home/AboutPage'
import { useReturnTo } from '@/shared/lib/hooks/useReturnTo'

export default function About() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const returnTo = useReturnTo(
    { home: '/', terms: '/terms', contact: '/contact', docs: '/docs', signup: '/signup', login: '/login' },
    '/'
  )

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
