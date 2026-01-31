import { useState } from 'react';
import {
  Shield,
  Monitor,
} from 'lucide-react';
import { UserRole, KioskSession, AdminSession } from '../../shared/types';
import { KioskLoginContainer } from '../../features/auth-by-kiosk';
import { AdminLoginContainer } from '../../features/auth-by-email';

interface LoginScreenProps {
  onLogin: (role: UserRole, sessionData?: KioskSession | AdminSession) => void;
  onGoBackToHome: () => void;
}

export function LoginScreen({ onLogin, onGoBackToHome }: LoginScreenProps) {
  const [openCard, setOpenCard] = useState<'admin' | 'kiosk' | null>('admin');

  return (
    <div className="min-h-screen bg-[#F3F1EA] font-lexend">
      <div className="grid min-h-screen lg:grid-cols-[0.75fr_1fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-b from-[#0f5132] to-[#064e3b] px-10 py-12 text-white lg:flex">
          <div className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full bg-emerald-400/6 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-300/4 blur-3xl" />

          <button
            onClick={onGoBackToHome}
            className="group relative z-10 flex items-center gap-2 text-left text-white/90 transition hover:text-white"
          >
            <span className="flex h-12 w-12 items-center justify-center">
              <img
                src="/logo.png"
                alt="SwiftCause Logo"
                className="h-10 w-10 rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            </span>
            <span className="font-lexend text-2xl font-bold tracking-tight text-stone-50">
              SwiftCause
            </span>
          </button>

          <div className="relative z-10 mt-4 flex flex-1 flex-col justify-center gap-12">
            <div className="max-w-xl space-y-10">
              <div>
                <h1 className="font-lexend text-7xl font-black leading-tight tracking-tighter md:text-8xl">
                  <span className="block text-emerald-100/80">Welcome</span>
                  <span className="block text-stone-50">back</span>
                </h1>
                <div className="mt-16 ml-2 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20">
                      <Shield className="h-4.5 w-4.5 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-stone-50 md:text-2xl">Admin Login</p>
                      <p className="mt-1 text-base leading-relaxed text-emerald-50/80 md:text-lg">
                        Access analytics, campaigns, and organization settings.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20">
                      <Monitor className="h-4.5 w-4.5 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-stone-50 md:text-2xl">Kiosk Mode</p>
                      <p className="mt-1 text-base leading-relaxed text-emerald-50/80 md:text-lg">
                        Start accepting walk-in donations on this device.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8 text-sm text-emerald-50/70">
            <div className="flex items-center gap-2">
              <span>Need help?</span>
              <a href="/contact" className="font-semibold text-stone-50 hover:text-emerald-100 transition-colors">
                Contact Support
              </a>
            </div>
            <span className="text-xs text-emerald-50/50">v1.0.0</span>
          </div>
        </section>

        <section className="flex items-start justify-center bg-[#F3F1EA] px-4 py-10 sm:items-center sm:px-6 sm:py-12">
          <div className="w-full max-w-lg">
            <div className="mb-10 flex items-center justify-start bg-[#F3F1EA] py-3 lg:hidden sticky top-0 z-10 -mx-4 px-4 sm:static sm:mx-0 sm:px-0 sm:py-0">
              <button
                onClick={onGoBackToHome}
                className="flex items-center gap-2 text-left text-slate-800 transition hover:text-slate-900"
              >
                <span className="flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10">
                  <img src="/logo.png" alt="SwiftCause Logo" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
                </span>
                <span className="text-lg font-semibold tracking-tight text-[#064e3b] sm:text-2xl">
                  SwiftCause
                </span>
              </button>
            </div>
            <div className="mb-10 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400/60 sm:text-xs sm:tracking-[0.35em]">
                Secure access
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-800 sm:mt-3 sm:text-4xl">
                Log in to SwiftCause
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Choose your access method below to continue.
              </p>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div 
                className={`rounded-3xl border bg-white shadow-[0_18px_35px_-28px_rgba(15,23,42,0.25)] transition-all ${
                  openCard === 'admin' 
                    ? 'border-[#F3F1EA]/60 p-6 sm:p-8' 
                    : 'border-[#F3F1EA]/60 cursor-pointer hover:border-slate-300 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] p-6 sm:p-8'
                }`}
                onClick={() => openCard !== 'admin' && setOpenCard('admin')}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Shield className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-slate-900">Organization Admin</p>
                    <p className="text-base text-slate-600">
                      Manage campaigns, kiosks, and view analytics.
                    </p>
                  </div>
                </div>
                {openCard === 'admin' && (
                  <div className="mt-4 sm:mt-5 animate-fade-in">
                    <AdminLoginContainer
                      onLogin={onLogin}
                      variant="panel"
                      buttonLabel="Login as Admin"
                      buttonClassName="!h-12 !rounded-2xl !bg-none !bg-[#064e3b] !text-stone-50 !shadow-[0_6px_18px_-10px_rgba(6,78,59,0.5)] hover:!bg-[#0f5132]"
                    />
                  </div>
                )}
              </div>

              <div 
                className={`rounded-3xl border bg-white shadow-[0_18px_35px_-28px_rgba(15,23,42,0.25)] transition-all ${
                  openCard === 'kiosk' 
                    ? 'border-[#F3F1EA]/60 p-6 sm:p-8' 
                    : 'border-[#F3F1EA]/60 cursor-pointer hover:border-slate-300 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] p-6 sm:p-8'
                }`}
                onClick={() => openCard !== 'kiosk' && setOpenCard('kiosk')}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Monitor className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-slate-900">Kiosk Terminal</p>
                    <p className="text-base text-slate-600">
                      Connect a physical device to your organization.
                    </p>
                  </div>
                </div>
                {openCard === 'kiosk' && (
                  <div className="mt-4 sm:mt-5 animate-fade-in">
                    <KioskLoginContainer
                      onLogin={onLogin}
                      variant="panel"
                      buttonLabel="Login as Kiosk"
                      buttonClassName="!h-12 !rounded-2xl !bg-none !bg-transparent !text-[#064e3b] !shadow-none !border-2 !border-[#064e3b] hover:!bg-emerald-50"
                    />
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-slate-500 sm:text-sm">
                Don't have an account?{' '}
                <a href="/signup" className="font-semibold text-[#064e3b] hover:underline">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
