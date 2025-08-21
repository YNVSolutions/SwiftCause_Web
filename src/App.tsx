import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
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

export type Screen =
  | 'login'
  | 'campaigns'
  | 'campaign' // Unified campaign screen (details + donation)
  | 'payment'
  | 'result'
  | 'email-confirmation'
  | 'admin-dashboard'
  | 'admin-campaigns'
  | 'admin-kiosks'
  | 'admin-donations'
  | 'admin-users';

export type UserRole = 'kiosk' | 'admin';

// Granular permission system
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
  // Pricing Options
  predefinedAmounts: number[];
  allowCustomAmount: boolean;
  minCustomAmount: number;
  maxCustomAmount: number;
  suggestedAmounts: number[];

  // Subscription Settings
  enableRecurring: boolean;
  recurringIntervals: ('monthly' | 'quarterly' | 'yearly')[];
  defaultRecurringInterval: 'monthly' | 'quarterly' | 'yearly';
  recurringDiscount?: number; // percentage discount for recurring

  // Display Settings
  displayStyle: 'grid' | 'list' | 'carousel';
  showProgressBar: boolean;
  showDonorCount: boolean;
  showRecentDonations: boolean;
  maxRecentDonations: number;

  // Call-to-Action
  primaryCTAText: string;
  secondaryCTAText?: string;
  urgencyMessage?: string;

  // Visual Customization
  accentColor?: string;
  backgroundImage?: string;
  theme: 'default' | 'minimal' | 'vibrant' | 'elegant';

  // Form Configuration
  requiredFields: ('email' | 'name' | 'phone' | 'address')[];
  optionalFields: ('email' | 'name' | 'phone' | 'address' | 'message')[];
  enableAnonymousDonations: boolean;

  // Social Features
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
  image: string;
  category: string;
  status?: 'active' | 'paused' | 'completed';
  createdAt?: string;
  endDate?: string;
  organizationId?: string;

  // Enhanced configuration
  configuration: CampaignConfiguration;

  // Kiosk Assignment
  assignedKiosks?: string[]; // Array of kiosk IDs
  isGlobal?: boolean; // If true, shows on all kiosks

  // Additional campaign content
  longDescription?: string;
  videoUrl?: string;
  galleryImages?: string[];
  organizationInfo?: {
    name: string;
    description: string;
    website?: string;
    logo?: string;
  };

  // Impact metrics
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
  accessCode: string; // Required for authentication
  qrCode?: string; // QR code data for quick login

  // Campaign Assignment
  assignedCampaigns?: string[]; // Array of campaign IDs
  defaultCampaign?: string; // Default campaign to highlight

  // Kiosk Configuration
  settings?: {
    displayMode: 'grid' | 'list' | 'carousel';
    showAllCampaigns: boolean; // If true, shows global campaigns too
    maxCampaignsDisplay: number;
    autoRotateCampaigns: boolean;
    rotationInterval?: number; // in seconds
  };

  // Hardware/Location Details
  deviceInfo?: {
    model?: string;
    os?: string;
    screenSize?: string;
    touchCapable?: boolean;
  };

  // Operational Details
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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
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

  const handleLogin = (role: UserRole, sessionData?: KioskSession | AdminSession) => {
    setUserRole(role);
    if (role === 'admin') {
      setCurrentAdminSession(sessionData as AdminSession);
      navigate('admin-dashboard');
    } else {
      setCurrentKioskSession(sessionData as KioskSession);
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

  const refreshCurrentKioskSession = async () => {
    if (currentKioskSession?.kioskId) {
      try {
        const kioskRef = doc(db, 'kiosks', currentKioskSession.kioskId);
        const kioskSnap = await getDoc(kioskRef);
        if (kioskSnap.exists()) {
          setCurrentKioskSession(prev => ({ ...prev!, ...kioskSnap.data() as Kiosk }));
        } else {
          console.warn("Kiosk document not found during refresh:", currentKioskSession.kioskId);
        }
      } catch (error) {
        console.error("Error refreshing kiosk session:", error);
      }
    }
  };

  const handleCampaignSelect = (campaign: Campaign, initialShowDetails: boolean = false) => {
    setSelectedCampaign(campaign);
    // The 'campaign' screen in CampaignScreen.tsx now handles both overview and donate views
    // The initialShowDetails flag will tell CampaignScreen whether to show details expanded
    setCampaignView(initialShowDetails ? 'overview' : 'donate'); // This prop is now primarily for CampaignScreen's internal logic
    navigate('campaign');
  };

  const handleCampaignViewChange = (view: 'overview' | 'donate') => {
    // This function might become redundant if CampaignScreen fully manages its internal view
    // But keeping it for now in case internal view toggling is still desired.
    setCampaignView(view);
  };

  const handleDonationSubmit = (donationData: Donation) => {
    // Add kiosk ID to donation if available
    const donationWithKiosk = {
      ...donationData,
      kioskId: currentKioskSession?.kioskId
    };
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

  // Permission checking utility
  const hasPermission = (permission: Permission): boolean => {
    if (!currentAdminSession) return false;
    return currentAdminSession.user.permissions.permissions.includes(permission) ||
           currentAdminSession.user.permissions.permissions.includes('system_admin');
  };

  // Render admin screens
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

  // Render kiosk screens
  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}

      {currentScreen === 'campaigns' && (
        <CampaignListContainer
          onSelectCampaign={(campaign) => handleCampaignSelect(campaign, false)} // Donate button
          onViewDetails={(campaign) => handleCampaignSelect(campaign, true)} // Info button, show details
          kioskSession={currentKioskSession}
          onLogout={handleLogout}
          refreshCurrentKioskSession={refreshCurrentKioskSession}
        />
      )}

      {currentScreen === 'campaign' && selectedCampaign && (
        <CampaignScreen
          campaign={selectedCampaign}
          initialShowDetails={campaignView === 'overview'} // Pass initialShowDetails based on campaignView
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