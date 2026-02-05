"use client";
import { Button } from '../../shared/ui/button';
import { ArrowLeft, Heart, Globe, Award, CheckCircle, Target, Shield, Users } from 'lucide-react';

const ValueCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="group rounded-3xl border border-[#F3F1EA]/60 bg-white p-6 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_40px_-18px_rgba(15,23,42,0.3)]">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{description}</p>
  </div>
);

export function AboutPage({ onNavigate, onBack }: { onNavigate?: (screen: string) => void; onBack?: () => void }) {
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
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-semibold">Back</span>
          </Button>
        </div>
      </header>

      <main className="py-10 sm:py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <section className="hero-gradient rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-green-900/10">
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl -mr-24 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-300/10 rounded-full blur-3xl -ml-16 -mb-10"></div>
            <div className="relative px-8 py-12 sm:py-14 text-left">
              <p className="text-emerald-100/80 text-xs tracking-[0.3em] uppercase">About</p>
              <h1 className="mt-3 text-4xl sm:text-5xl font-semibold text-white leading-tight">
                Fundraising that scales with your mission.
              </h1>
              <p className="mt-4 text-sm sm:text-base text-emerald-50/85 leading-relaxed max-w-2xl">
                SwiftCause helps organizations launch campaigns, accept donations anywhere, and deliver real-time visibility across impact.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  onClick={() => onNavigate && onNavigate('docs')}
                  className="h-12 px-6 bg-white text-[#064e3b] hover:bg-[#F3F1EA] rounded-2xl font-semibold shadow-lg shadow-emerald-900/10"
                >
                  Guide
                </Button>
                <Button
                  onClick={() => onNavigate && onNavigate('contact')}
                  variant="outline"
                  className="h-12 px-6 rounded-2xl border-white text-white bg-white/10 hover:bg-white/20 hover:border-white/80"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400/70">Our Story</p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-slate-900">
                  Built for teams who run high-impact campaigns.
                </h2>
              </div>
              <div className="space-y-4 text-slate-600">
                <p>
                  We started SwiftCause after seeing how many organizations were forced to stitch together spreadsheets,
                  outdated tools, and hardware-heavy setups just to accept donations.
                </p>
                <p>
                  We built a platform that works anywhere, kiosk, web, or mobile, so teams can focus on campaigns instead of infrastructure.
                </p>
                <p>
                  Today, SwiftCause supports organizations across multiple countries with enterprise-grade security and real-time reporting.
                </p>
              </div>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/30 border border-white/70">
              <img src="/aboutSection.png" alt="SwiftCause platform" className="w-full h-full object-contain rounded-2xl" />
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ValueCard
              icon={<Target className="h-6 w-6" />}
              title="Mission-driven"
              description="We build for organizations focused on measurable outcomes and transparent reporting."
            />
            <ValueCard
              icon={<Shield className="h-6 w-6" />}
              title="Secure by design"
              description="Payments and data are protected with bank-grade security and compliance practices."
            />
            <ValueCard
              icon={<Users className="h-6 w-6" />}
              title="Built for teams"
              description="Role-based access, shared dashboards, and collaboration across campaigns."
            />
          </section>

          <section className="rounded-[2rem] bg-white border border-[#F3F1EA]/60 p-8 sm:p-10 shadow-xl shadow-slate-200/30">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400/70">Why SwiftCause</p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">
                  Everything you need to launch, manage, and grow campaigns.
                </h2>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <span>Unified dashboards for campaigns, kiosks, and payments.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <span>Real-time analytics with exportable reports.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <span>Flexible donation flows for events, kiosks, and online.</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-6 text-emerald-900">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-emerald-700" />
                  <span className="text-sm font-semibold uppercase tracking-[0.25em]">Global reach</span>
                </div>
                <p className="mt-3 text-sm text-emerald-800">
                  Scale your impact with tools built for multi-location fundraising and international donors.
                </p>
                <div className="mt-6 flex items-center gap-3 text-sm text-emerald-700">
                  <Award className="h-5 w-5" />
                  Trusted by growing nonprofit teams.
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-gradient-to-r from-[#064e3b] to-[#0f5132] text-white p-10 text-center shadow-2xl shadow-emerald-900/20">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs tracking-[0.3em] uppercase">
              <Heart className="h-4 w-4" />
              Join the platform
            </div>
            <h2 className="mt-6 text-3xl sm:text-4xl font-semibold">
              Ready to build your next campaign?
            </h2>
            <p className="mt-3 text-sm text-emerald-50/90">
              We will help you launch faster, raise more, and deliver transparent impact.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => onNavigate && onNavigate('signup')}
                className="h-12 px-6 bg-white text-[#064e3b] hover:bg-[#F3F1EA] rounded-2xl font-semibold"
              >
                Start Your Free Trial
              </Button>
              <Button
                onClick={() => onNavigate && onNavigate('contact')}
                variant="outline"
                className="h-12 px-6 rounded-2xl border-white text-white bg-white/10 hover:bg-white/20 hover:border-white/80"
              >
                Contact Us
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
