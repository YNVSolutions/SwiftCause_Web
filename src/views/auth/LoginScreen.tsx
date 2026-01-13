import { useState, useEffect } from 'react';
import { Badge } from '../../shared/ui/badge';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { Button } from '../../shared/ui/button';

import {
  Heart,
  Users,
  Globe,
  DollarSign,
  Monitor,
  ArrowLeft,
  UserCog,
} from 'lucide-react';
import { UserRole, KioskSession, AdminSession } from '../../shared/types';
import { KioskLoginContainer } from '../../features/auth-by-kiosk';
import { AdminLoginContainer } from '../../features/auth-by-email';

// Phase 1-2 Creative Components
import { DynamicGradientMesh } from './backgrounds/DynamicGradientMesh';
import { ParticleField } from './backgrounds/ParticleField';
import { GlassMorphCard } from './cards/GlassMorphCard';
import { LiquidFillProgress } from './cards/LiquidFillProgress';

interface LoginScreenProps {
  onLogin: (role: UserRole, sessionData?: KioskSession | AdminSession) => void;
  onGoBackToHome: () => void;
}

export function LoginScreen({ onLogin, onGoBackToHome }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'kiosk' | 'admin'>('admin');
  const [formState, setFormState] = useState<'idle' | 'typing' | 'error' | 'success'>('idle');
  const [formProgress, setFormProgress] = useState(0);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Mock real-time statistics
  const [stats, setStats] = useState({
    totalRaised: 2847650,
    activeCampaigns: 42,
    totalDonors: 15847,
    activeKiosks: 28,
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

  // Logo easter egg - click 5 times
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

  // Reset logo clicks after inactivity
  useEffect(() => {
    if (logoClicks > 0 && logoClicks < 5) {
      const timer = setTimeout(() => setLogoClicks(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClicks]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Phase 1: Dynamic gradient background with time-of-day */}
      <DynamicGradientMesh />

      {/* Phase 1: Interactive particle field with physics */}
      <ParticleField />

      <div className="flex min-h-screen relative z-10">
        {/* Left side - Stats and branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center p-6 xl:p-12">
          <div className="max-w-lg mx-auto w-full">
            <Button 
              onClick={onGoBackToHome} 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 left-4 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="sr-only">Back to Home</span>
            </Button>

            {/* Logo with easter egg */}
            <button 
              onClick={handleLogoClick} 
              className={`
                flex items-center space-x-3 mb-4 text-left hover:opacity-80 
                transition-all duration-300 hover:scale-105 group
                ${logoClicks > 0 ? 'animate-bounce' : ''}
                ${showEasterEgg ? 'animate-spin' : ''}
              `}
            >
              <div className="flex h-14 w-14 items-center justify-center transform transition-transform group-hover:rotate-12">
                <img src="/logo.png" className="h-14 w-14 rounded-xl shadow-lg" alt="Swift Cause Logo" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  Swift Cause
                </h1>
                <p className="text-sm text-green-600 font-medium">
                  {showEasterEgg ? '🎉 You found it!' : 'Modern Donation Platform'}
                </p>
              </div>
            </button>

            {/* Time-based greeting */}
            <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-4 leading-tight animate-fade-in">
              {getGreeting()}! <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 animate-gradient">Welcome back</span>
            </h2>

            <p className="text-base xl:text-lg text-gray-600 mb-8 animate-fade-in-delay">
              Comprehensive donation management platform trusted by organizations worldwide.
            </p>

            {/* Animated stats cards */}
            <div className="grid grid-cols-2 gap-4 mb-12 animate-fade-in-delay-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-green-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 w-6 text-green-600 transform group-hover:scale-110 transition-transform">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs animate-pulse bg-green-100 text-green-700">Live</Badge>
                </div>
                <div className="text-xl xl:text-2xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  {formatCurrency(stats.totalRaised)}
                </div>
                <p className="text-xs xl:text-sm text-gray-600">Total raised this year</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-emerald-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 w-6 text-emerald-600 transform group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">Active</Badge>
                </div>
                <div className="text-xl xl:text-2xl font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {formatNumber(stats.totalDonors)}
                </div>
                <p className="text-xs xl:text-sm text-gray-600">Generous donors</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-teal-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 w-6 text-teal-600 transform group-hover:scale-110 transition-transform">
                    <Globe className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700">Global</Badge>
                </div>
                <div className="text-xl xl:text-2xl font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                  {stats.activeCampaigns}
                </div>
                <p className="text-xs xl:text-sm text-gray-600">Active campaigns</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-green-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 w-6 text-green-600 transform group-hover:scale-110 transition-transform">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Online</Badge>
                </div>
                <div className="text-xl xl:text-2xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  {stats.activeKiosks}
                </div>
                <p className="text-xs xl:text-sm text-gray-600">Active kiosks</p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="space-y-4 animate-fade-in-delay-3">
              <div className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102">
                <div className="w-12 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full my-3"></div>
                <p className="text-sm text-gray-700 mb-3 italic leading-relaxed">
                  "We make a living by what we get, but we make a life by what we give."
                </p>
                <div className="text-xs text-gray-600">
                  <span className="font-semibold">Winston Churchill</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-4 sm:p-6 lg:p-6 xl:p-8">
          <div className="w-full max-w-md animate-slide-in-right">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-6">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg animate-bounce-slow">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {getGreeting()}!
              </h2>
              <p className="text-sm text-gray-600">Welcome to Swift Cause</p>
            </div>

            {/* Phase 2: Glass morph card with liquid fill */}
            <GlassMorphCard formState={formState} className="relative">
              {/* Phase 2: Liquid fill progress indicator */}
              <LiquidFillProgress progress={formProgress} />
              
              <CardHeader className="text-center space-y-1 pt-6 pb-4 relative z-10">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Platform Access
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Choose your access type to continue
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-2 pb-6 px-4 sm:px-6 relative z-10">
                <Tabs 
                  value={activeTab} 
                  onValueChange={(value) => {
                    setActiveTab(value as 'kiosk' | 'admin');
                    setFormProgress(0);
                    setFormState('idle');
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2 h-11 bg-green-50/50">
                    <TabsTrigger 
                      value="admin" 
                      className="flex items-center space-x-2 text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <UserCog className="w-4 h-4" />
                      <span>User</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="kiosk" 
                      className="flex items-center space-x-2 text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Kiosk</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4">
                    <TabsContent value="kiosk" className="m-0">
                      <KioskLoginContainer onLogin={onLogin} />
                    </TabsContent>

                    <TabsContent value="admin" className="m-0">
                      <AdminLoginContainer onLogin={onLogin} />
                    </TabsContent>
                  </div>
                </Tabs>

                <div className="pt-3 border-t border-green-100 text-center space-y-2 relative z-10">
                  <p className="text-xs sm:text-sm text-gray-600">Need assistance?</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm">
                    <a 
                      href="mailto:swiftcauseweb@gmail.com" 
                      className="text-green-600 hover:text-green-700 font-medium transition-colors hover:underline"
                    >
                      📩 swiftcauseweb@gmail.com
                    </a>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span className="text-gray-600">24/7 Support</span>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Secure • Encrypted • Verified</span>
                  </div>
                </div>
              </CardContent>
            </GlassMorphCard>

            {/* Easter egg display */}
            {showEasterEgg && (
              <div className="mt-4 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl animate-bounce text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Heart className="w-4 h-4 fill-white animate-pulse" />
                  <span className="text-sm font-semibold">
                    {formatCurrency(stats.totalRaised)} raised globally! 🌍
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
