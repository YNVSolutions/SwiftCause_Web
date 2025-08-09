import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

import { 
  Shield, 
  Heart, 
  Users, 
  Globe, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  ArrowRight,
  DollarSign,
  MapPin,
  Clock,
  Star,
  Settings,
  UserCog,
  Database,
  Monitor,
  Wifi,
  WifiOff,
  AlertTriangle,
  QrCode,
  Camera,
  KeyRound
} from 'lucide-react';
import { UserRole, KioskSession, AdminSession, Kiosk, User, UserPermissions, Permission } from '../App';
import { QRCodeScanner } from './QRCodeScanner';
import { ApiClient, AuthService, isSupabaseConfigured } from '../utils/supabase/client';

interface LoginScreenProps {
  onLogin: (role: UserRole, sessionData?: KioskSession | AdminSession) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'kiosk' | 'admin'>('kiosk');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [kioskCredentials, setKioskCredentials] = useState({
    kioskId: '',
    accessCode: ''
  });
  const [adminCredentials, setAdminCredentials] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');

  // Mock real-time statistics
  const [stats, setStats] = useState({
    totalRaised: 2847650,
    activeCampaigns: 42,
    totalDonors: 15847,
    successRate: 98.5,
    activeKiosks: 28,
    monthlyGrowth: 15.3
  });

  // Mock kiosks data (now standalone, no user relationships)
  const availableKiosks: Kiosk[] = [
    {
      id: 'KIOSK-NYC-001',
      name: 'Times Square Terminal',
      location: 'Times Square, New York',
      status: 'online',
      accessCode: 'TS2024',
      qrCode: 'KIOSK-NYC-001:TS2024',
      assignedCampaigns: ['1', '2', '3'],
      defaultCampaign: '1',
      settings: {
        displayMode: 'grid',
        showAllCampaigns: false,
        maxCampaignsDisplay: 6,
        autoRotateCampaigns: false
      }
    },
    {
      id: 'KIOSK-SF-002',
      name: 'Golden Gate Hub',
      location: 'Union Square, San Francisco',
      status: 'online',
      accessCode: 'SF2024',
      qrCode: 'KIOSK-SF-002:SF2024',
      assignedCampaigns: ['2', '4'],
      defaultCampaign: '2',
      settings: {
        displayMode: 'carousel',
        showAllCampaigns: true,
        maxCampaignsDisplay: 4,
        autoRotateCampaigns: true,
        rotationInterval: 30
      }
    },
    {
      id: 'KIOSK-LA-003',
      name: 'Downtown Community Center',
      location: 'Downtown LA, California',
      status: 'online',
      accessCode: 'LA2024',
      qrCode: 'KIOSK-LA-003:LA2024',
      assignedCampaigns: ['1', '3', '4'],
      defaultCampaign: '3',
      settings: {
        displayMode: 'list',
        showAllCampaigns: false,
        maxCampaignsDisplay: 5,
        autoRotateCampaigns: false
      }
    },
    {
      id: 'KIOSK-CHI-004',
      name: 'Millennium Park Station',
      location: 'Chicago, Illinois',
      status: 'maintenance',
      accessCode: 'CH2024',
      qrCode: 'KIOSK-CHI-004:CH2024',
      assignedCampaigns: ['1', '2'],
      defaultCampaign: '1',
      settings: {
        displayMode: 'grid',
        showAllCampaigns: false,
        maxCampaignsDisplay: 4,
        autoRotateCampaigns: false
      }
    },
    {
      id: 'KIOSK-MIA-005',
      name: 'Beach Walk Plaza',
      location: 'Miami Beach, Florida',
      status: 'online',
      accessCode: 'MI2024',
      qrCode: 'KIOSK-MIA-005:MI2024',
      assignedCampaigns: ['2', '3'],
      defaultCampaign: '2',
      settings: {
        displayMode: 'grid',
        showAllCampaigns: true,
        maxCampaignsDisplay: 6,
        autoRotateCampaigns: true,
        rotationInterval: 45
      }
    }
  ];

  // Mock admin users with different permission levels
  const mockUsers: User[] = [
    {
      id: 'user-1',
      username: 'admin',
      email: 'admin@donatehub.com',
      role: 'admin',
      isActive: true,
      department: 'IT',
      permissions: {
        role: 'super_admin',
        description: 'Full system access and control',
        permissions: ['system_admin'] // system_admin includes all permissions
      }
    },
    {
      id: 'user-2',
      username: 'manager',
      email: 'manager@donatehub.com',
      role: 'admin',
      isActive: true,
      department: 'Operations',
      permissions: {
        role: 'manager',
        description: 'Campaign and kiosk management',
        permissions: [
          'view_dashboard',
          'view_campaigns', 'create_campaign', 'edit_campaign',
          'view_kiosks', 'create_kiosk', 'edit_kiosk', 'assign_campaigns',
          'view_donations', 'export_donations',
          'view_users'
        ]
      }
    },
    {
      id: 'user-3',
      username: 'operator',
      email: 'operator@donatehub.com',
      role: 'admin',
      isActive: true,
      department: 'Support',
      permissions: {
        role: 'operator',
        description: 'Campaign operations and basic kiosk management',
        permissions: [
          'view_dashboard',
          'view_campaigns', 'edit_campaign',
          'view_kiosks', 'assign_campaigns',
          'view_donations'
        ]
      }
    },
    {
      id: 'user-4',
      username: 'viewer',
      email: 'viewer@donatehub.com',
      role: 'admin',
      isActive: true,
      department: 'Analytics',
      permissions: {
        role: 'viewer',
        description: 'Read-only access to view data and reports',
        permissions: [
          'view_dashboard',
          'view_campaigns',
          'view_kiosks',
          'view_donations'
        ]
      }
    }
  ];

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalRaised: prev.totalRaised + Math.floor(Math.random() * 100),
        totalDonors: prev.totalDonors + Math.floor(Math.random() * 3)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleKioskLogin = async (kioskId: string, accessCode: string, loginMethod: 'qr' | 'manual' = 'manual') => {
    setLoginError('');
    
    try {
      // Use Supabase API to authenticate kiosk
      const result = await ApiClient.authenticateKiosk(kioskId, accessCode);
      
      if (result.success && result.kiosk) {
        // Create kiosk session
        const kioskSession: KioskSession = {
          kioskId: result.kiosk.id,
          kioskName: result.kiosk.name,
          startTime: new Date().toISOString(),
          assignedCampaigns: result.kiosk.assignedCampaigns || [],
          settings: result.kiosk.settings || {
            displayMode: 'grid',
            showAllCampaigns: false,
            maxCampaignsDisplay: 6,
            autoRotateCampaigns: false
          },
          loginMethod
        };

        onLogin('kiosk', kioskSession);
      }
    } catch (error) {
      console.error('Kiosk authentication error:', error);
      setLoginError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    }
  };

  const handleKioskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleKioskLogin(kioskCredentials.kioskId, kioskCredentials.accessCode, 'manual');
  };

  const handleQRScanSuccess = (qrData: string) => {
    // Parse QR data format: "KIOSK-ID:ACCESS-CODE"
    const [kioskId, accessCode] = qrData.split(':');
    if (kioskId && accessCode) {
      handleKioskLogin(kioskId, accessCode, 'qr');
    } else {
      setLoginError('Invalid QR code format. Please try scanning again.');
    }
    setShowQRScanner(false);
  };

  const handleQRScanError = (error: string) => {
    setLoginError(error);
    setShowQRScanner(false);
  };

const handleAdminSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginError('');

  const { email, password } = adminCredentials;

  if (!email || !password) {
    setLoginError('Please enter both email and password.');
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // using the uid here to fetch
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      setLoginError('No user profile found for this account.');
      return;
    }

    const userData = userSnap.data() as User;

    if (!userData.isActive) {
      setLoginError('User account is disabled.');
      return;
    }

    // session creation
    const adminSession: AdminSession = {
      user: {
        ...userData,
        lastLogin: new Date().toISOString()
      },
      loginTime: new Date().toISOString()
    };

    onLogin('admin', adminSession);
  } catch (error: any) {
    console.error('Login error:', error);
    setLoginError(error.message || 'Authentication failed. Please try again.');
  }
};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const features = [
    {
      icon: Globe,
      title: "Global Impact",
      description: "Support causes worldwide with secure, instant donations"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Bank-level security with PCI DSS compliance"
    },
    {
      icon: TrendingUp,
      title: "Real-time Tracking",
      description: "Watch your impact grow with live campaign updates"
    },
    {
      icon: Award,
      title: "Verified Campaigns",
      description: "All campaigns verified by our trusted partners"
    }
  ];

  const adminFeatures = [
    {
      icon: Database,
      title: "Campaign Management",
      description: "Create, edit, and monitor donation campaigns"
    },
    {
      icon: Settings,
      title: "Kiosk Configuration",
      description: "Deploy and manage kiosk networks"
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Deep insights into donation patterns and performance"
    },
    {
      icon: UserCog,
      title: "User Management",
      description: "Control access and permissions across the platform"
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Regular Donor",
      text: "The easiest way to make a difference. I love seeing the real-time impact!",
      rating: 5
    },
    {
      name: "Mike R.", 
      role: "Monthly Supporter",
      text: "Transparent, secure, and incredibly user-friendly. Highly recommended.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with branding */}
      <header className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">DonateHub</h1>
                <p className="text-sm text-gray-600">Platform Access Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                System Online
              </Badge>
              {isSupabaseConfigured() ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Database className="w-3 h-3 mr-1" />
                  Supabase Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Demo Mode
                </Badge>
              )}
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                24/7 Support
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left side - Information Panel */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center p-8 xl:p-16">
          {/* Hero Section */}
          <div className="max-w-lg">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Live platform monitoring
            </div>
            
            <h2 className="text-4xl xl:text-5xl text-gray-900 mb-6 leading-tight">
              Powering <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">global</span> generosity
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Comprehensive donation management platform trusted by organizations worldwide. 
              Access your kiosk interface or admin dashboard to make a difference.
            </p>

            {/* Live Statistics */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <Badge variant="secondary" className="text-xs">Live</Badge>
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalRaised)}
                </div>
                <p className="text-sm text-gray-600">Total raised this year</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  {formatNumber(stats.totalDonors)}
                </div>
                <p className="text-sm text-gray-600">Generous donors</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <Globe className="h-8 w-8 text-purple-600" />
                  <Badge variant="secondary" className="text-xs">Global</Badge>
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  {stats.activeCampaigns}
                </div>
                <p className="text-sm text-gray-600">Active campaigns</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <Settings className="h-8 w-8 text-orange-600" />
                  <Badge variant="secondary" className="text-xs">Online</Badge>
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  {stats.activeKiosks}
                </div>
                <p className="text-sm text-gray-600">Active kiosks</p>
              </div>
            </div>

            {/* Featured Campaign Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1541199249251-f713e6145474?w=100&h=100&fit=crop"
                    alt="Featured campaign"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Clean Water for All</h4>
                  <p className="text-xs text-gray-600 mb-2">Help provide clean drinking water to communities in need</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-green-600">$32,500 raised</span>
                    </div>
                    <Progress value={65} className="h-1.5" />
                    <div className="text-xs text-gray-500">65% of $50,000 goal</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">"{testimonial.text}"</p>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">{testimonial.name}</span> • {testimonial.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Login Forms */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {/* Mobile header for small screens */}
            <div className="lg:hidden text-center mb-8">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl text-gray-900 mb-2">Welcome to DonateHub</h2>
              <p className="text-gray-600">Access portal for kiosks and administration</p>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-xl lg:text-2xl">Platform Access</CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  Choose your access type to continue
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'kiosk' | 'admin')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="kiosk" className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>Kiosk</span>
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="flex items-center space-x-2">
                      <UserCog className="w-4 h-4" />
                      <span>Admin</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="kiosk" className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                        <Heart className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h3 className="font-medium">Kiosk Access</h3>
                      <p className="text-sm text-gray-600">Scan QR code or enter kiosk credentials</p>
                    </div>

                    {/* QR Code vs Manual Toggle */}
                    <div className="flex space-x-2 mb-6">
                      <Button
                        type="button"
                        onClick={() => setShowQRScanner(true)}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan QR Code
                      </Button>
                      <div className="flex items-center justify-center px-3 text-sm text-gray-500">
                        or
                      </div>
                    </div>

                    {/* Manual Entry Form */}
                    <form onSubmit={handleKioskSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="kioskId" className="flex items-center space-x-2">
                          <Monitor className="w-4 h-4 text-gray-500" />
                          <span>Kiosk ID</span>
                        </Label>
                        <Input
                          id="kioskId"
                          type="text"
                          placeholder="e.g., KIOSK-NYC-001"
                          value={kioskCredentials.kioskId}
                          onChange={(e) => setKioskCredentials(prev => ({ ...prev, kioskId: e.target.value.toUpperCase() }))}
                          className="h-12"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="accessCode" className="flex items-center space-x-2">
                          <KeyRound className="w-4 h-4 text-gray-500" />
                          <span>Access Code</span>
                        </Label>
                        <Input
                          id="accessCode"
                          type="password"
                          placeholder="Enter kiosk access code"
                          value={kioskCredentials.accessCode}
                          onChange={(e) => setKioskCredentials(prev => ({ ...prev, accessCode: e.target.value }))}
                          className="h-12"
                          required
                        />
                      </div>

                      {/* Error Display */}
                      {loginError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-700">{loginError}</p>
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg"
                        disabled={!kioskCredentials.kioskId || !kioskCredentials.accessCode}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Access Donation Interface
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>

                    {/* Help Text */}
                    <div className="text-center space-y-2 pt-4 border-t">
                      <p className="text-xs text-gray-600">
                        Find your kiosk ID and access code on the device label
                      </p>
                      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <QrCode className="w-3 h-3" />
                          <span>QR scan preferred</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>Secure access</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="admin" className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                        <UserCog className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-medium">Administrator Access</h3>
                      <p className="text-sm text-gray-600">For platform management and analytics</p>
                    </div>

                    <form onSubmit={handleAdminSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center space-x-2">
                          <UserCog className="w-4 h-4 text-gray-500" />
                          <span>Email</span>
                        </Label>
                        <Input
                          id="email"
                          type="text"
                          placeholder="Enter admin email"
                          value={adminCredentials.email}
                          onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                          className="h-12"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-gray-500" />
                          <span>Password</span>
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter admin password"
                          value={adminCredentials.password}
                          onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="h-12"
                          required
                        />
                      </div>

                      {/* Error Display */}
                      {loginError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-700">{loginError}</p>
                          </div>
                        </div>
                      )}
                      
                      <Button type="submit" className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
                        <UserCog className="mr-2 h-4 w-4" />
                        Access Admin Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>

                    {/* Demo Account Info */}
                    <div className="pt-4 border-t space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">Demo Accounts:</h4>
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">admin</span>
                          <Badge variant="outline" className="text-xs">Super Admin</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">manager</span>
                          <Badge variant="outline" className="text-xs">Manager</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">operator</span>
                          <Badge variant="outline" className="text-xs">Operator</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">viewer</span>
                          <Badge variant="outline" className="text-xs">View Only</Badge>
                        </div>
                        <p className="text-center text-xs text-gray-500 pt-2">
                          Use any password for demo accounts
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Quick Features for Mobile - Kiosk */}
                {activeTab === 'kiosk' && (
                  <div className="lg:hidden space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900">Kiosk Features:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <feature.icon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-xs text-gray-700">{feature.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Support Information */}
                <div className="pt-4 border-t text-center space-y-2">
                  <p className="text-sm text-gray-600">Need assistance?</p>
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <a href="tel:1-800-DONATE-1" className="text-indigo-600 hover:text-indigo-700 font-medium">
                      📞 1-800-DONATE-1
                    </a>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-600">24/7 Support</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>Secure • Encrypted • Verified</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Notice */}
            {!isSupabaseConfigured() && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <h4 className="text-sm font-medium text-yellow-800">Demo Mode Active</h4>
                </div>
                <p className="text-xs text-yellow-700 mb-2">
                  Supabase not configured. Using mock data for demonstration.
                </p>
                <p className="text-xs text-yellow-600">
                  To connect to Supabase, update the credentials in <code className="bg-yellow-100 px-1 rounded">utils/supabase/info.tsx</code>
                </p>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 mb-3">Trusted by organizations worldwide</p>
              <div className="flex items-center justify-center space-x-6 opacity-60">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs">SSL Secured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs">PCI Compliant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">SOC 2 Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* QR Scanner Modal */}
      <QRCodeScanner
        isActive={showQRScanner}
        onScanSuccess={handleQRScanSuccess}
        onScanError={handleQRScanError}
        onClose={() => setShowQRScanner(false)}
      />
    </div>
  );
}