'use client'

import { useState, useEffect } from 'react';
import { 
  Heart, 
  Terminal, 
  Zap,
  PieChart,
  ArrowRight,
  Menu,
  X,
  PenTool,
  Tv,
  Activity,
  Layout,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Minus,
  Send,
  Github,
  Linkedin,
  MessageCircle
} from 'lucide-react';

interface HomePageProps {
  onLogin: () => void;
  onSignup: () => void;
  onNavigate: (screen: string) => void;
}

export function HomePage({ onLogin, onSignup, onNavigate }: HomePageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaign' | 'kiosk' | 'dashboard'>('campaign');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Performance', href: '#performance' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  const features = [
    {
      title: 'Campaign Management',
      description: 'Launch specific fundraisers for unique causes with stories, goals, and visual impact metrics.',
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: 'Physical Kiosks',
      description: 'Bridge the physical-digital gap with secure, easy-to-use donation terminals for events and public spaces.',
      icon: <Terminal className="w-6 h-6" />,
    },
    {
      title: 'Gift Aid Boost',
      description: 'Increase donation value by 25% automatically for UK taxpayers without additional setup hurdles.',
      icon: <Zap className="w-6 h-6" />,
    },
    {
      title: 'Real-time Analytics',
      description: 'Gain instant visibility into fundraising performance across all digital and physical channels.',
      icon: <PieChart className="w-6 h-6" />,
    },
  ];

  const faqs = [
    {
      question: "What is SwiftCause?",
      answer: "SwiftCause is a fundraising platform built for UK charities to accept donations online and in person, manage multiple campaigns, and track fundraising performance from one central dashboard."
    },
    {
      question: "Who is SwiftCause for?",
      answer: "SwiftCause is designed for UK-based charities and nonprofit organisations of all sizes — from small community groups to national charities running multiple campaigns and events."
    },
    {
      question: "Do donors need an account to donate?",
      answer: "No. Donors can make a donation without creating an account. They only provide the details required for the donation and, if applicable, Gift Aid."
    },
    {
      question: "Can multiple team members access the account?",
      answer: "Yes. You can invite team members and assign roles with different permission levels, such as admin, manager, or view-only access."
    }
  ];

  const demoContent = {
    campaign: {
      title: "Create Campaigns in Seconds",
      description: "Our intuitive builder lets you tell stories that inspire action. Customize amounts, add Gift Aid, and go live instantly.",
      image: "https://picsum.photos/1000/600?random=builder",
      icon: <PenTool className="w-5 h-5" />
    },
    kiosk: {
      title: "Powerful Kiosk Experience",
      description: "Turn any tablet into a professional donation station. Perfect for shop fronts, events, and community spaces.",
      image: "https://picsum.photos/1000/600?random=kiosk",
      icon: <Tv className="w-5 h-5" />
    },
    dashboard: {
      title: "Integrated Performance Tracking",
      description: "See your multi-channel performance at a glance. Export Gift Aid reports and analyze donor trends effortlessly.",
      image: "https://picsum.photos/1000/600?random=analytics",
      icon: <Activity className="w-5 h-5" />
    }
  };

  return (
    <div className="min-h-screen selection:bg-[#0f5132] selection:text-white">

      {/* Navbar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#F3F1EA]/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-[#064e3b] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-[#064e3b] tracking-tight">SwiftCause</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className="text-[#064e3b]/80 hover:text-[#064e3b] font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="px-5 py-2 text-[#064e3b] font-semibold hover:bg-[#064e3b]/5 rounded-lg transition-colors"
            >
              Login
            </button>
            <button 
              onClick={onSignup}
              className="px-6 py-2 bg-[#064e3b] text-white font-semibold rounded-lg shadow-md hover:bg-[#0f5132] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-[#064e3b]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#F3F1EA] border-b border-[#064e3b]/10 shadow-xl p-6 flex flex-col gap-4">
            {navItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className="text-lg font-medium text-[#064e3b]"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#064e3b]/10">
              <button 
                onClick={onLogin}
                className="w-full py-3 text-[#064e3b] font-semibold border border-[#064e3b]/20 rounded-xl"
              >
                Login
              </button>
              <button 
                onClick={onSignup}
                className="w-full py-3 bg-[#064e3b] text-white font-semibold rounded-xl shadow-lg"
              >
                Sign Up Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main>
        <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#064e3b]/10 text-[#064e3b] rounded-full text-sm font-semibold border border-[#064e3b]/20">
                <span className="flex h-2 w-2 rounded-full bg-[#064e3b] animate-pulse"></span>
                Designed for UK Nonprofits
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-[#064e3b] leading-[1.1] tracking-tight">
                Fundraising, <br />
                <span className="text-[#0f5132]">streamlined.</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                Empower your charity with modern digital tools for physical kiosks, online campaigns, and automatic Gift Aid—all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={onSignup}
                  className="px-8 py-4 bg-[#064e3b] text-white font-bold rounded-2xl shadow-xl hover:bg-[#0f5132] transition-all flex items-center justify-center gap-2 group"
                >
                  Start Raising Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#064e3b]/5 rounded-full blur-3xl"></div>
              <div className="relative glass-card border border-white p-6 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="bg-white rounded-2xl overflow-hidden shadow-inner border border-slate-100">
                  <div className="h-12 bg-slate-50 border-b flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="ml-4 h-6 w-full max-w-md bg-white rounded border border-slate-100 flex items-center px-2 text-[10px] text-slate-400 text-center justify-center">
                      app.swiftcause.org/new-campaign
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                     <div className="space-y-1">
                        <div className="h-4 w-24 bg-slate-100 rounded"></div>
                        <div className="h-10 w-full bg-[#F3F1EA] rounded-xl border border-slate-200"></div>
                     </div>
                     <div className="space-y-1">
                        <div className="h-4 w-32 bg-slate-100 rounded"></div>
                        <div className="h-24 w-full bg-[#F3F1EA] rounded-xl border border-slate-200"></div>
                     </div>
                     <div className="h-12 w-full bg-[#064e3b] rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white px-6">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-sm font-bold text-[#0f5132] uppercase tracking-[0.2em]">Our Platform</h2>
              <p className="text-4xl md:text-5xl font-bold text-[#064e3b] tracking-tight">Everything you need to grow your impact.</p>
              <p className="text-lg text-slate-600">We handle the technical complexity so you can focus on what matters: your mission.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="p-8 rounded-[2rem] bg-[#F7F6F2] border border-transparent hover:border-[#064e3b]/10 hover:shadow-xl transition-all group"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#064e3b] shadow-sm mb-6 group-hover:bg-[#064e3b] group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#064e3b] mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section id="demo" className="py-24 bg-[#F3F1EA] px-6 overflow-hidden">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/3 space-y-8">
                <h2 className="text-4xl font-bold text-[#064e3b] leading-tight">Simplified tools for complex goals.</h2>
                
                <div className="space-y-4">
                  {(Object.keys(demoContent) as Array<'campaign' | 'kiosk' | 'dashboard'>).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all border ${
                        activeTab === tab 
                          ? 'bg-white border-[#064e3b]/10 shadow-lg scale-[1.02]' 
                          : 'bg-transparent border-transparent hover:bg-white/50 text-slate-500'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${activeTab === tab ? 'bg-[#064e3b] text-white' : 'bg-slate-200'}`}>
                        {demoContent[tab].icon}
                      </div>
                      <div>
                        <h4 className={`font-bold ${activeTab === tab ? 'text-[#064e3b]' : 'text-slate-600'}`}>
                          {demoContent[tab].title.split(' ')[0]} {demoContent[tab].title.split(' ')[1]}
                        </h4>
                        <p className="text-sm opacity-80 line-clamp-1">{demoContent[tab].description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => onNavigate('docs')}
                    className="text-[#064e3b] font-bold inline-flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    Learn more about our builder <Layout className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:w-2/3 relative">
                <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden h-full">
                   <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-stretch justify-center">
                      {/* Campaign Builder Demo */}
                      {activeTab === 'campaign' && (
                        <div className="w-full h-full flex items-center justify-center animate-fade-in">
                          <div className="bg-white rounded-2xl p-8 shadow-lg w-full h-full flex flex-col justify-center max-w-2xl">
                            <div className="space-y-6">
                              <div>
                                <label className="text-base font-semibold text-slate-600 mb-3 block">Campaign Title</label>
                                <div className="h-14 bg-[#F3F1EA] rounded-xl border-2 border-[#064e3b]/20 flex items-center px-5">
                                  <span className="text-lg text-slate-700 animate-pulse">Save the Rainforest</span>
                                </div>
                              </div>
                              <div>
                                <label className="text-base font-semibold text-slate-600 mb-3 block">Fundraising Goal</label>
                                <div className="h-14 bg-[#F3F1EA] rounded-xl border-2 border-[#064e3b]/20 flex items-center px-5">
                                  <span className="text-lg text-slate-700">£50,000</span>
                                </div>
                              </div>
                              <div>
                                <label className="text-base font-semibold text-slate-600 mb-3 block">Donation Amounts</label>
                                <div className="flex gap-4">
                                  <div className="flex-1 h-16 bg-emerald-100 rounded-xl flex items-center justify-center border-2 border-emerald-500">
                                    <span className="text-2xl font-bold text-emerald-700">£25</span>
                                  </div>
                                  <div className="flex-1 h-16 bg-emerald-100 rounded-xl flex items-center justify-center border-2 border-emerald-500">
                                    <span className="text-2xl font-bold text-emerald-700">£50</span>
                                  </div>
                                  <div className="flex-1 h-16 bg-emerald-100 rounded-xl flex items-center justify-center border-2 border-emerald-500">
                                    <span className="text-2xl font-bold text-emerald-700">£100</span>
                                  </div>
                                </div>
                              </div>
                              <button className="w-full h-16 bg-[#064e3b] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-[#0f5132] transition-all">
                                Create Campaign
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Kiosk Demo */}
                      {activeTab === 'kiosk' && (
                        <div className="w-full h-full flex items-center justify-center animate-fade-in">
                          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-slate-700 w-full max-w-xl h-full flex items-center">
                            <div className="bg-white rounded-2xl p-10 space-y-8 w-full">
                              <div className="text-center">
                                <h3 className="text-3xl font-bold text-[#064e3b] mb-3">Support Our Cause</h3>
                                <p className="text-base text-slate-600">Choose your donation amount</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-5">
                                {['£10', '£25', '£50', '£100'].map((amount, i) => (
                                  <button 
                                    key={i}
                                    className="h-28 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 transition-all flex items-center justify-center group"
                                  >
                                    <span className="text-4xl font-bold text-emerald-700 group-hover:scale-110 transition-transform">{amount}</span>
                                  </button>
                                ))}
                              </div>

                              <button className="w-full h-20 bg-[#064e3b] text-white rounded-2xl font-bold text-2xl shadow-lg animate-pulse">
                                Tap to Donate
                              </button>

                              <div className="flex items-center justify-center gap-2 text-base text-slate-500">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span>Secure Payment</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dashboard Demo */}
                      {activeTab === 'dashboard' && (
                        <div className="w-full h-full flex items-center justify-center animate-fade-in">
                          <div className="bg-white rounded-2xl p-10 shadow-lg w-full h-full flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-8">
                              <div>
                                <h3 className="text-2xl font-bold text-[#064e3b]">Campaign Performance</h3>
                                <p className="text-sm text-slate-500 mt-1">Last 30 days</p>
                              </div>
                              <div className="text-right">
                                <div className="text-4xl font-bold text-[#064e3b]">£18,450</div>
                                <div className="text-base text-emerald-600 font-semibold flex items-center gap-1 justify-end mt-1">
                                  <ArrowUpRight className="w-5 h-5" />
                                  +32%
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                              <div className="bg-emerald-50 rounded-2xl p-5">
                                <div className="text-sm text-slate-600 mb-2">Online</div>
                                <div className="text-2xl font-bold text-emerald-700">£11.8k</div>
                              </div>
                              <div className="bg-blue-50 rounded-2xl p-5">
                                <div className="text-sm text-slate-600 mb-2">Kiosk</div>
                                <div className="text-2xl font-bold text-blue-700">£5.7k</div>
                              </div>
                              <div className="bg-purple-50 rounded-2xl p-5">
                                <div className="text-sm text-slate-600 mb-2">Events</div>
                                <div className="text-2xl font-bold text-purple-700">£930</div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-base">
                                <span className="text-slate-600 font-medium">Campaign Progress</span>
                                <span className="font-bold text-[#064e3b] text-lg">64%</span>
                              </div>
                              <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-pulse" style={{ width: '64%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                   </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0f5132]/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#064e3b]/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Section */}
        <section id="performance" className="py-24 bg-[#F3F1EA] px-6 overflow-hidden">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-[#064e3b] leading-tight">Integrated Performance & Real-time Insights.</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Never wonder where your fundraising stands. Our unified dashboard pulls data from physical kiosks and online campaigns to give you a 360° view of your impact.
                </p>
                <ul className="space-y-4 pt-4">
                  {[
                    { title: "Dynamic Goal Tracking", icon: <TrendingUp className="w-5 h-5" /> },
                    { title: "Automatic Gift Aid Calculation", icon: <PieChart className="w-5 h-5" /> },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[#064e3b] font-semibold">
                      <div className="w-8 h-8 rounded-full bg-[#064e3b]/10 flex items-center justify-center">
                        {item.icon}
                      </div>
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-white">
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Raised This Month</div>
                      <div className="text-3xl font-bold text-[#064e3b]">£24,590</div>
                      <div className="text-sm text-slate-500 mt-1">Goal: £30,000</div>
                    </div>
                    <div className="flex items-center gap-1 text-[#0f5132] font-bold bg-emerald-50 px-3 py-2 rounded-lg">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>+24%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                        style={{ width: '82%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>82% of monthly goal</span>
                      <span>£5,410 to go</span>
                    </div>
                  </div>

                  {/* Weekly Trend Chart */}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Weekly Donations</div>
                    <div className="flex items-end justify-between h-32 gap-2 bg-slate-50 rounded-xl p-4">
                      {[
                        { height: 45, label: 'Mon', amount: '£2.8k' },
                        { height: 70, label: 'Tue', amount: '£4.2k' },
                        { height: 55, label: 'Wed', amount: '£3.3k' },
                        { height: 85, label: 'Thu', amount: '£5.1k' },
                        { height: 65, label: 'Fri', amount: '£3.9k' },
                        { height: 90, label: 'Sat', amount: '£5.4k' },
                        { height: 75, label: 'Sun', amount: '£4.5k' }
                      ].map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <div className="relative w-full flex items-end" style={{ height: '100%' }}>
                            <div 
                              className="w-full bg-gradient-to-t from-[#064e3b] to-emerald-500 group-hover:from-emerald-600 group-hover:to-emerald-400 transition-all rounded-t-lg cursor-pointer relative" 
                              style={{ height: `${day.height}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                {day.amount}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium mt-1">{day.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Channel Breakdown */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <div className="text-[10px] font-bold text-emerald-700 uppercase">Online</div>
                      </div>
                      <div className="text-lg font-bold text-emerald-700">£15.7k</div>
                      <div className="text-xs text-emerald-600">64%</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="text-[10px] font-bold text-blue-700 uppercase">Kiosk</div>
                      </div>
                      <div className="text-lg font-bold text-blue-700">£7.6k</div>
                      <div className="text-xs text-blue-600">31%</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="text-[10px] font-bold text-purple-700 uppercase">Events</div>
                      </div>
                      <div className="text-lg font-bold text-purple-700">£1.2k</div>
                      <div className="text-xs text-purple-600">5%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-white px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#064e3b]">Common Questions</h2>
              <p className="text-slate-500 mt-4">Everything you need to know about the platform.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className={`border border-slate-100 rounded-3xl transition-all ${openFaqIndex === idx ? 'bg-[#F7F6F2] shadow-sm' : 'bg-white hover:bg-slate-50'}`}
                >
                  <button 
                    className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  >
                    <span className="text-lg font-bold text-[#064e3b] pr-8">{faq.question}</span>
                    {openFaqIndex === idx ? (
                      <Minus className="w-6 h-6 text-[#0f5132]" />
                    ) : (
                      <Plus className="w-6 h-6 text-[#064e3b]" />
                    )}
                  </button>
                  
                  <div 
                    className={`px-8 overflow-hidden transition-all duration-300 ${
                      openFaqIndex === idx ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-[#064e3b] px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl flex flex-col lg:flex-row gap-16 overflow-hidden relative">
              <div className="lg:w-1/2 space-y-8 relative z-10">
                <h2 className="text-4xl font-bold text-[#064e3b]">Let's talk about your mission.</h2>
                <p className="text-lg text-slate-600">
                  Ready to streamline your fundraising? Whether you have a question about kiosks, Gift Aid, or custom pricing, our team is here to help.
                </p>
              </div>

              <div className="lg:w-1/2 relative z-10">
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Jane Doe"
                        className="w-full px-6 py-4 bg-[#F7F6F2] border-transparent focus:border-[#064e3b]/20 focus:bg-white focus:ring-4 focus:ring-[#064e3b]/5 rounded-2xl transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="jane@charity.org"
                        className="w-full px-6 py-4 bg-[#F7F6F2] border-transparent focus:border-[#064e3b]/20 focus:bg-white focus:ring-4 focus:ring-[#064e3b]/5 rounded-2xl transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Message</label>
                    <textarea 
                      rows={4}
                      placeholder="Tell us about your organization..."
                      className="w-full px-6 py-4 bg-[#F7F6F2] border-transparent focus:border-[#064e3b]/20 focus:bg-white focus:ring-4 focus:ring-[#064e3b]/5 rounded-2xl transition-all resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-[#064e3b] text-white font-bold rounded-2xl shadow-lg hover:bg-[#0f5132] transition-all flex items-center justify-center gap-2 group"
                  >
                    Send Message
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
              
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#0f5132]/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#F3F1EA] pt-20 pb-10 px-6 border-t border-slate-200">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="space-y-6">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-[#064e3b] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-[#064e3b]">SwiftCause</span>
              </button>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Simplifying digital and physical fundraising for charities across the United Kingdom. Built for impact, designed for trust.
              </p>
            </div>

            <div className="space-y-4">
              <h5 className="font-bold text-[#064e3b] uppercase tracking-wider text-xs">Navigation</h5>
              <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-600 font-medium">
                <li>
                  <button 
                    onClick={onLogin}
                    className="hover:text-[#064e3b] transition-colors"
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onSignup}
                    className="hover:text-[#064e3b] transition-colors"
                  >
                    Sign Up
                  </button>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    className="hover:text-[#064e3b] transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('terms')}
                    className="hover:text-[#064e3b] transition-colors"
                  >
                    Terms
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('about')}
                    className="hover:text-[#064e3b] transition-colors"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate('docs')}
                    className="hover:text-[#064e3b] transition-colors"
                  >
                    Docs
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="font-bold text-[#064e3b] uppercase tracking-wider text-xs">Join Our Community</h5>
              
              <a 
                href="https://discord.gg/3EG7Y5Q9nV"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-[#064e3b] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold">Join Discord</div>
                    <div className="text-[10px] text-white/70">Connect with other UK charities</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <div className="flex gap-4 items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Follow us</span>
                <div className="flex gap-2">
                  <a href="#" className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-all shadow-sm">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-all shadow-sm">
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> in the UK
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
