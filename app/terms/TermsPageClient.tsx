'use client'

import { useRouter } from 'next/navigation'
import { TermsPage } from '@/views/home/TermsPage'

const returnMap: Record<string, string> = {
  home: '/',
  signup: '/signup',
}

export default function TermsPageClient({ from, step }: { from?: string; step?: string }) {
  const router = useRouter()
  const baseReturnTo = (from && returnMap[from]) || '/'
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
      safePush('/')
    } else {
      safePush(`/${screen}`)
    }
  }

  return <TermsPage onNavigate={handleNavigate} onBack={handleBack} />
}
