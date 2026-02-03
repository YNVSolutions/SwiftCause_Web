import React, { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { ArrowLeft, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

export function TermsPage({ onNavigate, onBack }: { onNavigate?: (screen: string) => void; onBack?: () => void }) {
  const effectiveDate = 'September 28, 2025';

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const PointBox = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start bg-[#F7F6F2] p-3 sm:p-4 rounded-2xl border border-[#E6E2D8] shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-0.5">
      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#1f7a53] mr-2 sm:mr-3 mt-0.5 shrink-0" />
      <span className="flex-1 text-sm sm:text-base text-slate-700 leading-relaxed">{children}</span>
    </li>
  );

  return (
    <div className="min-h-screen bg-[#F3F1EA] font-['Helvetica',sans-serif] text-slate-700">
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .hero-gradient {
          background: linear-gradient(180deg, #0f5132 0%, #064e3b 100%);
        }
      `}</style>
      <header className="sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between py-4 glass-card px-4 rounded-b-2xl">
          <button
            onClick={() => onNavigate && onNavigate('home')}
            className="flex items-center gap-3 text-left"
            aria-label="Go to home"
          >
            <img src="/logo.png" alt="SwiftCause" className="w-8 h-8" />
            <div>
              <span className="font-bold text-lg tracking-tight text-[#064e3b]">SwiftCause</span>
              <p className="text-[11px] text-slate-500">Donation Platform</p>
            </div>
          </button>
          <Button
            variant="ghost"
            onClick={() => (onBack ? onBack() : onNavigate && onNavigate('home'))}
            className="flex items-center gap-2 text-[#064e3b] border border-[#064e3b] px-4 py-2 rounded-2xl hover:bg-[#064e3b] hover:text-stone-50 transition-all duration-300"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-semibold">Back</span>
          </Button>
        </div>
      </header>

      <main role="main">
        <section
          className={`px-4 sm:px-6 lg:px-8 pt-6 pb-0 transition-opacity duration-700 ease-in ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          aria-labelledby="terms-content"
        >
          <div className="max-w-[1200px] mx-auto">
            <h2 id="terms-content" className="sr-only">Terms of Service Content</h2>

            <div className="bg-white border border-[#E6E2D8] rounded-4xl p-6 sm:p-8 shadow-xl shadow-slate-200/30">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <div className="flex items-center justify-center mx-auto h-12 w-12 rounded-2xl bg-emerald-100/90 text-emerald-700 mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="text-emerald-700/80 text-xs tracking-[0.3em] uppercase mb-3">Legal</p>
                <h1 id="terms-title" className="text-3xl sm:text-4xl font-semibold text-slate-900 italic leading-tight mb-4">
                  Terms of Service
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Last Updated: <time dateTime="2025-09-28">{effectiveDate}</time>
                </p>
              </div>
              <div className="mb-8 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl" role="alert" aria-live="polite">
              <div className="flex items-start">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-amber-800">Disclaimer for Platform Owner</h3>
                  <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                    This is a template and not legal advice. You must consult with a qualified legal professional to ensure your Terms are compliant with all applicable laws.
                  </p>
                </div>
              </div>
              </div>

              <div className="space-y-6 text-slate-700">
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">1. Acceptance of Terms</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  Welcome to SwiftCause ("we," "us," or "our"). These Terms of Service ("Terms") govern your use of our website, mobile applications, and services (collectively, the "Service"). By creating an account or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">2. Description of Service</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  SwiftCause provides an online platform that enables nonprofit organizations ("Campaign Creators") to create and manage fundraising campaigns to accept monetary donations from individuals ("Donors").
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">3. For Campaign Creators (Nonprofits)</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  You represent and warrant that you are an authorized representative of a legally registered nonprofit organization. You agree to:
                </p>
                <ul className="list-none p-0 grid grid-cols-1 gap-3 my-4">
                  <PointBox>Provide accurate and complete information when creating an account and campaign.</PointBox>
                  <PointBox>Use all donated funds solely for the purposes stated in your campaign.</PointBox>
                  <PointBox>Comply with all applicable laws and regulations, including tax and financial reporting requirements. SwiftCause is not responsible for your compliance with Gift Aid regulations.</PointBox>
                  <PointBox>Not post content that is fraudulent, misleading, illegal, defamatory, or hateful.</PointBox>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">4. For Donors</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  By making a donation through the Service, you agree that:
                </p>
                <ul className="list-none p-0 grid grid-cols-1 gap-3 my-4">
                  <PointBox>Your donation is a voluntary contribution. All donations are final and non-refundable.</PointBox>
                  <PointBox>SwiftCause does not endorse any campaign and is not responsible for the use of your donation by the Campaign Creator. We provide the technology platform but do not guarantee the truthfulness of any campaign.</PointBox>
                  <PointBox>You are responsible for ensuring you are eligible for any tax benefits, such as Gift Aid, and for maintaining your own records.</PointBox>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">5. Fees and Payments</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  SwiftCause may charge a platform fee, which will be disclosed at the time of a transaction. All payments are processed through third-party payment gateways (e.g., Stripe, SumUp). These gateways may charge their own processing fees. SwiftCause is not responsible for the performance of these third-party processors.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">6. Intellectual Property</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  Our Service, including our logo, branding, and software, is the exclusive property of SwiftCause. Campaign Creators retain ownership of the content they upload but grant us a worldwide, non-exclusive, license to display and distribute it in connection with providing the Service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">7. Prohibited Conduct</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  You agree not to use the Service to violate any law, engage in fraudulent activity, infringe on intellectual property rights, upload malicious code, or attempt to disrupt our systems.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">8. Disclaimer of Warranties and Limitation of Liability</h2>
                <p className="text-sm sm:text-base leading-relaxed font-medium text-slate-800">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL SWIFTCAUSE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">9. Governing Law</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  These Terms shall be governed by the laws of England and Wales.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">10. Changes to These Terms</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify you of changes by posting the new Terms on this page and updating the "Last Updated" date.
                </p>
              </section>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
