'use client'

import { useRouter } from 'next/navigation'
import { DocumentationPage } from '@/views/home/DocumentationPage'

export default function Docs() {
  const router = useRouter()

  const handleNavigate = (screen: string) => {
    router.push(`/${screen}`)
  }

  return <DocumentationPage onNavigate={handleNavigate} />
}
