import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { CampaignListContainer } from './features/campaigns/containers/CampaignListContainer';
import { CampaignScreen } from './components/CampaignScreen';
import { PaymentContainer } from './features/payment/containers/PaymentContainer';
import { ResultScreen } from './components/ResultScreen';
import { EmailConfirmationScreen } from './components/EmailConfirmationScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { KioskManagement } from './components/admin/KioskManagement';
import { DonationManagement } from './components/admin/DonationManagement';
import { UserManagement } from './components/admin/UserManagement';
import CampaignManagement from './components/admin/CampaignManagement';
import { doc, getDoc, db } from './lib/firebase';
import { HomePage } from './components/HomePage';

export type Screen =
  | 'home'
  | 'login'
  | 'signup'
  | 'campaigns'
  | 'campaign'
  | 'payment'
  | 'result'
  | 'email-confirmation'
  | 'admin-dashboard'
  | 'admin-campaigns'
  | 'admin-kiosks'
  | 'admin-donations'
  | 'admin-users';

// ... (All other type definitions remain the same)
export type UserRole = 'kiosk' | 'admin';
export type Permission =
  | 'view_dashboard'
  | 'view_campaigns'
  | 'create_campaign'
  | 'edit_campaign'
  | 'delete_campaign'
  | 'view_kiosks'
  | 'create_kiosk'
  | 'edit_kiosk'
  | 'delete_kiosk'
  | 'assign_campaigns'
  | 'view_donations'
  | 'export_donations'
  | 'view_users'
  | 'create_user'
  | 'edit_user'
  | 'delete_user'
  | 'manage_permissions'
  | 'system_admin';
export interface UserPermissions {
  permissions: Permission[];
  role: 'super_admin' | 'admin' | 'manager' | 'operator' | 'viewer';
  description: string;
}
export interface CampaignConfiguration {
  predefinedAmounts: number[];
  allowCustomAmount: boolean;
  minCustomAmount: number;
  maxCustomAmount: number;
  suggestedAmounts: number[];
  enableRecurring: boolean;
  recurringIntervals: ('monthly' | 'quarterly' | 'yearly')[];
  defaultRecurringInterval: 'monthly' | 'quarterly' | 'yearly';
  recurringDiscount?: number;
  displayStyle: 'grid' | 'list' | 'carousel';
  showProgressBar: boolean;
  showDonorCount: boolean;
  showRecentDonations: boolean;
  maxRecentDonations: number;
  primaryCTAText: string;
  secondaryCTAText?: string;
  urgencyMessage?: string;
  accentColor?: string;
  backgroundImage?: string;
  theme: 'default' | 'minimal' | 'vibrant' | 'elegant';
  requiredFields: ('email' | 'name' | 'phone' | 'address')[];
  optionalFields: ('email' | 'name' | 'phone' | 'address' | 'message')[];
  enableAnonymousDonations: boolean;
  enableSocialSharing: boolean;
  shareMessage?: string;
  enableDonorWall: boolean;
  enableComments: boolean;
}
export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  coverImageUrl: string;
  category: string;
  tags?: string[];
  status?: 'active' | 'paused' | 'completed';
  createdAt?: string;
  endDate?: string;
  organizationId?: string;
  donationCount?: number;
  configuration: CampaignConfiguration;
  assignedKiosks?: string[];
  isGlobal?: boolean;
  longDescription?: string;
  videoUrl?: string;
  galleryImages?: string[];
  organizationInfo?: {
    name: string;
    description: string;
    website?: string;
    logo?: string;
  };
  impactMetrics?: {
    peopleHelped?: number;
    itemsProvided?: number;
    customMetric?: {
      label: string;
      value: number;
      unit: string;
    };
  };
}
export interface Donation {
  campaignId: string;
  amount: number;
  isRecurring: boolean;
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly';
  id?: string;
  donorEmail?: string;
  donorName?: string;
  donorPhone?: string;
  donorMessage?: string;
  isAnonymous?: boolean;
  timestamp?: string;
  kioskId?: string;
  transactionId?: string;
  isGiftAid?: boolean;
}
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}
export interface Kiosk {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  lastActive?: string;
  totalDonations?: number;
  totalRaised?: number;
  accessCode: string;
  qrCode?: string;
  assignedCampaigns?: string[];
  defaultCampaign?: string;
  settings?: {
    displayMode: 'grid' | 'list' | 'carousel';
    showAllCampaigns: boolean;
    maxCampaignsDisplay: number;
    autoRotateCampaigns: boolean;
    rotationInterval?: number;
  };
  deviceInfo?: {
    model?: string;
    os?: string;
    screenSize?: string;
    touchCapable?: boolean;
  };
  operatingHours?: {
    monday?: { open: string; close: string; };
    tuesday?: { open: string; close: string; };
    wednesday?: { open: string; close: string; };
    thursday?: { open: string; close: string; };
    friday?: { open: string; close: string; };
    saturday?: { open: string; close: string; };
    sunday?: { open: string; close: string; };
  };
}
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  lastLogin?: string;
  isActive: boolean;
  department?: string;
  createdAt?: string;
}
export interface KioskSession {
  kioskId: string;
  kioskName: string;
  startTime: string;
  assignedCampaigns: string[];
  defaultCampaign?: string;
  settings: Kiosk['settings'];
  loginMethod: 'qr' | 'manual';
}
export interface AdminSession {
  user: User;
  loginTime: string;
}
export interface SignupFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Organization Information
  organizationName: string;
  organizationType: string;
  organizationSize: string;
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


export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignView, setCampaignView] = useState<'overview' | 'donate'>('overview');
  const [donation, setDonation] = useState<Donation | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [currentKioskSession, setCurrentKioskSession] = useState<KioskSession | null>(null);
  const [currentAdminSession, setCurrentAdminSession] = useState<AdminSession | null>(null);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleGoToLogin = () => {
    navigate('login');
  };

  const handleGoToSignup = () => {
    navigate('signup');
  };
  
 
  const handleGoBackToHome = () => {
    navigate('home');
  };

  const handleLogin = async (role: UserRole, sessionData?: KioskSession | AdminSession) => {
    setUserRole(role);
    if (role === 'admin') {
      setCurrentAdminSession(sessionData as AdminSession);
      navigate('admin-dashboard');
    } else {
      setCurrentKioskSession(sessionData as KioskSession);
      await refreshCurrentKioskSession((sessionData as KioskSession).kioskId);
      navigate('campaigns');
    }
  };

 
  const handleLogout = () => {
    setUserRole(null);
    setSelectedCampaign(null);
    setDonation(null);
    setPaymentResult(null);
    setCurrentKioskSession(null);
    setCurrentAdminSession(null);
    setCampaignView('overview');
    navigate('login');
  };
  const refreshCurrentKioskSession = async (kioskIdToRefresh?: string) => {
    const targetKioskId = kioskIdToRefresh || currentKioskSession?.kioskId;
    if (targetKioskId) {
      try {
        const kioskRef = doc(db, 'kiosks', targetKioskId);
        const kioskSnap = await getDoc(kioskRef);
        if (kioskSnap.exists()) {
          setCurrentKioskSession(prev => ({ ...prev!, ...kioskSnap.data() as Kiosk }));
        } else {
          console.warn("Kiosk document not found during refresh:", targetKioskId);
        }
      } catch (error) {
        console.error("Error refreshing kiosk session:", error);
      }
    }
  };
  const handleCampaignSelect = (campaign: Campaign, initialShowDetails: boolean = false) => {
    setSelectedCampaign(campaign);
    setCampaignView(initialShowDetails ? 'overview' : 'donate');
    navigate('campaign');
  };
  const handleCampaignViewChange = (view: 'overview' | 'donate') => {
    setCampaignView(view);
  };
  const handleDonationSubmit = (donationData: Donation) => {
    const donationWithKiosk = { ...donationData, kioskId: currentKioskSession?.kioskId };
    setDonation(donationWithKiosk);
    navigate('payment');
  };
  const handlePaymentSubmit = (result: PaymentResult) => {
    setPaymentResult(result);
    navigate('result');
  };
  const handleEmailConfirmation = () => {
    navigate('email-confirmation');
  };
  const handlePaymentSuccess = (paymentIntentId: string) => {
    handlePaymentSubmit({ success: true, transactionId: paymentIntentId });
  };
  const handleReturnToStart = () => {
    setSelectedCampaign(null);
    setDonation(null);
    setPaymentResult(null);
    setCampaignView('overview');
    if (userRole === 'admin') {
      navigate('admin-dashboard');
    } else {
      navigate('campaigns');
    }
  };
  const handleBackFromCampaign = () => {
    if (campaignView === 'donate') {
      setCampaignView('overview');
    } else {
      navigate('campaigns');
    }
  };
  const handleSignup = (signupData: SignupFormData) => {
    // In a real app, this would make an API call to create the account
    console.log('Signup data:', signupData);
    
    // For demo purposes, simulate successful signup and redirect to login
    // You could also automatically log them in here
    navigate('login');
    
    // TODO: Implement actual signup logic with Supabase
    // - Create user account
    // - Send verification email
    // - Set up organization
    // - Create initial admin session
  };
  const hasPermission = (permission: Permission): boolean => {
    if (!currentAdminSession) return false;
    return currentAdminSession.user.permissions.permissions.includes(permission) ||
           currentAdminSession.user.permissions.permissions.includes('system_admin');
  };

  if (currentScreen === 'home') {
    return (
      <HomePage
        onLogin={handleGoToLogin}
        onSignup={handleGoToSignup}
      />
    );
  }
  if (currentScreen === 'signup') {
    return (
      <SignupScreen
        onSignup={handleSignup}
        onBack={() => navigate('home')}
        onLogin={() => navigate('login')}
      />
    );
  }

  if (userRole === 'admin' && currentAdminSession) {
    return (
      <div className="min-h-screen bg-background">
        {currentScreen === 'admin-dashboard' && (
          <AdminDashboard
            onNavigate={navigate}
            onLogout={handleLogout}
            userSession={currentAdminSession}
            hasPermission={hasPermission}
          />
        )}
        {currentScreen === 'admin-campaigns' && (
          <CampaignManagement
            onNavigate={navigate}
            onLogout={handleLogout}
            userSession={currentAdminSession}
            hasPermission={hasPermission}
          />
        )}
        {currentScreen === 'admin-kiosks' && (
          <KioskManagement
            onNavigate={navigate}
            onLogout={handleLogout}
            userSession={currentAdminSession}
            hasPermission={hasPermission}
          />
        )}
        {currentScreen === 'admin-donations' && (
          <DonationManagement
            onNavigate={navigate}
            onLogout={handleLogout}
            userSession={currentAdminSession}
            hasPermission={hasPermission}
          />
        )}
        {currentScreen === 'admin-users' && (
          <UserManagement
            onNavigate={navigate}
            onLogout={handleLogout}
            userSession={currentAdminSession}
            hasPermission={hasPermission}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'login' && (
      
        <LoginScreen onLogin={handleLogin} onGoBackToHome={handleGoBackToHome} />
      )}

      {currentScreen === 'campaigns' && (
        <CampaignListContainer
          onSelectCampaign={(campaign) => handleCampaignSelect(campaign, false)}
          onViewDetails={(campaign) => handleCampaignSelect(campaign, true)}
          kioskSession={currentKioskSession}
          onLogout={handleLogout}
          refreshCurrentKioskSession={refreshCurrentKioskSession}
        />
      )}

      {currentScreen === 'campaign' && selectedCampaign && (
        <CampaignScreen
          campaign={selectedCampaign}
          initialShowDetails={campaignView === 'overview'}
          onSubmit={handleDonationSubmit}
          onBack={handleBackFromCampaign}
          onViewChange={handleCampaignViewChange}
        />
      )}

      {currentScreen === 'payment' && donation && selectedCampaign && (
        <PaymentContainer
          campaign={selectedCampaign}
          donation={donation}
          onPaymentComplete={handlePaymentSubmit}
          onBack={() => {
            setCampaignView('donate');
            navigate('campaign');
          }}
        />
      )}

      {currentScreen === 'result' && paymentResult && (
        <ResultScreen
          result={paymentResult}
          onEmailConfirmation={paymentResult.success ? handleEmailConfirmation : undefined}
          onReturnToStart={handleReturnToStart}
        />
      )}

      {currentScreen === 'email-confirmation' && paymentResult && (
        <EmailConfirmationScreen
          transactionId={paymentResult.transactionId}
          onComplete={handleReturnToStart}
        />
      )}
    </div>
  );
}