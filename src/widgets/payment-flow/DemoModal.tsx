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

  const startDemo = () => {
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
  };

  const pauseDemo = () => {
    setIsPlaying(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const resetDemo = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isPlaying, currentStep, progress, intervalId]);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setProgress(0);
    if (isPlaying) {
      pauseDemo();
    }
  };

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[95vh] flex flex-col p-0 sm:!max-w-[95vw] sm:!w-[95vw]">
        {/* Header */}
        <div className="p-8 pb-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3 text-3xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Swift Cause Platform Demo
                </span>
                <Badge className="ml-3 bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1">Interactive</Badge>
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
            <div className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={isPlaying ? pauseDemo : startDemo}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md h-12 px-6 text-base"
                >
                  {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {isPlaying ? 'Pause Demo' : 'Start Demo'}
                </Button>
                
                <Button variant="outline" onClick={resetDemo} size="lg" className="h-12 px-6 text-base">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="flex items-center space-x-8">
                <span className="text-base font-medium text-gray-700">
                  Step {currentStep + 1} of {demoSteps.length}
                </span>
                <div className="flex space-x-3">
                  {demoSteps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        index === currentStep ? 'bg-indigo-600 scale-125' : 
                        index < currentStep ? 'bg-green-500' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      title={step.title}
                    />
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
                    <div className="bg-white rounded-2xl overflow-hidden">
                      {/* Device Header */}
                      <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                          <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="text-sm text-gray-500 font-mono">swift-cause.com</div>
                        <div className="w-20"></div>
                      </div>
                      
                      {/* Dynamic Demo Screen Content */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-white p-8">
                        {currentStep === 0 && (
                          <div className="h-full space-y-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-semibold text-gray-900">Active Campaigns</h3>
                              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                Live
                              </Badge>
                            </div>
                            
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex items-start space-x-5">
                                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Heart className="w-8 h-8 text-white" />
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
                                        <span className="text-base font-semibold text-indigo-600">
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
                            
                            <Button className="w-full h-14 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg text-lg">
                              <Heart className="w-5 h-5 mr-3" />
                              Support This Campaign
                              <ArrowRight className="w-5 h-5 ml-3" />
                            </Button>
                          </div>
                        )}

                        {currentStep === 1 && (
                          <div className="h-full space-y-6">
                            <div className="text-center">
                              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Choose Your Impact</h3>
                              <p className="text-base text-gray-600">Select an amount or enter a custom donation</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {(currentStepData.mockData.amounts as number[]).map((amount, idx) => (
                                <Button
                                  key={idx}
                                  variant={amount === currentStepData.mockData.selected ? "default" : "outline"}
                                  className={`h-16 text-lg ${
                                    amount === currentStepData.mockData.selected 
                                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform scale-105' 
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <DollarSign className="w-5 h-5 mr-2" />
                                  {amount}
                                </Button>
                              ))}
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-indigo-600" />
                                <div className="flex-1">
                                  <span className="text-base font-medium text-indigo-900">
                                    Make this {currentStepData.mockData.recurring as string}
                                  </span>
                                  <p className="text-sm text-indigo-700">Maximize your impact with recurring donations</p>
                                </div>
                              </div>
                              
                              <Button className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg text-lg">
                                <Heart className="w-6 h-6 mr-3" />
                                Donate ${currentStepData.mockData.selected as number}
                                <ArrowRight className="w-6 h-6 ml-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {currentStep === 2 && (
                          <div className="h-full space-y-6">
                            <div className="text-center">
                              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Secure Payment</h3>
                              <p className="text-base text-gray-600">Your donation is protected by enterprise-grade security</p>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="p-5 bg-green-50 border border-green-200 rounded-xl">
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
                                  <div key={idx} className="p-3 bg-gray-50 border rounded-xl text-center">
                                    <span className="text-sm font-medium text-gray-700">{provider}</span>
                                  </div>
                                ))}
                              </div>
                              
                              {isPlaying && (
                                <div className="flex items-center justify-center space-x-4 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-blue-600 border-t-transparent"></div>
                                  <span className="text-base font-medium text-blue-900">Processing secure payment...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {currentStep === 3 && (
                          <div className="h-full space-y-6">
                            <div className="text-center">
                              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Admin Dashboard</h3>
                              <p className="text-base text-gray-600">Real-time insights and comprehensive analytics</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                                <div className="flex items-center space-x-3 mb-3">
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">Total Raised</span>
                                </div>
                                <div className="text-2xl font-bold text-green-900">{currentStepData.mockData.totalRaised as string}</div>
                                <div className="text-sm text-green-600">{currentStepData.mockData.growth as string} this month</div>
                              </div>
                              
                              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                                <div className="flex items-center space-x-3 mb-3">
                                  <BarChart3 className="w-5 h-5 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-700">Conversion</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-900">{currentStepData.mockData.conversion as string}</div>
                                <div className="text-sm text-blue-600">Above average</div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center space-x-3">
                                  <Users className="w-5 h-5 text-gray-600" />
                                  <span className="text-base">Active Campaigns</span>
                                </div>
                                <span className="text-base font-semibold">{currentStepData.mockData.campaigns as number}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
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
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base text-gray-600">Demo Progress</span>
                        <span className="text-base text-indigo-600 font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-3 bg-gray-200" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Step Information */}
              <div className="xl:col-span-2 space-y-8">
                <div className="sticky top-0 space-y-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-indigo-600">{currentStep + 1}</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">{currentStepData.title}</h3>
                    </div>
                    <p className="text-base text-gray-600 leading-relaxed">{currentStepData.description}</p>
                  </div>
                  
                  <div className="space-y-5">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Key Features</span>
                    </h4>
                    <ul className="space-y-4">
                      {currentStepData.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-base text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Platform Benefits */}
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span>Why Choose Swift Cause?</span>
                      </h4>
                      <div className="space-y-4 text-base">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-yellow-600" />
                          </div>
                          <span className="text-gray-700">98.5% payment success rate</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-gray-700">Bank-level security standards</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-gray-700">Real-time analytics & insights</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-gray-700">Multi-platform compatibility</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Call to Action */}
                  <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg">
                    <h4 className="text-lg font-semibold mb-3">Ready to get started?</h4>
                    <p className="text-indigo-100 text-base mb-5">
                      Join hundreds of organizations already using Swift Cause to maximize their fundraising impact.
                    </p>
                    <Button 
                      className="w-full h-12 bg-white text-indigo-600 hover:bg-gray-50 shadow-md text-base"
                      onClick={() => onOpenChange(false)}
                    >
                      Start Your Free Trial
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

