import { useState } from 'react';
import { Button } from '../../shared/ui/button';

interface HomePageProps {
  onLogin: () => void;
  onSignup: () => void;
  onNavigate: (screen: string) => void;
}

export function HomePage({ onLogin, onSignup, onNavigate }: HomePageProps) {
  const [showDemoModal, setShowDemoModal] = useState(false);

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
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 px-4 py-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-10 py-5 glass-card rounded-3xl">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SwiftCause" className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-[#064e3b]">SwiftCause</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onSignup}
              className="px-10 py-4 bg-[#064e3b] text-stone-50 text-sm font-semibold rounded-2xl hover:bg-[#0f5132] transition-all duration-300 shadow-lg shadow-[#064e3b]/20 hover:shadow-xl hover:shadow-[#064e3b]/25"
            >
              Sign Up
            </button>
            <button 
              onClick={() => onNavigate('docs')}
              className="px-8 py-3 bg-transparent text-[#064e3b] text-sm font-semibold rounded-2xl border-2 border-[#064e3b] hover:bg-[#064e3b] hover:text-stone-50 transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <header className="pt-32 pb-16 px-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="hero-gradient rounded-[3rem] overflow-hidden relative shadow-2xl shadow-green-900/6">
            {/* Background blur effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/6 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-300/4 rounded-full blur-3xl -ml-10 -mb-10"></div>
            
            {/* Hero Content */}
            <div className="relative px-8 md:px-16 py-16 text-center max-w-5xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-medium text-emerald-100/80 leading-relaxed mb-2">
                SwiftCause
              </h1>
              <h2 className="text-4xl md:text-6xl font-semibold text-white italic leading-tight mb-10">
                Giving, streamlined
              </h2>
              <p className="text-emerald-50/85 text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                Modern infrastructure for global philanthropy. Manage nationwide kiosks and digital campaigns from one command center.
              </p>
              <div className="flex justify-center">
                <Button 
                  onClick={onLogin}
                  className="px-24 py-8 text-xl bg-[#F7F6F2] text-[#064e3b] font-semibold rounded-full hover:bg-[#F3F1EA] transition-all duration-300 shadow-2xl shadow-slate-900/8 hover:shadow-2xl hover:shadow-slate-900/12 hover:scale-105"
                >
                  Sign In
                </Button>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative px-6 md:px-12 pb-16">
              <div className="bg-[#F7F6F2]/98 backdrop-blur-sm rounded-[3rem] shadow-2xl shadow-green-900/3 border border-[#F3F1EA]/50 p-8 md:p-12">
                <div className="text-center mb-12">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Fundraising Operations Overview</h3>
                  <p className="text-base text-slate-500 leading-relaxed font-light max-w-4xl mx-auto">Real-time visibility and operational control across campaign execution and platform infrastructure</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-[1200px] mx-auto">
                  
                  {/* Payment Processing Status Tile */}
                  <div className="stat-card bg-[#F7F6F2] p-6 rounded-[2rem] flex flex-col items-start text-left shadow-lg shadow-emerald-900/4 border border-[#F3F1EA]/60 min-h-[160px] hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/6 transition-all duration-300">
                    <div className="flex justify-between w-full items-start mb-5">
                      <div>
                        <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400/60">Payment Processing</span>
                        <h3 className="text-xl font-bold text-slate-800 mt-3 leading-tight">Secure & Active</h3>
                      </div>
                      <div className="bg-emerald-400/10 p-3 rounded-2xl">
                        <svg className="w-4 h-4 text-emerald-600/80" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-emerald-50/70 px-4 py-2.5 rounded-2xl mb-6">
                      <span className="text-[9px] font-medium text-emerald-700/80">Stripe-powered donation processing</span>
                    </div>
                    
                    {/* Secure Donation Flow Visual */}
                    <div className="mt-auto w-full flex justify-center items-center pb-2">
                      <div className="w-full max-w-[90px] h-16 relative">
                        {/* Donor → Secure Processing → Confirmation flow */}
                        <div className="flex items-center justify-between h-full px-1">
                          {/* Donor/Campaign selection */}
                          <div className="w-5 h-7 bg-emerald-100/80 rounded-xl border border-emerald-200/60 flex flex-col items-center justify-center shadow-sm">
                            <div className="w-2.5 h-1 bg-emerald-500/70 rounded-full mb-0.5"></div>
                            <div className="w-2 h-0.5 bg-emerald-400/60 rounded-full"></div>
                          </div>
                          
                          {/* Secure flow arrow */}
                          <svg className="w-3.5 h-3.5 text-emerald-500/70" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          
                          {/* Secure processing */}
                          <div className="w-5 h-7 bg-emerald-50/90 rounded-xl border border-emerald-200/60 flex items-center justify-center shadow-sm relative">
                            <svg className="w-2.5 h-2.5 text-emerald-600/80" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          
                          {/* Confirmation arrow */}
                          <svg className="w-3.5 h-3.5 text-emerald-500/70" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          
                          {/* Secure confirmation */}
                          <div className="w-5 h-7 bg-emerald-600/90 rounded-xl flex items-center justify-center shadow-sm">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kiosk Management Tile */}
                  <div className="stat-card bg-[#F7F6F2] p-6 rounded-[2rem] flex flex-col items-start text-left shadow-lg shadow-emerald-900/4 border border-[#F3F1EA]/60 min-h-[160px] relative overflow-hidden group hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/6 transition-all duration-300">
                    <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400/80 mb-3">Kiosk Management</span>
                    <div className="mt-1 flex flex-col h-full w-full">
                      <div className="flex items-center mb-5">
                        <h3 className="text-lg font-bold text-slate-800 mr-3">Connected</h3>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                          <span className="text-[10px] font-medium text-emerald-600/80 uppercase tracking-wide">Online</span>
                        </div>
                      </div>
                      
                      {/* Large Kiosk Image */}
                      <div className="flex justify-center mb-5 flex-1">
                        <svg className="w-20 h-20 text-slate-400/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 100">
                          {/* Main Kiosk Body - Outer frame */}
                          <rect x="30" y="15" width="40" height="65" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.6"/>
                          
                          {/* Inner screen frame */}
                          <rect x="33" y="18" width="34" height="55" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                          
                          {/* Screen area */}
                          <rect x="35" y="20" width="30" height="51" rx="2" fill="#F3F1EA" opacity="0.8"/>
                          
                          {/* Kiosk Base/Stand */}
                          <rect x="35" y="82" width="30" height="6" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
                        </svg>
                      </div>
                      
                      <p className="text-[9px] text-slate-400/70 text-center leading-relaxed font-light">Infrastructure connectivity maintained</p>
                    </div>
                  </div>

                  {/* Campaign Management Tile */}
                  <div className="stat-card bg-[#F7F6F2] p-6 rounded-[2rem] flex flex-col items-center text-center shadow-lg shadow-emerald-900/4 border border-[#F3F1EA]/60 min-h-[160px] hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/6 transition-all duration-300 relative">
                    <div className="flex justify-between w-full items-start mb-5">
                      <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400/80">Campaign Management</span>
                      <div className="bg-emerald-100/80 text-emerald-700 text-[8px] font-semibold px-3 py-1.5 rounded-2xl">
                        ACTIVE
                      </div>
                    </div>
                    
                    {/* Mini Campaign Card */}
                    <div className="w-full flex-1 flex flex-col items-center">
                      {/* Campaign Card Preview */}
                      <div className="w-20 h-12 bg-gradient-to-b from-emerald-200 to-emerald-400 rounded-2xl mb-4 relative overflow-hidden">
                        {/* Forest silhouette */}
                        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 80 48" fill="none">
                          {/* Back trees */}
                          <polygon points="8,40 14,20 20,40" fill="#4FA16B" opacity="0.6"/>
                          <polygon points="24,40 30,22 36,40" fill="#4FA16B" opacity="0.6"/>
                          <polygon points="44,40 50,21 56,40" fill="#4FA16B" opacity="0.6"/>
                          <polygon points="60,40 66,23 72,40" fill="#4FA16B" opacity="0.6"/>
                          {/* Front trees */}
                          <polygon points="12,48 18,28 24,48" fill="#2F855A"/>
                          <polygon points="30,48 36,26 42,48" fill="#2F855A"/>
                          <polygon points="48,48 54,27 60,48" fill="#2F855A"/>
                        </svg>
                      </div>
                      
                      {/* Campaign Info */}
                      <div className="mb-2 w-full">
                        <h4 className="text-xs font-bold text-slate-800 mb-2">Forest Restoration</h4>
                        <div className="w-full bg-emerald-100 rounded-full h-1.5 mb-3">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        
                        {/* Donation Amount Buttons */}
                        <div className="flex gap-1.5 mb-3">
                          <div className="flex-1 bg-emerald-50 rounded-xl px-1 py-1.5 text-center">
                            <span className="text-[8px] font-medium text-emerald-600">£25</span>
                          </div>
                          <div className="flex-1 bg-emerald-50 rounded-xl px-1 py-1.5 text-center">
                            <span className="text-[8px] font-medium text-emerald-600">£50</span>
                          </div>
                          <div className="flex-1 bg-emerald-50 rounded-xl px-1 py-1.5 text-center">
                            <span className="text-[8px] font-medium text-emerald-600">£100</span>
                          </div>
                        </div>
                        
                        {/* Mini Donate Button */}
                        <div className="w-full bg-emerald-500 rounded-xl py-1.5">
                          <span className="text-[8px] font-semibold text-white block text-center">Donate</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Analytics Tile - Visual Hero */}
                  <div className="stat-card bg-[#F7F6F2] p-5 rounded-[2rem] flex flex-col text-left shadow-xl shadow-emerald-900/6 border border-[#F3F1EA]/60 min-h-[160px] hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/8 transition-all duration-300 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-3 relative z-10">
                      <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400/80">System Analytics</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-1"></div>
                        <span className="text-[10px] text-slate-400/70 font-light">Live</span>
                      </div>
                    </div>
                    
                    {/* Large Analytics Chart - Hero Visual */}
                    <div className="flex-1 w-full relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#F3F1EA] to-[#F7F6F2] rounded-2xl overflow-hidden">
                        {/* Minimal sidebar indicator */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#064e3b] opacity-20 rounded-l-2xl"></div>
                        
                        {/* Main chart area - Focus on trends */}
                        <div className="ml-8 h-full bg-white/60 backdrop-blur-sm relative rounded-r-2xl">
                          {/* Minimal top indicator */}
                          <div className="h-2 bg-white/40 border-b border-slate-100/50 rounded-tr-2xl"></div>
                          
                          {/* Hero Chart */}
                          <div className="p-3 h-full">
                            <div className="h-full relative">
                              {/* Minimal legend */}
                              <div className="absolute top-1 left-2 flex gap-3 z-10">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                  <span className="text-[6px] text-slate-600 font-medium">Revenue</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-[#064e3b] rounded-full"></div>
                                  <span className="text-[6px] text-slate-600 font-medium">Growth</span>
                                </div>
                              </div>
                              
                              {/* Large Chart Area - Performance Signals */}
                              <div className="absolute inset-3 top-7">
                                <svg className="w-full h-full" viewBox="0 0 140 50" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id="heroAreaFill" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                                      <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                                    </linearGradient>
                                    <linearGradient id="heroAreaFill2" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#064e3b" stopOpacity="0.2"/>
                                      <stop offset="100%" stopColor="#064e3b" stopOpacity="0"/>
                                    </linearGradient>
                                  </defs>
                                  
                                  {/* Subtle grid */}
                                  <line x1="0" y1="12" x2="140" y2="12" stroke="#E5E7EB" strokeWidth="0.3" opacity="0.5"/>
                                  <line x1="0" y1="25" x2="140" y2="25" stroke="#E5E7EB" strokeWidth="0.3" opacity="0.5"/>
                                  <line x1="0" y1="38" x2="140" y2="38" stroke="#E5E7EB" strokeWidth="0.3" opacity="0.5"/>
                                  
                                  {/* Primary trend area - Revenue momentum */}
                                  <path d="M0 40 C25 28, 45 32, 70 22 C95 12, 115 16, 140 8 L140 50 L0 50 Z" 
                                        fill="url(#heroAreaFill)"/>
                                  
                                  {/* Secondary trend area - Growth signals */}
                                  <path d="M0 45 C25 35, 45 38, 70 30 C95 22, 115 25, 140 18 L140 50 L0 50 Z" 
                                        fill="url(#heroAreaFill2)"/>
                                  
                                  {/* Primary trend line - Strong performance signal */}
                                  <path d="M0 40 C25 28, 45 32, 70 22 C95 12, 115 16, 140 8" 
                                        fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
                                  
                                  {/* Secondary trend line - Growth momentum */}
                                  <path d="M0 45 C25 35, 45 38, 70 30 C95 22, 115 25, 140 18" 
                                        fill="none" stroke="#064e3b" strokeWidth="2" strokeLinecap="round"/>
                                  
                                  {/* Performance indicators */}
                                  <circle cx="140" cy="8" fill="#10b981" r="2">
                                    <animate attributeName="r" values="2;3.5;2" dur="2s" repeatCount="indefinite"/>
                                  </circle>
                                  <circle cx="140" cy="18" fill="#064e3b" r="1.5">
                                    <animate attributeName="r" values="1.5;2.5;1.5" dur="2.5s" repeatCount="indefinite"/>
                                  </circle>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Donation Flow Section */}
      <section className="py-24 px-4 bg-[#F3F1EA]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 leading-tight mb-6">
              How Donations Flow Through SwiftCause
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed font-light max-w-3xl mx-auto">
              From physical kiosks to secure payments and real-time insights — all managed from one platform.
            </p>
          </div>

          {/* Flow Chart */}
          <div className="relative">
            {/* Desktop Flow - Horizontal */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between relative">
                
                {/* Step 1: Donation Kiosks */}
                <div className="flex-1 max-w-[220px]">
                  <div className="bg-[#F7F6F2] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-white/60 text-center">
                    <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="M6 8h.01M10 8h.01M14 8h.01"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">Donation Kiosks & Digital Touchpoints</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">In-person and digital donation entry points</p>
                  </div>
                </div>

                {/* Arrow 1 */}
                <div className="flex-shrink-0 px-4">
                  <svg className="w-8 h-6 text-emerald-500/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>

                {/* Step 2: Campaign Engine */}
                <div className="flex-1 max-w-[220px]">
                  <div className="bg-[#F7F6F2] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-white/60 text-center">
                    <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">Campaign Orchestration Engine</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Routes donations based on active campaigns and rules</p>
                  </div>
                </div>

                {/* Arrow 2 */}
                <div className="flex-shrink-0 px-4">
                  <svg className="w-8 h-6 text-emerald-500/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>

                {/* Step 3: Stripe Processing */}
                <div className="flex-1 max-w-[220px]">
                  <div className="bg-[#F7F6F2] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-white/60 text-center">
                    <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">Stripe-Powered Payment Processing</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">PCI-compliant, no card data stored on SwiftCause</p>
                  </div>
                </div>

                {/* Arrow 3 */}
                <div className="flex-shrink-0 px-4">
                  <svg className="w-8 h-6 text-emerald-500/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>

                {/* Step 4: Transaction Logging */}
                <div className="flex-1 max-w-[220px]">
                  <div className="bg-[#F7F6F2] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-white/60 text-center">
                    <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">Transaction Logging & Allocation</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Audit trails, reconciliation, Gift Aid support</p>
                  </div>
                </div>

                {/* Arrow 4 */}
                <div className="flex-shrink-0 px-4">
                  <svg className="w-8 h-6 text-emerald-500/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>

                {/* Step 5: Analytics */}
                <div className="flex-1 max-w-[220px]">
                  <div className="bg-[#F7F6F2] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-white/60 text-center">
                    <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 3v18h18"/>
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">Live Fundraising Analytics</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Monitor performance across kiosks and campaigns</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Mobile Flow - Vertical */}
            <div className="lg:hidden space-y-6">
              
              {/* Step 1: Donation Kiosks */}
              <div className="bg-[#F7F6F2] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-white/60 text-center">
                <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M6 8h.01M10 8h.01M14 8h.01"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Donation Kiosks & Digital Touchpoints</h3>
                <p className="text-xs text-slate-600 leading-relaxed">In-person and digital donation entry points</p>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center">
                <svg className="w-6 h-8 text-emerald-500/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
                </svg>
              </div>

              {/* Step 2: Campaign Engine */}
              <div className="bg-[#F7F6F2] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-white/60 text-center">
                <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Campaign Orchestration Engine</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Routes donations based on active campaigns and rules</p>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center">
                <svg className="w-6 h-8 text-emerald-500/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
                </svg>
              </div>

              {/* Step 3: Stripe Processing */}
              <div className="bg-[#F7F6F2] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-white/60 text-center">
                <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Stripe-Powered Payment Processing</h3>
                <p className="text-xs text-slate-600 leading-relaxed">PCI-compliant, no card data stored on SwiftCause</p>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center">
                <svg className="w-6 h-8 text-emerald-500/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
                </svg>
              </div>

              {/* Step 4: Transaction Logging */}
              <div className="bg-[#F7F6F2] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-white/60 text-center">
                <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Transaction Logging & Allocation</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Audit trails, reconciliation, Gift Aid support</p>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center">
                <svg className="w-6 h-8 text-emerald-500/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
                </svg>
              </div>

              {/* Step 5: Analytics */}
              <div className="bg-[#F7F6F2] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-white/60 text-center">
                <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Live Fundraising Analytics</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Monitor performance across kiosks and campaigns</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* About/Infrastructure Section */}
      <section className="py-32 px-4 bg-[#F7F6F2]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Left Column - Narrative */}
            <div className="space-y-6 lg:py-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-100/60 text-emerald-700 text-xs font-semibold px-4 py-2 rounded-2xl mb-6">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  INFRASTRUCTURE
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 leading-tight mb-6">
                  The Core of Fundraising Operations
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed font-light mb-6">
                  SwiftCause serves as the robust mediation layer between high-traffic physical touchpoints and enterprise-grade financial systems.
                </p>
                <p className="text-slate-600 text-lg leading-relaxed font-light mb-8">
                  We handle the technical heavy lifting, allowing you to focus on system scale.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-700 font-medium">Bridges physical and digital touchpoints</span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-700 font-medium">Enterprise-grade financial security</span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-700 font-medium">Unified API for system-wide control</span>
                </div>
              </div>

            </div>

            {/* Right Column - Platform Layers */}
            <div className="space-y-4">
              
              {/* Physical Kiosk Fleet */}
              <div className="bg-[#F3F1EA] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-[#F7F6F2]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-emerald-100/80 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M6 8h.01M10 8h.01M14 8h.01"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Edge Layer</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Physical Kiosk Fleet</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-light">
                  Centralized management of distributed hardware networks and edge devices. Monitor health, deploy updates, and manage peripheral connectivity.
                </p>
              </div>

              {/* Dynamic Campaign Engine */}
              <div className="bg-[#F3F1EA] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-[#F7F6F2]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-emerald-100/80 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Logic Layer</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Dynamic Campaign Engine</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-light">
                  Rules-based logic for donation routing and intelligent campaign distribution. Configure complex orchestration flows through a unified control plane.
                </p>
              </div>

              {/* Stripe-Integrated Processing */}
              <div className="bg-[#F3F1EA] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-[#F7F6F2]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-emerald-100/80 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Finance Layer</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Stripe-Integrated Processing</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-light">
                  Secure, enterprise-grade financial settlement and reconciliation. Deep integration with global payment rails ensures high-throughput stability.
                </p>
              </div>

              {/* Real-time System Analytics */}
              <div className="bg-[#F3F1EA] p-6 rounded-[2rem] shadow-lg shadow-slate-200/20 border border-[#F7F6F2]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-emerald-100/80 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 3v18h18"/>
                      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Data Layer</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Real-time System Analytics</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-light">
                  Comprehensive dashboards and performance monitoring. Gain operational visibility and decision intelligence across all platform infrastructure.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 px-4 bg-[#F3F1EA]/40">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-slate-800 leading-tight">Why Choose SwiftCause?</h2>
            <p className="text-slate-500 max-w-3xl mx-auto leading-relaxed text-lg font-light">Centralized control and operational visibility for organizations managing multi-location fundraising operations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-[1200px] mx-auto">
            <div className="group p-16 bg-[#F7F6F2] rounded-[3rem] shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-200/30 transition-all duration-500 hover:transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-[#F3F1EA]/80 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-emerald-600/80" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-6 text-slate-800 leading-tight">Kiosk & Campaign Monitoring</h3>
              <p className="text-slate-500/90 leading-relaxed font-light text-lg">Provides centralized oversight of kiosk networks and campaign performance. Real-time operational visibility enables administrators to monitor device status, transaction volumes, and campaign metrics across multiple locations.</p>
            </div>
            <div className="group p-16 bg-[#F7F6F2] rounded-[3rem] shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-200/30 transition-all duration-500 hover:transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-[#F3F1EA]/80 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-emerald-600/80" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-6 text-slate-800 leading-tight">Stripe-Powered Payment Infrastructure</h3>
              <p className="text-slate-500/90 leading-relaxed font-light text-lg">Supports secure, PCI-compliant payment processing through Stripe's infrastructure. Card data is never stored on SwiftCause servers, and all transactions maintain full audit trails with encrypted logging for organizational compliance requirements.</p>
            </div>
            <div className="group p-16 bg-[#F7F6F2] rounded-[3rem] shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-200/30 transition-all duration-500 hover:transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-[#F3F1EA]/80 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-emerald-600/80" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-6 text-slate-800 leading-tight">Performance & Revenue Analytics</h3>
              <p className="text-slate-500/90 leading-relaxed font-light text-lg">Enables data-driven decision making through comprehensive revenue tracking and performance analytics. Campaign-level insights, trend analysis, and operational metrics provide administrators with actionable intelligence for optimization and reporting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal Placeholder */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#F7F6F2] rounded-[3rem] p-16 max-w-lg w-full mx-6 shadow-2xl shadow-slate-900/20">
            <h3 className="text-2xl font-semibold mb-8 text-slate-800 leading-tight">Book a Demo</h3>
            <p className="text-slate-600 mb-12 leading-relaxed text-lg font-light">
              Schedule a personalized demo to see how SwiftCause can transform your fundraising.
            </p>
            <div className="flex space-x-6">
              <Button 
                onClick={() => setShowDemoModal(false)}
                variant="outline"
                className="flex-1 border-slate-200 text-slate-600 hover:bg-[#F3F1EA] rounded-2xl py-4 text-lg font-medium"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => setShowDemoModal(false)}
                className="flex-1 bg-[#064e3b] hover:bg-[#0f5132] text-stone-50 rounded-2xl py-4 text-lg font-medium shadow-lg shadow-[#064e3b]/20"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}