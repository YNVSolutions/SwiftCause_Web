'use client'

import { useState } from 'react'
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'
import Image from 'next/image'
import { ProfessionalPasswordField } from './interactions/ProfessionalPasswordField'
import { MagneticButton } from './interactions/MagneticButton'

interface ResetPasswordScreenProps {
  status: 'ready' | 'success' | 'error' | 'invalid'
  loading?: boolean
  email?: string
  errorMessage?: string
  onSubmit: (password: string) => Promise<void>
  onBackToLogin: () => void
}

export function ResetPasswordScreen({
  status,
  loading = false,
  email,
  errorMessage,
  onSubmit,
  onBackToLogin,
}: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (password.length < 8) {
      setLocalError('Use at least 8 characters for your new password.')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    setLocalError('')
    await onSubmit(password)
  }

  return (
    <div className="min-h-screen bg-[#fcf9f1] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image src="/logo.png" alt="SwiftCause logo" width={48} height={48} className="rounded-xl" />
          <span className="text-2xl font-bold tracking-tight text-[#064e3b]">SwiftCause</span>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] sm:p-10">
          {status === 'ready' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <KeyRound className="h-8 w-8" />
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Reset password</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Choose a new password</h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {email
                    ? `Create a new password for ${email}.`
                    : 'Create a new password to finish recovering your account.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <ProfessionalPasswordField
                  id="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  error={localError || undefined}
                />

                <ProfessionalPasswordField
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />

                {errorMessage && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                <MagneticButton
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  className="h-12 w-full text-base font-semibold"
                >
                  {!loading && 'Update password'}
                </MagneticButton>
              </form>
            </>
          )}

          {status === 'success' && (
            <div className="space-y-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Password updated</h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Your password has been reset successfully. You can now sign in with your new credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={onBackToLogin}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#064e3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5132]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </button>
            </div>
          )}

          {(status === 'error' || status === 'invalid') && (
            <div className="space-y-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  {status === 'invalid' ? 'Reset link unavailable' : 'Reset failed'}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {errorMessage ||
                    'This reset link is invalid, expired, or already used. Request a new password reset email and try again.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onBackToLogin}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#064e3b] px-5 py-3 text-sm font-semibold text-[#064e3b] transition hover:bg-emerald-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
