import { useEffect, useState } from 'react';
import { Shield, Monitor } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f5f3ef] font-(--font-lexend)">
      <div className="grid min-h-screen lg:grid-cols-[0.75fr_1fr]">
        <section className="relative hidden flex-col justify-between bg-linear-to-br from-[#6e8f7f] via-[#7e9e8f] to-[#6a8879] px-10 py-12 text-white lg:flex">
          <button
            onClick={onGoBackToHome}
            className="flex items-center gap-2 text-left text-white/90 transition hover:text-white"
          >
            <span className="flex h-16 w-16 items-center justify-center">
              <img src="/logo.png" alt="SwiftCause Logo" className="h-12 w-12" />
            </span>
            <span className="text-3xl font-semibold tracking-tight">
              SwiftCause
            </span>
          </button>

          <div className="mt-4 flex flex-1 flex-col justify-center gap-12">
            <div className="flex justify-center">
              <div className="relative flex h-64 w-64 items-center justify-center rounded-[36px] border border-white/25 bg-white/15 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.7)]">
                <div className="flex h-20 w-28 items-center justify-center rounded-2xl bg-white text-[#6b877c] shadow-lg">
                  <Monitor className="h-8 w-8" />
                </div>
                <div className="absolute -right-4 -bottom-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3ba871] text-white shadow-lg">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="flex items-start justify-center bg-[#fbfaf7] px-4 py-10 sm:items-center sm:px-6 sm:py-12">
          <div className="w-full max-w-lg">
            <div className="mb-10 flex items-center justify-start bg-[#fbfaf7] py-3 lg:hidden sticky top-0 z-10 -mx-4 px-4 sm:static sm:mx-0 sm:px-0 sm:py-0">
              <button
                onClick={onGoBackToHome}
                className="flex items-center gap-2 text-left text-[#1f2937] transition hover:text-[#0f172a]"
              >
                <span className="flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10">
                  <img src="/logo.png" alt="SwiftCause Logo" className="h-8 w-8 sm:h-9 sm:w-9" />
                </span>
                <span className="text-lg font-semibold tracking-tight sm:text-2xl">
                  SwiftCause
                </span>
              </button>
            </div>
            <div className="mb-10 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#9aa09b] sm:text-xs sm:tracking-[0.35em]">
                Secure access
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[#1f2937] sm:mt-3 sm:text-4xl">
                Log in to SwiftCause
              </h1>
              <p className="mt-2 text-sm text-[#6b7280]">
                Choose your access method below to continue.
              </p>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div className="rounded-3xl border border-[#e3e6e2] bg-white p-5 sm:p-6 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.45)]">
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
                <div className="mt-4 sm:mt-5">
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

              <div className="rounded-3xl border border-[#e3e6e2] bg-white p-5 sm:p-6 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.45)]">
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
                <div className="mt-4 sm:mt-5">
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-[600ms] ease-out ${
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

              <p className="text-center text-xs text-[#6b7280] sm:text-sm">
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
