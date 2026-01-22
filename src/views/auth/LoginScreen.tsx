import { useEffect, useState } from 'react';
import { Diamond, Star, Shield, Monitor } from 'lucide-react';
import { UserRole, KioskSession, AdminSession } from '../../shared/types';
import { KioskLoginContainer } from '../../features/auth-by-kiosk';
import { AdminLoginContainer } from '../../features/auth-by-email';

interface LoginScreenProps {
  onLogin: (role: UserRole, sessionData?: KioskSession | AdminSession) => void;
  onGoBackToHome: () => void;
}

export function LoginScreen({ onLogin, onGoBackToHome }: LoginScreenProps) {
  const [openCard, setOpenCard] = useState<'admin' | 'kiosk' | null>(null);
  const [showAdminButton, setShowAdminButton] = useState(true);
  const [showKioskButton, setShowKioskButton] = useState(true);

  useEffect(() => {
    if (openCard === 'admin') {
      setShowAdminButton(false);
      return;
    }

    const timer = setTimeout(() => setShowAdminButton(true), 600);
    return () => clearTimeout(timer);
  }, [openCard]);

  useEffect(() => {
    if (openCard === 'kiosk') {
      setShowKioskButton(false);
      return;
    }

    const timer = setTimeout(() => setShowKioskButton(true), 600);
    return () => clearTimeout(timer);
  }, [openCard]);

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        <section className="relative flex flex-col justify-between bg-linear-to-br from-[#6e8f7f] via-[#7e9e8f] to-[#6a8879] px-8 py-10 text-white lg:py-12">
          <button
            onClick={onGoBackToHome}
            className="flex items-center gap-3 text-left text-white/90 transition hover:text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-sm backdrop-blur">
              <Diamond className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              SwiftCause
            </span>
          </button>

          <div className="mt-12 flex flex-1 flex-col justify-center gap-10 lg:mt-0">
            <div className="flex justify-center lg:justify-start">
              <div className="relative flex h-56 w-56 items-center justify-center rounded-4xl border border-white/25 bg-white/15 shadow-[0_25px_50px_-30px_rgba(15,23,42,0.7)]">
                <div className="flex h-20 w-28 items-center justify-center rounded-2xl bg-white text-[#6b877c] shadow-lg">
                  <Monitor className="h-8 w-8" />
                </div>
                <div className="absolute -right-4 -bottom-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3ba871] text-white shadow-lg">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-[#7df0b2] lg:justify-start">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </div>

            <p className="max-w-md text-lg leading-relaxed text-white/90">
              "SwiftCause transformed how we manage our physical donation points. The deployment speed is unmatched."
            </p>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15 text-sm font-semibold">
                N1
              </div>
              <div>
                <p className="text-sm font-semibold">NGO_One</p>
                <p className="text-xs text-white/70">International Relief Fund</p>
              </div>
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.25em] text-white/50">
            (c) 2024 SwiftCause Management Inc.
          </p>
        </section>

        <section className="flex items-center justify-center bg-[#fbfaf7] px-6 py-12">
          <div className="w-full max-w-lg">
            <div className="mb-10 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-[#9aa09b]">
                Secure access
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-[#1f2937] sm:text-4xl">
                Log in to SwiftCause
              </h1>
              <p className="mt-2 text-sm text-[#6b7280]">
                Choose your access method below to continue.
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-[#e3e6e2] bg-white p-6 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.45)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f1] text-[#2f5b47]">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-[#1f2937]">Organization Admin</p>
                    <p className="text-sm text-[#6b7280]">
                      Manage campaigns, kiosks, and view analytics.
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-600 ease-out ${
                      openCard === 'admin' ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <AdminLoginContainer
                      onLogin={onLogin}
                      variant="panel"
                      buttonLabel="Login as Admin"
                      buttonClassName="!h-12 !rounded-2xl !bg-none !bg-[#2f4f43] !text-white !shadow-none hover:!bg-[#273f35]"
                    />
                  </div>
                  <div className="h-12">
                    <button
                      type="button"
                      onClick={() => setOpenCard('admin')}
                      className={`h-12 w-full rounded-2xl bg-[#2f4f43] text-sm font-semibold text-white transition hover:bg-[#273f35] ${
                        showAdminButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      Login as Admin
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[#e3e6e2] bg-white p-6 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.45)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f2f5] text-[#6b7280]">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-[#1f2937]">Kiosk Terminal</p>
                    <p className="text-sm text-[#6b7280]">
                      Connect a physical device to your organization.
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-600 ease-out ${
                      openCard === 'kiosk' ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <KioskLoginContainer
                      onLogin={onLogin}
                      variant="panel"
                      buttonLabel="Login as Kiosk"
                      buttonClassName="!h-12 !rounded-2xl !bg-none !bg-white !text-[#2f4f43] !shadow-none !border !border-[#d7ded9] hover:!bg-[#f4f7f4]"
                    />
                  </div>
                  <div className="h-12">
                    <button
                      type="button"
                      onClick={() => setOpenCard('kiosk')}
                      className={`h-12 w-full rounded-2xl border border-[#d7ded9] bg-white text-sm font-semibold text-[#2f4f43] transition hover:bg-[#f4f7f4] ${
                        showKioskButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      Login as Kiosk
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-[#6b7280]">
                Don't have an account?{' '}
                <a href="/signup" className="font-semibold text-[#2f4f43] hover:underline">
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
