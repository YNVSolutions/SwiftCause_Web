'use client'

import { useRouter } from 'next/navigation'
import { ContactPage } from '@/views/home/ContactPage'

export default function Contact() {
  const router = useRouter()

  const handleNavigate = (screen: string) => {
    router.push(`/${screen}`)
  }

  return <ContactPage onNavigate={handleNavigate} />
}
