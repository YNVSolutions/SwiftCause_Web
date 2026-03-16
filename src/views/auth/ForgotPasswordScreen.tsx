'use client'

import { ArrowLeft, CheckCircle2, LifeBuoy, ShieldAlert } from 'lucide-react'
import Image from 'next/image'
import { ProfessionalEmailField } from './interactions/ProfessionalEmailField'
import { MagneticButton } from './interactions/MagneticButton'

interface ForgotPasswordScreenProps {
  email: string
  loading: boolean
  status: 'idle' | 'submitted' | 'rate_limited' | 'error'
  message: string
  onEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (event: React.FormEvent) => void
  onBackToLogin: () => void
}

export function ForgotPasswordScreen({
  email,
  loading,
  status,
  message,
  onEmailChange,
  onSubmit,
  onBackToLogin,
}: ForgotPasswordScreenProps) {
  const isSuccessState = status === 'submitted'

  return (
    <div className="min-h-screen bg-[#F3F1EA] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-[#d9ded6] bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative hidden overflow-hidden bg-linear-to-b from-[#0f5132] to-[#064e3b] px-10 py-12 text-white lg:block">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-200/10 blur-3xl" />
            </div>

            <button onClick={onBackToLogin} className="relative z-10 inline-flex items-center gap-2 text-sm text-white/80 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>

            <div className="relative z-10 mt-10">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="SwiftCause logo" width={42} height={42} className="rounded-xl" />
                <span className="text-2xl font-bold tracking-tight text-stone-50">SwiftCause</span>
              </div>

              <div className="mt-16 max-w-md space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-emerald-100/70">Account Recovery</p>
                  <h1 className="mt-4 text-5xl font-black leading-tight tracking-tight text-stone-50">
                    Reset access
                    <span className="block text-emerald-100/80">without support tickets</span>
                  </h1>
                </div>

                <div className="space-y-5 text-base leading-relaxed text-emerald-50/80">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-emerald-200" />
                    <p>We use generic responses and Firebase password reset emails so account existence is never disclosed.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <LifeBuoy className="mt-1 h-5 w-5 shrink-0 text-emerald-200" />
                    <p>If the address is valid, you'll get a secure link that routes back to the correct SwiftCause environment.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <button onClick={onBackToLogin} className="inline-flex items-center gap-2 text-sm font-medium text-[#064e3b] transition hover:text-[#0f5132] lg:hidden">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>

            <div className="mt-6 lg:mt-0">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Forgot password</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Request a reset link</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                Enter your email and we&apos;ll send instructions if an account exists for it.
              </p>
            </div>

            <div className="mt-8 rounded-[28px] border border-[#e4e7e2] bg-[#fafaf8] p-6 sm:p-8">
              {isSuccessState ? (
                <div className="space-y-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900">Check your email</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#064e3b] px-5 py-3 text-sm font-semibold text-[#064e3b] transition hover:bg-emerald-50"
                  >
                    Return to login
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <ProfessionalEmailField
                    value={email}
                    onChange={onEmailChange}
                    error={status === 'error' ? message : null}
                  />

                  {status === 'rate_limited' && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      {message}
                    </div>
                  )}

                  <MagneticButton
                    type="submit"
                    loading={loading}
                    disabled={loading}
                    className="h-12 w-full text-base font-semibold"
                  >
                    {!loading && 'Send reset link'}
                  </MagneticButton>

                  <p className="text-xs leading-relaxed text-slate-500">
                    For security, SwiftCause uses the same response for known and unknown email addresses.
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
