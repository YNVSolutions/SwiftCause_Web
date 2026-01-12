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

  const useCases = [
    {
      title: 'Non-Profit Organizations',
      description: 'Streamline donation collection with branded kiosks in multiple locations',
      icon: <Heart className="w-6 h-6 text-red-600" />,
      benefits: ['Increase donation volume', 'Reduce operational costs', 'Track impact metrics']
    },
    {
      title: 'Healthcare Institutions',
      description: 'Enable easy donations for medical research and patient care programs',
      icon: <Shield className="w-6 h-6 text-blue-600" />,
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
      icon: <Globe className="w-6 h-6 text-purple-600" />,
      benefits: ['Community engagement', 'Transparent giving', 'Multiple campaigns']
    }
  ];

  const howItWorks = [
    {
      title: 'Set Up',
      description: 'Customize your campaigns with branding, goals, and pricing through our intuitive dashboard.',
      icon: <Settings className="w-8 h-8 text-indigo-600" />
    },
    {
      title: 'Deploy',
      description: 'Place touch-friendly kiosks in key locations or share QR codes for easy, contactless access.',
      icon: <MapPin className="w-8 h-8 text-purple-600" />
    },
    {
      title: 'Engage',
      description: 'Donors contribute seamlessly with a few taps on a kiosk or a quick scan from their smartphone.',
      icon: <CreditCard className="w-8 h-8 text-green-600" />
    },
    {
      title: 'Track',
      description: 'Monitor donations in real-time and analyze campaign performance directly from your dashboard.',
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />
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
              <Button onClick={onSignup} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>


      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trusted by organizations worldwide
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Transform Your
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Fundraising</span>
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
                  className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 border-gray-300 hover:bg-gray-50"
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

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-1">
                <div className="aspect-[4/3] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 flex flex-col justify-center">
                 
                  <div className="space-y-4">
            
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8">
                          <img 
                            src={swiftCauseLogo.src} 
                            alt="Swift Cause" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="font-semibold text-gray-900">Swift Cause Analytics</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Live</Badge>
                    </div>

                   
                    <EnterprisePlatformShowcase />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

  
      <section id="solutions" className="py-20 bg-gray-50">
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
              <Card key={index} className="hover:shadow-xl transition-shadow group">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0 p-3 rounded-xl bg-gray-100 group-hover:bg-indigo-100 transition-colors">
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
                        <ArrowRight className="w-4 h-4 text-indigo-600 mr-3" />
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


      <section id="how-it-works" className="py-20 bg-white">
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
              <Card key={index} className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-full inline-block bg-indigo-50 text-indigo-600">
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


      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to the most common questions about our platform and services.
            </p>
          </div>
          
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-8">
                <button
                  className="flex items-center justify-between w-full text-left focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{faq.question}</h3>
                  <ChevronRight
                    className={`w-6 h-6 transform transition-transform duration-300 ${
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


      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Fundraising?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of organizations already using Swift Cause to maximize their impact
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onSignup}
              size="lg" 
              className="h-14 px-8 bg-white text-indigo-600 hover:bg-gray-100 shadow-lg"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 px-8 border-white text-indigo-600  hover:bg-gray-100 hover:text-indigo-600 shadow-lg"
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