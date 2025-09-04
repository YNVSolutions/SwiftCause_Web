import React, { useState } from 'react';
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
  BarChart3,
  Lock,
  Cloud,
  CheckSquare,
  Clock,
  DollarSign
} from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

interface SignupScreenProps {
  onSignup: (data: SignupFormData) => void;
  onBack: () => void;
  onLogin: () => void;
}

interface SignupFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  
  // Organization Information
  organizationName: string;
  organizationType: string;
  organizationSize: string;
  organizationId: string; // Added organizationId
  website?: string;
  
  // Account Setup
  password: string;
  confirmPassword: string;
  
  // Preferences
  interestedFeatures: string[];
  hearAboutUs: string;
  
  // Legal
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

const auth = getAuth();
const firestore = getFirestore();

export function SignupScreen({ onSignup, onBack, onLogin }: SignupScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    organizationName: '',
    organizationType: '',
    organizationSize: '',
    organizationId: '', // Added organizationId
    website: '',
    password: '',
    confirmPassword: '',
    interestedFeatures: [],
    hearAboutUs: '',
    agreeToTerms: false,
    agreeToMarketing: false
  });

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

  const updateFormData = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    } else if (step === 2) {
      if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
      if (!formData.organizationType) newErrors.organizationType = 'Organization type is required';
      if (!formData.organizationSize) newErrors.organizationSize = 'Organization size is required';
    } else if (step === 3) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    } 

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Updated handleSignup to include initial data for permissions and isActive
  const handleSignup = async (data: SignupFormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const userId = userCredential.user.uid;

      await setDoc(doc(firestore, 'users', userId), {
        username: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: 'admin',
        permissions: ['view_dashboard', 'manage_permissions', 'create_user', 'edit_user', 'delete_user', 'view_campaigns', 'create_campaign', 'edit_campaign', 'delete_campaign', 'view_kiosks', 'create_kiosk', 'edit_kiosk', 'delete_kiosk', 'assign_campaigns', 'view_donations', 'export_donations', 'view_users'], 
        isActive: true,
        createdAt: new Date().toISOString(),
        organizationId: data.organizationId
      });

      await setDoc(doc(firestore, 'organizations', data.organizationId), {
        name: data.organizationName,
        type: data.organizationType,
        size: data.organizationSize,
        website: data.website,
        createdAt: new Date().toISOString()
      });

      alert('Signup successful!');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Signup error:', error);
        alert(`Signup failed: ${error.message}`);
      } else {
        console.error('Unknown signup error:', error);
        alert('Signup failed due to an unknown error.');
      }
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      handleSignup({
        ...formData,
        organizationId: formData.organizationName.replace(/\s+/g, '-').toLowerCase() // Generate organizationId
      });
    }
  };

  const toggleFeature = (featureId: string) => {
    const current = formData.interestedFeatures;
    const updated = current.includes(featureId)
      ? current.filter(id => id !== featureId)
      : [...current, featureId];
    updateFormData('interestedFeatures', updated);
  };

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
              <div className="h-10 w-10">
               
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Swift Cause</h1>
                <p className="text-xs text-gray-600">Account Registration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              <div className="text-sm text-gray-600">
                Already have an account?{' '}
                <button onClick={onLogin} className="text-indigo-600 hover:text-indigo-700 font-medium">
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
          </div>

          {/* Right side - Registration Form */}
          <div className="lg:col-span-5 flex items-start justify-center py-20 lg:py-32">
            <div className="w-full max-w-md">
              {/* Mobile header */}
              <div className="lg:hidden text-center mb-8">
                <div className="mx-auto mb-4 h-16 w-16">
                  
                </div>
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
                            value={formData.firstName}
                            onChange={(e) => updateFormData('firstName', e.target.value)}
                            className={errors.firstName ? 'border-red-500' : ''}
                          />
                          {errors.firstName && (
                            <p className="text-xs text-red-600 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => updateFormData('lastName', e.target.value)}
                            className={errors.lastName ? 'border-red-500' : ''}
                          />
                          {errors.lastName && (
                            <p className="text-xs text-red-600 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="you@organization.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Organization Information */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                          <Building className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Organization Details</h3>
                        <p className="text-sm text-gray-600">Tell us about your organization</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="organizationName">Organization Name</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="organizationName"
                            value={formData.organizationName}
                            onChange={(e) => updateFormData('organizationName', e.target.value)}
                            className={`pl-10 ${errors.organizationName ? 'border-red-500' : ''}`}
                            placeholder="Your Organization Name"
                          />
                        </div>
                        {errors.organizationName && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.organizationName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="organizationType">Organization Type</Label>
                        <Select 
                          value={formData.organizationType} 
                          onValueChange={(value) => updateFormData('organizationType', value)}
                        >
                          <SelectTrigger className={errors.organizationType ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select organization type" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizationTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.organizationType && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.organizationType}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="organizationSize">Organization Size</Label>
                        <Select 
                          value={formData.organizationSize} 
                          onValueChange={(value) => updateFormData('organizationSize', value)}
                        >
                          <SelectTrigger className={errors.organizationSize ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select organization size" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizationSizes.map((size) => (
                              <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.organizationSize && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.organizationSize}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => updateFormData('website', e.target.value)}
                            className="pl-10"
                            placeholder="https://www.organization.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Account Security */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                          <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                        <p className="text-sm text-gray-600">Create a secure password</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => updateFormData('password', e.target.value)}
                            className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                            placeholder="Create a strong password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.password}
                          </p>
                        )}
                        <p className="text-xs text-gray-600">Must be at least 8 characters</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                            className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                            placeholder="Confirm your password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Preferences & Terms */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Almost Done!</h3>
                        <p className="text-sm text-gray-600">Tell us what you're interested in</p>
                      </div>

                      <div className="space-y-4">
                        <Label>Features you're interested in (optional)</Label>
                        <div className="grid grid-cols-1 gap-3">
                          {featureOptions.map((feature) => (
                            <div 
                              key={feature.id} 
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                formData.interestedFeatures.includes(feature.id)
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleFeature(feature.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  checked={formData.interestedFeatures.includes(feature.id)}
                                  onChange={() => toggleFeature(feature.id)}
                                />
                                <div>
                                  <div className="font-medium text-sm">{feature.label}</div>
                                  <div className="text-xs text-gray-600">{feature.description}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>How did you hear about us?</Label>
                        <Select 
                          value={formData.hearAboutUs} 
                          onValueChange={(value) => updateFormData('hearAboutUs', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {hearAboutUsOptions.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                          />
                          <div className="text-sm">
                            <label htmlFor="agreeToTerms" className="cursor-pointer">
                              I agree to the{' '}
                              <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>
                              {' '}and{' '}
                              <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                            </label>
                            {errors.agreeToTerms && (
                              <p className="text-xs text-red-600 flex items-center mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.agreeToTerms}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="agreeToMarketing"
                            checked={formData.agreeToMarketing}
                            onCheckedChange={(checked) => updateFormData('agreeToMarketing', checked)}
                          />
                          <label htmlFor="agreeToMarketing" className="text-sm cursor-pointer">
                            I'd like to receive updates about new features and fundraising tips
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    {currentStep > 1 ? (
                      <Button variant="outline" onClick={handlePrevious}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    ) : (
                      <div />
                    )}

                    {currentStep < 4 ? (
                      <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700">
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
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