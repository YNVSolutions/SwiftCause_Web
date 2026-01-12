import React, { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { Progress } from '../../shared/ui/progress';
import { DemoModal } from '../../widgets/payment-flow/DemoModal';
import { EnterprisePlatformShowcase } from '../../widgets/payment-flow/EnterprisePlatformShowcase';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../shared/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { 
  Heart,
  Shield,
  Globe,
  TrendingUp,
  Award,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  Settings,
  Star,
  MapPin,
  Smartphone,
  CreditCard,
  BarChart3,
  QrCode,
  Zap,
  Target,
  UserCog,
  PlayCircle,
  Quote,
  ArrowDown,
  ChevronRight,
  Monitor,
  Database,
  Clock,
  Calendar,
  Layers,
  Handshake,
  Wifi,
  Lock,
  Cloud,
  Building,
  CheckSquare,
  Tablet,
  Activity,
  PieChart,
  Download,
  Upload,
  Eye,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';

import { ImageWithFallback } from '../../shared/ui/figma/ImageWithFallback';
import { Footer } from '../../shared/ui/Footer';
import swiftCauseLogo from '../../shared/assets/logo.png';

interface HomePageProps {
  onLogin: () => void;
  onSignup: () => void;
  onNavigate?: (screen: any) => void;
}

export function HomePage({ onLogin, onSignup, onNavigate }: HomePageProps) {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeFlowStep, setActiveFlowStep] = useState(0);
  
  // Mock live statistics for demonstration
  const [stats, setStats] = useState({
    totalRaised: 15847320,
    totalDonors: 47823,
    activeCampaigns: 156,
    activeKiosks: 89,
    organizationsServed: 234,
    countriesReached: 45
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalRaised: prev.totalRaised + Math.floor(Math.random() * 500),
        totalDonors: prev.totalDonors + Math.floor(Math.random() * 3)
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Donation flow steps for carousel
  const donationFlowSteps = [
    {
      title: 'Browse Campaigns',
      description: 'Discover causes that matter to you',
      step: 1,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-lg">Active Campaigns</h3>
            <Badge className="bg-green-100 text-green-700 border-green-300">
              <Activity className="w-3 h-3 mr-1" />
              {stats.activeCampaigns} Live
            </Badge>
          </div>
          <div className="space-y-3">
            {['Medical Research Fund', 'Education for All', 'Community Support'].map((campaign, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-400 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{campaign}</p>
                      <p className="text-xs text-gray-600">£{(8000 + idx * 1000).toLocaleString()} raised</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Choose Amount',
      description: 'Select or enter your donation amount',
      step: 2,
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Medical Research Fund</h3>
              <p className="text-xs text-gray-500">Choose your contribution</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[10, 25, 50].map((amount, idx) => (
              <button
                key={amount}
                className={`py-4 px-3 rounded-xl font-semibold transition-all duration-200 ${
                  idx === 1 
                    ? 'bg-green-600 text-white shadow-lg scale-105' 
                    : 'bg-green-50 text-green-700 border-2 border-green-200 hover:border-green-400'
                }`}
              >
                £{amount}
              </button>
            ))}
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <input 
              type="text" 
              placeholder="Custom amount" 
              className="w-full bg-transparent text-center font-semibold text-gray-700 outline-none"
              defaultValue=""
            />
          </div>
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input type="checkbox" className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700">Make this a monthly donation</span>
          </div>
        </div>
      )
    },
    {
      title: 'Gift Aid',
      description: 'Boost your donation by 25% at no cost',
      step: 3,
      content: (
        <div className="space-y-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="inline-flex p-3 bg-green-600 rounded-full mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Add Gift Aid?</h3>
            <p className="text-sm text-gray-600 mb-3">Your £25 donation becomes £31.25</p>
            <div className="flex items-center justify-center space-x-2 text-green-700 font-semibold">
              <span className="text-2xl">£25</span>
              <ArrowRight className="w-5 h-5" />
              <span className="text-3xl">£31.25</span>
            </div>
          </div>
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="First Name" 
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
            <input 
              type="text" 
              placeholder="Last Name" 
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
            <input 
              type="text" 
              placeholder="Postcode" 
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
              Yes, Add Gift Aid
            </button>
            <button className="px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              Skip
            </button>
          </div>
        </div>
      )
    },
    {
      title: 'Secure Payment',
      description: 'Complete your donation securely',
      step: 4,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Payment Details</h3>
            <div className="flex items-center space-x-1">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Secure</span>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Amount</span>
              <span className="text-2xl font-bold text-green-700">£31.25</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Includes £6.25 Gift Aid</p>
          </div>
          <div className="space-y-3">
            <div className="p-4 border-2 border-gray-300 rounded-lg bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Card Number</span>
                <div className="flex space-x-1">
                  <div className="w-8 h-5 bg-blue-600 rounded"></div>
                  <div className="w-8 h-5 bg-red-600 rounded"></div>
                </div>
              </div>
              <p className="text-gray-400 mt-2">•••• •••• •••• ••••</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 border-2 border-gray-300 rounded-lg bg-white">
                <span className="text-sm text-gray-600">Expiry</span>
                <p className="text-gray-400 mt-2">MM / YY</p>
              </div>
              <div className="p-4 border-2 border-gray-300 rounded-lg bg-white">
                <span className="text-sm text-gray-600">CVV</span>
                <p className="text-gray-400 mt-2">•••</p>
              </div>
            </div>
          </div>
          <button className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
            Complete Donation
          </button>
        </div>
      )
    },
    {
      title: 'Thank You!',
      description: 'Your donation makes a difference',
      step: 5,
      content: (
        <div className="space-y-4 text-center">
          <div className="inline-flex p-4 bg-green-100 rounded-full mb-2 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-xl">Donation Successful!</h3>
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <p className="text-sm text-gray-600 mb-2">You donated</p>
            <p className="text-4xl font-bold text-green-700 mb-1">£31.25</p>
            <p className="text-xs text-gray-500">to Medical Research Fund</p>
          </div>
          <div className="space-y-2 text-left bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-gray-900">TXN-2024-001</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date</span>
              <span className="text-gray-900">Jan 13, 2026</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Receipt</span>
              <span className="text-green-600 font-medium cursor-pointer hover:underline">Download</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 px-4">
            Thank you for your generosity. Your contribution will help make a real impact.
          </p>
        </div>
      )
    }
  ];

  const nextStep = () => {
    setActiveFlowStep((prev) => (prev + 1) % donationFlowSteps.length);
  };

  const prevStep = () => {
    setActiveFlowStep((prev) => (prev - 1 + donationFlowSteps.length) % donationFlowSteps.length);
  };

  const goToStep = (index: number) => {
    setActiveFlowStep(index);
  };

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextStep();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeFlowStep]);

  const useCases = [
    {
      title: 'Non-Profit Organizations',
      description: 'Streamline donation collection with branded kiosks in multiple locations',
      icon: <Heart className="w-6 h-6 text-green-600" />,
      benefits: ['Increase donation volume', 'Reduce operational costs', 'Track impact metrics']
    },
    {
      title: 'Healthcare Institutions',
      description: 'Enable easy donations for medical research and patient care programs',
      icon: <Shield className="w-6 h-6 text-green-600" />,
      benefits: ['Secure patient data', 'Compliant processing', 'Research funding']
    },
    {
      title: 'Educational Institutions',
      description: 'Facilitate alumni donations and scholarship fund contributions',
      icon: <Award className="w-6 h-6 text-green-600" />,
      benefits: ['Alumni engagement', 'Scholarship programs', 'Campus improvements']
    },
    {
      title: 'Religious Organizations',
      description: 'Modern tithing and offering collection with transparent tracking',
      icon: <Globe className="w-6 h-6 text-green-600" />,
      benefits: ['Community engagement', 'Transparent giving', 'Multiple campaigns']
    }
  ];

  const howItWorks = [
    {
      title: 'Set Up',
      description: 'Customize your campaigns with branding, goals, and pricing through our intuitive dashboard.',
      icon: <Settings className="w-8 h-8 text-green-600" />
    },
    {
      title: 'Deploy',
      description: 'Place touch-friendly kiosks in key locations or share QR codes for easy, contactless access.',
      icon: <MapPin className="w-8 h-8 text-green-600" />
    },
    {
      title: 'Engage',
      description: 'Donors contribute seamlessly with a few taps on a kiosk or a quick scan from their smartphone.',
      icon: <CreditCard className="w-8 h-8 text-green-600" />
    },
    {
      title: 'Track',
      description: 'Monitor donations in real-time and analyze campaign performance directly from your dashboard.',
      icon: <BarChart3 className="w-8 h-8 text-green-600" />
    },
  ];

  const faqs = [
    {
      question: 'What is Swift Cause?',
      answer: 'Swift Cause is an intelligent donation platform that empowers organizations with touch-friendly kiosks, real-time analytics, and comprehensive campaign management to make giving easy, secure, and impactful.'
    },
    {
      question: 'How does Swift Cause ensure my donations are secure?',
      answer: 'Swift Cause secures donations through a 3-tier architecture. Stripe tokenizes payments, while Firebase Functions and webhooks ensure all sensitive data is processed and protected in a safe backend.'
    },
    {
      question: 'Is Swift Cause suitable for small organizations?',
      answer: 'Yes, Swift Cause is designed to be flexible for organizations of all sizes. The platform is scalable and with features like instant QR code access and easy deployment, you can quickly set up a kiosk for a single event and manage it efficiently.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10">
                <img 
                  src={swiftCauseLogo.src} 
                  alt="Swift Cause Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Swift Cause</h1>
                <p className="text-xs text-gray-600">Donation Platform</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#solutions" className="text-gray-600 hover:text-gray-900 transition-colors">Solutions</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
            </nav>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onLogin} className="text-gray-600 hover:text-gray-900">
                Login
              </Button>
              <Button onClick={onSignup} className="bg-green-600 hover:bg-green-700 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>


      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trusted by organizations worldwide
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Transform Your
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"> Fundraising</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Empower your organization with intelligent donation kiosks, 
                  comprehensive campaign management, and real-time analytics. 
                  Make giving easy, secure, and impactful.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={onSignup}
                  size="lg" 
                  className="h-14 px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => setShowDemoModal(true)}
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>


              <div className="flex items-center space-x-6 pt-8 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRaised)}</div>
                  <div className="text-sm text-gray-600">Total Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalDonors)}</div>
                  <div className="text-sm text-gray-600">Happy Donors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.organizationsServed}</div>
                  <div className="text-sm text-gray-600">Organizations</div>
                </div>
              </div>
            </div>

            <div className="relative h-[600px] flex items-center justify-center">
              {/* Interactive Donation Flow Carousel */}
              <div className="relative w-full max-w-md">
                
                {/* Main Card Display */}
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 border-2 border-green-100 min-h-[480px]">
                  
                  {/* Step Indicator */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {donationFlowSteps[activeFlowStep].step}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {donationFlowSteps[activeFlowStep].title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {donationFlowSteps[activeFlowStep].description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content with Transition */}
                  <div className="transition-all duration-500 ease-in-out">
                    {donationFlowSteps[activeFlowStep].content}
                  </div>

                  {/* Navigation Arrows */}
                  <div className="absolute top-1/2 -left-4 -translate-y-1/2">
                    <button
                      onClick={prevStep}
                      className="w-10 h-10 bg-white rounded-full shadow-lg border-2 border-green-200 flex items-center justify-center hover:bg-green-50 hover:border-green-400 transition-all group"
                      aria-label="Previous step"
                    >
                      <ChevronRight className="w-5 h-5 text-green-600 rotate-180 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <div className="absolute top-1/2 -right-4 -translate-y-1/2">
                    <button
                      onClick={nextStep}
                      className="w-10 h-10 bg-white rounded-full shadow-lg border-2 border-green-200 flex items-center justify-center hover:bg-green-50 hover:border-green-400 transition-all group"
                      aria-label="Next step"
                    >
                      <ChevronRight className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Dot Indicators */}
                <div className="flex justify-center space-x-2 mt-6">
                  {donationFlowSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === activeFlowStep
                          ? 'w-8 h-3 bg-green-600'
                          : 'w-3 h-3 bg-gray-300 hover:bg-green-400'
                      }`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-4 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${((activeFlowStep + 1) / donationFlowSteps.length) * 100}%` }}
                  />
                </div>

                {/* Floating decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-100 rounded-full opacity-40 blur-2xl animate-pulse" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-100 rounded-full opacity-30 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

  
      <section id="solutions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Built for Every Organization
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible solutions that adapt to your unique fundraising needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow group border-gray-200">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0 p-3 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors">
                      {useCase.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                      <p className="text-gray-600">{useCase.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {useCase.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      <section id="how-it-works" className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started with Swift Cause is fast, easy, and intuitive.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <Card key={index} className="text-center p-6 bg-white border-green-100">
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-full inline-block bg-green-100 text-green-600">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to the most common questions about our platform and services.
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <button
                  className="flex items-center justify-between w-full text-left focus:outline-none group"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <ChevronRight
                    className={`w-5 h-5 text-green-600 transform transition-transform duration-300 ${
                      openFaqIndex === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <p className="text-gray-600 mt-2 transition-all duration-300 ease-in-out">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Fundraising?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join hundreds of organizations already using Swift Cause to maximize their impact
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onSignup}
              size="lg" 
              className="h-14 px-8 bg-white text-green-700 hover:bg-green-50 shadow-lg font-semibold"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 px-8 border-white text-white hover:bg-white hover:text-green-700 shadow-lg"
              onClick={() => setShowDemoModal(true)}
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />

      {/* Demo Modal */}
      <DemoModal 
        open={showDemoModal} 
        onOpenChange={setShowDemoModal} 
      />
    </div>
  );
}