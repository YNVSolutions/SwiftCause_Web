'use client'

import { useRouter } from 'next/navigation'
import { DocumentationPage } from '@/views/home/DocumentationPage'

export default function Docs() {
  const router = useRouter()

  const handleNavigate = (screen: string) => {
    if (screen === 'home') {
      router.push('/')
    } else {
      router.push(`/${screen}`)
    }
  }

  return <DocumentationPage onNavigate={handleNavigate} />
}
