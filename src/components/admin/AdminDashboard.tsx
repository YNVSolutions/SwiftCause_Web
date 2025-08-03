import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart,
  Line,
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
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Database,
  UserCog,
  LogOut,
  Plus,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Screen, AdminSession, Permission } from '../../App';

interface AdminDashboardProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}

export function AdminDashboard({ onNavigate, onLogout, userSession, hasPermission }: AdminDashboardProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Mock dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalRaised: 2847650,
    totalDonations: 18543,
    activeCampaigns: 42,
    activeKiosks: 28,
    avgDonation: 153.54,
    conversionRate: 67.3,
    monthlyGrowth: 15.3,
    successfulTransactions: 98.7
  });

  const donationTrends = [
    { date: '2024-01-01', amount: 12500, donations: 85 },
    { date: '2024-01-02', amount: 15200, donations: 102 },
    { date: '2024-01-03', amount: 18700, donations: 127 },
    { date: '2024-01-04', amount: 22100, donations: 145 },
    { date: '2024-01-05', amount: 19800, donations: 132 },
    { date: '2024-01-06', amount: 25300, donations: 168 },
    { date: '2024-01-07', amount: 28900, donations: 189 }
  ];

  const campaignPerformance = [
    { name: 'Clean Water for All', raised: 32500, goal: 50000, donors: 245 },
    { name: 'Education for Every Child', raised: 45300, goal: 75000, donors: 312 },
    { name: 'Emergency Disaster Relief', raised: 78900, goal: 100000, donors: 489 },
    { name: 'Local Food Bank Support', raised: 18750, goal: 30000, donors: 156 }
  ];

  const categoryDistribution = [
    { name: 'Global Health', value: 35, color: '#3B82F6' },
    { name: 'Education', value: 28, color: '#8B5CF6' },
    { name: 'Emergency Relief', value: 22, color: '#EF4444' },
    { name: 'Food Security', value: 15, color: '#10B981' }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'donation',
      message: 'New donation of $250 to Clean Water for All',
      timestamp: '2 minutes ago',
      kioskId: 'KIOSK-NYC-001'
    },
    {
      id: 2,
      type: 'campaign',
      message: 'Campaign "Education for Every Child" reached 60% of goal',
      timestamp: '15 minutes ago',
      kioskId: null
    },
    {
      id: 3,
      type: 'kiosk',
      message: 'Kiosk KIOSK-LA-003 came online',
      timestamp: '32 minutes ago',
      kioskId: 'KIOSK-LA-003'
    },
    {
      id: 4,
      type: 'donation',
      message: 'New donation of $500 to Emergency Disaster Relief',
      timestamp: '1 hour ago',
      kioskId: 'KIOSK-CHI-002'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Kiosk KIOSK-MIA-001 has been offline for 2 hours',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'info',
      message: 'Monthly donation report ready for download',
      priority: 'low'
    },
    {
      id: 3,
      type: 'success',
      message: 'Campaign "Clean Water for All" is trending above average',
      priority: 'low'
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setDashboardData(prev => ({
        ...prev,
        totalRaised: prev.totalRaised + Math.floor(Math.random() * 1000),
        totalDonations: prev.totalDonations + Math.floor(Math.random() * 10)
      }));
      setRefreshing(false);
    }, 2000);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <Heart className="w-4 h-4 text-green-600" />;
      case 'campaign':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'kiosk':
        return <Settings className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  Welcome back, {userSession.user.username} • {userSession.user.permissions.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>

              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All Systems Online
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl text-gray-900">Overview</h2>
            <p className="text-gray-600">Monitor your donation platform performance</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasPermission('create_campaign') && (
              <Button onClick={() => onNavigate('admin-campaigns')} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Raised</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(dashboardData.totalRaised)}
                  </p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    +{dashboardData.monthlyGrowth}% this month
                  </div>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(dashboardData.totalDonations)}
                  </p>
                  <div className="flex items-center text-sm text-blue-600 mt-1">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    +12.3% this week
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.activeCampaigns}
                  </p>
                  <div className="flex items-center text-sm text-purple-600 mt-1">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    +3 this month
                  </div>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Kiosks</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.activeKiosks}
                  </p>
                  <div className="flex items-center text-sm text-orange-600 mt-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    96% uptime
                  </div>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Donation Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Donation Trends</CardTitle>
              <CardDescription>Daily donation amounts and counts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={donationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'amount' ? formatCurrency(value as number) : value,
                      name === 'amount' ? 'Amount' : 'Donations'
                    ]}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Categories</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {categoryDistribution.map((category, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-gray-600">{category.name}</span>
                    <span className="text-sm font-medium">{category.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Performance & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Campaigns */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Campaigns by fundraising progress</CardDescription>
              </div>
              {hasPermission('view_campaigns') && (
                <Button variant="outline" size="sm" onClick={() => onNavigate('admin-campaigns')}>
                  View All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaignPerformance.map((campaign, index) => {
                  const progress = (campaign.raised / campaign.goal) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {formatCurrency(campaign.raised)}
                          </p>
                          <p className="text-xs text-gray-500">{campaign.donors} donors</p>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{progress.toFixed(1)}% complete</span>
                        <span>Goal: {formatCurrency(campaign.goal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        {activity.kioskId && (
                          <>
                            <span className="text-xs text-gray-300">•</span>
                            <Badge variant="secondary" className="text-xs">
                              {activity.kioskId}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span>System Alerts</span>
              </CardTitle>
              <CardDescription>Important notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <Badge 
                        variant={alert.priority === 'medium' ? 'destructive' : 'secondary'} 
                        className="mt-1 text-xs"
                      >
                        {alert.priority} priority
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {hasPermission('view_campaigns') && (
                  <Button 
                    variant="outline" 
                    className="justify-start h-12"
                    onClick={() => onNavigate('admin-campaigns')}
                  >
                    <Database className="w-4 h-4 mr-3" />
                    Manage Campaigns
                  </Button>
                )}
                
                {hasPermission('view_kiosks') && (
                  <Button 
                    variant="outline" 
                    className="justify-start h-12"
                    onClick={() => onNavigate('admin-kiosks')}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Configure Kiosks
                  </Button>
                )}
                
                {hasPermission('view_donations') && (
                  <Button 
                    variant="outline" 
                    className="justify-start h-12"
                    onClick={() => onNavigate('admin-donations')}
                  >
                    <TrendingUp className="w-4 h-4 mr-3" />
                    View Donations
                  </Button>
                )}
                
                {hasPermission('view_users') && (
                  <Button 
                    variant="outline" 
                    className="justify-start h-12"
                    onClick={() => onNavigate('admin-users')}
                  >
                    <UserCog className="w-4 h-4 mr-3" />
                    User Management
                  </Button>
                )}
                
                {hasPermission('export_donations') && (
                  <Button variant="outline" className="justify-start h-12">
                    <Download className="w-4 h-4 mr-3" />
                    Export Reports
                  </Button>
                )}
                
                {/* Show limited access message for users with few permissions */}
                {!hasPermission('view_campaigns') && !hasPermission('view_kiosks') && !hasPermission('view_users') && (
                  <div className="p-4 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
                    <UserCog className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Limited access account</p>
                    <p className="text-xs">Contact administrator for additional permissions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}