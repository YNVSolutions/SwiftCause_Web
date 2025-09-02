import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Heart,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  Building,
  Mail,
  Phone,
  User,
  Globe,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
  Star,
  Award,
  TrendingUp,
  Target,
  Lock,
  Cloud,
  CheckSquare,
  DollarSign
} from 'lucide-react';

export function SignupScreen() {
  const currentStep = 1; // Statically set to the first step

  const organizationTypes = [
    'Non-profit Organization',
    'Healthcare Institution', 
    'Educational Institution',
    'Religious Organization',
    'Government Agency',
    'Corporate Foundation',
    'Other'
  ];

  const organizationSizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-1000 employees',
    '1000+ employees'
  ];

  const featureOptions = [
    { id: 'kiosks', label: 'Donation Kiosks', description: 'Touch-friendly donation interfaces' },
    { id: 'analytics', label: 'Advanced Analytics', description: 'Real-time insights and reporting' },
    { id: 'campaigns', label: 'Campaign Management', description: 'Flexible campaign configuration' },
    { id: 'security', label: 'Enterprise Security', description: 'Bank-level security features' },
    { id: 'mobile', label: 'Mobile Optimization', description: 'Mobile-first design approach' },
    { id: 'integrations', label: 'API Integrations', description: 'Connect with existing systems' }
  ];

  const hearAboutUsOptions = [
    'Search Engine (Google, Bing)',
    'Social Media',
    'Referral from colleague',
    'Conference/Event',
    'Industry publication',
    'Partner recommendation',
    'Other'
  ];

  const benefits = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      title: 'Quick Setup',
      description: 'Get started in under 10 minutes'
    },
    {
      icon: <Shield className="w-5 h-5 text-green-600" />,
      title: '14-Day Free Trial',
      description: 'No credit card required'
    },
    {
      icon: <Award className="w-5 h-5 text-blue-600" />,
      title: 'Dedicated Support',
      description: 'Expert onboarding assistance'
    }
  ];

  const platformStats = [
    {
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      value: '$15.8M+',
      label: 'Total Raised',
      description: 'Funds raised through our platform'
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      value: '500+',
      label: 'Organizations',
      description: 'Trusted by organizations globally'
    },
    {
      icon: <Heart className="w-6 h-6 text-red-600" />,
      value: '47K+',
      label: 'Donors',
      description: 'People making a difference'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      value: '98.5%',
      label: 'Success Rate',
      description: 'Payment processing reliability'
    }
  ];

  const complianceFeatures = [
    {
      icon: Lock,
      title: 'PCI DSS',
      description: 'Level 1 compliance'
    },
    {
      icon: Shield,
      title: 'SSL/TLS',
      description: '256-bit encryption'
    },
    {
      icon: CheckSquare,
      title: 'GDPR',
      description: 'Privacy compliant'
    },
    {
      icon: Cloud,
      title: 'SOC 2',
      description: 'Type II audited'
    }
  ];

  const stepProgress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Swift Cause</h1>
                <p className="text-xs text-gray-600">Account Registration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => {}} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              <div className="text-sm text-gray-600">
                Already have an account?{' '}
                <button onClick={() => {}} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
          {/* Left side - Benefits & Information */}
          <div className="lg:col-span-7 flex flex-col justify-center py-20 lg:py-32 space-y-12">
            {/* Hero Section */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                  <Award className="w-4 h-4 mr-2" />
                  Trusted by 500+ organizations worldwide
                </div>
                
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  Join the<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> fundraising</span><br />revolution
                </h2>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Transform your organization's fundraising with intelligent donation technology. 
                  Get started with your free trial today and see why leading nonprofits choose Swift Cause.
                </p>
              </div>

              {/* Platform Statistics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {platformStats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      {stat.icon}
                      <Badge variant="secondary" className="text-xs">Live</Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">{stat.label}</div>
                    <p className="text-xs text-gray-600">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Section */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Why choose Swift Cause?</h3>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border shadow-sm flex items-center justify-center">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Enterprise-Grade Security</h3>
                <p className="text-gray-600">Your data is protected by industry-leading security measures</p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {complianceFeatures.map((feature, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <div className="w-10 h-10 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <feature.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Registration Progress</span>
                <span className="text-sm text-gray-600">Step {currentStep} of 4</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Personal Info</span>
                <span>Organization</span>
                <span>Security</span>
                <span>Preferences</span>
              </div>
            </div>

            {/* Testimonial */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Swift Cause transformed our entire donation process. Setup was incredibly easy and our donations increased by 340% in the first quarter!"
                </p>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
                      alt="Sarah Chen"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-600">Development Director</div>
                    <div className="text-sm text-indigo-600">Global Health Initiative</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Registration Form */}
          <div className="lg:col-span-5 flex items-start justify-center py-20 lg:py-32">
            <div className="w-full max-w-md">
              {/* Mobile header */}
              <div className="lg:hidden text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                <p className="text-gray-600">Join the fundraising revolution</p>
              </div>

              <Card className="bg-white shadow-xl border border-gray-200">
                <CardHeader className="text-center space-y-2">
                  <div className="hidden lg:block">
                    <CardTitle className="text-xl lg:text-2xl">Create Your Account</CardTitle>
                    <CardDescription>Step {currentStep} of 4 - Let's get you started</CardDescription>
                  </div>
                  <div className="lg:hidden">
                    <CardDescription>Step {currentStep} of 4</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        <p className="text-sm text-gray-600">Tell us about yourself</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value=""
                            onChange={() => {}}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value=""
                            onChange={() => {}}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value=""
                            onChange={() => {}}
                            className="pl-10"
                            placeholder="you@organization.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            value=""
                            onChange={() => {}}
                            className="pl-10"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  
                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    {currentStep > 1 ? (
                      <Button variant="outline" onClick={() => {}}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    ) : (
                      <div />
                    )}

                    {currentStep < 4 ? (
                      <Button onClick={() => {}} className="bg-indigo-600 hover:bg-indigo-700">
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={() => {}} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                        Create Account
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}