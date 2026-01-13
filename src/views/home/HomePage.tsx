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

interface HomePageProps {
  onLogin: () => void;
  onSignup: () => void;
  onNavigate?: (screen: any) => void;
}

export function HomePage({ onLogin, onSignup, onNavigate }: HomePageProps) {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeFlowStep, setActiveFlowStep] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [globalDonations, setGlobalDonations] = useState<Array<{
    id: number;
    lat: number;
    lng: number;
    amount: number;
  }>>([]);
  const [floatingParticles, setFloatingParticles] = useState<Array<{
    id: number;
    left: number;
    size: number;
    duration: number;
    delay: number;
  }>>([]);
  const [mapDonations, setMapDonations] = useState<Array<{
    id: number;
    x: number;
    y: number;
    amount: number;
    country: string;
  }>>([]);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [navHoverEffect, setNavHoverEffect] = useState<string | null>(null);
  
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

  // Easter egg: Logo click counter
  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    
    if (newCount === 5) {
      setShowEasterEgg(true);
      setTimeout(() => {
        setShowEasterEgg(false);
        setLogoClicks(0);
      }, 3000);
    }
  };

  // Reset logo clicks after 3 seconds of inactivity
  useEffect(() => {
    if (logoClicks > 0 && logoClicks < 5) {
      const timer = setTimeout(() => setLogoClicks(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClicks]);

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

  // Mouse move handler for 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg tilt
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setCardTilt({ rotateX, rotateY });
    setMousePosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0 });
  };

  // Generate global donation pulses
  useEffect(() => {
    const locations = [
      { lat: 51.5, lng: -0.1, city: 'London' },
      { lat: 40.7, lng: -74, city: 'New York' },
      { lat: 35.7, lng: 139.7, city: 'Tokyo' },
      { lat: -33.9, lng: 151.2, city: 'Sydney' },
      { lat: 48.9, lng: 2.3, city: 'Paris' },
      { lat: 55.8, lng: 37.6, city: 'Moscow' },
      { lat: 19.4, lng: -99.1, city: 'Mexico City' },
      { lat: -23.5, lng: -46.6, city: 'São Paulo' }
    ];
    
    const generatePulse = () => {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const newPulse = {
        id: Date.now() + Math.random(),
        lat: location.lat,
        lng: location.lng,
        amount: [10, 25, 50, 100][Math.floor(Math.random() * 4)]
      };
      
      setGlobalDonations(prev => [...prev, newPulse]);
      
      setTimeout(() => {
        setGlobalDonations(prev => prev.filter(p => p.id !== newPulse.id));
      }, 3000);
    };
    
    // Initial pulses
    for (let i = 0; i < 3; i++) {
      setTimeout(() => generatePulse(), i * 800);
    }
    
    const interval = setInterval(() => {
      generatePulse();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Generate floating heart particles
  useEffect(() => {
    const generateParticle = () => {
      const newParticle = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        size: Math.random() * 20 + 15, // 15-35px
        duration: Math.random() * 5 + 8, // 8-13 seconds
        delay: 0
      };
      
      setFloatingParticles(prev => [...prev, newParticle]);
      
      setTimeout(() => {
        setFloatingParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, newParticle.duration * 1000);
    };
    
    // Generate initial particles
    for (let i = 0; i < 8; i++) {
      setTimeout(() => generateParticle(), i * 600);
    }
    
    // Continue generating particles
    const interval = setInterval(() => {
      generateParticle();
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  // Generate donation cards from map locations
  useEffect(() => {
    const mapLocations = [
      { x: 15, y: 35, country: 'USA', amounts: [10, 25, 50] },
      { x: 48, y: 30, country: 'UK', amounts: [15, 30, 75] },
      { x: 52, y: 28, country: 'France', amounts: [20, 40, 100] },
      { x: 58, y: 25, country: 'Russia', amounts: [10, 50, 150] },
      { x: 75, y: 32, country: 'Japan', amounts: [25, 60, 200] },
      { x: 80, y: 55, country: 'Australia', amounts: [15, 35, 80] },
      { x: 20, y: 50, country: 'Brazil', amounts: [10, 20, 45] },
      { x: 50, y: 45, country: 'South Africa', amounts: [15, 30, 60] }
    ];
    
    const generateMapDonation = () => {
      const location = mapLocations[Math.floor(Math.random() * mapLocations.length)];
      const amount = location.amounts[Math.floor(Math.random() * location.amounts.length)];
      
      const newDonation = {
        id: Date.now() + Math.random(),
        x: location.x,
        y: location.y,
        amount: amount,
        country: location.country
      };
      
      setMapDonations(prev => [...prev, newDonation]);
      
      setTimeout(() => {
        setMapDonations(prev => prev.filter(d => d.id !== newDonation.id));
      }, 6000);
    };
    
    // Initial donations
    for (let i = 0; i < 3; i++) {
      setTimeout(() => generateMapDonation(), i * 1000);
    }
    
    // Continue generating
    const interval = setInterval(() => {
      generateMapDonation();
    }, 2500);
    
    return () => clearInterval(interval);
  }, []);

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

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section - Left with Easter Egg */}
            <div 
              className="flex items-center space-x-4 min-w-[200px] cursor-pointer group"
              onClick={handleLogoClick}
            >
              <div className={`h-12 w-12 bg-green-600 rounded-xl p-2 shadow-md group-hover:shadow-lg transition-all duration-300 ${
                logoClicks > 0 ? 'animate-bounce' : ''
              } ${showEasterEgg ? 'animate-spin' : ''}`}>
                <img 
                  src="/logo.png" 
                  alt="Swift Cause Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  Swift Cause
                </h1>
                <p className="text-xs text-green-600 font-medium">
                  {showEasterEgg ? '🎉 You found it!' : 'Donation Platform'}
                </p>
              </div>
            </div>
            
            {/* Navigation Links - Center with Creative Hover Effects */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-2xl">
              <a 
                href="#solutions" 
                onMouseEnter={() => setNavHoverEffect('solutions')}
                onMouseLeave={() => setNavHoverEffect(null)}
                className="relative px-4 py-2 text-gray-700 hover:text-green-600 rounded-lg transition-all duration-200 font-medium group"
              >
                <span className="relative z-10">Solutions</span>
                {navHoverEffect === 'solutions' && (
                  <span className="absolute inset-0 bg-green-50 rounded-lg animate-pulse"></span>
                )}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a 
                href="#how-it-works" 
                onMouseEnter={() => setNavHoverEffect('how')}
                onMouseLeave={() => setNavHoverEffect(null)}
                className="relative px-4 py-2 text-gray-700 hover:text-green-600 rounded-lg transition-all duration-200 font-medium group"
              >
                <span className="relative z-10">How It Works</span>
                {navHoverEffect === 'how' && (
                  <span className="absolute inset-0 bg-green-50 rounded-lg animate-pulse"></span>
                )}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a 
                href="#faq" 
                onMouseEnter={() => setNavHoverEffect('faq')}
                onMouseLeave={() => setNavHoverEffect(null)}
                className="relative px-4 py-2 text-gray-700 hover:text-green-600 rounded-lg transition-all duration-200 font-medium group"
              >
                <span className="relative z-10">FAQ</span>
                {navHoverEffect === 'faq' && (
                  <span className="absolute inset-0 bg-green-50 rounded-lg animate-pulse"></span>
                )}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </nav>

            {/* CTA Buttons - Right with Micro-interactions */}
            <div className="flex items-center space-x-3 min-w-[200px] justify-end">
              <Button 
                variant="ghost" 
                onClick={onLogin} 
                className="relative text-gray-700 hover:text-green-600 hover:bg-green-50 font-medium group overflow-hidden"
              >
                <span className="relative z-10">Login</span>
                <span className="absolute inset-0 bg-green-100 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              </Button>
              <Button 
                onClick={onSignup} 
                className="relative bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg font-semibold overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Live Donation Counter Easter Egg */}
        {showEasterEgg && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl animate-bounce z-50">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 fill-white animate-pulse" />
              <span className="text-sm font-semibold">
                {formatCurrency(stats.totalRaised)} raised globally! 🌍
              </span>
            </div>
          </div>
        )}
      </header>


      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 min-h-screen flex items-center">
        {/* Animated Background Patterns with Parallax */}
        <div 
          className="absolute inset-0 overflow-hidden transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Network World Map Visualization */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
            {/* World map network - continents represented by connected nodes */}
            
            {/* North America - More detailed */}
            <g>
              {/* West Coast */}
              <circle cx="150" cy="180" r="3" fill="#16a34a" />
              <circle cx="160" cy="200" r="3" fill="#16a34a" />
              <circle cx="155" cy="220" r="3" fill="#16a34a" />
              {/* Central */}
              <circle cx="180" cy="190" r="4" fill="#16a34a" />
              <circle cx="200" cy="200" r="4" fill="#16a34a" />
              <circle cx="220" cy="195" r="3" fill="#16a34a" />
              <circle cx="190" cy="220" r="3" fill="#16a34a" />
              <circle cx="210" cy="230" r="3" fill="#16a34a" />
              {/* East Coast */}
              <circle cx="240" cy="200" r="3" fill="#16a34a" />
              <circle cx="250" cy="220" r="3" fill="#16a34a" />
              <circle cx="245" cy="240" r="3" fill="#16a34a" />
              {/* Canada */}
              <circle cx="170" cy="160" r="3" fill="#16a34a" />
              <circle cx="200" cy="170" r="3" fill="#16a34a" />
              <circle cx="230" cy="165" r="3" fill="#16a34a" />
              {/* Mexico */}
              <circle cx="180" cy="260" r="3" fill="#16a34a" />
              <circle cx="200" cy="270" r="3" fill="#16a34a" />
              
              {/* Connections */}
              <line x1="150" y1="180" x2="160" y2="200" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="160" y1="200" x2="155" y2="220" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="180" y1="190" x2="200" y2="200" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="200" y1="200" x2="220" y2="195" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="200" y1="200" x2="190" y2="220" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="190" y1="220" x2="210" y2="230" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="220" y1="195" x2="240" y2="200" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="240" y1="200" x2="250" y2="220" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="250" y1="220" x2="245" y2="240" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="170" y1="160" x2="200" y2="170" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="200" y1="170" x2="230" y2="165" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="200" y1="170" x2="180" y2="190" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="210" y1="230" x2="180" y2="260" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="180" y1="260" x2="200" y2="270" stroke="#16a34a" strokeWidth="1.5" />
            </g>
            
            {/* South America - More detailed */}
            <g>
              <circle cx="240" cy="320" r="3" fill="#16a34a" />
              <circle cx="250" cy="340" r="3" fill="#16a34a" />
              <circle cx="260" cy="360" r="4" fill="#16a34a" />
              <circle cx="270" cy="380" r="3" fill="#16a34a" />
              <circle cx="280" cy="400" r="3" fill="#16a34a" />
              <circle cx="285" cy="420" r="3" fill="#16a34a" />
              <circle cx="280" cy="440" r="3" fill="#16a34a" />
              <circle cx="270" cy="460" r="3" fill="#16a34a" />
              <circle cx="255" cy="380" r="3" fill="#16a34a" />
              <circle cx="245" cy="400" r="3" fill="#16a34a" />
              
              <line x1="240" y1="320" x2="250" y2="340" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="250" y1="340" x2="260" y2="360" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="260" y1="360" x2="270" y2="380" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="270" y1="380" x2="280" y2="400" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="280" y1="400" x2="285" y2="420" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="285" y1="420" x2="280" y2="440" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="280" y1="440" x2="270" y2="460" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="270" y1="380" x2="255" y2="380" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="255" y1="380" x2="245" y2="400" stroke="#16a34a" strokeWidth="1.5" />
            </g>
            
            {/* Europe - More detailed */}
            <g>
              <circle cx="560" cy="170" r="3" fill="#16a34a" />
              <circle cx="580" cy="165" r="3" fill="#16a34a" />
              <circle cx="600" cy="175" r="4" fill="#16a34a" />
              <circle cx="620" cy="170" r="3" fill="#16a34a" />
              <circle cx="640" cy="180" r="3" fill="#16a34a" />
              <circle cx="590" cy="190" r="3" fill="#16a34a" />
              <circle cx="610" cy="200" r="3" fill="#16a34a" />
              <circle cx="630" cy="205" r="3" fill="#16a34a" />
              <circle cx="570" cy="210" r="3" fill="#16a34a" />
              <circle cx="590" cy="220" r="3" fill="#16a34a" />
              
              <line x1="560" y1="170" x2="580" y2="165" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="580" y1="165" x2="600" y2="175" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="600" y1="175" x2="620" y2="170" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="620" y1="170" x2="640" y2="180" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="600" y1="175" x2="590" y2="190" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="590" y1="190" x2="610" y2="200" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="610" y1="200" x2="630" y2="205" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="590" y1="190" x2="570" y2="210" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="570" y1="210" x2="590" y2="220" stroke="#16a34a" strokeWidth="1.5" />
            </g>
            
            {/* Africa - More detailed */}
            <g>
              <circle cx="590" cy="280" r="3" fill="#16a34a" />
              <circle cx="610" cy="290" r="3" fill="#16a34a" />
              <circle cx="620" cy="310" r="4" fill="#16a34a" />
              <circle cx="630" cy="330" r="3" fill="#16a34a" />
              <circle cx="625" cy="350" r="3" fill="#16a34a" />
              <circle cx="620" cy="370" r="3" fill="#16a34a" />
              <circle cx="610" cy="390" r="3" fill="#16a34a" />
              <circle cx="600" cy="410" r="3" fill="#16a34a" />
              <circle cx="605" cy="320" r="3" fill="#16a34a" />
              <circle cx="595" cy="340" r="3" fill="#16a34a" />
              <circle cx="590" cy="360" r="3" fill="#16a34a" />
              
              <line x1="590" y1="280" x2="610" y2="290" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="610" y1="290" x2="620" y2="310" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="620" y1="310" x2="630" y2="330" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="630" y1="330" x2="625" y2="350" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="625" y1="350" x2="620" y2="370" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="620" y1="370" x2="610" y2="390" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="610" y1="390" x2="600" y2="410" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="620" y1="310" x2="605" y2="320" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="605" y1="320" x2="595" y2="340" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="595" y1="340" x2="590" y2="360" stroke="#16a34a" strokeWidth="1.5" />
            </g>
            
            {/* Asia - More detailed */}
            <g>
              {/* Middle East */}
              <circle cx="660" cy="240" r="3" fill="#16a34a" />
              <circle cx="680" cy="250" r="3" fill="#16a34a" />
              {/* Central Asia */}
              <circle cx="700" cy="200" r="3" fill="#16a34a" />
              <circle cx="720" cy="190" r="3" fill="#16a34a" />
              <circle cx="740" cy="195" r="4" fill="#16a34a" />
              <circle cx="760" cy="200" r="3" fill="#16a34a" />
              {/* South Asia */}
              <circle cx="730" cy="260" r="3" fill="#16a34a" />
              <circle cx="750" cy="270" r="3" fill="#16a34a" />
              <circle cx="760" cy="285" r="3" fill="#16a34a" />
              {/* East Asia */}
              <circle cx="780" cy="210" r="3" fill="#16a34a" />
              <circle cx="800" cy="220" r="4" fill="#16a34a" />
              <circle cx="820" cy="230" r="3" fill="#16a34a" />
              <circle cx="840" cy="240" r="3" fill="#16a34a" />
              {/* Southeast Asia */}
              <circle cx="810" cy="280" r="3" fill="#16a34a" />
              <circle cx="830" cy="290" r="3" fill="#16a34a" />
              <circle cx="850" cy="300" r="3" fill="#16a34a" />
              
              <line x1="660" y1="240" x2="680" y2="250" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="680" y1="250" x2="700" y2="200" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="700" y1="200" x2="720" y2="190" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="720" y1="190" x2="740" y2="195" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="740" y1="195" x2="760" y2="200" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="680" y1="250" x2="730" y2="260" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="730" y1="260" x2="750" y2="270" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="750" y1="270" x2="760" y2="285" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="760" y1="200" x2="780" y2="210" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="780" y1="210" x2="800" y2="220" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="800" y1="220" x2="820" y2="230" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="820" y1="230" x2="840" y2="240" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="760" y1="285" x2="810" y2="280" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="810" y1="280" x2="830" y2="290" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="830" y1="290" x2="850" y2="300" stroke="#16a34a" strokeWidth="1.5" />
            </g>
            
            {/* Australia - More detailed */}
            <g>
              <circle cx="940" cy="380" r="3" fill="#16a34a" />
              <circle cx="960" cy="375" r="3" fill="#16a34a" />
              <circle cx="980" cy="380" r="4" fill="#16a34a" />
              <circle cx="1000" cy="390" r="3" fill="#16a34a" />
              <circle cx="990" cy="410" r="3" fill="#16a34a" />
              <circle cx="970" cy="420" r="3" fill="#16a34a" />
              <circle cx="950" cy="415" r="3" fill="#16a34a" />
              <circle cx="935" cy="400" r="3" fill="#16a34a" />
              
              <line x1="940" y1="380" x2="960" y2="375" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="960" y1="375" x2="980" y2="380" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="980" y1="380" x2="1000" y2="390" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="1000" y1="390" x2="990" y2="410" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="990" y1="410" x2="970" y2="420" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="970" y1="420" x2="950" y2="415" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="950" y1="415" x2="935" y2="400" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="935" y1="400" x2="940" y2="380" stroke="#16a34a" strokeWidth="1.5" />
            </g>
            
            {/* Inter-continental connections - More visible */}
            <line x1="240" y1="200" x2="560" y2="170" stroke="#16a34a" strokeWidth="1" opacity="0.4" strokeDasharray="5,5" />
            <line x1="640" y1="180" x2="700" y2="200" stroke="#16a34a" strokeWidth="1" opacity="0.4" strokeDasharray="5,5" />
            <line x1="840" y1="240" x2="940" y2="380" stroke="#16a34a" strokeWidth="1" opacity="0.4" strokeDasharray="5,5" />
            <line x1="590" y1="220" x2="590" y2="280" stroke="#16a34a" strokeWidth="1" opacity="0.4" strokeDasharray="5,5" />
            <line x1="200" y1="270" x2="240" y2="320" stroke="#16a34a" strokeWidth="1" opacity="0.4" strokeDasharray="5,5" />
          </svg>
        </div>

        {/* Donation Cards Floating from Map */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
          {mapDonations.map((donation) => (
            <div
              key={donation.id}
              className="absolute animate-float-from-map"
              style={{
                left: `${donation.x}%`,
                bottom: `${donation.y}%`,
              }}
            >
              <div className="bg-white/95 backdrop-blur-sm border-2 border-green-400 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-xl flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white fill-white" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-green-700">£{donation.amount}</div>
                  <div className="text-[10px] sm:text-xs text-gray-600">{donation.country}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Heart Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
          {floatingParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute bottom-0 animate-float-particle"
              style={{
                left: `${particle.left}%`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`
              }}
            >
              <Heart 
                className="text-green-400 fill-green-400 opacity-60"
                style={{ 
                  width: `${particle.size}px`, 
                  height: `${particle.size}px`,
                  filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))'
                }}
              />
            </div>
          ))}
        </div>

        <div className="relative w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-24 xl:gap-32 items-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                  Transform Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mt-1 sm:mt-2"> Fundraising</span>
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed">
                  Empower your organization with intelligent donation kiosks, 
                  comprehensive campaign management, and real-time analytics. 
                  Make giving easy, secure, and impactful.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button 
                  onClick={onSignup}
                  size="lg" 
                  className="w-full sm:w-auto h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 text-sm sm:text-base md:text-lg bg-green-600 hover:bg-green-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 text-sm sm:text-base md:text-lg border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 shadow-lg transition-all duration-200"
                  onClick={() => setShowDemoModal(true)}
                >
                  <PlayCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  Watch Demo
                </Button>
              </div>
            </div>

            <div 
              className="relative h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] flex items-center justify-center perspective-1000"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Interactive Donation Flow Carousel with 3D Tilt */}
              <div 
                className="relative w-full max-w-md mx-auto transition-transform duration-300 ease-out"
                style={{
                  transform: `perspective(1000px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                
                {/* Main Card Display */}
                <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 border-2 border-green-100 min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[480px]">
                  
                  {/* Spotlight effect following mouse */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`
                    }}
                  />
                  
                  {/* Step Indicator */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6 relative z-10">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-xs md:text-sm">
                        {donationFlowSteps[activeFlowStep].step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-[11px] sm:text-xs md:text-sm truncate">
                          {donationFlowSteps[activeFlowStep].title}
                        </h3>
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 truncate">
                          {donationFlowSteps[activeFlowStep].description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content with Transition */}
                  <div className="transition-all duration-500 ease-in-out relative z-10 text-xs sm:text-sm md:text-base">
                    {donationFlowSteps[activeFlowStep].content}
                  </div>

                  {/* Navigation Arrows */}
                  <div className="absolute top-1/2 -left-2 sm:-left-3 md:-left-4 -translate-y-1/2 hidden sm:block z-20">
                    <button
                      onClick={prevStep}
                      className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg border-2 border-green-200 flex items-center justify-center hover:bg-green-50 hover:border-green-400 transition-all group"
                      aria-label="Previous step"
                    >
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600 rotate-180 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <div className="absolute top-1/2 -right-2 sm:-right-3 md:-right-4 -translate-y-1/2 hidden sm:block z-20">
                    <button
                      onClick={nextStep}
                      className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg border-2 border-green-200 flex items-center justify-center hover:bg-green-50 hover:border-green-400 transition-all group"
                      aria-label="Next step"
                    >
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Dot Indicators */}
                <div className="flex justify-center space-x-1.5 sm:space-x-2 mt-3 sm:mt-4 md:mt-6">
                  {donationFlowSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === activeFlowStep
                          ? 'w-5 sm:w-6 md:w-8 h-2 sm:h-2.5 md:h-3 bg-green-600'
                          : 'w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 bg-gray-300 hover:bg-green-400'
                      }`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-2 sm:mt-3 md:mt-4 bg-gray-200 rounded-full h-0.5 sm:h-1 md:h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${((activeFlowStep + 1) / donationFlowSteps.length) * 100}%` }}
                  />
                </div>

                {/* Floating decorative elements with parallax */}
                <div 
                  className="absolute -top-3 sm:-top-4 md:-top-6 -right-3 sm:-right-4 md:-right-6 w-12 sm:w-16 md:w-24 h-12 sm:h-16 md:h-24 bg-green-100 rounded-full opacity-40 blur-2xl animate-pulse transition-transform duration-300 hidden sm:block"
                  style={{
                    transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`
                  }}
                />
                <div 
                  className="absolute -bottom-3 sm:-bottom-4 md:-bottom-6 -left-3 sm:-left-4 md:-left-6 w-16 sm:w-20 md:w-32 h-16 sm:h-20 md:h-32 bg-emerald-100 rounded-full opacity-30 blur-2xl animate-pulse transition-transform duration-300 hidden sm:block" 
                  style={{ 
                    animationDelay: '1s',
                    transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

  
      <section id="solutions" className="py-20 sm:py-24 lg:py-32 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-50 rounded-full filter blur-3xl opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
              <Building className="w-4 h-4 mr-2" />
              Trusted Solutions
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Built for Every Organization
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible solutions that adapt to your unique fundraising needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-gray-200 hover:border-green-300 cursor-pointer transform hover:-translate-y-2">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0 p-3 sm:p-4 rounded-xl bg-green-50 group-hover:bg-green-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      {useCase.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                        {useCase.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">{useCase.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3 pl-16 sm:pl-20">
                    {useCase.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-gray-700 group/item hover:text-green-700 transition-colors">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-3 flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                        <span className="text-sm sm:text-base">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      <section id="how-it-works" className="py-20 sm:py-24 lg:py-32 bg-green-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100 rounded-full filter blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white text-green-800 text-sm font-medium mb-4 shadow-sm">
              <Zap className="w-4 h-4 mr-2 text-green-600" />
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started with Swift Cause is fast, easy, and intuitive.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200"></div>
            
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <Card className="text-center p-6 sm:p-8 bg-white border-green-100 hover:border-green-400 transition-all duration-300 hover:shadow-xl group cursor-pointer transform hover:-translate-y-2">
                  <CardContent className="space-y-4">
                    {/* Animated step number */}
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-green-600 rounded-full animate-ping opacity-20"></div>
                      <div className="relative p-4 rounded-full inline-block bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                        {step.icon}
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Arrow for mobile/tablet */}
                {index < howItWorks.length - 1 && (
                  <div className="flex justify-center my-4 lg:hidden">
                    <ArrowDown className="w-6 h-6 text-green-400 animate-bounce" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      <section id="faq" className="py-20 sm:py-24 lg:py-32 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-50 rounded-full filter blur-3xl opacity-40"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
              <Quote className="w-4 h-4 mr-2" />
              Got Questions?
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to the most common questions about our platform and services.
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-green-300 transition-all duration-300 hover:shadow-lg"
              >
                <button
                  className="flex items-center justify-between w-full text-left p-6 focus:outline-none group"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      openFaqIndex === index ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-green-50'
                    }`}>
                      <CheckCircle className={`w-5 h-5 transition-colors ${
                        openFaqIndex === index ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'
                      }`} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-green-600 transform transition-all duration-300 flex-shrink-0 ml-4 ${
                      openFaqIndex === index ? 'rotate-90 scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-6 pb-6 text-sm sm:text-base text-gray-600 leading-relaxed pl-20">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 sm:py-24 lg:py-32 bg-gradient-to-r from-green-600 to-emerald-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full opacity-5 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full opacity-5 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
            <Star className="w-4 h-4 mr-2" />
            Join {stats.organizationsServed}+ Organizations
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Fundraising?
          </h2>
          <p className="text-lg sm:text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of organizations already using Swift Cause to maximize their impact and streamline donations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onSignup}
              size="lg" 
              className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg bg-white text-green-700 hover:bg-green-50 shadow-2xl font-semibold transform hover:scale-105 transition-all duration-200"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button 
              size="lg" 
              className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-700 shadow-xl font-semibold transition-all duration-200"
              onClick={() => setShowDemoModal(true)}
            >
              <PlayCircle className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Watch Demo
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-green-100 text-sm mb-4">Trusted by leading organizations</p>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-white/80">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">PCI Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span className="text-sm">Encrypted Data</span>
              </div>
            </div>
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