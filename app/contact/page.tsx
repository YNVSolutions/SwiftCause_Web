'use client'

import { useRouter } from 'next/navigation'
import { ContactPage } from '@/views/home/ContactPage'

export default function Contact() {
  const router = useRouter()

  const handleNavigate = (screen: string) => {
    if (screen === 'home') {
      router.push('/')
    } else {
      router.push(`/${screen}`)
    }
  }

  return <ContactPage onNavigate={handleNavigate} />
}
