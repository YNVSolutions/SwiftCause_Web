'use client'

import { useRouter } from 'next/navigation'
import { AboutPage } from '@/views/home/AboutPage'

export default function About() {
  const router = useRouter()

  const handleNavigate = (screen: string) => {
    if (screen === 'home') {
      router.push('/')
    } else {
      router.push(`/${screen}`)
    }
  }

  return <AboutPage onNavigate={handleNavigate} />
}
