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

  const handleBack = () => {
    router.push(returnTo)
  }

  const handleNavigate = (screen: string) => {
    if (screen === 'home') {
      router.push(returnTo)
    } else {
      router.push(`/${screen}`)
    }
  }

  return <TermsPage onNavigate={handleNavigate} onBack={handleBack} />
}
