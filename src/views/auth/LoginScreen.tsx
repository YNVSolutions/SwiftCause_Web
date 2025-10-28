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
      name: "Winston Churchill",
      text: "We make a living by what we get, but we make a life by what we give.",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex-1 flex">
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center p-8 xl:p-16">
          <div className="max-w-lg">
            <Button onClick={onGoBackToHome} variant="ghost" size="icon" className="absolute top-4 left-4 text-gray-500 hover:text-gray-800">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="sr-only">Back to Home</span>
                </Button>
            <button onClick={onGoBackToHome} className="flex items-center space-x-3 mb-2 text-left hover:opacity-80 transition-opacity">
              <div className="flex h-12 w-12 items-center justify-center">
                <img src="/logo.png" className="h-12 w-12 rounded-xl shadow-md" alt="My Logo" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Swift Cause</h1>
                <p className="text-sm text-gray-600">Modern Donation Platform</p>
              </div>
            </button>

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
                  <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full my-3"></div>
                  <p className="text-sm text-gray-700 mb-2">"{testimonial.text}"</p>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">{testimonial.name}</span>
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
              <CardHeader className="relative text-center space-y-2 pt-10 pb-0">
                <CardTitle className="text-xl lg:text-2xl">Platform Access</CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  Choose your access type to continue
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'kiosk' | 'admin')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="admin" className="flex items-center space-x-2">
                      <UserCog className="w-4 h-4" />
                      <span>User</span>
                    </TabsTrigger>
                    <TabsTrigger value="kiosk" className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>Kiosk</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Ensure consistent box sizing for tab panels */}
                  <div className="mt-4 min-h-[320px]">
                    <TabsContent value="kiosk" className="m-0">
                      <KioskLoginContainer onLogin={onLogin} />
                    </TabsContent>

                    <TabsContent value="admin" className="m-0">
                      <AdminLoginContainer onLogin={onLogin} />
                    </TabsContent>
                  </div>
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
                    <a href="mailto:swiftcauseweb@gmail.com" className="text-indigo-600 hover:text-indigo-700 font-medium">
                      📩 swiftcauseweb@gmail.com
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
          </div>
        </div>
      </div>
    </div>
  );
}