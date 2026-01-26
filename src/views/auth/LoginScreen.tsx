import { useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { Button } from '../../shared/ui/button';

import {
  Heart,
  ArrowLeft,
  UserCog,
} from 'lucide-react';
import { UserRole, KioskSession, AdminSession } from '../../shared/types';
import { KioskLoginContainer } from '../../features/auth-by-kiosk';
import { AdminLoginContainer } from '../../features/auth-by-email';

// Phase 1-2 Creative Components
import { GlassMorphCard } from './cards/GlassMorphCard';
import { LiquidFillProgress } from './cards/LiquidFillProgress';
import { FeaturedCampaign } from './components/FeaturedCampaign';
import { useFeaturedCampaigns } from './hooks/useFeaturedCampaigns';

interface LoginScreenProps {
  onLogin: (role: UserRole, sessionData?: KioskSession | AdminSession) => void;
  onGoBackToHome: () => void;
}

export function LoginScreen({ onLogin, onGoBackToHome }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'kiosk' | 'admin'>('admin');
  const [formState, setFormState] = useState<'idle' | 'typing' | 'error' | 'success'>('idle');
  const [formProgress, setFormProgress] = useState(0);

  // Fetch real campaign data from Firestore
  const { campaigns, loading, error } = useFeaturedCampaigns(3);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
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

            {/* Logo */}
            <button
              onClick={onGoBackToHome}
              className="flex items-center space-x-3 mb-4 text-left hover:opacity-90 transition-all duration-300 hover:scale-105 group"
            >
              <div className="flex h-14 w-14 items-center justify-center transform transition-transform group-hover:scale-110">
                <img src="/logo.png" className="h-14 w-14 rounded-xl shadow-lg" alt="Swift Cause Logo" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  Swift Cause
                </h1>
                <p className="text-sm text-green-600 font-medium">
                  Modern Donation Platform
                </p>
              </div>
            </button>

            {/* Professional greeting */}
            <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-4 leading-tight animate-fade-in">
              Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">Swift Cause</span>
            </h2>

            <p className="text-base xl:text-lg text-gray-600 mb-8 animate-fade-in-delay">
              Comprehensive donation management platform trusted by organizations worldwide.
            </p>

            {/* Featured Campaign - Real data from Firestore */}
            {loading ? (
              <div className="w-full max-w-lg mx-auto mb-8 p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-64 bg-white/60 rounded-3xl" />
                </div>
              </div>
            ) : error ? (
              <div className="w-full max-w-lg mx-auto mb-8 p-8 text-center text-gray-500">
                <p className="text-sm">Unable to load campaigns</p>
              </div>
            ) : (
              <FeaturedCampaign
                campaigns={campaigns}
                autoRotateInterval={6000}
                showNavigation={true}
              />
            )}

            {/* Testimonial - Matching login form style */}
            <div className="mt-8 animate-fade-in-delay-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
                {/* Accent line matching the green theme */}
                <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4" />

                {/* Quote text */}
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  "We make a living by what we get, but we make a life by what we give."
                </p>

                {/* Author */}
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Winston Churchill</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-4 sm:p-6 lg:p-6 xl:p-8">
          <div className="w-full max-w-md animate-slide-in-right">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-6">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                Welcome Back
              </h2>
              <p className="text-sm text-gray-600">Swift Cause Platform</p>
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
                      swiftcauseweb@gmail.com
                    </a>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <span className="text-gray-600">24/7 Support</span>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Secure - Encrypted - Verified</span>
                  </div>
                </div>
              </CardContent>
            </GlassMorphCard>
          </div>
        </div>
      </div>
    </div>
  );
}
