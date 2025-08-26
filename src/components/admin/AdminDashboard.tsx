import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
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
  RefreshCw
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
        { value: 1e9,  name: 'B' },
        { value: 1e6,  name: 'M' },
        { value: 1e3,  name: 'K' },
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
                  <YAxis tickFormatter={(value) => formatCurrency(value as number)}/>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="Collected" fill="#3B82F6" />
                  <Bar dataKey="Goal" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" nameKey="name">
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* ⬇️ THIS ENTIRE SECTION IS RESTORED TO ITS ORIGINAL DESIGN ⬇️ */}
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