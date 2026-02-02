'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { TermsPage } from '@/views/home/TermsPage'
import { useReturnTo } from '@/shared/lib/hooks/useReturnTo'

export default function Terms() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const step = searchParams.get('step')
  const baseReturnTo = useReturnTo({ home: '/', signup: '/signup' }, '/')
  const returnTo = from === 'signup' && step ? `/signup?step=${step}` : baseReturnTo

  const clearSignupDraft = () => {
    if (from === 'signup') {
      sessionStorage.removeItem('signupDraft')
    }
  }

  const safePush = (path: string) => {
    Promise.resolve(router.push(path)).catch(() => {
      // Ignore dev-time navigation timeouts
    })
  }

  const handleBack = () => {
    safePush(returnTo)
  }

  const handleNavigate = (screen: string) => {
    if (screen === 'home') {
      clearSignupDraft()
      safePush(returnTo)
    } else {
      safePush(`/${screen}`)
    }
  }

  return <TermsPage onNavigate={handleNavigate} onBack={handleBack} />
}
