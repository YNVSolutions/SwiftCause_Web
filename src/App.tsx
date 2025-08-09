import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { CampaignListScreen } from './components/CampaignListScreen';
import { CampaignScreen } from './components/CampaignScreen';
import { PaymentScreen } from './components/PaymentScreen';
import { ResultScreen } from './components/ResultScreen';
import { EmailConfirmationScreen } from './components/EmailConfirmationScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { KioskManagement } from './components/admin/KioskManagement';
import { DonationManagement } from './components/admin/DonationManagement';
import { UserManagement } from './components/admin/UserManagement';
import CampaignManagement from './components/admin/CampaignManagement';

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
  settings: Kiosk['settings'];
  loginMethod: 'qr' | 'manual'; // Track how user logged in
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

  const handleCampaignSelect = (campaign: Campaign, view: 'overview' | 'donate' = 'overview') => {
    setSelectedCampaign(campaign);
    setCampaignView(view);
    navigate('campaign');
  };

  const handleCampaignViewChange = (view: 'overview' | 'donate') => {
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
        <CampaignListScreen 
          onSelectCampaign={(campaign) => handleCampaignSelect(campaign, 'donate')}
          onViewDetails={(campaign) => handleCampaignSelect(campaign, 'overview')}
          kioskSession={currentKioskSession}
        />
      )}
      
      {currentScreen === 'campaign' && selectedCampaign && (
        <CampaignScreen 
          campaign={selectedCampaign}
          view={campaignView}
          onSubmit={handleDonationSubmit}
          onBack={handleBackFromCampaign}
          onViewChange={handleCampaignViewChange}
        />
      )}
      
      {currentScreen === 'payment' && donation && selectedCampaign && (
        <PaymentScreen 
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