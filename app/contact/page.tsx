'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ContactPage } from '@/views/home/ContactPage'
import { useReturnTo } from '@/shared/lib/hooks/useReturnTo'

function ContactContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const returnTo = useReturnTo(
    { home: '/', terms: '/terms', about: '/about', docs: '/docs', signup: '/signup', login: '/login' },
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

  return <ContactPage onNavigate={handleNavigate} onBack={handleBack} />
}

export default function Contact() {
  return (
    <Suspense fallback={null}>
      <ContactContent />
    </Suspense>
  )
}
