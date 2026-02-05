'use client'

import { useRouter } from 'next/navigation'
import { DocumentationPage } from '@/views/home/DocumentationPage'

const returnMap: Record<string, string> = {
  home: '/',
  terms: '/terms',
  about: '/about',
  contact: '/contact',
  signup: '/signup',
  login: '/login',
}

export default function DocsPageClient({ from }: { from?: string }) {
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

  return <DocumentationPage onNavigate={handleNavigate} onBack={handleBack} />
}
