'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { DocumentationPage } from '@/views/home/DocumentationPage'
import { useReturnTo } from '@/shared/lib/hooks/useReturnTo'

export default function Docs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const returnTo = useReturnTo(
    { home: '/', terms: '/terms', about: '/about', contact: '/contact', signup: '/signup', login: '/login' },
    '/'
  )

  const handleBack = () => {
    if (from) {
      router.push(returnTo)
    } else {
      router.back()
    }
  }

  const handleNavigate = (screen: string) => {
    if (screen === 'home') {
      router.push('/')
    } else {
      router.push(`/${screen}`)
    }
  }

  return <DocumentationPage onNavigate={handleNavigate} onBack={handleBack} />
}
