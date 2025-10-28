'use client'

import { useRouter } from 'next/navigation'
import { TermsPage } from '@/views/home/TermsPage'

export default function Terms() {
  const router = useRouter()

  const handleNavigate = (screen: string) => {
    if (screen === 'home') {
      router.push('/')
    } else {
      router.push(`/${screen}`)
    }
  }

  return <TermsPage onNavigate={handleNavigate} />
}
