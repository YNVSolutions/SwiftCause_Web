'use client'

import { useRouter } from 'next/navigation'
import { useForgotPassword } from '@/features/auth-by-email/hooks/useForgotPassword'
import { ForgotPasswordScreen } from '@/views/auth/ForgotPasswordScreen'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { email, setEmail, loading, message, status, handleSubmit } = useForgotPassword()

  return (
    <ForgotPasswordScreen
      email={email}
      loading={loading}
      status={status}
      message={message}
      onEmailChange={(event) => setEmail(event.target.value)}
      onSubmit={handleSubmit}
      onBackToLogin={() => router.push('/login')}
    />
  )
}
