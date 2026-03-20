import React, { useState, useEffect } from 'react';
import { Badge } from '../../shared/ui/badge';
import { Card, CardContent } from '../../shared/ui/card';
import { Progress } from '../../shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { formatCurrency, formatCurrencyFromMajor } from '../../shared/lib/currencyFormatter';
import { 
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Heart,
  Target,
  Zap,
  Activity,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Monitor,
  CreditCard,
  QrCode,
  Globe,
  Calendar,
  ArrowUp,
  ArrowDown,
  Wifi,
  WifiOff,
  Settings,
  Eye,
  PieChart
} from 'lucide-react';

interface LiveDonation {
  id: string;
  amount: number;
  campaignTitle: string;
  kioskLocation: string;
  timestamp: string;
  isRecurring: boolean;
}

interface CampaignMetrics {
  id: string;
  title: string;
  raised: number;
  goal: number;
  progress: number;
  donorCount: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface KioskStatus {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  todayDonations: number;
  todayAmount: number;
  lastActive: string;
}

export function EnterprisePlatformShowcase() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [animationStep, setAnimationStep] = useState(0);
  const [liveDonations, setLiveDonations] = useState<LiveDonation[]>([
    {
      id: '1',
      amount: 250,
      campaignTitle: 'Clean Water Initiative',
      kioskLocation: 'Downtown Mall',
      timestamp: '2 minutes ago',
      isRecurring: false
    },
    {
      id: '2',
      amount: 100,
      campaignTitle: 'Education Fund',
      kioskLocation: 'Community Center',
      timestamp: '5 minutes ago',
      isRecurring: true
    },
    {
      id: '3',
      amount: 500,
      campaignTitle: 'Healthcare Support',
      kioskLocation: 'Hospital Lobby',
      timestamp: '8 minutes ago',
      isRecurring: false
    }
  ]);

  const [campaignMetrics] = useState<CampaignMetrics[]>([
    {
      id: '1',
      title: 'Clean Water Initiative',
      raised: 47250,
      goal: 75000,
      progress: 63,
      donorCount: 284,
      trend: 'up',
      trendPercentage: 23
    },
    {
      id: '2',
      title: 'Education Fund',
      raised: 32100,
      goal: 50000,
      progress: 64,
      donorCount: 156,
      trend: 'up',
      trendPercentage: 15
    },
    {
      id: '3',
      title: 'Healthcare Support',
      raised: 18750,
      goal: 25000,
      progress: 75,
      donorCount: 92,
      trend: 'stable',
      trendPercentage: 3
    }
  ]);

  const [kioskStatuses] = useState<KioskStatus[]>([
    {
      id: '1',
      name: 'Kiosk #001',
      location: 'Downtown Mall',
      status: 'online',
      todayDonations: 23,
      todayAmount: 2840,
      lastActive: '2 min ago'
    },
    {
      id: '2',
      name: 'Kiosk #002',
      location: 'Community Center',
      status: 'online',
      todayDonations: 18,
      todayAmount: 1950,
      lastActive: '1 min ago'
    },
    {
      id: '3',
      name: 'Kiosk #003',
      location: 'Hospital Lobby',
      status: 'maintenance',
      todayDonations: 0,
      todayAmount: 0,
      lastActive: '2 hours ago'
    },
    {
      id: '4',
      name: 'Kiosk #004',
      location: 'University Campus',
      status: 'online',
      todayDonations: 31,
      todayAmount: 4120,
      lastActive: '30 sec ago'
    }
  ]);

  // Auto-rotate tabs every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const tabs = ['analytics', 'campaigns', 'kiosks', 'insights'];
    const interval = setInterval(() => {
      setActiveTab(current => {
        const currentIndex = tabs.indexOf(current);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Simulate new donations every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newDonation: LiveDonation = {
        id: Date.now().toString(),
        amount: Math.floor(Math.random() * 500) + 25,
        campaignTitle: ['Clean Water Initiative', 'Education Fund', 'Healthcare Support', 'Emergency Relief'][Math.floor(Math.random() * 4)],
        kioskLocation: ['Downtown Mall', 'Community Center', 'Hospital Lobby', 'University Campus'][Math.floor(Math.random() * 4)],
        timestamp: 'Just now',
        isRecurring: Math.random() > 0.7
      };

      setLiveDonations(prev => [newDonation, ...prev.slice(0, 4)]);
      setAnimationStep(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const totalDonationsToday = kioskStatuses.reduce((sum, kiosk) => sum + kiosk.todayDonations, 0);
  const totalAmountToday = kioskStatuses.reduce((sum, kiosk) => sum + kiosk.todayAmount, 0);
  const onlineKiosks = kioskStatuses.filter(k => k.status === 'online').length;

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={handleTabClick} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4 bg-white/70 backdrop-blur-sm border border-gray-200/50">
          <TabsTrigger value="analytics" className="text-xs font-medium">Live Analytics</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs font-medium">Campaigns</TabsTrigger>
          <TabsTrigger value="kiosks" className="text-xs font-medium">Kiosks</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs font-medium">Insights</TabsTrigger>
        </TabsList>

        {/* Live Analytics Tab */}
        <TabsContent value="analytics" className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span>Real-time Dashboard</span>
            </h4>
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-3 py-1 animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Live
            </Badge>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div className="flex items-center space-x-1 text-xs text-green-700">
                  <ArrowUp className="w-3 h-3" />
                  <span>+12%</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-900">{formatCurrency(totalAmountToday)}</div>
              <div className="text-xs text-green-700">Today's Donations</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div className="flex items-center space-x-1 text-xs text-blue-700">
                  <ArrowUp className="w-3 h-3" />
                  <span>+18%</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-900">{totalDonationsToday}</div>
              <div className="text-xs text-blue-700">Transactions</div>
            </div>
          </div>
          
          {/* Live Donations Feed */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-900">Live Donations</span>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-hidden">
              {liveDonations.slice(0, 3).map((donation, index) => (
                <div 
                  key={donation.id}
                  className={`flex items-center justify-between p-2 rounded-lg transition-all duration-500 ${
                    index === 0 ? 'bg-green-100 border border-green-200 scale-105' : 'bg-white border border-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${donation.isRecurring ? 'bg-purple-500' : 'bg-green-500'}`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(donation.amount)}</div>
                      <div className="text-xs text-gray-600">{donation.campaignTitle}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-700">{donation.kioskLocation}</div>
                    <div className="text-xs text-gray-500">{donation.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* System Status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-gray-700">{onlineKiosks}/4 Kiosks Online</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">99.2% Uptime</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Campaign Performance Tab */}
        <TabsContent value="campaigns" className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span>Campaign Performance</span>
            </h4>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-3 py-1">
              <BarChart3 className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
          </div>
          
          <div className="space-y-3">
            {campaignMetrics.map((campaign, index) => (
              <div 
                key={campaign.id}
                className={`bg-gradient-to-r from-white to-gray-50 border rounded-xl p-4 transition-all duration-500 ${
                  animationStep % campaignMetrics.length === index ? 'border-purple-300 shadow-lg scale-105' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{campaign.title}</div>
                    <div className="text-xs text-gray-600">{campaign.donorCount} donors</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(campaign.raised)}
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      {campaign.trend === 'up' ? (
                        <ArrowUp className="w-3 h-3 text-green-600" />
                      ) : campaign.trend === 'down' ? (
                        <ArrowDown className="w-3 h-3 text-red-600" />
                      ) : (
                        <div className="w-3 h-3" />
                      )}
                      <span className={`${
                        campaign.trend === 'up' ? 'text-green-600' :
                        campaign.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {campaign.trend === 'stable' ? 'Stable' : `${campaign.trendPercentage}%`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      {campaign.progress}% of {formatCurrencyFromMajor(campaign.goal)} goal
                    </span>
                    <span className="font-medium text-purple-600">
                      {formatCurrencyFromMajor(campaign.goal - campaign.raised)} remaining
                    </span>
                  </div>
                  <Progress value={campaign.progress} className="h-3" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Kiosk Management Tab */}
        <TabsContent value="kiosks" className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-blue-600" />
              <span>Kiosk Network</span>
            </h4>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-3 py-1">
              <Eye className="w-3 h-3 mr-1" />
              Monitoring
            </Badge>
          </div>
          
          <div className="space-y-2">
            {kioskStatuses.map((kiosk, index) => (
              <div 
                key={kiosk.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-500 ${
                  animationStep % kioskStatuses.length === index ? 'bg-blue-50 border-blue-300 scale-105' :
                  kiosk.status === 'online' ? 'bg-green-50 border-green-200' :
                  kiosk.status === 'maintenance' ? 'bg-orange-50 border-orange-200' :
                  'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    kiosk.status === 'online' ? 'bg-green-500 animate-pulse' :
                    kiosk.status === 'maintenance' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <div className="font-medium text-sm text-gray-900">{kiosk.name}</div>
                    <div className="text-xs text-gray-600 flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{kiosk.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrency(kiosk.todayAmount)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {kiosk.todayDonations} donations today
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-1 justify-end">
                    <Clock className="w-3 h-3" />
                    <span>{kiosk.lastActive}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Network Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-900">{onlineKiosks}/4</div>
                <div className="text-xs text-blue-700">Online</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-900">{formatCurrency(totalAmountToday)}</div>
                <div className="text-xs text-green-700">Today</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-900">99.2%</div>
                <div className="text-xs text-purple-700">Uptime</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Platform Insights Tab */}
        <TabsContent value="insights" className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>Platform Insights</span>
            </h4>
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs px-3 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          
          {/* Payment Methods */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-900 mb-3">Payment Distribution</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-xs">Credit/Debit Cards</span>
                </div>
                <span className="text-sm font-bold text-gray-900">67%</span>
              </div>
              <Progress value={67} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-green-600" />
                  <span className="text-xs">Mobile Payments</span>
                </div>
                <span className="text-sm font-bold text-gray-900">28%</span>
              </div>
              <Progress value={28} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-4 h-4 text-purple-600" />
                  <span className="text-xs">QR Code Payments</span>
                </div>
                <span className="text-sm font-bold text-gray-900">5%</span>
              </div>
              <Progress value={5} className="h-2" />
            </div>
          </div>
          
          {/* Key Insights */}
          <div className="space-y-2">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">Peak Hours</span>
              </div>
              <div className="text-xs text-gray-600">Most donations occur between 2-4 PM (+34% vs average)</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-900">Recurring Impact</span>
              </div>
              <div className="text-xs text-gray-600">23% of donors set up recurring donations, generating 47% more value</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">Location Performance</span>
              </div>
              <div className="text-xs text-gray-600">University Campus kiosk has highest average donation ({formatCurrency(13300)})</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
