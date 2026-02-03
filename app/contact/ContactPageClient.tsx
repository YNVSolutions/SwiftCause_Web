'use client'

import { useRouter } from 'next/navigation'
import { ContactPage } from '@/views/home/ContactPage'

const returnMap: Record<string, string> = {
  home: '/',
  terms: '/terms',
  about: '/about',
  docs: '/docs',
  signup: '/signup',
  login: '/login',
}

export default function ContactPageClient({ from }: { from?: string }) {
  const router = useRouter()
  const returnTo = (from && returnMap[from]) || '/'

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
