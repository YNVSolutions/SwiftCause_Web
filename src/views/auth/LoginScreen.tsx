import { useEffect, useState } from 'react';
import {
  Shield,
  Monitor,
  Globe,
  Zap,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
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
  const [openPrinciple, setOpenPrinciple] = useState<string | null>(null);

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
        <section className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-[#0b1b16] via-[#10241e] to-[#0b1a14] px-10 py-12 text-white lg:flex">
          <div className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />

          <button
            onClick={onGoBackToHome}
            className="relative z-10 flex items-center gap-4 text-left text-white/90 transition hover:text-white"
          >
            <span className="flex h-12 w-12 items-center justify-center">
              <img src="/logo.png" alt="SwiftCause Logo" className="h-10 w-10" />
            </span>
            <span className="font-(--font-lexend) text-2xl font-bold tracking-tight text-white">
              SwiftCause
            </span>
          </button>

          <div className="relative z-10 mt-4 flex flex-1 flex-col justify-center gap-12">
            <div className="max-w-xl space-y-10">
              <h1 className="font-(--font-lexend) text-5xl font-black leading-[1] tracking-tighter text-white">
                <span className="block">Precision</span>
                <span className="block">for</span>
                <span className="block text-emerald-400">Humanity.</span>
              </h1>

              <p className="max-w-lg border-l-2 border-emerald-500/20 pl-8 text-xl font-medium leading-relaxed text-emerald-50/40">
                Coordinate verified missions, deploy trusted kiosks, and scale
                impact with a single secure network.
              </p>

              <div className="space-y-4 pt-10">
                {[
                  {
                    title: 'Radical transparency for every mission',
                    items: [
                      'Real-time visibility into donations, campaigns, and outcomes',
                      'Clear audit trails for every transaction and Gift Aid claim',
                      'Data that builds trust with donors, partners, and regulators',
                    ],
                  },
                  {
                    title: 'Verified partners across the globe',
                    items: [
                      'Organizations verified before onboarding to the platform',
                      'Trusted payment and compliance partners built into the system',
                      'Designed to support local causes with global standards',
                    ],
                  },
                  {
                    title: 'Secure access for every operator',
                    items: [
                      'Role-based access for admins, volunteers, and kiosks',
                      'Encrypted authentication and secure session handling',
                      'Built on industry-grade security and payment infrastructure',
                    ],
                  },
                ].map((principle) => {
                  const isOpen = openPrinciple === principle.title;
                  return (
                    <div key={principle.title}>
                      <button
                        type="button"
                        onClick={() => setOpenPrinciple(isOpen ? null : principle.title)}
                        className="group flex w-full items-center gap-4 text-left"
                      >
                        <ChevronRight
                          className={`h-5 w-5 text-emerald-500/40 transition-transform transition-colors duration-300 group-hover:text-emerald-400 ${
                            isOpen ? 'rotate-90 text-emerald-400' : ''
                          }`}
                        />
                        <span className="font-(--font-lexend) text-lg font-bold tracking-tight text-white/80 transition-colors group-hover:text-white md:text-xl">
                          {principle.title}
                        </span>
                      </button>
                      <div
                        className={`mt-3 overflow-hidden transition-[max-height,opacity] duration-[450ms] ease-out ${
                          isOpen ? 'max-h-[220px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <ul className="space-y-2 pl-9 text-sm text-emerald-50/50 md:text-base">
                          {principle.items.map((item) => (
                            <li key={item} className="leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-12 border-t border-white/5 pt-12 text-white/10">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                Verified Global Network
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                End-to-End Encryption
              </span>
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
