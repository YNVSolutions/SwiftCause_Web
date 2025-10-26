import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/shared/lib/auth-provider'
import { ToastProvider } from '@/shared/ui/ToastProvider'
import { StripeProvider } from '@/shared/lib/stripe-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SwiftCause',
  description: 'SwiftCause - Donation Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
