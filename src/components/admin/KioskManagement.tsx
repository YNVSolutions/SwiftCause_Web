import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowLeft,
  Settings,
  Activity,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Download,
  Target,
  Star,
  Globe
} from 'lucide-react';
import { Screen, Kiosk, Campaign, AdminSession, Permission } from '../../App';
import { KioskCampaignAssignmentDialog } from './components/KioskCampaignAssignmentDialog';

interface KioskManagementProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}

export function KioskManagement({ onNavigate, onLogout, userSession, hasPermission }: KioskManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingKiosk, setEditingKiosk] = useState<Kiosk | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [assigningKiosk, setAssigningKiosk] = useState<Kiosk | null>(null);

  const [newKiosk, setNewKiosk] = useState({
    name: '',
    location: '',
    accessCode: ''
  });

  // Mock kiosks data with campaign assignments
  const [kiosks, setKiosks] = useState<(Kiosk & {
    accessCode: string;
    version: string;
    uptime: number;
  })[]>([
    {
      id: 'KIOSK-NYC-001',
      name: 'Times Square Terminal',
      location: 'Times Square, New York, NY',
      status: 'online',
      lastActive: '2024-01-07T14:30:00Z',
      totalDonations: 1247,
      totalRaised: 156780,
      accessCode: 'TS2024',
      version: '2.1.4',
      uptime: 99.2,
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
      location: 'Union Square, San Francisco, CA',
      status: 'online',
      lastActive: '2024-01-07T14:25:00Z',
      totalDonations: 892,
      totalRaised: 127450,
      accessCode: 'HB2024',
      version: '2.1.4',
      uptime: 97.8,
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
      lastActive: '2024-01-07T14:20:00Z',
      totalDonations: 756,
      totalRaised: 98340,
      accessCode: 'LA2024',
      version: '2.1.4',
      uptime: 96.1,
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
      location: 'Millennium Park, Chicago, IL',
      status: 'maintenance',
      lastActive: '2024-01-06T09:15:00Z',
      totalDonations: 654,
      totalRaised: 89320,
      accessCode: 'MP2024',
      version: '2.0.8',
      uptime: 94.5,
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
      status: 'offline',
      lastActive: '2024-01-05T16:45:00Z',
      totalDonations: 423,
      totalRaised: 67890,
      accessCode: 'SB2024',
      version: '2.1.2',
      uptime: 88.3,
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
  ]);

  // Mock campaigns data for assignment
  const mockCampaigns: Campaign[] = [
    {
      id: '1',
      title: 'Clean Water for All',
      goal: 50000,
      raised: 32500,
      image: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=400&h=300&fit=crop',
      category: 'Global Health',
      description: 'Help provide clean drinking water to communities in need.',
      configuration: {} as any
    },
    {
      id: '2',
      title: 'Education for Every Child',
      goal: 75000,
      raised: 45300,
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop',
      category: 'Education',
      description: 'Support education initiatives for children.',
      configuration: {} as any
    },
    {
      id: '3',
      title: 'Emergency Disaster Relief',
      goal: 100000,
      raised: 78900,
      image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop',
      category: 'Emergency Relief',
      description: 'Provide immediate assistance to disaster victims.',
      configuration: {} as any
    },
    {
      id: '4',
      title: 'Local Food Bank Support',
      goal: 30000,
      raised: 18750,
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop',
      category: 'Food Security',
      description: 'Help feed families in our local community.',
      configuration: {} as any
    },
    {
      id: '5',
      title: 'Global Emergency Fund',
      goal: 500000,
      raised: 125000,
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
      category: 'Emergency Relief',
      description: 'A worldwide emergency fund for immediate crisis response.',
      isGlobal: true,
      configuration: {} as any
    }
  ];

  const filteredKiosks = kiosks.filter(kiosk => {
    const matchesSearch = kiosk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kiosk.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kiosk.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || kiosk.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateKiosk = () => {
    const kiosk = {
      id: `KIOSK-${newKiosk.name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}-${String(kiosks.length + 1).padStart(3, '0')}`,
      name: newKiosk.name,
      location: newKiosk.location,
      status: 'offline' as const,
      lastActive: new Date().toISOString(),
      totalDonations: 0,
      totalRaised: 0,
      accessCode: newKiosk.accessCode,
      version: '2.1.4',
      uptime: 0
    };

    setKiosks(prev => [kiosk, ...prev]);
    setNewKiosk({ name: '', location: '', accessCode: '' });
    setShowCreateDialog(false);
  };

  const handleToggleStatus = (kioskId: string) => {
    setKiosks(prev => prev.map(kiosk => 
      kiosk.id === kioskId 
        ? { 
            ...kiosk, 
            status: kiosk.status === 'online' ? 'offline' : 'online' as 'online' | 'offline' | 'maintenance',
            lastActive: new Date().toISOString()
          }
        : kiosk
    ));
  };

  const handleDeleteKiosk = (kioskId: string) => {
    setKiosks(prev => prev.filter(kiosk => kiosk.id !== kioskId));
  };

  const handleAssignCampaigns = (kiosk: Kiosk) => {
    setAssigningKiosk(kiosk);
    setShowAssignmentDialog(true);
  };

  const handleSaveKioskAssignment = (updatedKiosk: Kiosk) => {
    setKiosks(prev => prev.map(k => 
      k.id === updatedKiosk.id 
        ? { ...k, ...updatedKiosk }
        : k
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Online
          </Badge>
        );
      case 'offline':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Maintenance
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 98) return 'text-green-600';
    if (uptime >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalStats = {
    online: kiosks.filter(k => k.status === 'online').length,
    offline: kiosks.filter(k => k.status === 'offline').length,
    maintenance: kiosks.filter(k => k.status === 'maintenance').length,
    totalRaised: kiosks.reduce((sum, k) => sum + (k.totalRaised || 0), 0),
    totalDonations: kiosks.reduce((sum, k) => sum + (k.totalDonations || 0), 0),
    avgUptime: kiosks.reduce((sum, k) => sum + k.uptime, 0) / kiosks.length
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
                <h1 className="text-xl font-semibold text-gray-900">Kiosk Management</h1>
                <p className="text-sm text-gray-600">Configure and monitor donation kiosks</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Kiosk
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Kiosks</p>
                  <p className="text-2xl font-semibold text-gray-900">{kiosks.length}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span className="text-green-600">{totalStats.online} online</span>
                    <span className="text-red-600">{totalStats.offline} offline</span>
                    <span className="text-yellow-600">{totalStats.maintenance} maintenance</span>
                  </div>
                </div>
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Raised</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalStats.totalRaised)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Across all kiosks</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalStats.totalDonations.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time transactions</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Uptime</p>
                  <p className={`text-2xl font-semibold ${getUptimeColor(totalStats.avgUptime)}`}>
                    {totalStats.avgUptime.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search kiosks..."
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
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Kiosks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Kiosks ({filteredKiosks.length})</CardTitle>
            <CardDescription>Monitor and manage your kiosk network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kiosk Details</TableHead>
                    <TableHead>Status & Uptime</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Campaign Assignment</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKiosks.map((kiosk) => (
                    <TableRow key={kiosk.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Monitor className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{kiosk.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{kiosk.location}</span>
                          </div>
                          <p className="text-xs text-gray-400 font-mono">{kiosk.id}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              {kiosk.assignedCampaigns?.length || 0} campaigns
                            </Badge>
                            {kiosk.defaultCampaign && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(kiosk.status)}
                          <div className="flex items-center space-x-2">
                            <Activity className="w-3 h-3 text-gray-400" />
                            <span className={`text-sm ${getUptimeColor(kiosk.uptime)}`}>
                              {kiosk.uptime.toFixed(1)}% uptime
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {formatCurrency(kiosk.totalRaised || 0)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{kiosk.totalDonations || 0} donations</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Avg: {kiosk.totalDonations ? formatCurrency((kiosk.totalRaised || 0) / kiosk.totalDonations) : '$0'}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {kiosk.assignedCampaigns?.length || 0} assigned
                            </span>
                          </div>
                          
                          {kiosk.defaultCampaign && (
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">
                                {mockCampaigns.find(c => c.id === kiosk.defaultCampaign)?.title?.slice(0, 20) || 'Featured'}
                                {mockCampaigns.find(c => c.id === kiosk.defaultCampaign)?.title && mockCampaigns.find(c => c.id === kiosk.defaultCampaign)!.title.length > 20 ? '...' : ''}
                              </span>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            Layout: {kiosk.settings?.displayMode || 'grid'}
                            {kiosk.settings?.autoRotateCampaigns && ' • Auto-rotate'}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          v{kiosk.version}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAssignCampaigns(kiosk)}
                            title="Manage campaigns"
                          >
                            <Target className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(kiosk.id)}
                            title={kiosk.status === 'online' ? 'Take offline' : 'Bring online'}
                          >
                            {kiosk.status === 'online' ? (
                              <WifiOff className="w-4 h-4" />
                            ) : (
                              <Wifi className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingKiosk(kiosk)}
                            title="Edit kiosk"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteKiosk(kiosk.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete kiosk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Kiosk Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Kiosk</DialogTitle>
              <DialogDescription>
                Configure a new donation kiosk for deployment.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="kioskName">Kiosk Name</Label>
                <Input
                  id="kioskName"
                  value={newKiosk.name}
                  onChange={(e) => setNewKiosk(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Times Square Kiosk"
                />
              </div>

              <div>
                <Label htmlFor="kioskLocation">Location</Label>
                <Input
                  id="kioskLocation"
                  value={newKiosk.location}
                  onChange={(e) => setNewKiosk(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Times Square, New York, NY"
                />
              </div>

              <div>
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                  id="accessCode"
                  value={newKiosk.accessCode}
                  onChange={(e) => setNewKiosk(prev => ({ ...prev, accessCode: e.target.value }))}
                  placeholder="TS2024"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This code will be used for kiosk authentication
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateKiosk}
                disabled={!newKiosk.name || !newKiosk.location || !newKiosk.accessCode}
              >
                Add Kiosk
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Campaign Assignment Dialog */}
        <KioskCampaignAssignmentDialog
          open={showAssignmentDialog}
          onOpenChange={setShowAssignmentDialog}
          kiosk={assigningKiosk}
          campaigns={mockCampaigns}
          onSave={handleSaveKioskAssignment}
        />
      </div>
    </div>
  );
}