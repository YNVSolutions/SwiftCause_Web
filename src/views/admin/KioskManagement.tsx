import React, { useState, useEffect } from 'react';
import { db } from '../../shared/lib/firebase';
import { useKiosks } from '../../shared/lib/hooks/useKiosks';
import { useCampaigns } from '../../entities/campaign';
import { useKioskPerformance } from '../../shared/lib/hooks/useKioskPerformance';
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
import { Label } from '../../shared/ui/label';
import { Card, CardContent, CardHeader } from '../../shared/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/table';
import { KioskCampaignAssignmentDialog } from './components/KioskCampaignAssignmentDialog';


import {
  Plus, Edit, Trash2, Search, ArrowLeft, Settings, Activity, MapPin,
  DollarSign, Users, WifiOff, CheckCircle, Monitor, Target, Star, AlertTriangle
} from 'lucide-react';
import { Skeleton } from "../../shared/ui/skeleton"; // Import Skeleton
import { Ghost } from "lucide-react"; // Import Ghost
import { AdminLayout } from './AdminLayout';


export function KioskManagement({ onNavigate, onLogout, userSession, hasPermission }: {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}) {
  const { kiosks, loading: kiosksLoading, refresh: refreshKiosks } = useKiosks(userSession.user.organizationId);
  const { campaigns, loading: campaignsLoading, refresh: refreshCampaigns } = useCampaigns(userSession.user.organizationId);
  const performanceData = useKioskPerformance(kiosks);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter] = useState('all');
  const isLoading = kiosksLoading || campaignsLoading;


  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKiosk, setNewKiosk] = useState({ name: '', location: '', accessCode: '' });


  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [assigningKiosk, setAssigningKiosk] = useState<Kiosk | null>(null);

  useEffect(() => {
    refreshKiosks();
    refreshCampaigns();
  }, [refreshKiosks, refreshCampaigns]);

  const handleCreateKiosk = async () => {
    if (!newKiosk.name || !newKiosk.location || !userSession) return;
    try {
      //setKiosks(prev => [...prev, { id: docRef.id, ...newKioskData }]);
      refreshKiosks();
      setNewKiosk({ name: '', location: '', accessCode: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error adding kiosk: ", error);
    }
  };

  const handleDeleteKiosk = async (kioskId: string) => {
    if (window.confirm('Are you sure you want to delete this kiosk?')) {
      try {
        await deleteDoc(doc(db, 'kiosks', kioskId));
        refreshKiosks();
      } catch (error) {
        console.error("Error deleting kiosk: ", error);
      }
    }
  };
  
  
  const handleSaveKioskAssignment = async (updatedKiosk: Kiosk) => {
    const { id, ...dataToSave } = updatedKiosk;
    try {
        const kioskRef = doc(db, 'kiosks', id);
        await updateDoc(kioskRef, dataToSave);
        refreshKiosks();
    } catch (error) {
        console.error("Error updating kiosk assignment: ", error);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-600/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Online
          </span>
        );
      case 'offline': 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-red-600/20">
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </span>
        );
      case 'maintenance': 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Maintenance
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 ring-1 ring-gray-600/20">
            {status}
          </span>
        );
    }
  };

  const filteredKiosks = kiosks.filter(kiosk => {
    const matchesSearch = kiosk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kiosk.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kiosk.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || kiosk.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const totalStats = {
    online: kiosks.filter(k => k.status === 'online').length,
    offline: kiosks.filter(k => k.status === 'offline').length,
    maintenance: kiosks.filter(k => k.status === 'maintenance').length,
    totalRaised: kiosks.reduce((sum, k) => sum + (k.totalRaised || 0), 0),
    totalDonations: kiosks.reduce((sum, k) => sum + (k.totalDonations || 0), 0),
  };

  if (isLoading) {
    return (
      <AdminLayout
        onNavigate={onNavigate}
        onLogout={onLogout}
        userSession={userSession}
        hasPermission={hasPermission}
        activeScreen="admin-kiosks"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><div className="flex items-center justify-between"><div><Skeleton className="w-24 h-5 mb-2" /><Skeleton className="w-32 h-8" /></div><Skeleton className="h-8 w-8" /></div></CardContent></Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="w-48 h-6 mb-2" />
              <Skeleton className="w-64 h-4" />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableHead key={i}><Skeleton className="h-6 w-24" /></TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-20" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
    >
      <div className="space-y-6">
        <header className="bg-white shadow-sm border-b rounded-md">
          <div className="px-2 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onNavigate('admin')} className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" /><span>Back to Dashboard</span>
                </Button>
                <div className="h-6 w-px bg-gray-300 hidden sm:block" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Kiosk Management</h1>
                  <p className="text-sm text-gray-600">Configure and monitor donation kiosks</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-6 sm:mb-0 mt-2">
                <div className="w-full sm:w-80">
                  <div className="relative">
                    <div className="h-10 items-center flex flex-row gap-5 border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                      <div>
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                      <div>
                        <Input
                          placeholder="Search kiosks..."
                          value={searchTerm}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {hasPermission('create_kiosk') && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />Add Kiosk
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Kiosks</p><p className="text-2xl font-semibold text-gray-900">{kiosks.length}</p><div className="flex items-center space-x-4 text-xs text-gray-500 mt-1"><span className="text-green-600">{totalStats.online} online</span><span className="text-red-600">{totalStats.offline} offline</span></div></div><Settings className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Raised</p><p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalStats.totalRaised)}</p></div><DollarSign className="h-8 w-8 text-green-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Donations</p><p className="text-2xl font-semibold text-gray-900">{totalStats.totalDonations.toLocaleString()}</p></div><Users className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Maintenance</p><p className="text-2xl font-semibold text-gray-900">{totalStats.maintenance}</p></div><Activity className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
          </div>
          {/* Modern Table Container */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Kiosks ({filteredKiosks.length})</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor and manage your kiosk network</p>
            </div>
            <div className="overflow-x-auto">
              {filteredKiosks.length > 0 ? (
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Kiosk Details</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Assignment</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKiosks.map((kiosk) => (
                      <TableRow key={kiosk.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Monitor className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{kiosk.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-500">{kiosk.location}</span>
                            </div>
                            <p className="text-xs text-gray-400 font-mono">{kiosk.id}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">{getStatusBadge(kiosk.status)}</TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(performanceData[kiosk.id]?.totalRaised || 0)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{kiosk.assignedCampaigns?.length || 0} assigned</span>
                            </div>
                            {kiosk.defaultCampaign && (
                              <div className="flex items-center space-x-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-gray-500">{campaigns.find(c => c.id === kiosk.defaultCampaign)?.title?.slice(0, 20) || '...'}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {hasPermission('edit_kiosk') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setAssigningKiosk(kiosk);
                                  setIsAssignmentDialogOpen(true);
                                }}
                                className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600"
                                title="Edit Kiosk Details & Campaigns"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {hasPermission('delete_kiosk') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteKiosk(kiosk.id)}
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                title="Delete kiosk"
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Ghost className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium mb-2">No Kiosks Found</p>
                  <p className="text-sm mb-4">
                    No kiosks have been registered yet.
                  </p>
                  {hasPermission("create_kiosk") && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Register New Kiosk
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]"> {/* Adjusted max-width */}
          <DialogHeader><DialogTitle>Add New Kiosk</DialogTitle><DialogDescription>Configure a new donation kiosk for deployment.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="kioskName">Kiosk Name</Label>
              <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                <Input
                  id="kioskName"
                  value={newKiosk.name}
                  onChange={(e) => setNewKiosk(p => ({ ...p, name: e.target.value }))}
                  placeholder="Times Square Kiosk"
                  className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="kioskLocation">Location</Label>
              <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                <Input
                  id="kioskLocation"
                  value={newKiosk.location}
                  onChange={(e) => setNewKiosk(p => ({ ...p, location: e.target.value }))}
                  placeholder="Times Square, New York, NY"
                  className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accessCode">Access Code</Label>
              <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                <Input
                  id="accessCode"
                  value={newKiosk.accessCode}
                  onChange={(e) => setNewKiosk(p => ({ ...p, accessCode: e.target.value }))}
                  placeholder="TS2024"
                  className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4"><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateKiosk} disabled={!newKiosk.name || !newKiosk.location}>Add Kiosk</Button></div>
        </DialogContent>
      </Dialog>
      
      <KioskCampaignAssignmentDialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen} kiosk={assigningKiosk} campaigns={campaigns} onSave={handleSaveKioskAssignment} />
    </AdminLayout>
  );
}
