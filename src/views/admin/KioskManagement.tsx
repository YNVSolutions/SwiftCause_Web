"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../shared/lib/firebase';
import { useKiosks } from '../../shared/lib/hooks/useKiosks';
import { useCampaigns } from '../../entities/campaign';
import { useKioskPerformance } from '../../shared/lib/hooks/useKioskPerformance';
import { useOrganization } from "../../shared/lib/hooks/useOrganization";
import { useStripeOnboarding, StripeOnboardingDialog } from "../../features/stripe-onboarding";
import {
  collection,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { Screen, Kiosk, AdminSession, Permission } from '../../shared/types';

// UI Components
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Badge } from '../../shared/ui/badge';
import { Card, CardContent } from '../../shared/ui/card';
import { Dialog, DialogContent, DialogTitle, VisuallyHidden } from '../../shared/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/table';

import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Eye,
  EyeOff,
  Copy,
  Check,
  MoreVertical,
  Search,
  DollarSign,
  Users,
  Settings,
  Activity,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { KioskForm, KioskFormData } from './components/KioskForm';
import { exportToCsv } from '../../shared/utils/csvExport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shared/ui/dropdown-menu";


export function KioskManagement({ onNavigate, onLogout, userSession, hasPermission }: {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}) {
  const { kiosks, loading: kiosksLoading, refresh: refreshKiosks } = useKiosks(userSession.user.organizationId);
  const { campaigns, loading: campaignsLoading, refresh: refreshCampaigns } = useCampaigns(userSession.user.organizationId);
  const performanceData = useKioskPerformance(kiosks);
  
  // Stripe onboarding state & hooks
  const { organization, loading: orgLoading } = useOrganization(
    userSession.user.organizationId ?? null
  );
  const { needsOnboarding } = useStripeOnboarding(organization);
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
  
  // Search + status filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'maintenance'>('all');
  
  const isLoading = kiosksLoading || campaignsLoading;

  // Filtered kiosks derived state
  const filteredKiosks = kiosks.filter((kiosk) => {
    const matchesSearch = kiosk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kiosk.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kiosk.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || kiosk.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate total stats
  const totalStats = {
    online: filteredKiosks.filter(k => k.status === 'online').length,
    offline: filteredKiosks.filter(k => k.status === 'offline').length,
    maintenance: filteredKiosks.filter(k => k.status === 'maintenance').length,
    totalRaised: Object.values(performanceData).reduce((sum, data) => sum + (data?.totalRaised || 0), 0),
    totalDonations: Object.values(performanceData).reduce((sum, data) => sum + (data?.donorCount || 0), 0)
  };

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingKiosk, setEditingKiosk] = useState<Kiosk | null>(null);
  const [newKiosk, setNewKiosk] = useState<KioskFormData>({ 
    name: '', 
    location: '', 
    accessCode: '', 
    status: 'offline' as Kiosk['status'],
    assignedCampaigns: [] as string[],
    displayLayout: 'grid' as 'grid' | 'list' | 'carousel'
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [kioskToDelete, setKioskToDelete] = useState<Kiosk | null>(null);
  
  // State for showing access codes and copy feedback
  const [showAccessCodes, setShowAccessCodes] = useState<{ [key: string]: boolean }>({});
  const [copiedIds, setCopiedIds] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    refreshKiosks();
    refreshCampaigns();
  }, [refreshKiosks, refreshCampaigns]);

  const handleAssignCampaign = (campaignId: string) => {
    if (needsOnboarding) {
      setShowOnboardingDialog(true);
      return;
    }
    
    setNewKiosk(prev => ({
      ...prev,
      assignedCampaigns: [...prev.assignedCampaigns, campaignId]
    }));
  };

  const handleUnassignCampaign = (campaignId: string) => {
    setNewKiosk(prev => ({
      ...prev,
      assignedCampaigns: prev.assignedCampaigns.filter(id => id !== campaignId)
    }));
  };

  const handleCreateKiosk = async () => {
    if (needsOnboarding) {
      setShowOnboardingDialog(true);
      return;
    }
    
    if (!newKiosk.name || !newKiosk.location || !userSession) return;
    try {
      if (editingKiosk) {
        // Update existing kiosk
        const updatedKioskData = {
          ...editingKiosk,
          name: newKiosk.name,
          location: newKiosk.location,
          accessCode: newKiosk.accessCode,
          status: newKiosk.status,
          assignedCampaigns: newKiosk.assignedCampaigns,
          settings: {
            ...editingKiosk.settings,
            displayMode: newKiosk.displayLayout,
          },
          organizationId: userSession.user.organizationId,
        };
        const kioskRef = doc(db, 'kiosks', editingKiosk.id);
        await updateDoc(kioskRef, updatedKioskData);
      } else {
        // Create new kiosk
        const newKioskData: Omit<Kiosk, 'id'> = {
          ...newKiosk,
          status: newKiosk.status,
          lastActive: new Date().toISOString(),
          totalDonations: 0,
          totalRaised: 0,
          assignedCampaigns: newKiosk.assignedCampaigns,
          defaultCampaign: '',
          deviceInfo: {},
          operatingHours: {},
          settings: { 
            displayMode: newKiosk.displayLayout, 
            showAllCampaigns: true, 
            maxCampaignsDisplay: 6, 
            autoRotateCampaigns: false 
          },
          organizationId: userSession.user.organizationId,
        };
        await addDoc(collection(db, 'kiosks'), newKioskData);
      }
      refreshKiosks();
      setNewKiosk({ name: '', location: '', accessCode: '', status: 'offline', assignedCampaigns: [], displayLayout: 'grid' });
      setIsCreateDialogOpen(false);
      setEditingKiosk(null);
    } catch (error) {
      console.error("Error saving kiosk: ", error);
    }
  };

  const handleCancel = () => {
    setIsCreateDialogOpen(false);
    setEditingKiosk(null);
    setNewKiosk({ name: '', location: '', accessCode: '', status: 'offline', assignedCampaigns: [], displayLayout: 'grid' });
  };

  const handleEditKiosk = (kiosk: Kiosk) => {
    setEditingKiosk(kiosk);
    setNewKiosk({
      name: kiosk.name,
      location: kiosk.location,
      accessCode: kiosk.accessCode || '',
      status: kiosk.status,
      assignedCampaigns: kiosk.assignedCampaigns || [],
      displayLayout: (kiosk.settings?.displayMode as 'grid' | 'list' | 'carousel') || 'grid'
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteKiosk = (kiosk: Kiosk) => {
    setKioskToDelete(kiosk);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteKiosk = async () => {
    if (!kioskToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'kiosks', kioskToDelete.id));
      refreshKiosks();
      setIsDeleteDialogOpen(false);
      setKioskToDelete(null);
    } catch (error) {
      console.error("Error deleting kiosk: ", error);
    }
  };

  // Copy kiosk ID to clipboard
  const copyKioskId = async (kioskId: string) => {
    try {
      await navigator.clipboard.writeText(kioskId);
      setCopiedIds(prev => ({ ...prev, [kioskId]: true }));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedIds(prev => ({ ...prev, [kioskId]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy kiosk ID:', error);
    }
  };

  // Toggle access code visibility
  const toggleAccessCode = (kioskId: string) => {
    setShowAccessCodes(prev => ({
      ...prev,
      [kioskId]: !prev[kioskId]
    }));
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(amount);
  const handleExportKiosks = () => {
    const exportData = filteredKiosks.map((kiosk) => {
      const performance = performanceData[kiosk.id];
      return {
        name: kiosk.name,
        location: kiosk.location,
        status: kiosk.status,
        kioskId: kiosk.id,
        totalRaised: performance?.totalRaised ?? 0,
        totalDonations: performance?.donorCount ?? 0,
        assignedCampaigns: kiosk.assignedCampaigns?.length ?? 0,
        lastActive: kiosk.lastActive || '',
      };
    });

    exportToCsv(exportData, 'kiosks');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': 
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Online
          </Badge>
        );
      case 'offline': 
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Offline
          </Badge>
        );
      case 'maintenance': 
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Maintenance
          </Badge>
        );
      default: 
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        onNavigate={onNavigate}
        onLogout={onLogout}
        userSession={userSession}
        hasPermission={hasPermission}
        activeScreen="admin-kiosks"
        hideHeaderDivider
        hideSidebarTrigger
      >
        <div className="min-h-screen bg-gray-50">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      onNavigate={onNavigate}
      onLogout={onLogout}
      userSession={userSession}
      hasPermission={hasPermission}
      activeScreen="admin-kiosks"
      headerTitle="Kiosk Management"
      headerSubtitle="Configure and monitor donation kiosks"
      headerActions={(
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-gray-100 transition-colors"
          onClick={handleExportKiosks}
          aria-label="Export CSV"
        >
          <Download className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      )}
      hideSidebarTrigger
    >
      <div className="min-h-screen bg-gray-50">
        <main className="px-2 sm:px-6 lg:px-8 pt-2 pb-4 sm:pt-3 sm:pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Kiosks</p><p className="text-2xl font-semibold text-gray-900">{filteredKiosks.length}</p><div className="flex items-center space-x-4 text-xs text-gray-500 mt-1"><span className="text-green-600">{totalStats.online} online</span><span className="text-red-600">{totalStats.offline} offline</span></div></div><Settings className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Raised</p><p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalStats.totalRaised)}</p></div><DollarSign className="h-8 w-8 text-green-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Donations</p><p className="text-2xl font-semibold text-gray-900">{totalStats.totalDonations.toLocaleString()}</p></div><Users className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Maintenance</p><p className="text-2xl font-semibold text-gray-900">{totalStats.maintenance}</p></div><Activity className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
          </div>
          {/* Modern Table Container */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div className="w-full max-w-sm">
                  <div className="relative border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search kiosks..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-3 w-full h-12 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                    />
                  </div>
                </div>
                {hasPermission('create_kiosk') && (
                  <>
                    <Button
                      onClick={() => {
                        setIsCreateDialogOpen(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 h-10 w-10 p-0 text-white sm:hidden"
                      aria-label="Add Kiosk"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={() => {
                        setIsCreateDialogOpen(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 h-10 px-4 text-white hidden sm:inline-flex"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Kiosk
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Kiosks ({filteredKiosks.length})</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor and manage your kiosk network</p>
            </div>
            <div className="overflow-x-auto">
              {filteredKiosks.length > 0 ? (
                <>
                  <div className="md:hidden px-6 py-6 space-y-4">
                    {filteredKiosks.map((kiosk) => {
                      const assignedIds = Array.from(new Set(kiosk.assignedCampaigns || [])).filter(Boolean);
                      const assignedCount = campaigns.filter((c) => assignedIds.includes(c.id)).length;

                      return (
                        <div
                          key={kiosk.id}
                          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{kiosk.name}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {kiosk.location}
                              </div>
                            </div>
                            {(hasPermission('edit_kiosk') || hasPermission('delete_kiosk')) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                                    aria-label="Kiosk actions"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {hasPermission('edit_kiosk') && (
                                    <DropdownMenuItem
                                      onSelect={() => handleEditKiosk(kiosk)}
                                      className="flex items-center gap-2"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                  )}
                                  {hasPermission('delete_kiosk') && (
                                    <DropdownMenuItem
                                      onSelect={() => handleDeleteKiosk(kiosk)}
                                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>

                          <div className="mt-4 space-y-3">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                Kiosk ID
                              </p>
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-mono text-sm text-gray-900 break-all">{kiosk.id}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyKioskId(kiosk.id)}
                                  className="h-8 w-8 text-blue-600 hover:text-blue-800"
                                  title="Copy ID"
                                >
                                  {copiedIds[kiosk.id] ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                Access Code
                              </p>
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-mono text-sm text-gray-900">
                                  {showAccessCodes[kiosk.id]
                                    ? kiosk.accessCode || 'Not set'
                                    : '******'}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleAccessCode(kiosk.id)}
                                  className="h-8 w-8 text-blue-600 hover:text-blue-800"
                                  title={showAccessCodes[kiosk.id] ? "Hide Access Code" : "Show Access Code"}
                                >
                                  {showAccessCodes[kiosk.id] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">{getStatusBadge(kiosk.status)}</div>

                          <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
                            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                              Performance
                            </div>
                            <div className="mt-1 font-semibold text-gray-900">
                              {formatCurrency(performanceData[kiosk.id]?.totalRaised || 0)}
                            </div>
                          </div>

                          <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
                            <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                              Campaign Assignment
                            </div>
                            <div className="mt-2">{assignedCount} assigned</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="hidden md:block overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kiosk Details
                          </TableHead>
                          <TableHead className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </TableHead>
                          <TableHead className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                          </TableHead>
                          <TableHead className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Campaign Assignment
                          </TableHead>
                          <TableHead className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="bg-white divide-y divide-gray-200">
                        {filteredKiosks.map((kiosk) => (
                          <TableRow key={kiosk.id} className="hover:bg-gray-50">
                            <TableCell className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-900">{kiosk.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm text-gray-500">{kiosk.location}</span>
                                  </div>
                                </div>
                                <div className="bg-gray-50 rounded p-3 text-xs space-y-2">
                                  <div>
                                    <div className="text-gray-500 uppercase font-medium mb-1">Kiosk ID</div>
                                    <div className="font-mono text-gray-900 flex items-center justify-between">
                                      <span className="truncate">{kiosk.id}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyKioskId(kiosk.id)}
                                        className="h-auto p-1 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                        title="Copy ID"
                                      >
                                        {copiedIds[kiosk.id] ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            Copied
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            Copy ID
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500 uppercase font-medium mb-1">Access Code</div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-blue-600 font-medium font-mono">
                                        {showAccessCodes[kiosk.id] ? (kiosk.accessCode || 'Not set') : '******'}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleAccessCode(kiosk.id)}
                                        className="h-auto p-1 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                        title={showAccessCodes[kiosk.id] ? "Hide Access Code" : "Show Access Code"}
                                      >
                                        {showAccessCodes[kiosk.id] ? (
                                          <>
                                            <EyeOff className="w-3 h-3" />
                                            Hide
                                          </>
                                        ) : (
                                          <>
                                            <Eye className="w-3 h-3" />
                                            Show
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(kiosk.status)}
                            </TableCell>
                            <TableCell className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(performanceData[kiosk.id]?.totalRaised || 0)}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              {(() => {
                                const assignedIds = Array.from(new Set(kiosk.assignedCampaigns || [])).filter(Boolean);
                                const assignedCount = campaigns.filter((c) => assignedIds.includes(c.id)).length;
                                return (
                                  <div className="text-sm text-gray-500">
                                    {assignedCount} assigned
                                  </div>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {hasPermission('edit_kiosk') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditKiosk(kiosk)}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                                    title="Edit Kiosk"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                )}
                                {hasPermission('delete_kiosk') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteKiosk(kiosk)}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                                    title="Delete Kiosk"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No kiosks found matching your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Kiosk Setup/Edit Dialog */}
      <KioskForm
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingKiosk(null);
            setNewKiosk({ name: '', location: '', accessCode: '', status: 'offline', assignedCampaigns: [], displayLayout: 'grid' });
          }
        }}
        editingKiosk={editingKiosk}
        kioskData={newKiosk}
        setKioskData={setNewKiosk}
        campaigns={campaigns}
        onSubmit={handleCreateKiosk}
        onCancel={handleCancel}
        onAssignCampaign={handleAssignCampaign}
        onUnassignCampaign={handleUnassignCampaign}
        formatCurrency={formatCurrency}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <VisuallyHidden>
            <DialogTitle>Delete Kiosk Confirmation</DialogTitle>
          </VisuallyHidden>
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Kiosk
            </h2>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this kiosk? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDeleteKiosk}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Stripe Onboarding Dialog */}
      <StripeOnboardingDialog
        open={showOnboardingDialog}
        onOpenChange={setShowOnboardingDialog}
        organization={organization}
        loading={orgLoading}
      />
    </AdminLayout>
  );
}
