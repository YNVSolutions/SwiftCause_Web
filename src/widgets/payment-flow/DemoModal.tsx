import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { Progress } from '../../shared/ui/progress';
import { Card, CardContent } from '../../shared/ui/card';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  Heart,
  CreditCard,
  Smartphone,
  BarChart3,
  Users,
  DollarSign,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Globe,
  ChevronRight
} from 'lucide-react';

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Add custom animation styles
const customStyles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.5s ease-out;
  }
  
  .animate-slide-down {
    animation: slide-down 0.4s ease-out;
  }
`;

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const demoSteps = [
    {
      title: "Campaign Discovery",
      description: "Users browse active campaigns with rich details and real-time progress tracking",
      features: ["Live donation tracking", "Campaign categories", "Impact metrics", "Progress visualization"],
      mockData: {
        campaign: "Clean Water Initiative",
        raised: "$32,450",
        goal: "$50,000",
        progress: 65,
        donors: 247,
        category: "Health & Environment"
      }
    },
    {
      title: "Smart Donation Interface", 
      description: "Intuitive donation forms with flexible payment options and recurring support",
      features: ["Quick amount selection", "Recurring donations", "Anonymous giving", "Custom amounts"],
      mockData: {
        amounts: [25, 50, 100, 250],
        selected: 100,
        recurring: "Monthly",
        customEnabled: true
      }
    },
    {
      title: "Secure Payment Processing",
      description: "Bank-level security with multiple payment methods and instant confirmation",
      features: ["PCI DSS compliant", "Fraud protection", "Instant receipts", "Multiple payment methods"],
      mockData: {
        method: "Credit Card",
        processing: true,
        security: "256-bit encryption",
        providers: ["Stripe", "SumUp", "Apple Pay"]
      }
    },
    {
      title: "Real-time Analytics",
      description: "Comprehensive insights and reporting dashboard for administrators",
      features: ["Live dashboards", "Donor analytics", "Campaign performance", "Export capabilities"],
      mockData: {
        totalRaised: "$125,430",
        campaigns: 12,
        growth: "+23%",
        kiosks: 8,
        conversion: "12.5%"
      }
    }
  ];

  const pauseDemo = useCallback(() => {
    setIsPlaying(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  const resetDemo = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  const startDemo = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    setIsPlaying(true);
    setCurrentStep(0);
    setProgress(0);
    
    const newInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1.5;
        if (newProgress >= 100) {
          setCurrentStep(curr => {
            const nextStep = curr + 1;
            if (nextStep >= demoSteps.length) {
              setIsPlaying(false);
              clearInterval(newInterval);
              return curr;
            }
            return nextStep;
          });
          return 0;
        }
        return newProgress;
      });
    }, 80);
    
    setIntervalId(newInterval);
  }, [intervalId, demoSteps.length]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setProgress(0);
    pauseDemo();
  }, [pauseDemo]);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  useEffect(() => {
    if (!open) {
      resetDemo();
    }
  }, [open, resetDemo]);

  const currentStepData = demoSteps[currentStep];

  return (
    <>
      <style>{customStyles}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[95vh] flex flex-col p-0 sm:!max-w-[95vw] sm:!w-[95vw]">
        {/* Header */}
        <div className="p-8 pb-6 border-b bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle animated background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-50" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-50" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-green-300 rounded-full animate-ping opacity-50" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
          </div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center space-x-3 text-3xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg animate-pulse relative">
                <Heart className="h-6 w-6 text-white" />
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-green-400 opacity-20 blur-xl animate-pulse"></div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Swift Cause Platform Demo
                </span>
                <Badge className="ml-3 bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1 animate-pulse">Interactive</Badge>
              </div>
            </DialogTitle>
            <DialogDescription className="text-lg mt-3 text-gray-600">
              Experience the complete donation platform workflow from donor discovery to payment processing
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Demo Controls */}
            <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] relative overflow-hidden group">
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-50/0 via-green-50/50 to-green-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="flex items-center space-x-4 relative z-10">
                <Button
                  onClick={isPlaying ? pauseDemo : startDemo}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white shadow-md h-12 px-6 text-base transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden group"
                >
                  {/* Button shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  
                  {isPlaying ? <Pause className="w-5 h-5 mr-2 relative z-10" /> : <Play className="w-5 h-5 mr-2 relative z-10" />}
                  <span className="relative z-10">{isPlaying ? 'Pause Demo' : 'Start Demo'}</span>
                </Button>
                
                <Button variant="outline" onClick={resetDemo} size="lg" className="h-12 px-6 text-base backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-green-300 hover:bg-green-50/50">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="flex items-center space-x-8 relative z-10">
                <span className="text-base font-medium text-gray-700">
                  Step {currentStep + 1} of {demoSteps.length}
                </span>
                <div className="flex space-x-3">
                  {demoSteps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={`w-4 h-4 rounded-full transition-all duration-300 relative ${
                        index === currentStep ? 'bg-green-600 scale-125 shadow-lg shadow-green-300 animate-pulse' : 
                        index < currentStep ? 'bg-green-500 hover:scale-110' : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                      }`}
                      title={step.title}
                    >
                      {/* Glow effect for active step */}
                      {index === currentStep && (
                        <div className="absolute inset-0 rounded-full bg-green-400 opacity-50 blur-md animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Demo Content */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
              {/* Left: Demo Screen */}
              <div className="xl:col-span-3 space-y-6">
                <div className="relative">
                  {/* Device Frame */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-3xl shadow-2xl">
                    <div className="bg-white rounded-2xl overflow-hidden backdrop-blur-sm">
                      {/* Device Header */}
                      <div className="bg-gray-50/90 backdrop-blur-md px-6 py-4 border-b flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                          <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="text-sm text-gray-500 font-mono">swift-cause.com</div>
                        <div className="w-20"></div>
                      </div>
                      
                      {/* Dynamic Demo Screen Content */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-white p-8 transition-all duration-500 ease-in-out">
                        {currentStep === 0 && (
                          <div className="h-full space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-semibold text-gray-900">Active Campaigns</h3>
                              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                Live
                              </Badge>
                            </div>
                            
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/95 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden group">
                              {/* Glow effect on hover */}
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-start space-x-5">
                                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse relative">
                                    <Heart className="w-8 h-8 text-white" />
                                    {/* Icon glow */}
                                    <div className="absolute inset-0 rounded-xl bg-green-400 opacity-30 blur-lg"></div>
                                  </div>
                                  <div className="flex-1 space-y-4">
                                    <div>
                                      <h4 className="text-xl font-semibold text-gray-900">{currentStepData.mockData.campaign as string}</h4>
                                      <Badge variant="outline" className="text-sm mt-2">{currentStepData.mockData.category as string}</Badge>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-base text-gray-600">
                                          {currentStepData.mockData.raised as string} raised
                                        </span>
                                        <span className="text-base font-semibold text-green-600">
                                          {currentStepData.mockData.progress as number}% complete
                                        </span>
                                      </div>
                                      <Progress value={currentStepData.mockData.progress as number} className="h-3" />
                                      <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span className="flex items-center space-x-2">
                                          <Users className="w-4 h-4" />
                                          <span>{currentStepData.mockData.donors as number} donors</span>
                                        </span>
                                        <span>Goal: {currentStepData.mockData.goal as string}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Button className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden group">
                              {/* Shimmer effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                              
                              <Heart className="w-5 h-5 mr-3 relative z-10" />
                              <span className="relative z-10">Support This Campaign</span>
                              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform relative z-10" />
                            </Button>
                          </div>
                        )}

                        {currentStep === 1 && (
                          <div className="h-full space-y-6 animate-fade-in">
                            <div className="text-center animate-slide-down">
                              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Choose Your Impact</h3>
                              <p className="text-base text-gray-600">Select an amount or enter a custom donation</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {(currentStepData.mockData.amounts as number[]).map((amount, idx) => (
                                <Button
                                  key={idx}
                                  variant={amount === currentStepData.mockData.selected ? "default" : "outline"}
                                  className={`h-16 text-lg transition-all duration-300 ${
                                    amount === currentStepData.mockData.selected 
                                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg transform scale-105 animate-pulse' 
                                      : 'hover:bg-gray-50 hover:scale-105 hover:border-green-300'
                                  }`}
                                >
                                  <DollarSign className="w-5 h-5 mr-2" />
                                  {amount}
                                </Button>
                              ))}
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <div className="flex-1">
                                  <span className="text-base font-medium text-green-900">
                                    Make this {currentStepData.mockData.recurring as string}
                                  </span>
                                  <p className="text-sm text-green-700">Maximize your impact with recurring donations</p>
                                </div>
                              </div>
                              
                              <Button className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group relative overflow-hidden">
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                                
                                <Heart className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform relative z-10" />
                                <span className="relative z-10">Donate ${currentStepData.mockData.selected as number}</span>
                                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform relative z-10" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {currentStep === 2 && (
                          <div className="h-full space-y-6 animate-fade-in">
                            <div className="text-center animate-slide-down">
                              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Secure Payment</h3>
                              <p className="text-base text-gray-600">Your donation is protected by enterprise-grade security</p>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="p-5 bg-green-50/80 backdrop-blur-sm rounded-xl border border-green-200 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <CreditCard className="w-6 h-6 text-green-600" />
                                    <span className="text-lg font-medium text-green-900">{currentStepData.mockData.method as string}</span>
                                  </div>
                                  <Badge className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Secure
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-3 text-base text-green-700">
                                  <CheckCircle className="w-5 h-5" />
                                  <span>{currentStepData.mockData.security as string}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-3">
                                
                                {currentStepData.mockData.providers?.map((provider, idx) => (
                                  <div key={idx} className="p-3 bg-gray-50/80 backdrop-blur-sm border rounded-xl text-center">
                                    <span className="text-sm font-medium text-gray-700">{provider}</span>
                                  </div>
                                ))}
                              </div>
                              
                              {isPlaying && (
                                <div className="flex items-center justify-center space-x-4 p-5 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl animate-fade-in shadow-lg shadow-green-200/50">
                                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-green-600 border-t-transparent"></div>
                                  <span className="text-base font-medium text-green-900 animate-pulse">Processing secure payment...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {currentStep === 3 && (
                          <div className="h-full space-y-6 animate-fade-in">
                            <div className="text-center animate-slide-down">
                              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Admin Dashboard</h3>
                              <p className="text-base text-gray-600">Real-time insights and comprehensive analytics</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm border border-green-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-green-300">
                                <div className="flex items-center space-x-3 mb-3">
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">Total Raised</span>
                                </div>
                                <div className="text-2xl font-bold text-green-900">{currentStepData.mockData.totalRaised as string}</div>
                                <div className="text-sm text-green-600">{currentStepData.mockData.growth as string} this month</div>
                              </div>
                              
                              <div className="p-4 bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm border border-green-200 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-green-300">
                                <div className="flex items-center space-x-3 mb-3">
                                  <BarChart3 className="w-5 h-5 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">Conversion</span>
                                </div>
                                <div className="text-2xl font-bold text-green-900">{currentStepData.mockData.conversion as string}</div>
                                <div className="text-sm text-green-600">Above average</div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 hover:bg-green-50/80 hover:border hover:border-green-200">
                                <div className="flex items-center space-x-3">
                                  <Users className="w-5 h-5 text-gray-600" />
                                  <span className="text-base">Active Campaigns</span>
                                </div>
                                <span className="text-base font-semibold">{currentStepData.mockData.campaigns as number}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105 hover:bg-green-50/80 hover:border hover:border-green-200">
                                <div className="flex items-center space-x-3">
                                  <Smartphone className="w-5 h-5 text-gray-600" />
                                  <span className="text-base">Active Kiosks</span>
                                </div>
                                <span className="text-base font-semibold">{currentStepData.mockData.kiosks as number}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {isPlaying && (
                    <div className="mt-6 animate-fade-in">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base text-gray-600">Demo Progress</span>
                        <span className="text-base text-green-600 font-medium animate-pulse">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-3 bg-gray-200 shadow-inner" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Step Information */}
              <div className="xl:col-span-2 space-y-8">
                <div className="sticky top-0 space-y-8">
                  <div className="animate-fade-in">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-green-200">
                        <span className="text-lg font-bold text-green-600">{currentStep + 1}</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">{currentStepData.title}</h3>
                    </div>
                    <p className="text-base text-gray-600 leading-relaxed">{currentStepData.description}</p>
                  </div>
                  
                  <div className="space-y-5 animate-fade-in">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" />
                      <span>Key Features</span>
                    </h4>
                    <ul className="space-y-4">
                      {currentStepData.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3 transition-all duration-300 hover:translate-x-2">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-base text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Platform Benefits */}
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50/90 to-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden">
                    {/* Subtle animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 to-emerald-50/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardContent className="p-6 relative z-10">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-500 animate-pulse" />
                        <span>Why Choose Swift Cause?</span>
                      </h4>
                      <div className="space-y-4 text-base">
                        <div className="flex items-center space-x-3 transition-all duration-300 hover:translate-x-2">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-yellow-600" />
                          </div>
                          <span className="text-gray-700">98.5% payment success rate</span>
                        </div>
                        <div className="flex items-center space-x-3 transition-all duration-300 hover:translate-x-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-gray-700">Bank-level security standards</span>
                        </div>
                        <div className="flex items-center space-x-3 transition-all duration-300 hover:translate-x-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="text-gray-700">Real-time analytics & insights</span>
                        </div>
                        <div className="flex items-center space-x-3 transition-all duration-300 hover:translate-x-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-gray-700">Multi-platform compatibility</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Call to Action */}
                  <div className="p-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl text-white shadow-lg backdrop-blur-sm relative overflow-hidden group">
                    {/* Animated pattern overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                      <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                    </div>
                    
                    <div className="relative z-10">
                      <h4 className="text-lg font-semibold mb-3">Ready to get started?</h4>
                      <p className="text-green-100 text-base mb-5">
                        Join hundreds of organizations already using Swift Cause to maximize their fundraising impact.
                      </p>
                      <Button 
                        className="w-full h-12 bg-white text-green-600 hover:bg-gray-50 shadow-md text-base transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                        onClick={() => onOpenChange(false)}
                      >
                        Start Your Free Trial
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

