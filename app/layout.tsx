import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Lexend } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/shared/lib/auth-provider'
import { ToastProvider } from '@/shared/ui/ToastProvider'
import { StripeProvider } from '@/shared/lib/stripe-provider'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})
const lexend = Lexend({ 
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SwiftCause',
  description: 'SwiftCause - Donation Platform',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={lexend.variable}>
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <StripeProvider>
              {children}
            </StripeProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
