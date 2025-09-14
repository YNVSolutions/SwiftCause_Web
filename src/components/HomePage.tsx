import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { DemoModal } from './DemoModal';
import { EnterprisePlatformShowcase } from './EnterprisePlatformShowcase';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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

import { ImageWithFallback } from './figma/ImageWithFallback';
import swiftCauseLogo from '../assets/logo.png';

interface HomePageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function HomePage({ onLogin, onSignup }: HomePageProps) {
  const [showDemoModal, setShowDemoModal] = useState(false);
  
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const keyFeatures = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Touch-Friendly Kiosks',
      description: 'Intuitive donation interfaces optimized for mobile and touch screens',
      highlights: ['Mobile-first design', 'iOS/Android compatible', 'Gesture-friendly'],
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Bank-Level Security',
      description: 'PCI DSS compliant payment processing with enterprise-grade security',
      highlights: ['Encrypted transactions', 'Fraud protection', 'Data privacy'],
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Advanced Analytics',
      description: 'Real-time insights and comprehensive reporting for data-driven decisions',
      highlights: ['Live dashboards', 'Custom reports', 'Performance tracking'],
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      icon: <QrCode className="w-8 h-8" />,
      title: 'QR Code Access',
      description: 'Instant kiosk access via QR codes for seamless user experience',
      highlights: ['Quick setup', 'Contactless access', 'Easy deployment'],
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Campaign Management',
      description: 'Flexible campaign configuration with custom goals and branding',
      highlights: ['Custom pricing', 'Visual themes', 'Multi-location'],
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      icon: <UserCog className="w-8 h-8" />,
      title: 'User Permissions',
      description: 'Granular access control with role-based permission system',
      highlights: ['Role management', 'Access control', 'Audit trails'],
      color: 'bg-red-50 text-red-600 border-red-200'
    }
  ];

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



  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10">
                <img 
                  src={swiftCauseLogo} 
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
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trusted by 500+ organizations worldwide
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

              {/* Live Stats */}
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

            {/* Hero Platform Preview */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-1">
                <div className="aspect-[4/3] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 flex flex-col justify-center">
                  {/* Platform Interface Preview */}
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8">
                          <img 
                            src={swiftCauseLogo} 
                            alt="Swift Cause" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="font-semibold text-gray-900">Swift Cause Analytics</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Live</Badge>
                    </div>

                    {/* Interactive Analytics Dashboard */}
                    <EnterprisePlatformShowcase />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive donation management platform designed for modern organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className={`inline-flex p-4 rounded-2xl ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Leaders Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See how organizations are transforming their fundraising with Swift Cause
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-indigo-200 mb-4" />
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <ImageWithFallback
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-indigo-600">{testimonial.organization}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
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
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8">
                  <img 
                    src={swiftCauseLogo} 
                    alt="Swift Cause Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-lg font-semibold">Swift Cause</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering organizations to create meaningful impact through intelligent fundraising technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex items-center justify-between">
            <p className="text-gray-400">© 2024 Swift Cause. All rights reserved.</p>
            <div className="flex items-center space-x-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <DemoModal 
        open={showDemoModal} 
        onOpenChange={setShowDemoModal} 
      />
    </div>
  );
}