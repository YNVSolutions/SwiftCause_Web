import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { Progress } from '../../shared/ui/progress';
import { Card, CardContent } from '../../shared/ui/card';
import { 
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
      <DialogContent className="!max-w-[95vw] !w-[95vw] h-[95vh] flex flex-col p-0 sm:!max-w-[95vw] sm:!w-[95vw] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm relative overflow-hidden flex-shrink-0">
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
            <DialogTitle className="flex items-center space-x-2 sm:space-x-3 text-xl sm:text-2xl">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg animate-pulse relative">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-green-400 opacity-20 blur-xl animate-pulse"></div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Swift Cause Platform Demo
                </span>
                <Badge className="ml-2 sm:ml-3 bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 animate-pulse">Interactive</Badge>
              </div>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base mt-2 text-gray-600">
              Experience the complete donation platform workflow from donor discovery to payment processing
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 flex flex-col overflow-hidden">
            {/* Demo Controls */}
            <div className="flex items-center justify-between p-4 sm:p-6 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] relative overflow-hidden group flex-shrink-0">
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-50/0 via-green-50/50 to-green-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
                <Button
                  onClick={isPlaying ? pauseDemo : startDemo}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white shadow-md h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden group"
                >
                  {/* Button shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 relative z-10" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 relative z-10" />}
                  <span className="relative z-10">{isPlaying ? 'Pause Demo' : 'Start Demo'}</span>
                </Button>
                
                <Button variant="outline" onClick={resetDemo} size="lg" className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-green-300 hover:bg-green-50/50">
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Reset
                </Button>
              </div>

              <div className="flex items-center space-x-4 sm:space-x-8 relative z-10">
                <span className="text-sm sm:text-base font-medium text-gray-700">
                  Step {currentStep + 1} of {demoSteps.length}
                </span>
                <div className="flex space-x-2 sm:space-x-3">
                  {demoSteps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 relative ${
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
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8 flex-1 min-h-0 overflow-hidden">
              {/* Left: Demo Screen */}
              <div className="xl:col-span-3 flex flex-col min-h-0">
                <div className="relative flex-1 min-h-0">
                  {/* Device Frame */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl h-full flex flex-col">
                    <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-sm flex-1 flex flex-col">
                      {/* Device Header */}
                      <div className="bg-gray-50/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 border-b flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-400 rounded-full"></div>
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-yellow-400 rounded-full"></div>
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">swift-cause.com</div>
                        <div className="w-10 sm:w-16"></div>
                      </div>
                      
                      {/* Dynamic Demo Screen Content */}
                      <div className="flex-1 bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 overflow-y-auto">
                        {currentStep === 0 && (
                          <div className="h-full space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-semibold text-gray-900">Active Campaigns</h3>
                              <Badge className="bg-green-100 text-green-800 border-green-200 px-2 py-0.5 text-xs">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                                Live
                              </Badge>
                            </div>
                            
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/95 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden group">
                              {/* Glow effect on hover */}
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              
                              <CardContent className="p-4 relative z-10">
                                <div className="flex items-start space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg animate-pulse relative flex-shrink-0">
                                    <Heart className="w-6 h-6 text-white" />
                                    {/* Icon glow */}
                                    <div className="absolute inset-0 rounded-lg bg-green-400 opacity-30 blur-lg"></div>
                                  </div>
                                  <div className="flex-1 space-y-2.5">
                                    <div>
                                      <h4 className="text-lg font-semibold text-gray-900">{currentStepData.mockData.campaign as string}</h4>
                                      <Badge variant="outline" className="text-xs mt-1.5">{currentStepData.mockData.category as string}</Badge>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                          {currentStepData.mockData.raised as string} raised
                                        </span>
                                        <span className="text-sm font-semibold text-green-600">
                                          {currentStepData.mockData.progress as number}% complete
                                        </span>
                                      </div>
                                      <Progress value={currentStepData.mockData.progress as number} className="h-2" />
                                      <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span className="flex items-center space-x-1.5">
                                          <Users className="w-3.5 h-3.5" />
                                          <span>{currentStepData.mockData.donors as number} donors</span>
                                        </span>
                                        <span>Goal: {currentStepData.mockData.goal as string}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Button className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg text-base transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden group">
                              {/* Shimmer effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                              
                              <Heart className="w-4 h-4 mr-2 relative z-10" />
                              <span className="relative z-10">Support This Campaign</span>
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                            </Button>
                          </div>
                        )}

                        {currentStep === 1 && (
                          <div className="h-full space-y-4 animate-fade-in">
                            <div className="text-center animate-slide-down">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Impact</h3>
                              <p className="text-sm text-gray-600">Select an amount or enter a custom donation</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              {(currentStepData.mockData.amounts as number[]).map((amount, idx) => (
                                <Button
                                  key={idx}
                                  variant={amount === currentStepData.mockData.selected ? "default" : "outline"}
                                  className={`h-12 text-base transition-all duration-300 ${
                                    amount === currentStepData.mockData.selected 
                                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg transform scale-105 animate-pulse' 
                                      : 'hover:bg-gray-50 hover:scale-105 hover:border-green-300'
                                  }`}
                                >
                                  <DollarSign className="w-4 h-4 mr-1.5" />
                                  {amount}
                                </Button>
                              ))}
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3 p-3 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-green-900">
                                    Make this {currentStepData.mockData.recurring as string}
                                  </span>
                                  <p className="text-xs text-green-700">Maximize your impact with recurring donations</p>
                                </div>
                              </div>
                              
                              <Button className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg text-base transition-all duration-300 hover:scale-105 hover:shadow-xl group relative overflow-hidden">
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                                
                                <Heart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform relative z-10" />
                                <span className="relative z-10">Donate ${currentStepData.mockData.selected as number}</span>
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {currentStep === 2 && (
                          <div className="h-full space-y-4 animate-fade-in">
                            <div className="text-center animate-slide-down">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payment</h3>
                              <p className="text-sm text-gray-600">Your donation is protected by enterprise-grade security</p>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="p-3 bg-green-50/80 backdrop-blur-sm rounded-lg border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <CreditCard className="w-5 h-5 text-green-600" />
                                    <span className="text-base font-medium text-green-900">{currentStepData.mockData.method as string}</span>
                                  </div>
                                  <Badge className="bg-green-100 text-green-800 border-green-300 px-2 py-0.5 text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Secure
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-green-700">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>{currentStepData.mockData.security as string}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2">
                                
                                {currentStepData.mockData.providers?.map((provider, idx) => (
                                  <div key={idx} className="p-2 bg-gray-50/80 backdrop-blur-sm border rounded-lg text-center">
                                    <span className="text-xs font-medium text-gray-700">{provider}</span>
                                  </div>
                                ))}
                              </div>
                              
                              {isPlaying && (
                                <div className="flex items-center justify-center space-x-3 p-3 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-lg animate-fade-in shadow-lg shadow-green-200/50">
                                  <div className="animate-spin rounded-full h-5 w-5 border-3 border-green-600 border-t-transparent"></div>
                                  <span className="text-sm font-medium text-green-900 animate-pulse">Processing secure payment...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {currentStep === 3 && (
                          <div className="h-full space-y-4 animate-fade-in">
                            <div className="text-center animate-slide-down">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Dashboard</h3>
                              <p className="text-sm text-gray-600">Real-time insights and comprehensive analytics</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm border border-green-200 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-green-300">
                                <div className="flex items-center space-x-2 mb-2">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-medium text-green-700">Total Raised</span>
                                </div>
                                <div className="text-xl font-bold text-green-900">{currentStepData.mockData.totalRaised as string}</div>
                                <div className="text-xs text-green-600">{currentStepData.mockData.growth as string} this month</div>
                              </div>
                              
                              <div className="p-3 bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm border border-green-200 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-green-300">
                                <div className="flex items-center space-x-2 mb-2">
                                  <BarChart3 className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-medium text-green-700">Conversion</span>
                                </div>
                                <div className="text-xl font-bold text-green-900">{currentStepData.mockData.conversion as string}</div>
                                <div className="text-xs text-green-600">Above average</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2.5 bg-gray-50/80 backdrop-blur-sm rounded-lg transition-all duration-300 hover:scale-105 hover:bg-green-50/80 hover:border hover:border-green-200">
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm">Active Campaigns</span>
                                </div>
                                <span className="text-sm font-semibold">{currentStepData.mockData.campaigns as number}</span>
                              </div>
                              <div className="flex items-center justify-between p-2.5 bg-gray-50/80 backdrop-blur-sm rounded-lg transition-all duration-300 hover:scale-105 hover:bg-green-50/80 hover:border hover:border-green-200">
                                <div className="flex items-center space-x-2">
                                  <Smartphone className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm">Active Kiosks</span>
                                </div>
                                <span className="text-sm font-semibold">{currentStepData.mockData.kiosks as number}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {isPlaying && (
                    <div className="mt-3 sm:mt-4 animate-fade-in flex-shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-gray-600">Demo Progress</span>
                        <span className="text-xs sm:text-sm text-green-600 font-medium animate-pulse">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1 sm:h-1.5 bg-gray-200 shadow-inner" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Step Information */}
              <div className="xl:col-span-2 flex flex-col min-h-0 h-full">
                {/* Full height container with gradient background */}
                <div className="h-full bg-gradient-to-br from-gray-50/50 via-green-50/30 to-emerald-50/50 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm border border-gray-200/50">
                  {/* Decorative background elements */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-10 right-10 w-40 h-40 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 left-10 w-40 h-40 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                  </div>
                  
                  {/* Floating particles */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-40" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-40" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
                    <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-green-300 rounded-full animate-ping opacity-40" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
                  </div>

                  {/* Top Section: Step Info */}
                  <div className="space-y-3 relative z-10">
                    <div className="animate-fade-in">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg flex-shrink-0 relative">
                          <span className="text-sm sm:text-base font-bold text-white relative z-10">{currentStep + 1}</span>
                          {/* Glow effect */}
                          <div className="absolute inset-0 rounded-xl bg-green-400 opacity-30 blur-md animate-pulse"></div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{currentStepData.title}</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{currentStepData.description}</p>
                    </div>
                    
                    <div className="space-y-2 animate-fade-in">
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 animate-pulse" />
                        <span>Key Features</span>
                      </h4>
                      <ul className="space-y-2">
                        {currentStepData.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2 transition-all duration-300 hover:translate-x-1">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Middle Section: Platform Benefits */}
                  <div className="relative z-10">
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01] relative overflow-hidden">
                      {/* Subtle animated gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-50/30 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <CardContent className="p-3 sm:p-4 relative z-10">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center space-x-1.5">
                          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 animate-pulse" />
                          <span>Why Choose Swift Cause?</span>
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 transition-all duration-300 hover:translate-x-1">
                            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                              <Zap className="w-3 h-3 text-yellow-600" />
                            </div>
                            <span className="text-gray-700">98.5% payment success rate</span>
                          </div>
                          <div className="flex items-center space-x-2 transition-all duration-300 hover:translate-x-1">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <Shield className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-gray-700">Bank-level security standards</span>
                          </div>
                          <div className="flex items-center space-x-2 transition-all duration-300 hover:translate-x-1">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <BarChart3 className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-gray-700">Real-time analytics & insights</span>
                          </div>
                          <div className="flex items-center space-x-2 transition-all duration-300 hover:translate-x-1">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <Globe className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-gray-700">Multi-platform compatibility</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Bottom Section: Call to Action */}
                  <div className="relative z-10">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl text-white shadow-lg backdrop-blur-sm relative overflow-hidden group">
                      {/* Animated pattern overlay */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                      
                      {/* Floating particles effect */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                      </div>
                      
                      <div className="relative z-10">
                        <h4 className="text-sm sm:text-base font-semibold mb-1.5">Ready to get started?</h4>
                        <p className="text-green-100 text-xs sm:text-sm mb-2.5">
                          Join hundreds of organizations using Swift Cause.
                        </p>
                        <Button 
                          className="w-full h-9 sm:h-10 bg-white text-green-600 hover:bg-gray-50 shadow-md text-xs sm:text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg group relative overflow-hidden"
                          onClick={() => onOpenChange(false)}
                        >
                          {/* Button shimmer */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-100/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                          
                          <span className="relative z-10">Start Your Free Trial</span>
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 group-hover:translate-x-1 transition-transform relative z-10" />
                        </Button>
                      </div>
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
