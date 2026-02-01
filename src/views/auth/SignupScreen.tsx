import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Input } from '../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Checkbox } from '../../shared/ui/checkbox';
import { checkEmailExists, checkOrganizationIdExists } from '../../shared/api/firestoreService';
import Image from "next/image"
import { 
  Heart,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  Phone,
  Globe,
  Eye,
  EyeOff,
  AlertCircle,
  TrendingUp,
  Lock,
  DollarSign,
  Home
} from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { ORGANIZATION_TYPES, ORGANIZATION_SIZES } from '../../shared/config';

interface SignupScreenProps {
  onSignup: (data: SignupFormData) => Promise<void>;
  onBack: () => void;
  onLogin: () => void;
  onViewTerms: () => void;
}

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  
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
  
  password: string;
  confirmPassword: string;
  
  currency: string;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingOrganization, setIsCheckingOrganization] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
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
    
    if (field in errors && errors[field as keyof SignupFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const isPasswordValid = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
  };

  const handleEmailBlur = async () => {
    if (!formData.email.trim()) {
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address'
      }));
      return;
    }

    setIsCheckingEmail(true);
    try {
      const exists = await checkEmailExists(formData.email);
      if (exists) {
        setErrors(prev => ({
          ...prev,
          email: 'This email is already registered. Please use a different email or sign in.'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          email: undefined
        }));
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const generateOrganizationId = (name: string): string => {
    return name.replace(/\s+/g, '-').toLowerCase();
  };

  const handleOrganizationNameBlur = async () => {
    if (!formData.organizationName.trim()) {
      return;
    }

    const organizationId = generateOrganizationId(formData.organizationName);
    
    setIsCheckingOrganization(true);
    try {
      const exists = await checkOrganizationIdExists(organizationId);
      if (exists) {
        setErrors(prev => ({
          ...prev,
          organizationName: 'An organization with this name already exists. Please choose a different name.'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          organizationName: undefined
        }));
      }
    } catch (error) {
      console.error('Error checking organization name:', error);
    } finally {
      setIsCheckingOrganization(false);
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
        try {
          const exists = await checkEmailExists(formData.email);
          if (exists) {
            newErrors.email = 'This email is already registered. Please use a different email or sign in.';
          }
        } catch (error) {
          console.error('Error checking email:', error);
        }
      }
    } else if (step === 2) {
      if (!formData.organizationName.trim()) {
        newErrors.organizationName = 'Organization name is required';
      } else {
        // Check if organization ID already exists
        const organizationId = generateOrganizationId(formData.organizationName);
        try {
          const exists = await checkOrganizationIdExists(organizationId);
          if (exists) {
            newErrors.organizationName = 'An organization with this name already exists. Please choose a different name.';
          }
        } catch (error) {
          console.error('Error checking organization name:', error);
        }
      }
      if (!formData.organizationType) newErrors.organizationType = 'Organization type is required';
    } else if (step === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else {
        if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[0-9]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one number';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one special character';
        }
      }
      
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the Terms of Service';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    setIsValidating(true);
    try {
      const isValid = await validateStep(currentStep);
      if (isValid) {
        setCurrentStep(prev => Math.min(prev + 1, 3));
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const isValid = await validateStep(currentStep);
    
    if (!recaptchaToken) {
      setErrors(prev => ({
        ...prev,
        agreeToTerms: 'Please complete the reCAPTCHA verification'
      }));
      return;
    }
    
    if (isValid && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await onSignup({
          ...formData,
          organizationId: generateOrganizationId(formData.organizationName),
          stripe: {
            accountId: '',
            chargesEnabled: false,
            payoutsEnabled: false,
          },
          recaptchaToken, // Include the token for backend verification
        } as any)
      } catch (error) {
        setIsSubmitting(false)
        // Reset reCAPTCHA on error
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          setRecaptchaToken(null);
        }
      }
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

      <main className="min-h-screen lg:grid lg:grid-cols-[43fr_57fr]">
        {/* Left side - Green section */}
        <div className="hidden lg:flex bg-[#0a2e16] relative overflow-hidden flex-col justify-between p-12 lg:p-20">
          {/* Logo at top - visible on all steps */}
          <div className="absolute top-8 left-12 z-20 flex items-center gap-3">
            <Image src="/logo.png" alt="SwiftCause logo" width={40} height={40} className="rounded-xl opacity-80" />
            <span className="font-bold text-xl tracking-tight text-white uppercase opacity-80">SwiftCause</span>
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

          {/* Step 1 Content */}
          {currentStep === 1 && (
            <>
              <div className="relative z-10 flex-1 flex flex-col justify-center">

                {/* Hero Content */}
                <div className="max-w-lg w-full">
                  <h2 className="text-5xl font-bold text-white leading-tight mb-4">
                    Empower change globally.
                  </h2>
                  <p className="text-emerald-100/70 text-lg mb-6">
                  Create an account to set up your organization and start managing fundraising campaigns and donations.
                  </p>

                  <div className="bg-[#fcf9f1]/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white shadow-2xl">

                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs font-bold text-emerald-200/60 uppercase tracking-widest mb-1">
                          Donation Impact
                        </p>
                        <h3 className="text-3xl font-bold">Global Outreach</h3>
                      </div>
                      <div className="bg-emerald-400/20 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </div>
                    </div>


                    <div className="flex items-end gap-3 h-32 mb-6">
                      <div className="flex-1 bg-white/10 h-[30%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white/10 h-[45%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white/10 h-[40%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white/10 h-[60%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white/10 h-[55%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white/10 h-[85%] rounded-t-lg transition-all hover:bg-white/30"></div>
                      <div className="flex-1 bg-white h-full rounded-t-lg"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 hover:scale-105 cursor-pointer">
                        <p className="text-[10px] text-emerald-200/50 uppercase font-bold mb-1 text-center">
                          CAMPAIGNS
                        </p>
                        <p className="text-lg font-bold text-center text-white">Multiple Active</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 hover:scale-105 cursor-pointer">
                        <p className="text-[10px] text-emerald-200/50 uppercase font-bold mb-1 text-center">
                          KIOSKS
                        </p>
                        <p className="text-lg font-bold text-center text-white">Network Ready</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 hover:scale-105 cursor-pointer">
                        <p className="text-[10px] text-emerald-200/50 uppercase font-bold mb-1 text-center">
                          Status
                        </p>
                        <p className="text-lg font-bold text-center text-white">    High <br/> Impact</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="relative z-10 flex flex-col items-center justify-center text-center flex-1 max-w-lg w-full mx-auto">
                <div className="w-32 h-32 bg-[#11d452]/20 rounded-full flex items-center justify-center mb-8 border border-[#11d452]/30">
                  <Globe className="text-[#11d452] w-16 h-16" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">Global Community</h2>
                <p className="text-white/80 text-lg leading-relaxed max-w-sm w-full">
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

          {currentStep === 3 && (
            <>
              <div className="relative z-10 flex flex-col items-center justify-center flex-1 max-w-lg mx-auto w-full">
                {/* Security Icon */}
                <div className="relative w-48 h-48 mb-12">
                  <div className="absolute inset-0 bg-[#11d452]/10 rounded-[40px] blur-3xl"></div>
                  <div className="relative bg-white/5 backdrop-blur-md border border-white/10 w-full h-full rounded-[40px] flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                    <Shield className="text-[#11d452] w-24 h-24" strokeWidth={0.5} />
                  </div>
                  <div className="absolute -inset-4 border border-white/5 rounded-[48px]"></div>
                  <div className="absolute -inset-8 border border-white/5 rounded-[56px]"></div>
                </div>

                {/* Heading */}
                <div className="text-center mb-8">
                  <h1 className="text-white text-3xl font-bold mb-3">Your security is our priority</h1>
                  <p className="text-emerald-100/70 text-lg">
                    We employ bank-grade security measures to ensure your data and impact remain protected at all times.
                  </p>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/5">
                    <div className="bg-[#11d452]/20 p-2 rounded-lg flex-shrink-0">
                      <Lock className="text-[#11d452] w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">Secure Access</h4>
                      <p className="text-[#a8c3ad] text-xs mt-1">
                       Protect your organization’s dashboard and data.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                    <div className="bg-[#11d452]/20 p-3 rounded-lg flex-shrink-0">
                      <Users className="text-[#11d452] w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Controlled Permissions</h4>
                      <p className="text-emerald-100/60 text-sm">
                        Only authorized users can manage campaigns and donations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                    <div className="bg-[#11d452]/20 p-3 rounded-lg flex-shrink-0">
                      <CheckCircle className="text-[#11d452] w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Trusted Infrastructure</h4>
                      <p className="text-emerald-100/60 text-sm">
                        Payments and access are handled securely on our platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="relative z-10 pt-8 mt-6 border-t border-white/10">
                <p className="text-emerald-100/40 text-sm">
                  Trust and transparency are at the core of our platform architecture.
                </p>
              </footer>
            </>
          )}
        </div>

        {/* Right side - Form */}
        <div className="flex flex-col p-6 md:p-8 lg:p-12 bg-[#fcf9f1] min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {/* Home button */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:text-[#064e3b] hover:border-[#064e3b] hover:bg-green-50 transition-all group"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </button>

            {/* Mobile logo - center on mobile */}
            <div className="flex lg:hidden items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              <Image src="/logo.png" alt="Swift Cause Logo" width={32} height={32} className="rounded-lg" />
              <span className="font-bold text-xl tracking-tight text-[#064e3b] uppercase">
                SwiftCause
              </span>
            </div>

            {/* Login link */}
            <div className="text-sm text-slate-500">
              <span className="hidden sm:inline">Already have an account?{' '}</span>
              <button onClick={onLogin} className="text-[#064e3b] font-semibold hover:underline">
                Log in
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center overflow-y-auto">
            {/* White background card for the form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-[#064e3b] uppercase tracking-wider">
                    Step {currentStep} of 3
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    {Math.round((currentStep / 3) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#064e3b] rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((currentStep / 3) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Form title */}
              <div className="mb-6 text-left">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {currentStep === 1 && 'Create your account'}
                  {currentStep === 2 && 'Organization Details'}
                  {currentStep === 3 && 'Account Security'}
                </h1>
                <p className="text-base text-slate-500">
                  {currentStep === 1 && 'Join a global movement of transparent giving and track your impact in real-time.'}
                  {currentStep === 2 && 'Tell us about your organization'}
                  {currentStep === 3 && 'Secure your account'}
                </p>
              </div>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
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
                  disabled={isCheckingEmail || isValidating}
                  className="w-full bg-[#064e3b] text-white font-bold text-lg py-5 rounded-xl hover:bg-emerald-900 transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed h-14"
                >
                  {isValidating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            

            {/* Step 2: Organization Information */}
            {currentStep === 2 && (
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                {/* Organization Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#0a2e16] text-base font-medium" htmlFor="organizationName">
                    Organization Name
                  </label>
                  <div className="relative">
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('organizationName', e.target.value)}
                      onBlur={handleOrganizationNameBlur}
                      className={`w-full rounded-lg border !bg-white text-[#0a2e16] h-14 px-4 text-base placeholder:text-gray-400 focus:border-[#11d452] focus:ring-0 ${
                        errors.organizationName ? 'border-red-500' : 'border-gray-200'
                      } ${isCheckingOrganization ? 'opacity-50' : ''}`}
                      placeholder="Enter your organization's legal name"
                      disabled={isCheckingOrganization}
                    />
                    {isCheckingOrganization && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#064e3b] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {errors.organizationName && (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.organizationName}
                    </p>
                  )}
                  {isCheckingOrganization && (
                    <p className="text-xs text-slate-500 flex items-center">
                      Checking organization name availability...
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

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-8">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-[#0a2e16] font-bold text-sm hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isValidating || isCheckingOrganization}
                    className="flex items-center justify-center min-w-[140px] px-8 py-3 bg-[#064e3b] text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-[#11d452]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Password Setup */}
                  {currentStep === 3 && (
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
                            placeholder="Enter your password"
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
                            placeholder="Confirm your password"
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
                            {(() => {
                              const checks = [
                                formData.password.length >= 8,
                                /[A-Z]/.test(formData.password),
                                /[0-9]/.test(formData.password),
                                /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                              ];
                              const passedChecks = checks.filter(Boolean).length;
                              if (passedChecks === 0) return 'Weak';
                              if (passedChecks <= 2) return 'Fair';
                              if (passedChecks === 3) return 'Good';
                              return 'Strong';
                            })()}
                          </p>
                        </div>
                        <div className="flex gap-1 h-1.5">
                          {(() => {
                            const checks = [
                              formData.password.length >= 8,
                              /[A-Z]/.test(formData.password),
                              /[0-9]/.test(formData.password),
                              /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                            ];
                            const passedCount = checks.filter(Boolean).length;
                            
                            return [0, 1, 2, 3].map((index) => (
                              <div 
                                key={index}
                                className={`flex-1 rounded-full ${index < passedCount ? 'bg-[#11d452]' : 'bg-[#cfe7d3]'}`}
                              ></div>
                            ));
                          })()}
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
                          <span className={`text-xs font-medium ${formData.password.length >= 8 ? 'text-[#0d1b10]' : formData.password.length > 0 ? 'text-red-600' : 'text-[#4c9a59]'}`}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/[A-Z]/.test(formData.password) ? (
                            <CheckCircle className="text-[#11d452] w-[18px] h-[18px]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cfe7d3]"></div>
                          )}
                          <span className={`text-xs font-medium ${/[A-Z]/.test(formData.password) ? 'text-[#0d1b10]' : formData.password.length > 0 ? 'text-red-600' : 'text-[#4c9a59]'}`}>
                            One uppercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/[0-9]/.test(formData.password) ? (
                            <CheckCircle className="text-[#11d452] w-[18px] h-[18px]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cfe7d3]"></div>
                          )}
                          <span className={`text-xs font-medium ${/[0-9]/.test(formData.password) ? 'text-[#0d1b10]' : formData.password.length > 0 ? 'text-red-600' : 'text-[#4c9a59]'}`}>
                            One number
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? (
                            <CheckCircle className="text-[#11d452] w-[18px] h-[18px]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cfe7d3]"></div>
                          )}
                          <span className={`text-xs font-medium ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-[#0d1b10]' : formData.password.length > 0 ? 'text-red-600' : 'text-[#4c9a59]'}`}>
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

                      {/* reCAPTCHA */}
                      <div className="flex justify-center pt-4">
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                          onChange={(token: string | null) => {
                            setRecaptchaToken(token);
                            // Clear any previous captcha errors
                            if (errors.agreeToTerms?.includes('reCAPTCHA')) {
                              setErrors(prev => ({
                                ...prev,
                                agreeToTerms: undefined
                              }));
                            }
                          }}
                          onExpired={() => setRecaptchaToken(null)}
                          onErrored={() => setRecaptchaToken(null)}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-8 gap-5">
                       
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-[#0a2e16] font-bold text-sm hover:bg-gray-50 transition-colors"
                        >

                           <ArrowLeft className="w-4 h-4" />
                           
                          Back
                        </button>

                         <button
                          type="submit"
                          disabled={isSubmitting || !formData.agreeToTerms || !isPasswordValid(formData.password) || formData.password !== formData.confirmPassword || !recaptchaToken}
                          className="flex items-center justify-center min-w-[140px] px-8 py-3 bg-[#064e3b] text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-[#11d452]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                        >
                          <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  )}
            </div>
            {/* End of white background card */}
          </div>
        </div>
      </main>
    </div>
  );
}