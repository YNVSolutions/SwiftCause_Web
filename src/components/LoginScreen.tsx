import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';


import {
  Shield,
  Heart,
  Users,
  Globe,
  TrendingUp,
  Award,
  CheckCircle,
  DollarSign,
  Clock,
  Star,
  UserCog,
  Monitor,
} from 'lucide-react';
import { UserRole, KioskSession, AdminSession } from '../App';
import { KioskLogin } from './KioskLogin';
import { AdminLogin } from './AdminLogin';

interface LoginScreenProps {
  onLogin: (role: UserRole, sessionData?: KioskSession | AdminSession) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'kiosk' | 'admin'>('kiosk');

  // Mock real-time statistics
  const [stats, setStats] = useState({
    totalRaised: 2847650,
    activeCampaigns: 42,
    totalDonors: 15847,
    successRate: 98.5,
    activeKiosks: 28,
    monthlyGrowth: 15.3
  });


  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalRaised: prev.totalRaised + Math.floor(Math.random() * 100),
        totalDonors: prev.totalDonors + Math.floor(Math.random() * 3)
      }));
    }, 5000);

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

  const features = [
    {
      icon: Globe,
      title: "Global Impact",
      description: "Support causes worldwide with secure, instant donations"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Bank-level security with PCI DSS compliance"
    },
    {
      icon: TrendingUp,
      title: "Real-time Tracking",
      description: "Watch your impact grow with live campaign updates"
    },
    {
      icon: Award,
      title: "Verified Campaigns",
      description: "All campaigns verified by our trusted partners"
    }
  ];



  const testimonials = [
    {
      name: "Sarah M.",
      role: "Regular Donor",
      text: "The easiest way to make a difference. I love seeing the real-time impact!",
      rating: 5
    },
    {
      name: "Mike R.",
      role: "Monthly Supporter",
      text: "Transparent, secure, and incredibly user-friendly. Highly recommended.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center shadow-lg">
                <img src="/logo.png" className="h-12 w-12 rounded-xl" alt="My Logo" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Swift Cause</h1>
                <p className="text-sm text-gray-600">Modern Donation Platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                System Online
              </Badge>
              
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                24/7 Support
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center p-8 xl:p-16">
          <div className="max-w-lg">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Live platform monitoring
            </div>

            <h2 className="text-4xl xl:text-5xl text-gray-900 mb-6 leading-tight">
              Powering <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">global</span> generosity
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              Comprehensive donation management platform trusted by organizations worldwide.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-16">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <Badge variant="secondary" className="text-xs">Live</Badge>
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalRaised)}
                </div>
                <p className="text-sm text-gray-600">Total raised this year</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  {formatNumber(stats.totalDonors)}
                </div>
                <p className="text-sm text-gray-600">Generous donors</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <Globe className="h-8 w-8 text-purple-600" />
                  <Badge variant="secondary" className="text-xs">Global</Badge>
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  {stats.activeCampaigns}
                </div>
                <p className="text-sm text-gray-600">Active campaigns</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <Monitor className="h-8 w-8 text-orange-600" />
                  <Badge variant="secondary" className="text-xs">Online</Badge>
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  {stats.activeKiosks}
                </div>
                <p className="text-sm text-gray-600">Active kiosks</p>
              </div>
            </div>

            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">"{testimonial.text}"</p>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">{testimonial.name}</span> • {testimonial.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl text-gray-900 mb-2">Welcome to Swift Cause</h2>
              <p className="text-gray-600">Access portal </p>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-xl lg:text-2xl">Platform Access</CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  Choose your access type to continue
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'kiosk' | 'admin')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="kiosk" className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>Kiosk</span>
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="flex items-center space-x-2">
                      <UserCog className="w-4 h-4" />
                      <span>Admin</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="kiosk">
                    <KioskLogin onLogin={onLogin} />
                  </TabsContent>

                  <TabsContent value="admin">
                    <AdminLogin onLogin={onLogin} />
                  </TabsContent>
                </Tabs>

                {activeTab === 'kiosk' && (
                  <div className="lg:hidden space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900">Kiosk Features:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <feature.icon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-xs text-gray-700">{feature.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t text-center space-y-2">
                  <p className="text-sm text-gray-600">Need assistance?</p>
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <a href="tel:1-800-DONATE-1" className="text-indigo-600 hover:text-indigo-700 font-medium">
                      📩 ynvtech@gmail.com
                    </a>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-600">24/7 Support</span>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>Secure • Encrypted • Verified</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 mb-3">Trusted by organizations worldwide</p>
              <div className="flex items-center justify-center space-x-6 opacity-60">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs">SSL Secured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs">PCI Compliant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">SOC 2 Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}