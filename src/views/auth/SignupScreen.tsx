import React, { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Checkbox } from '../../shared/ui/checkbox';
import { Progress } from '../../shared/ui/progress';
import { CurrencyRequestDialog } from '../../shared/ui/CurrencyRequestDialog';
import { PersistentNotification } from '../../shared/ui/PersistentNotification';
import { submitCurrencyRequest } from '../../shared/api/firestoreService';
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
import { ORGANIZATION_TYPES, ORGANIZATION_SIZES, CURRENCY_OPTIONS } from '../../shared/config';

interface SignupScreenProps {
  onSignup: (data: SignupFormData) => Promise<void>;
  onBack: () => void;
  onLogin: () => void;
  onViewTerms: () => void;
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
  organizationId: string; 
  website?: string;
  stripe?: {
    accountId: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  };
  
  // Account Setup
  password: string;
  confirmPassword: string;
  
  // Preferences
  currency: string;
  
  // Legal
  agreeToTerms: boolean;
}

const auth = getAuth();
const firestore = getFirestore();

export function SignupScreen({ onSignup, onBack, onLogin, onViewTerms }: SignupScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [requestDifferentCurrency, setRequestDifferentCurrency] = useState(false);
  const [currencyRequestSubmitted, setCurrencyRequestSubmitted] = useState(false);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    organizationName: '',
    organizationType: '',
    organizationSize: '',
    organizationId: '', 
    website: '',
    password: '',
    confirmPassword: '',
    currency: 'GBP', 
    agreeToTerms: false
  });

  const organizationTypes = ORGANIZATION_TYPES;
  const organizationSizes = ORGANIZATION_SIZES;

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
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    } else if (step === 2) {
      if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
      if (!formData.organizationType) newErrors.organizationType = 'Organization type is required';
      if (!formData.organizationSize) newErrors.organizationSize = 'Organization size is required';
    }  else if (step === 3) {
      // Currency is hardcoded to GBP, no validation needed
      // But if they checked the box, they must complete the request
      if (requestDifferentCurrency && !currencyRequestSubmitted) {
        newErrors.currency = 'Please complete your currency request or uncheck the option';
      }
    } else if (step === 4) {
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
  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSignup({
        ...formData,
        organizationId: formData.organizationName.replace(/\s+/g, '-').toLowerCase(), // Generate organizationId
        stripe: {
          accountId: '',
          chargesEnabled: false,
          payoutsEnabled: false,
        },
      });
    }
  };

  const handleCurrencyRequest = async (currency: string, notes: string) => {
    try {
      await submitCurrencyRequest({
        email: formData.email,
        requestedCurrency: currency,
        notes: notes,
        organizationName: formData.organizationName,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      // Mark as submitted
      setCurrencyRequestSubmitted(true);
      
      // Show persistent notification
      setShowSuccessNotification(true);
      
    } catch (error) {
      console.error('Error submitting currency request:', error);
      throw new Error('Failed to submit currency request. Please try again.');
    }
  };

  const handleCurrencyCheckboxChange = (checked: boolean) => {
    if (checked) {
      // User wants to request different currency
      setRequestDifferentCurrency(true);
      setShowCurrencyDialog(true);
    } else {
      // User unchecked - reset everything
      setRequestDifferentCurrency(false);
      setCurrencyRequestSubmitted(false);
      setShowCurrencyDialog(false);
    }
  };

  const handleCurrencyDialogClose = () => {
    setShowCurrencyDialog(false);
    // If user closes dialog without submitting, uncheck the checkbox
    if (!currencyRequestSubmitted) {
      setRequestDifferentCurrency(false);
    }
  };

 

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
              <div className="flex h-12 w-12 items-center justify-center">
                <img src="/logo.png" className="h-12 w-12 rounded-xl shadow-md" alt="My Logo" />
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
                <span>Currency</span>
                <span>Security</span>
                <span>Preferences</span>
              </div>
            </div>
          </div>

          {/* Right side - Registration Form */}
          <div className="lg:col-span-5 flex items-center justify-center py-20 lg:py-32">
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('firstName', e.target.value)}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('lastName', e.target.value)}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('email', e.target.value)}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('organizationName', e.target.value)}
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
                          onValueChange={(value: string) => updateFormData('organizationType', value)}
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
                          onValueChange={(value: string) => updateFormData('organizationSize', value)}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('website', e.target.value)}
                            className="pl-10"
                            placeholder="https://www.organization.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Currency Selection */}
                  {/* Currency Selection */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                          <DollarSign className="h-6 w-6 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Currency Settings</h3>
                        <p className="text-sm text-gray-600">Your organization will use GBP for all transactions</p>
                      </div>

                      <div className="space-y-4">
                        {/* Display Default Currency */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Default Currency</p>
                                <p className="text-lg font-bold text-gray-900">GBP (£) - British Pound</p>
                              </div>
                            </div>
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-xs text-gray-600 mt-3">
                            All donations, campaigns, and financial reports will use GBP as the primary currency.
                          </p>
                        </div>

                        {/* Request Different Currency Checkbox */}
                        <div className={`border rounded-lg p-4 bg-white ${errors.currency ? 'border-red-500' : 'border-gray-200'}`}>
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="requestDifferentCurrency"
                              checked={requestDifferentCurrency}
                              onCheckedChange={handleCurrencyCheckboxChange}
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor="requestDifferentCurrency" 
                                className="text-sm font-medium text-gray-900 cursor-pointer"
                              >
                                Request a different currency (USD, INR, or Custom)
                              </label>
                              <p className="text-xs text-gray-600 mt-1">
                                Need to use a different currency? We'll review your request and notify you when it's available.
                              </p>
                              {currencyRequestSubmitted && (
                                <div className="mt-2 flex items-center space-x-2 text-xs text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="font-medium">Request submitted successfully</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {errors.currency && (
                            <p className="text-xs text-red-600 flex items-center mt-2 ml-7">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.currency}
                            </p>
                          )}
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                              <p className="font-medium mb-1">Important Information</p>
                              <p className="text-xs">
                                Currency settings are configured during account setup and optimized for UK operations. 
                                If you need a different currency, submit a request and we'll notify you when it's available.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Original Step 3: Account Security, now Step 4 */}
                  {currentStep === 4 && (
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('password', e.target.value)}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('confirmPassword', e.target.value)}
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
                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onCheckedChange={(checked: boolean) => updateFormData('agreeToTerms', checked)}
                          />
                          <div className="text-sm">
                            <label htmlFor="agreeToTerms" className="cursor-pointer">
                              I agree to the{' '}
                              <button type="button" className="text-indigo-600 hover:underline" onClick={onViewTerms}>
                                Terms of Service
                              </button>
                            </label>
                            {errors.agreeToTerms && (
                              <p className="text-xs text-red-600 flex items-center mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.agreeToTerms}
                              </p>
                            )}
                          </div>
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

      {/* Currency Request Dialog */}
      <CurrencyRequestDialog
        isOpen={showCurrencyDialog}
        onClose={handleCurrencyDialogClose}
        onSubmit={handleCurrencyRequest}
        email={formData.email}
        organizationName={formData.organizationName}
        firstName={formData.firstName}
        lastName={formData.lastName}
      />

      {/* Persistent Success Notification */}
      <PersistentNotification
        isOpen={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="Currency Request Submitted"
        message="We have submitted your request for currency updation. We will send you notification when it will be added to the system. Till then please use GBP."
        type="success"
      />
    </div>
  );
}