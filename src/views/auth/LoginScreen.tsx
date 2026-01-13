import { useState, useEffect } from 'react';
import { Badge } from '../../shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { Button } from '../../shared/ui/button';

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
  ArrowLeft,
  Home,
} from 'lucide-react';
import { UserRole, KioskSession, AdminSession } from '../../shared/types';
import { KioskLoginContainer } from '../../features/auth-by-kiosk';
import { AdminLoginContainer } from '../../features/auth-by-email';

interface LoginScreenProps {
  onLogin: (role: UserRole, sessionData?: KioskSession | AdminSession) => void;
  onGoBackToHome: () => void;
}

export function LoginScreen({ onLogin, onGoBackToHome }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'kiosk' | 'admin'>('admin');

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
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num);
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
      name: "Winston Churchill",
      text: "We make a living by what we get, but we make a life by what we give.",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex min-h-screen relative z-10">
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center p-6 xl:p-12">
          <div className="max-w-lg mx-auto w-full">
            <Button onClick={onGoBackToHome} variant="ghost" size="icon" className="absolute top-4 left-4 text-gray-500 hover:text-gray-800">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="sr-only">Back to Home</span>
                </Button>
            <button onClick={onGoBackToHome} className="flex items-center space-x-3 mb-2 text-left hover:opacity-80 transition-all duration-300 hover:scale-105 group">
              <div className="flex h-12 w-12 items-center justify-center transform transition-transform group-hover:rotate-12">
                <img src="/logo.png" className="h-12 w-12 rounded-xl shadow-md" alt="My Logo" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Swift Cause</h1>
                <p className="text-sm text-gray-600">Modern Donation Platform</p>
              </div>
            </button>

            <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-4 leading-tight animate-fade-in">
              Powering <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient">global</span> generosity
            </h2>

            <p className="text-base xl:text-lg text-gray-600 mb-8 animate-fade-in-delay">
              Comprehensive donation management platform trusted by organizations worldwide.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-12 animate-fade-in-delay-2">
              <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 w-6 text-green-600 transform group-hover:scale-110 transition-transform">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs animate-pulse">Live</Badge>
                </div>
                <div className="text-xl xl:text-2xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  {formatCurrency(stats.totalRaised)}
                </div>
                <p className="text-xs xl:text-sm text-gray-600">Total raised this year</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 w-6 text-blue-600 transform group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
                <div className="text-xl xl:text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {formatNumber(stats.totalDonors)}
                </div>
                <p className="text-xs xl:text-sm text-gray-600">Generous donors</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 w-6 text-purple-600 transform group-hover:scale-110 transition-transform">
                    <Globe className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Global</Badge>
                </div>
                <div className="text-xl xl:text-2xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {stats.activeCampaigns}
                </div>
                <p className="text-xs xl:text-sm text-gray-600">Active campaigns</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 w-6 text-orange-600 transform group-hover:scale-110 transition-transform">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Online</Badge>
                </div>
                <div className="text-xl xl:text-2xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {stats.activeKiosks}
                </div>
                <p className="text-xs xl:text-sm text-gray-600">Active kiosks</p>
              </div>
            </div>

            <div className="space-y-4 animate-fade-in-delay-3">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102">
                  <div className="w-12 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-full my-3"></div>
                  <p className="text-sm text-gray-700 mb-2 italic">"{testimonial.text}"</p>
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">{testimonial.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-4 sm:p-6 lg:p-6 xl:p-8">
          <div className="w-full max-w-md animate-slide-in-right">
            <div className="lg:hidden text-center mb-6">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg animate-bounce-slow">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Welcome to Swift Cause</h2>
              <p className="text-sm text-gray-600">Access portal</p>
            </div>

            <Card className="bg-white/95 backdrop-blur-md border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <CardHeader className="text-center space-y-1 pt-6 pb-4">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Platform Access</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Choose your access type to continue
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-2 pb-6 px-4 sm:px-6">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'kiosk' | 'admin')}>
                  <TabsList className="grid w-full grid-cols-2 h-11">
                    <TabsTrigger value="admin" className="flex items-center space-x-2 text-sm">
                      <UserCog className="w-4 h-4" />
                      <span>User</span>
                    </TabsTrigger>
                    <TabsTrigger value="kiosk" className="flex items-center space-x-2 text-sm">
                      <Heart className="w-4 h-4" />
                      <span>Kiosk</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Consistent box sizing for tab panels */}
                  <div className="mt-4">
                    <TabsContent value="kiosk" className="m-0">
                      <KioskLoginContainer onLogin={onLogin} />
                    </TabsContent>

                    <TabsContent value="admin" className="m-0">
                      <AdminLoginContainer onLogin={onLogin} />
                    </TabsContent>
                  </div>
                </Tabs>

                {activeTab === 'kiosk' && (
                  <div className="lg:hidden space-y-3 pt-3 border-t">
                    <h4 className="text-xs font-medium text-gray-900">Kiosk Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <feature.icon className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span className="text-xs text-gray-700">{feature.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-3 border-t text-center space-y-1.5">
                  <p className="text-xs sm:text-sm text-gray-600">Need assistance?</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm">
                    <a href="mailto:swiftcauseweb@gmail.com" className="text-indigo-600 hover:text-indigo-700 font-medium">
                      📩 swiftcauseweb@gmail.com
                    </a>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span className="text-gray-600">24/7 Support</span>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-1.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>Secure • Encrypted • Verified</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}