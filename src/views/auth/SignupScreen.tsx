import React, { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Checkbox } from '../../shared/ui/checkbox';
import { Progress } from '../../shared/ui/progress';
import { submitCurrencyRequest, checkEmailExists } from '../../shared/api/firestoreService';
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
  DollarSign,
  ChevronDown
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

interface SignupFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  organizationName?: string;
  organizationType?: string;
  organizationSize?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

const auth = getAuth();
const firestore = getFirestore();

export function SignupScreen({ onSignup, onBack, onLogin, onViewTerms }: SignupScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [requestDifferentCurrency, setRequestDifferentCurrency] = useState(false);
  const [currencyRequestSubmitted, setCurrencyRequestSubmitted] = useState(false);
  const [requestedCurrency, setRequestedCurrency] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
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
    
    // Clear error when user starts typing (only for fields that have errors)
    if (field in errors && errors[field as keyof SignupFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleEmailBlur = async () => {
    // First validate email format
    if (!formData.email.trim()) {
      return; // Don't check if empty
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address'
      }));
      return;
    }

    // Check if email already exists
    setIsCheckingEmail(true);
    try {
      const exists = await checkEmailExists(formData.email);
      if (exists) {
        setErrors(prev => ({
          ...prev,
          email: 'This email is already registered. Please use a different email or sign in.'
        }));
      } else {
        // Clear email error if it was set
        setErrors(prev => ({
          ...prev,
          email: undefined
        }));
      }
    } catch (error) {
      console.error('Error checking email:', error);
      // Don't block user if check fails
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const newErrors: SignupFormErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      } else {
        // Check if email already exists
        try {
          const exists = await checkEmailExists(formData.email);
          if (exists) {
            newErrors.email = 'This email is already registered. Please use a different email or sign in.';
          }
        } catch (error) {
          console.error('Error checking email:', error);
          // Don't block if check fails
        }
      }
    } else if (step === 2) {
      if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
      if (!formData.organizationType) newErrors.organizationType = 'Organization type is required';
      if (!formData.organizationSize) newErrors.organizationSize = 'Organization size is required';
    }  else if (step === 3) {
      // Currency request is optional - no validation needed
    } else if (step === 4) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      
      // Add terms validation
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the Terms of Service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    // If on currency step (3) and user has entered a custom currency but not submitted yet
    if (currentStep === 3 && requestDifferentCurrency && requestedCurrency && !currencyRequestSubmitted) {
      // Submit the request and show success message, but don't move to next step
      await handleCurrencySubmit();
      return; // Stop here - user needs to click Next again to proceed
    }
    
    // Normal flow - validate and move to next step
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Updated handleSignup to include initial data for permissions and isActive
  const handleSubmit = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await onSignup({
          ...formData,
          organizationId: formData.organizationName.replace(/\s+/g, '-').toLowerCase(), // Generate organizationId
          stripe: {
            accountId: '',
            chargesEnabled: false,
            payoutsEnabled: false,
          },
        })
      } catch (error) {
        // Error is handled by parent component
        setIsSubmitting(false)
      }
      // Don't set isSubmitting to false on success - let redirect happen
    }
  };

  const handleCurrencySubmit = async () => {
    if (!requestedCurrency || requestedCurrency.length !== 3) return;
    
    try {
      await submitCurrencyRequest({
        email: formData.email,
        requestedCurrency: requestedCurrency,
        notes: `User requested ${requestedCurrency} currency during signup`,
        organizationName: formData.organizationName,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      setCurrencyRequestSubmitted(true);
    } catch (error) {
      console.error('Error submitting currency request:', error);
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

  // Show loading overlay during submission
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Creating Your Organization...</h3>
            <p className="text-sm text-gray-600">Setting up your account and workspace</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcf9f1]">
      {/* Loading overlay during submission */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#064e3b]"></div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Creating Your Organization...</h3>
              <p className="text-sm text-gray-600">Setting up your account and workspace</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex min-h-screen flex-col lg:flex-row">
        {/* Left side - Different content for each step */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0a2e16] relative overflow-hidden flex-col justify-between p-12 lg:p-20">
          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

          {/* Step 1 Content */}
          {currentStep === 1 && (
            <>
              <div className="relative z-10">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center">
                    <Heart className="text-white w-5 h-5" />
                  </div>
                  <span className="font-bold text-2xl tracking-tight text-white uppercase">Swift Cause</span>
                </div>

                {/* Hero Content */}
                <div className="max-w-lg">
                  <h2 className="text-5xl font-bold text-white leading-tight mb-4">
                    Empower change globally.
                  </h2>
                  <p className="text-emerald-100/70 text-lg mb-6">
                    Join a community of 2M+ contributors who have collectively funded projects that provided clean water to 500+ villages last year.
                  </p>

                  {/* Impact Card */}
                  <div className="bg-[#fcf9f1]/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white shadow-2xl">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs font-bold text-emerald-200/60 uppercase tracking-widest mb-1">
                          Donation Impact
                        </p>
                        <h3 className="text-3xl font-bold">$1,250,402</h3>
                      </div>
                      <div className="bg-emerald-400/20 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12.4%
                      </div>
                    </div>

                    {/* Chart bars */}
                    <div className="flex items-end gap-3 h-32 mb-6">
                      <div className="flex-1 bg-white/10 h-[30%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white/10 h-[45%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white/10 h-[40%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white/10 h-[60%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white/10 h-[55%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white/10 h-[85%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white h-full rounded-t-lg"></div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4">
                        <p className="text-[10px] text-emerald-200/50 uppercase font-bold mb-1 text-center">
                          Projects
                        </p>
                        <p className="text-lg font-bold text-center text-white">142</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4">
                        <p className="text-[10px] text-emerald-200/50 uppercase font-bold mb-1 text-center">
                          Countries
                        </p>
                        <p className="text-lg font-bold text-center text-white">24</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4">
                        <p className="text-[10px] text-emerald-200/50 uppercase font-bold mb-1 text-center">
                          Status
                        </p>
                        <p className="text-lg font-bold text-center text-white">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 text-emerald-100/40 text-sm">
                © 2024 Swift Cause. All rights reserved.
              </div>
            </>
          )}

          {/* Step 2 Content - Global Community */}
          {currentStep === 2 && (
            <>
              <div className="relative z-10 flex flex-col items-center justify-center text-center flex-1">
                <div className="w-32 h-32 bg-[#11d452]/20 rounded-full flex items-center justify-center mb-8 border border-[#11d452]/30">
                  <Globe className="text-[#11d452] w-16 h-16" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">Global Community</h2>
                <p className="text-white/80 text-lg leading-relaxed max-w-sm">
                  Join a worldwide network of change-makers and organizations dedicated to making a lasting impact.
                </p>
                <div className="mt-12 flex gap-2">
                  <div className="h-1 w-8 rounded-full bg-[#11d452]/30"></div>
                  <div className="h-1 w-12 rounded-full bg-[#11d452]"></div>
                  <div className="h-1 w-8 rounded-full bg-[#11d452]/30"></div>
                  <div className="h-1 w-8 rounded-full bg-[#11d452]/30"></div>
                </div>
              </div>
            </>
          )}

          {/* Step 3 Content - Currency Settings */}
          {currentStep === 3 && (
            <>
              <div className="relative z-10 flex flex-col items-center justify-center text-center flex-1">
                {/* Icon Row */}
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-[#11d452] w-8 h-8" />
                  </div>
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#11d452]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#11d452]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-4xl font-bold mb-6 text-white">Empower Your Impact</h2>
                
                {/* Description */}
                <p className="text-white/70 text-lg leading-relaxed max-w-md mb-12">
                  Manage your financial reach with ease. Setting up your preferences ensures every contribution flows exactly where it needs to go.
                </p>

                {/* Currency Symbols Card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 w-full max-w-md">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="flex items-center justify-center">
                      <span className="text-8xl font-light text-white/40">$</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-8xl font-light text-white/40">€</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-8xl font-light text-white/40">£</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-8xl font-light text-white/40">¥</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 4 Content - Security */}
          {currentStep === 4 && (
            <>
              <div className="relative z-10 flex flex-col items-center justify-center flex-1 max-w-lg mx-auto w-full">
                {/* Shield Icon with Glass Effect */}
                <div className="relative w-64 h-64 mb-12">
                  <div className="absolute inset-0 bg-[#11d452]/10 rounded-[40px] blur-3xl"></div>
                  <div className="relative bg-white/5 backdrop-blur-md border border-white/10 w-full h-full rounded-[40px] flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                    <Shield className="text-[#11d452] w-32 h-32" strokeWidth={0.5} />
                  </div>
                  <div className="absolute -inset-4 border border-white/5 rounded-[48px]"></div>
                  <div className="absolute -inset-8 border border-white/5 rounded-[56px]"></div>
                </div>

                {/* Title and Description */}
                <div className="text-center mb-10">
                  <h1 className="text-white text-3xl font-bold mb-4">Your security is our priority.</h1>
                  <p className="text-[#a8c3ad] text-lg">
                    We employ bank-grade security measures to ensure your data and impact remain protected at all times.
                  </p>
                </div>

                {/* Security Features */}
                <div className="w-full space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
                    <div className="bg-[#11d452]/20 p-2 rounded-lg flex-shrink-0">
                      <Lock className="text-[#11d452] w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">End-to-End Encryption</h4>
                      <p className="text-[#a8c3ad] text-sm mt-1">
                        Your sensitive information is encrypted before it ever leaves your device.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
                    <div className="bg-[#11d452]/20 p-2 rounded-lg flex-shrink-0">
                      <Phone className="text-[#11d452] w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Two-Factor Authentication</h4>
                      <p className="text-[#a8c3ad] text-sm mt-1">
                        An extra layer of protection ensuring only you can access your account.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
                    <div className="bg-[#11d452]/20 p-2 rounded-lg flex-shrink-0">
                      <CheckCircle className="text-[#11d452] w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Verified Donor Status</h4>
                      <p className="text-[#a8c3ad] text-sm mt-1">
                        Your contributions are tracked through our secure, immutable verification ledger.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="relative z-10 pt-8 border-t border-white/10">
                <p className="text-[#5d7a61] text-xs">
                  Trust and transparency are at the core of our platform architecture.
                </p>
              </footer>
            </>
          )}
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-8 lg:p-12 bg-[#fcf9f1] h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between lg:justify-end mb-6">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2">
              <div className="w-8 h-8 bg-[#064e3b] rounded-lg flex items-center justify-center">
                <Heart className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#064e3b] uppercase">
                Swift Cause
              </span>
            </div>

            {/* Login link */}
            <div className="text-sm text-slate-500">
              Already have an account?{' '}
              <button onClick={onLogin} className="text-[#064e3b] font-semibold hover:underline">
                Log in
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center min-h-0">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-[#064e3b] uppercase tracking-wider">
                  Step {currentStep} of 4
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  {(currentStep / 4) * 100}% Complete
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#064e3b] rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form title */}
            <div className="mb-6 text-left">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">
                {currentStep === 1 && 'Create your account'}
                {currentStep === 2 && 'Organization Details'}
                {currentStep === 3 && 'Currency Settings'}
                {currentStep === 4 && 'Account Security'}
              </h1>
              <p className="text-lg text-slate-500">
                {currentStep === 1 && 'Join a global movement of transparent giving and track your impact in real-time.'}
                {currentStep === 2 && 'Tell us about your organization'}
                {currentStep === 3 && 'Select your preferred currency'}
                {currentStep === 4 && 'Secure your account'}
              </p>
            </div>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                {/* Email field */}
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('email', e.target.value)}
                      onBlur={handleEmailBlur}
                      className={`w-full px-5 py-5 rounded-xl border !bg-white text-base focus:ring-0 focus:border-[#064e3b] transition-all outline-none h-14 ${
                        errors.email ? 'border-red-500' : 'border-slate-300'
                      } ${isCheckingEmail ? 'opacity-50' : ''}`}
                      placeholder="name@example.com"
                      disabled={isCheckingEmail}
                    />
                    {isCheckingEmail && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#064e3b] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center mt-2">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                  {isCheckingEmail && (
                    <p className="text-xs text-slate-500 flex items-center mt-2">
                      Checking email availability...
                    </p>
                  )}
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-base font-semibold text-slate-700 mb-2" htmlFor="firstName">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('firstName', e.target.value)}
                      className={`w-full px-5 py-5 rounded-xl border !bg-white text-base focus:ring-0 focus:border-[#064e3b] transition-all outline-none h-14 ${
                        errors.firstName ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="First name"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-slate-700 mb-2" htmlFor="lastName">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('lastName', e.target.value)}
                      className={`w-full px-5 py-5 rounded-xl border !bg-white text-base focus:ring-0 focus:border-[#064e3b]b] transition-all outline-none h-14 ${
                        errors.lastName ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="Last name"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-600 flex items-center mt-2">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Continue button */}
                <button
                  type="submit"
                  disabled={isCheckingEmail}
                  className="w-full bg-[#064e3b] text-white font-bold text-lg py-5 rounded-xl hover:bg-emerald-900 transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed h-14"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* Terms text */}
            {currentStep === 1 && (
              <p className="mt-6 text-sm text-slate-400 leading-relaxed text-left">
                By continuing, you agree to our{' '}
                <button onClick={onViewTerms} className="underline hover:text-slate-600 text-slate-500">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button onClick={onViewTerms} className="underline hover:text-slate-600 text-slate-500">
                  Privacy Policy
                </button>
                .
              </p>
            )}

            {/* Step 2: Organization Information */}
            {currentStep === 2 && (
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                {/* Organization Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#0a2e16] text-base font-medium" htmlFor="organizationName">
                    Organization Name
                  </label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('organizationName', e.target.value)}
                    className={`w-full rounded-lg border !bg-white text-[#0a2e16] h-14 px-4 text-base placeholder:text-gray-400 focus:border-[#11d452] focus:ring-0 ${
                      errors.organizationName ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter your organization's legal name"
                  />
                  {errors.organizationName && (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.organizationName}
                    </p>
                  )}
                </div>

                {/* Organization Type */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#0a2e16] text-base font-medium" htmlFor="organizationType">
                    Organization Type
                  </label>
                  <Select 
                    value={formData.organizationType} 
                    onValueChange={(value: string) => updateFormData('organizationType', value)}
                  >
                    <SelectTrigger className={`w-full rounded-lg border !bg-white text-[#0a2e16] h-14 px-4 text-base focus:border-[#11d452] focus:ring-0 ${
                      errors.organizationType ? 'border-red-500' : 'border-gray-200'
                    }`}>
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

                {/* Website */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#0a2e16] text-base font-medium" htmlFor="website">
                    Website
                  </label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('website', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 !bg-white text-[#0a2e16] h-14 px-4 text-base placeholder:text-gray-400 focus:border-[#11d452] focus:ring-0"
                    placeholder="https://example.com"
                  />
                </div>
              </form>
            )}

                  {/* Currency Selection */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                          <DollarSign className="h-6 w-6 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Currency Settings</h3>
                        <p className="text-sm text-gray-600">Select your preferred currency</p>
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
                        </div>

                        {/* Request Custom Currency - Inline Collapsible */}
                        <div className="border rounded-lg bg-white border-gray-200">
                          <button
                            type="button"
                            onClick={() => setRequestDifferentCurrency(!requestDifferentCurrency)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                Request a Custom Currency
                              </span>
                              {currencyRequestSubmitted && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                              requestDifferentCurrency ? 'rotate-180' : ''
                            }`} />
                          </button>

                          {/* Expandable Input Section */}
                          {requestDifferentCurrency && (
                            <div className="px-4 pb-4 space-y-3 border-t pt-4">
                              <div className="space-y-2">
                                <Label htmlFor="requestedCurrency">Currency Code</Label>
                                <Input
                                  id="requestedCurrency"
                                  value={requestedCurrency}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequestedCurrency(e.target.value.toUpperCase())}
                                  onBlur={handleCurrencySubmit}
                                  placeholder="e.g., USD, EUR, INR"
                                  className="uppercase"
                                  maxLength={3}
                                />
                                <p className="text-xs text-gray-500">
                                  Enter the 3-letter currency code (e.g., USD for US Dollar)
                                </p>
                              </div>

                              {currencyRequestSubmitted && (
                                <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                  <span>Request submitted! We'll notify you when {requestedCurrency} is available.</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Info Box - Only show when currency request is submitted */}
                        {currencyRequestSubmitted && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-blue-800">
                                You can continue with GBP and we'll notify you when your requested currency is available.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Password Setup */}
                  {currentStep === 4 && (
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                      {/* Password Field */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[#0d1b10] text-sm font-semibold" htmlFor="password">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('password', e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border !bg-white text-[#0d1b10] focus:ring-2 focus:ring-[#11d452] focus:border-transparent outline-none transition-all ${
                              errors.password ? 'border-red-500' : 'border-[#cfe7d3]'
                            }`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4c9a59] hover:text-[#11d452] transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password Field */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[#0d1b10] text-sm font-semibold" htmlFor="confirmPassword">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('confirmPassword', e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border !bg-white text-[#0d1b10] focus:ring-2 focus:ring-[#11d452] focus:border-transparent outline-none transition-all ${
                              errors.confirmPassword ? 'border-red-500' : 'border-[#cfe7d3]'
                            }`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4c9a59] hover:text-[#11d452] transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                      {/* Password Strength Indicator */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <p className="text-[#4c9a59] text-xs font-medium">Password strength</p>
                          <p className="text-[#11d452] text-xs font-bold">
                            {formData.password.length >= 8 ? 'Good' : 'Weak'}
                          </p>
                        </div>
                        <div className="flex gap-1 h-1.5">
                          <div className={`flex-1 rounded-full ${formData.password.length >= 2 ? 'bg-[#11d452]' : 'bg-[#cfe7d3]'}`}></div>
                          <div className={`flex-1 rounded-full ${formData.password.length >= 4 ? 'bg-[#11d452]' : 'bg-[#cfe7d3]'}`}></div>
                          <div className={`flex-1 rounded-full ${formData.password.length >= 6 ? 'bg-[#11d452]' : 'bg-[#cfe7d3]'}`}></div>
                          <div className={`flex-1 rounded-full ${formData.password.length >= 8 ? 'bg-[#11d452]' : 'bg-[#cfe7d3]'}`}></div>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 py-2">
                        <div className="flex items-center gap-2">
                          {formData.password.length >= 8 ? (
                            <CheckCircle className="text-[#11d452] w-[18px] h-[18px]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cfe7d3]"></div>
                          )}
                          <span className={`text-xs ${formData.password.length >= 8 ? 'text-[#0d1b10]' : 'text-[#4c9a59]'}`}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/[A-Z]/.test(formData.password) ? (
                            <CheckCircle className="text-[#11d452] w-[18px] h-[18px]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cfe7d3]"></div>
                          )}
                          <span className={`text-xs ${/[A-Z]/.test(formData.password) ? 'text-[#0d1b10]' : 'text-[#4c9a59]'}`}>
                            One uppercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/[0-9]/.test(formData.password) ? (
                            <CheckCircle className="text-[#11d452] w-[18px] h-[18px]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cfe7d3]"></div>
                          )}
                          <span className={`text-xs ${/[0-9]/.test(formData.password) ? 'text-[#0d1b10]' : 'text-[#4c9a59]'}`}>
                            One number
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? (
                            <CheckCircle className="text-[#11d452] w-[18px] h-[18px]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cfe7d3]"></div>
                          )}
                          <span className={`text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-[#0d1b10]' : 'text-[#4c9a59]'}`}>
                            One special symbol
                          </span>
                        </div>
                      </div>

                      {/* Terms Checkbox */}
                      <div className="flex items-start space-x-3 pt-2">
                        <Checkbox
                          id="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked: boolean) => updateFormData('agreeToTerms', checked)}
                          className="mt-0.5"
                        />
                        <div className="text-sm">
                          <label htmlFor="agreeToTerms" className="cursor-pointer text-[#0d1b10]">
                            I agree to the{' '}
                            <button type="button" className="text-[#4c9a59] hover:underline font-medium" onClick={onViewTerms}>
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

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={isSubmitting || !formData.agreeToTerms}
                          className="w-full bg-[#0d1b10] hover:bg-black text-white font-bold py-4 rounded-lg shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>{isSubmitting ? 'Creating Account...' : 'Create Password'}</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className="w-full bg-transparent hover:bg-[#e7f3e9] text-[#4c9a59] font-semibold py-3 rounded-lg transition-all"
                        >
                          Back to Step 3
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </main>
          </div>
        );
      }