import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { CampaignConfigurationDialog } from './components/CampaignConfigurationDialog';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Search,
  Download,
  ArrowLeft,
  Heart,
  Globe,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Settings,
  Palette,
  Zap,
  Clock
} from 'lucide-react';
import { Screen, Campaign, CampaignConfiguration, AdminSession, Permission } from '../../App';

interface CampaignManagementProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}

export function CampaignManagement({ onNavigate, onLogout, userSession, hasPermission }: CampaignManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Mock campaigns data with enhanced configuration
  const [campaigns, setCampaigns] = useState<(Campaign & { 
    donorCount: number;
    avgDonation: number;
    conversionRate: number;
  })[]>([
    {
      id: '1',
      title: 'Clean Water for All',
      description: 'Help provide clean drinking water to communities in need across developing nations.',
      goal: 50000,
      raised: 32500,
      image: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=400&h=300&fit=crop',
      category: 'Global Health',
      status: 'active',
      createdAt: '2024-01-15',
      endDate: '2024-06-15',
      organizationId: 'ORG-001',
      donorCount: 245,
      avgDonation: 132.65,
      conversionRate: 67.3,
      configuration: {
        predefinedAmounts: [25, 50, 100, 250, 500],
        allowCustomAmount: true,
        minCustomAmount: 1,
        maxCustomAmount: 10000,
        suggestedAmounts: [50, 100, 250],
        enableRecurring: true,
        recurringIntervals: ['monthly', 'quarterly'],
        defaultRecurringInterval: 'monthly',
        recurringDiscount: 5,
        displayStyle: 'grid',
        showProgressBar: true,
        showDonorCount: true,
        showRecentDonations: true,
        maxRecentDonations: 5,
        primaryCTAText: 'Help Provide Clean Water',
        secondaryCTAText: 'Learn More',
        urgencyMessage: 'Only 30 days left to reach our goal!',
        theme: 'default',
        requiredFields: ['email'],
        optionalFields: ['name', 'message'],
        enableAnonymousDonations: true,
        enableSocialSharing: true,
        shareMessage: 'Join me in providing clean water to communities in need!',
        enableDonorWall: true,
        enableComments: true
      }
    },
    {
      id: '2',
      title: 'Education for Every Child',
      description: 'Support education initiatives that give children access to quality learning materials and teachers.',
      goal: 75000,
      raised: 45300,
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop',
      category: 'Education',
      status: 'active',
      createdAt: '2024-01-10',
      endDate: '2024-08-10',
      organizationId: 'ORG-002',
      donorCount: 312,
      avgDonation: 145.19,
      conversionRate: 72.1,
      configuration: {
        predefinedAmounts: [50, 100, 200, 500, 1000],
        allowCustomAmount: true,
        minCustomAmount: 10,
        maxCustomAmount: 5000,
        suggestedAmounts: [100, 200, 500],
        enableRecurring: true,
        recurringIntervals: ['monthly', 'yearly'],
        defaultRecurringInterval: 'monthly',
        recurringDiscount: 10,
        displayStyle: 'grid',
        showProgressBar: true,
        showDonorCount: true,
        showRecentDonations: false,
        maxRecentDonations: 3,
        primaryCTAText: 'Fund Education',
        secondaryCTAText: 'See Impact',
        theme: 'vibrant',
        requiredFields: ['email', 'name'],
        optionalFields: ['phone'],
        enableAnonymousDonations: false,
        enableSocialSharing: true,
        enableDonorWall: true,
        enableComments: false
      }
    },
    {
      id: '3',
      title: 'Emergency Disaster Relief',
      description: 'Provide immediate assistance to families affected by natural disasters and emergencies.',
      goal: 100000,
      raised: 78900,
      image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop',
      category: 'Emergency Relief',
      status: 'active',
      createdAt: '2024-01-05',
      endDate: '2024-04-05',
      organizationId: 'ORG-003',
      donorCount: 489,
      avgDonation: 161.35,
      conversionRate: 81.4,
      configuration: {
        predefinedAmounts: [10, 25, 50, 100, 250, 500],
        allowCustomAmount: true,
        minCustomAmount: 5,
        maxCustomAmount: 25000,
        suggestedAmounts: [25, 50, 100],
        enableRecurring: false,
        recurringIntervals: ['monthly'],
        defaultRecurringInterval: 'monthly',
        displayStyle: 'list',
        showProgressBar: true,
        showDonorCount: true,
        showRecentDonations: true,
        maxRecentDonations: 10,
        primaryCTAText: 'Help Now',
        secondaryCTAText: 'Share',
        urgencyMessage: 'URGENT: Families need immediate help!',
        theme: 'minimal',
        requiredFields: ['email'],
        optionalFields: ['name', 'phone', 'message'],
        enableAnonymousDonations: true,
        enableSocialSharing: true,
        shareMessage: 'Help me support disaster relief efforts!',
        enableDonorWall: false,
        enableComments: true
      }
    },
    {
      id: '4',
      title: 'Local Food Bank Support',
      description: 'Help feed families in our local community through food bank donations and meal programs.',
      goal: 30000,
      raised: 18750,
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop',
      category: 'Food Security',
      status: 'paused',
      createdAt: '2024-01-20',
      endDate: '2024-07-20',
      organizationId: 'ORG-004',
      donorCount: 156,
      avgDonation: 120.19,
      conversionRate: 45.2,
      configuration: {
        predefinedAmounts: [15, 30, 60, 120, 240],
        allowCustomAmount: true,
        minCustomAmount: 5,
        maxCustomAmount: 1000,
        suggestedAmounts: [30, 60, 120],
        enableRecurring: true,
        recurringIntervals: ['monthly'],
        defaultRecurringInterval: 'monthly',
        displayStyle: 'carousel',
        showProgressBar: true,
        showDonorCount: false,
        showRecentDonations: true,
        maxRecentDonations: 8,
        primaryCTAText: 'Feed Families',
        theme: 'elegant',
        requiredFields: ['email', 'name'],
        optionalFields: ['phone', 'address'],
        enableAnonymousDonations: true,
        enableSocialSharing: false,
        enableDonorWall: true,
        enableComments: false
      }
    }
  ]);

  const categories = ['Global Health', 'Education', 'Emergency Relief', 'Food Security', 'Environmental', 'Community Development'];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || campaign.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateCampaign = () => {
    setIsCreating(true);
    setEditingCampaign(null);
    setShowConfigDialog(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setIsCreating(false);
    setEditingCampaign(campaign);
    setShowConfigDialog(true);
  };

  const handleSaveCampaign = (campaign: Campaign) => {
    if (isCreating) {
      const newCampaign = {
        ...campaign,
        donorCount: 0,
        avgDonation: 0,
        conversionRate: 0
      };
      setCampaigns(prev => [newCampaign, ...prev]);
    } else {
      setCampaigns(prev => prev.map(c => 
        c.id === campaign.id 
          ? { ...campaign, donorCount: c.donorCount, avgDonation: c.avgDonation, conversionRate: c.conversionRate }
          : c
      ));
    }
  };

  const handleToggleStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' as 'active' | 'paused' | 'completed' }
        : campaign
    ));
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('admin-dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Campaign Management</h1>
                <p className="text-sm text-gray-600">Create and manage donation campaigns</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {hasPermission('export_donations') && (
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              )}
              {hasPermission('create_campaign') && (
                <Button onClick={handleCreateCampaign} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-semibold text-gray-900">{campaigns.length}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {campaigns.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Raised</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(campaigns.reduce((sum, c) => sum + c.raised, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Conversion</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length).toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
            <CardDescription>Manage your donation campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const progress = (campaign.raised / campaign.goal) * 100;
                    const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={campaign.image}
                                alt={campaign.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900 truncate">{campaign.title}</p>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-2 py-0.5 ${
                                    campaign.configuration.theme === 'vibrant' ? 'border-purple-200 text-purple-700' :
                                    campaign.configuration.theme === 'minimal' ? 'border-gray-200 text-gray-700' :
                                    campaign.configuration.theme === 'elegant' ? 'border-indigo-200 text-indigo-700' :
                                    'border-blue-200 text-blue-700'
                                  }`}
                                >
                                  {campaign.configuration.theme}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <p className="text-sm text-gray-500">{campaign.category}</p>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center space-x-1">
                                  {campaign.configuration.enableRecurring && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Recurring
                                    </Badge>
                                  )}
                                  {campaign.configuration.allowCustomAmount && (
                                    <Badge variant="secondary" className="text-xs">
                                      <DollarSign className="w-3 h-3 mr-1" />
                                      Custom
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{formatCurrency(campaign.raised)}</span>
                              <span className="text-gray-500">{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-gray-500">Goal: {formatCurrency(campaign.goal)}</p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{campaign.donorCount} donors</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{formatCurrency(campaign.avgDonation)} avg</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{campaign.conversionRate}% conv.</span>
                            </div>
                            <div className="flex items-center space-x-1 mt-2">
                              <Badge variant="outline" className="text-xs">
                                ${campaign.configuration.predefinedAmounts.length} options
                              </Badge>
                              {campaign.configuration.enableRecurring && (
                                <Badge variant="outline" className="text-xs">
                                  Recurring
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {new Date(campaign.endDate).toLocaleDateString()}
                            <p className={`text-xs ${daysLeft < 30 ? 'text-red-600' : 'text-gray-500'}`}>
                              {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {hasPermission('edit_campaign') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(campaign.id)}
                                title={campaign.status === 'active' ? 'Pause campaign' : 'Activate campaign'}
                              >
                                {campaign.status === 'active' ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            
                            {hasPermission('edit_campaign') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCampaign(campaign)}
                                title="Configure campaign"
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {hasPermission('delete_campaign') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCampaign(campaign.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete campaign"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {/* Show view-only message for limited users */}
                            {!hasPermission('edit_campaign') && !hasPermission('delete_campaign') && (
                              <Badge variant="outline" className="text-xs text-gray-500">
                                View Only
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Configuration Dialog */}
        <CampaignConfigurationDialog
          open={showConfigDialog}
          onOpenChange={setShowConfigDialog}
          campaign={editingCampaign}
          onSave={handleSaveCampaign}
          isCreating={isCreating}
        />
      </div>
    </div>
  );
}