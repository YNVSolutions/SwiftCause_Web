import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  DollarSign,
  Users,
  TrendingUp,
  Settings,
  Heart,
  Globe,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  Database,
  UserCog,
  LogOut,
  Plus,
  Download,
  RefreshCw,
  Smartphone,
  CreditCard,
  Shield,
  BookOpen,
  HelpCircle,
  Star,
  ChevronDown,
  ChevronUp, // Added ChevronUp
  ChevronRight,
  Monitor,
  QrCode,
  BarChart3,
  Target,
  Workflow,
  Bell,
  Lightbulb,
  Rocket,
  Play
} from 'lucide-react';
import { Screen, AdminSession, Permission } from '../../App';
import { db } from '../../lib/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  DocumentData,
} from 'firebase/firestore';
import { useDashboardData } from '../../hooks/useDashboardData';

interface AdminDashboardProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}

const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#6366F1'];

export function AdminDashboard({ onNavigate, onLogout, userSession, hasPermission }: AdminDashboardProps) {
  const {
    stats,
    recentActivities,
    alerts,
    loading,
    error,
    refreshDashboard
  } = useDashboardData();

  const [topCampaigns, setTopCampaigns] = useState<DocumentData[]>([]);
  const [goalComparisonData, setGoalComparisonData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [showFeatures, setShowFeatures] = useState(true);
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [isLegendExpanded, setIsLegendExpanded] = useState(false); // State for legend

  // Platform features data
  const platformFeatures = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Touch-Friendly Kiosks',
      description: 'Intuitive donation kiosks optimized for mobile and touch interfaces',
      benefits: ['Mobile-first design', 'Responsive layouts', 'Touch gestures', 'iOS/Android compatibility'],
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Secure Payment Processing',
      description: 'PCI-compliant payment processing with multiple payment methods',
      benefits: ['Credit/Debit cards', 'Digital wallets', 'Recurring donations', 'Fraud protection'],
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Advanced Analytics',
      description: 'Real-time insights and detailed reporting for data-driven decisions',
      benefits: ['Real-time dashboards', 'Custom reports', 'Donor insights', 'Performance metrics'],
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: 'Campaign Management',
      description: 'Fully customizable campaigns with flexible configuration options',
      benefits: ['Custom pricing tiers', 'Visual themes', 'Goal tracking', 'Multi-location support'],
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'QR Code Access',
      description: 'Quick kiosk access via QR codes or device-specific access codes',
      benefits: ['QR code login', 'Secure access codes', 'Session management', 'User tracking'],
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'User & Permission System',
      description: 'Granular permission controls for different user roles and access levels',
      benefits: ['Role-based access', 'Granular permissions', 'User management', 'Audit trails'],
      color: 'bg-red-50 text-red-600 border-red-200'
    }
  ];

  // Getting started steps
  const gettingStartedSteps = [
    {
      step: 1,
      title: 'Create Your First Campaign',
      description: 'Set up a donation campaign with custom goals, pricing, and branding',
      action: 'Create Campaign',
      actionFunction: () => onNavigate('admin-campaigns'),
      icon: <Target className="w-5 h-5" />,
      estimated: '5 minutes',
      canAccess: hasPermission('create_campaign')
    },
    {
      step: 2,
      title: 'Configure Donation Kiosks',
      description: 'Set up kiosks in your locations with QR codes and access controls',
      action: 'Setup Kiosks',
      actionFunction: () => onNavigate('admin-kiosks'),
      icon: <Monitor className="w-5 h-5" />,
      estimated: '10 minutes',
      canAccess: hasPermission('create_kiosk')
    },
    {
      step: 3,
      title: 'Assign Campaigns to Kiosks',
      description: 'Connect your campaigns to specific kiosk locations for targeted fundraising',
      action: 'Assign Campaigns',
      actionFunction: () => onNavigate('admin-kiosks'),
      icon: <Workflow className="w-5 h-5" />,
      estimated: '3 minutes',
      canAccess: hasPermission('assign_campaigns')
    },
    {
      step: 4,
      title: 'Invite Team Members',
      description: 'Add users with appropriate permissions to help manage your platform',
      action: 'Manage Users',
      actionFunction: () => onNavigate('admin-users'),
      icon: <Users className="w-5 h-5" />,
      estimated: '5 minutes',
      canAccess: hasPermission('create_user')
    }
  ];

  // Quick tips for users
  const quickTips = [
    {
      icon: <Lightbulb className="w-5 h-5 text-yellow-600" />,
      title: 'Pro Tip: Use Global Campaigns',
      description: 'Mark campaigns as "Global" to display them across all kiosks automatically.'
    },
    {
      icon: <Star className="w-5 h-5 text-blue-600" />,
      title: 'Feature Campaigns',
      description: 'Set default campaigns for each kiosk to highlight your most important causes.'
    },
    {
      icon: <Bell className="w-5 h-5 text-green-600" />,
      title: 'Monitor Performance',
      description: 'Check the analytics regularly to optimize campaign performance and kiosk placement.'
    }
  ];

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const campaignsRef = collection(db, 'campaigns');
        const topListQuery = query(campaignsRef, orderBy('collectedAmount', 'desc'), limit(4));
        const topListSnapshot = await getDocs(topListQuery);
        setTopCampaigns(topListSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const topChartQuery = query(campaignsRef, orderBy('collectedAmount', 'desc'), limit(5));
        const topChartSnapshot = await getDocs(topChartQuery);
        const comparisonData = topChartSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: data.title,
            Collected: data.collectedAmount || 0,
            Goal: data.goalAmount || 0,
          }
        });
        setGoalComparisonData(comparisonData);

        const allCampaignsSnapshot = await getDocs(campaignsRef);
        const tagCounts: { [key: string]: number } = {};
        let totalTags = 0;
        allCampaignsSnapshot.forEach(doc => {
          const tags = doc.data().tags;
          if (Array.isArray(tags) && tags.length > 0) {
            tags.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              totalTags++;
            });
          }
        });
        if (totalTags > 0) {
          const formattedCategoryData = Object.keys(tagCounts).map((name, index) => ({
            name,
            value: Math.round((tagCounts[name] / totalTags) * 100),
            color: CHART_COLORS[index % CHART_COLORS.length],
          }));
          setCategoryData(formattedCategoryData);
        }

      } catch (error) {
        console.error("Error fetching chart data: ", error);
      }
    };

    fetchChartData();
  }, []);

  const handleRefresh = () => {
    refreshDashboard();
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  const formatLargeCurrency = (amount: number) => {
    if (amount === 0) return '$0';
    if (!amount || typeof amount !== 'number') return '...';

    const tiers = [
      { value: 1e12, name: 'T' },
      { value: 1e9, name: 'B' },
      { value: 1e6, name: 'M' },
      { value: 1e3, name: 'K' },
    ];

    const tier = tiers.find(t => amount >= t.value);

    if (tier) {
      const value = (amount / tier.value).toFixed(1);
      const [integerPart, decimalPart] = value.split('.');
      const paddedInteger = integerPart.padStart(3, '0');
      return `$ ${paddedInteger}.${decimalPart} ${tier.name}`;
    }

    return formatCurrency(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation': return <Heart className="w-4 h-4 text-green-600" />;
      case 'campaign': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'kiosk': return <Settings className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const displayedCategories = isLegendExpanded ? categoryData : categoryData.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                  <Badge variant="outline" className="text-xs">
                    {userSession.user.permissions.role}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Welcome back, {userSession.user.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="flex items-center space-x-2">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              Welcome to Your Donation Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Manage campaigns, configure kiosks, and track donations across your organization with our comprehensive donation management platform.
            </p>
          </div>

          <Collapsible open={showFeatures} onOpenChange={setShowFeatures}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto mb-4">
                <div className="flex items-center space-x-2">
                  <Rocket className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Platform Features</h3>
                </div>
                {showFeatures ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platformFeatures.map((feature, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                        {feature.icon}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={showGettingStarted} onOpenChange={setShowGettingStarted}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Getting Started</h3>
                </div>
                {showGettingStarted ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gettingStartedSteps.map((step, index) => (
                  <Card key={index} className={`${step.canAccess ? 'hover:shadow-md transition-shadow' : 'opacity-60'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="text-indigo-600">
                              {step.icon}
                            </div>
                            <h4 className="font-semibold text-gray-900">{step.title}</h4>
                          </div>
                          <p className="text-gray-600 mb-4">{step.description}</p>
                          <div className="flex items-center justify-between">
                            {step.canAccess ? (
                              <Button
                                onClick={step.actionFunction}
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                {step.action}
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <HelpCircle className="w-3 h-3 mr-1" />
                                Requires permission
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">~{step.estimated}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900">
                    <Lightbulb className="w-5 h-5" />
                    <span>Quick Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickTips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {tip.icon}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">{tip.title}</h5>
                          <p className="text-sm text-gray-600">{tip.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl text-gray-900">Overview</h2>
            <p className="text-gray-600">Monitor your donation platform performance</p>
          </div>
          <div className="flex items-center space-x-3">
            {hasPermission('create_campaign') && (
              <Button onClick={() => onNavigate('admin-campaigns')} className="bg-indigo-600 hover:bg-indigo-700">
                <Settings className="w-4 h-4 mr-2" />
                Manage Campaigns
              </Button>
            )}
            {hasPermission('view_kiosks') && (
              <Button variant="outline" onClick={() => onNavigate('admin-kiosks')}>
                <Settings className="w-4 h-4 mr-2" />
                Manage Kiosks
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Raised</p>
                  <p className="font-semibold text-gray-900 whitespace-nowrap text-[clamp(1.125rem,4vw,1.5rem)]">
                    {loading ? '...' : formatLargeCurrency(stats.totalRaised)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center"><DollarSign className="h-6 w-6 text-green-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : formatNumber(stats.totalDonations)}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center"><Heart className="h-6 w-6 text-blue-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.activeCampaigns}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center"><Globe className="h-6 w-6 text-purple-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Kiosks</p>
                  <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.activeKiosks}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center"><Settings className="h-6 w-6 text-orange-600" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Goal Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={goalComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={false} />
                  <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="Collected" fill="#3B82F6" />
                  <Bar dataKey="Goal" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Campaign Categories</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {displayedCategories.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="h-3 w-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-600 truncate">{entry.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{entry.value}%</span>
                    </div>
                  ))}
                </div>
                {categoryData.length > 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-indigo-600 hover:text-indigo-700"
                    onClick={() => setIsLegendExpanded(!isLegendExpanded)}
                  >
                    {isLegendExpanded ? (
                      <span className="flex items-center">
                        Show Less <ChevronUp className="w-4 h-4 ml-1" />
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Show More <ChevronDown className="w-4 h-4 ml-1" />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Campaigns by fundraising progress</CardDescription>
              </div>
              {hasPermission('view_campaigns') && (
                <Button variant="outline" size="sm" onClick={() => onNavigate('admin-campaigns')}>View All</Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCampaigns.length > 0 ? topCampaigns.map((campaign) => {
                  const collected = campaign.collectedAmount || 0;
                  const goal = campaign.goalAmount || 1;
                  const progress = Math.round((collected / goal) * 100);
                  return (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">{formatCurrency(collected)}</p>
                          <p className="text-xs text-gray-500">{campaign.donationCount || 0} donors</p>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{progress}% complete</span>
                        <span>Goal: {formatCurrency(goal)}</span>
                      </div>
                    </div>
                  );
                }) : <p className="text-sm text-gray-500">No campaign data available.</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        {activity.kioskId && (<Badge variant="secondary" className="text-xs">{activity.kioskId}</Badge>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><AlertCircle className="w-5 h-5 text-yellow-600" /><span>System Alerts</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
                    <p className="text-sm text-gray-900">{alert.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {hasPermission('view_campaigns') && <Button variant="outline" className="justify-start h-12" onClick={() => onNavigate('admin-campaigns')}><Database className="w-4 h-4 mr-3" />Manage Campaigns</Button>}
                {hasPermission('view_kiosks') && <Button variant="outline" className="justify-start h-12" onClick={() => onNavigate('admin-kiosks')}><Settings className="w-4 h-4 mr-3" />Configure Kiosks</Button>}
                {hasPermission('view_donations') && <Button variant="outline" className="justify-start h-12" onClick={() => onNavigate('admin-donations')}><TrendingUp className="w-4 h-4 mr-3" />View Donations</Button>}
                {hasPermission('view_users') && <Button variant="outline" className="justify-start h-12" onClick={() => onNavigate('admin-users')}><UserCog className="w-4 h-4 mr-3" />User Management</Button>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}