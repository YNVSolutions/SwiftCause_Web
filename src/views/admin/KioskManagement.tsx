import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Badge } from '../../shared/ui/badge';
import { Dialog, DialogContent, DialogTitle, VisuallyHidden } from '../../shared/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { KioskCampaignAssignmentDialog } from './components/KioskCampaignAssignmentDialog';

import {
  Plus, Edit, Trash2, MapPin, Monitor, AlertTriangle, Save, FileText, Grid3X3, List, GalleryThumbnails, Image, Eye, EyeOff, Copy, Check, Menu, X
} from 'lucide-react';
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
  
  const isLoading = kiosksLoading || campaignsLoading;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKiosk, setNewKiosk] = useState({ 
    name: '', 
    location: '', 
    accessCode: '', 
    status: 'offline' as Kiosk['status'],
    assignedCampaigns: [] as string[],
    displayLayout: 'grid' as 'grid' | 'list' | 'carousel'
  });
  
  // Scrollspy state and refs
  const [activeSection, setActiveSection] = useState('basic-info');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const availableCampaignsRef = useRef<HTMLDivElement>(null);

  // Navigation items
  const navigationItems = [
    { id: 'basic-info', label: 'BASIC INFO' },
    { id: 'campaigns', label: 'CAMPAIGNS' },
    { id: 'display', label: 'DISPLAY' }
  ];

  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [assigningKiosk, setAssigningKiosk] = useState<Kiosk | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [kioskToDelete, setKioskToDelete] = useState<Kiosk | null>(null);
  
  // State for showing access codes and copy feedback
  const [showAccessCodes, setShowAccessCodes] = useState<{ [key: string]: boolean }>({});
  const [copiedIds, setCopiedIds] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    refreshKiosks();
    refreshCampaigns();
  }, [refreshKiosks, refreshCampaigns]);

  // Scrollspy with IntersectionObserver
  useEffect(() => {
    if (!scrollContainerRef.current || !isCreateDialogOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisibleSection = 'basic-info';
        let maxVisibleHeight = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const visibleHeight = entry.intersectionRect.height;
            if (visibleHeight > maxVisibleHeight) {
              maxVisibleHeight = visibleHeight;
              mostVisibleSection = entry.target.id;
            }
          }
        });

        setActiveSection(mostVisibleSection);
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '0px',
        threshold: [0, 0.5, 1]
      }
    );

    setTimeout(() => {
      Object.values(sectionRefs.current).forEach((section) => {
        if (section) {
          observer.observe(section);
        }
      });
    }, 100);

    return () => observer.disconnect();
  }, [isCreateDialogOpen]);

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionId: string) => {
    const section = sectionRefs.current[sectionId];
    if (section && scrollContainerRef.current) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  // Handle keyboard navigation
  const handleNavKeyDown = useCallback((event: React.KeyboardEvent, sectionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToSection(sectionId);
    }
  }, [scrollToSection]);

  // Scroll to available campaigns section within the modal
  const scrollToAvailableCampaignsInModal = useCallback(() => {
    if (availableCampaignsRef.current && scrollContainerRef.current) {
      availableCampaignsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  const handleCreateKiosk = async () => {
    if (!newKiosk.name || !newKiosk.location || !userSession) return;
    try {
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
      refreshKiosks();
      setNewKiosk({ name: '', location: '', accessCode: '', status: 'offline', assignedCampaigns: [], displayLayout: 'grid' });
      setIsCreateDialogOpen(false);
      setActiveSection('basic-info');
      setIsMobileSidebarOpen(false);
    } catch (error) {
      console.error("Error adding kiosk: ", error);
    }
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

  const handleAssignCampaign = (campaignId: string) => {
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

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  
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
      >
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Kiosk Manager</h1>
              </div>
            </div>
          </header>
          <main className="p-4 sm:p-6">
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-48 mx-auto"></div>
              </div>
            </div>
          </main>
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Kiosk Manager</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6">
          {/* Add New Kiosk Section - Always visible */}
          <div className="mb-6 sm:mb-8">
            <div className="max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-12 text-center hover:border-gray-400 transition-colors font-lexend">
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 hover:bg-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors"
                  >
                    <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </button>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">Add New Kiosk</h2>
                <p className="text-gray-500 text-sm sm:text-base">Deploy a new display unit to your fleet in seconds.</p>
              </div>
            </div>
          </div>

          {/* Kiosks Table */}
          {kiosks.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                <div className="divide-y divide-gray-200">
                  {kiosks.map((kiosk) => (
                    <div key={kiosk.id} className="p-4 space-y-4">
                      {/* Kiosk Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 truncate">{kiosk.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-500 truncate">{kiosk.location}</span>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(kiosk.status)}
                        </div>
                      </div>

                      {/* Performance */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Total Raised:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(performanceData[kiosk.id]?.totalRaised || 0)}
                        </span>
                      </div>

                      {/* Campaign Assignment */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Campaigns:</span>
                        <span className="text-gray-900">
                          {(() => {
                            const assignedIds = Array.from(new Set(kiosk.assignedCampaigns || [])).filter(Boolean);
                            const assignedCount = campaigns.filter((c) => assignedIds.includes(c.id)).length;
                            return `${assignedCount} assigned`;
                          })()}
                        </span>
                      </div>

                      {/* Kiosk Details */}
                      <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2">
                        <div>
                          <div className="text-gray-500 uppercase font-medium mb-1">Kiosk ID</div>
                          <div className="font-mono text-gray-900 flex items-center justify-between">
                            <span className="truncate text-xs">{kiosk.id}</span>
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
                                  <span className="hidden xs:inline">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span className="hidden xs:inline">Copy</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 uppercase font-medium mb-1">Access Code</div>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-600 font-medium font-mono text-xs">
                              {showAccessCodes[kiosk.id] ? (kiosk.accessCode || 'Not set') : '••••••'}
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
                                  <span className="hidden xs:inline">Hide</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span className="hidden xs:inline">Show</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        {hasPermission('edit_kiosk') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAssigningKiosk(kiosk);
                              setIsAssignmentDialogOpen(true);
                            }}
                            className="text-gray-600 hover:text-gray-800 px-3 py-2"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        {hasPermission('delete_kiosk') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteKiosk(kiosk)}
                            className="text-red-600 hover:text-red-800 border-red-200 hover:bg-red-50 px-3 py-2"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
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
                    {kiosks.map((kiosk) => (
                      <TableRow key={kiosk.id} className="hover:bg-gray-50">
                        <TableCell className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="space-y-3">
                            {/* Kiosk Name and Location */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">{kiosk.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-500">{kiosk.location}</span>
                              </div>
                            </div>
                            
                            {/* Kiosk ID and Access Code */}
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
                                    {showAccessCodes[kiosk.id] ? (kiosk.accessCode || 'Not set') : '••••••'}
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
                                onClick={() => {
                                  setAssigningKiosk(kiosk);
                                  setIsAssignmentDialogOpen(true);
                                }}
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
            </div>
          )}
        </main>
      </div>
      {/* Single Scrollable Kiosk Setup Modal */}
      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            // Reset state when dialog closes
            setActiveSection('basic-info');
            setIsMobileSidebarOpen(false);
            setNewKiosk({ name: '', location: '', accessCode: '', status: 'offline', assignedCampaigns: [], displayLayout: 'grid' });
          }
        }}
      >
        <DialogContent className="sm:max-w-6xl p-0 border-0 shadow-2xl bg-white rounded-2xl overflow-hidden font-lexend max-h-[90vh] w-[95vw] sm:w-full">
          <VisuallyHidden>
            <DialogTitle>Kiosk Setup Configuration</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col sm:flex-row h-[90vh] sm:h-[700px]">
            {/* Mobile Header with Hamburger */}
            <div className="sm:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Kiosk Setup</h3>
                <p className="text-sm text-gray-500">Configuration</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {/* Sidebar Navigation */}
            <nav 
              className={`${
                isMobileSidebarOpen ? 'block' : 'hidden'
              } sm:block w-full sm:w-72 bg-gray-50 border-r border-gray-200 p-4 sm:p-8 absolute sm:relative z-10 sm:z-auto h-full sm:h-auto`} 
              aria-label="Kiosk setup navigation"
            >
              {/* Mobile Close Button */}
              <div className="sm:hidden flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Desktop Header */}
              <div className="hidden sm:block mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Kiosk</h3>
                <p className="text-sm text-gray-500">Configuration</p>
              </div>
              
              <div className="relative">
                {/* Navigation Items */}
                <ul className="space-y-2 relative" role="list">
                  {navigationItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(item.id);
                          scrollToSection(item.id);
                          setIsMobileSidebarOpen(false); // Close mobile sidebar after selection
                        }}
                        onKeyDown={(e) => handleNavKeyDown(e, item.id)}
                        className={`w-full flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-lg cursor-pointer transition-colors text-left ${
                          activeSection === item.id 
                            ? 'bg-green-600 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        aria-current={activeSection === item.id ? 'step' : undefined}
                        tabIndex={0}
                      >
                        <div className="text-sm font-medium">{item.label}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <header className="hidden sm:flex items-center justify-between p-6 lg:p-8 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="text-base text-gray-500 uppercase tracking-wide font-medium">
                    SETUP • NEW KIOSK
                  </div>
                </div>
              </header>

              {/* Scrollable Content Container */}
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto"
                role="main"
                aria-label="Kiosk configuration content"
              >
                {/* Basic Information Section */}
                <section 
                  id="basic-info"
                  ref={(el) => { sectionRefs.current['basic-info'] = el; }}
                  className="p-4 sm:p-6 lg:p-8 border-b border-gray-100"
                  aria-labelledby="basic-info-heading"
                >
                  <div className="max-w-4xl">
                    <h2 id="basic-info-heading" className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
                      Basic Information
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Single column on mobile, two columns on larger screens */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                          <Label htmlFor="kioskName" className="text-sm font-medium text-gray-700 mb-2 block">
                            KIOSK NAME
                          </Label>
                          <Input
                            id="kioskName"
                            value={newKiosk.name}
                            onChange={(e) => setNewKiosk(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. West Wing Visitor Display"
                            className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <Label htmlFor="kioskLocation" className="text-sm font-medium text-gray-700 mb-2 block">
                            PHYSICAL LOCATION
                          </Label>
                          <Input
                            id="kioskLocation"
                            value={newKiosk.location}
                            onChange={(e) => setNewKiosk(p => ({ ...p, location: e.target.value }))}
                            placeholder="e.g. Headquarters, Building B, Near Elevators"
                            className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                          />
                        </div>

                        <div>
                          <Label htmlFor="accessCode" className="text-sm font-medium text-gray-700 mb-2 block">
                            ACCESS CODE / PAIRING KEY
                          </Label>
                          <Input
                            id="accessCode"
                            value={newKiosk.accessCode}
                            onChange={(e) => setNewKiosk(p => ({ ...p, accessCode: e.target.value }))}
                            placeholder="e.g. TSK-0001-AB"
                            className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                          />
                        </div>

                        <div>
                          <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                            STATUS
                          </Label>
                          <Select
                            value={newKiosk.status}
                            onValueChange={(value: Kiosk['status']) => setNewKiosk(p => ({ ...p, status: value }))}
                          >
                            <SelectTrigger className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">Active</SelectItem>
                              <SelectItem value="offline">Inactive</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Campaigns Section */}
                <section 
                  id="campaigns"
                  ref={(el) => { sectionRefs.current['campaigns'] = el; }}
                  className="p-4 sm:p-6 lg:p-8 border-b border-gray-100"
                  aria-labelledby="campaigns-heading"
                >
                  <div className="max-w-4xl">
                    <h2 id="campaigns-heading" className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
                      Campaigns
                    </h2>
                    
                    {/* Assigned Campaigns Section */}
                    <div className="mb-6 sm:mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Assigned Campaigns</h3>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                          {newKiosk.assignedCampaigns.length}
                        </Badge>
                      </div>
                      
                      {/* Scrollable container for mobile */}
                      <div className="max-h-64 sm:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                        {newKiosk.assignedCampaigns.length === 0 ? (
                          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 sm:p-8 text-center">
                            <button
                              onClick={scrollToAvailableCampaignsInModal}
                              className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 hover:bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors cursor-pointer"
                              aria-label="Scroll to available campaigns"
                            >
                              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-green-600 transition-colors" />
                            </button>
                            <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No campaigns assigned</h4>
                            <p className="text-gray-500 text-sm">Select campaigns from the available list below to get started</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {newKiosk.assignedCampaigns.map(campaignId => {
                              const campaign = campaigns.find(c => c.id === campaignId);
                              if (!campaign) return null;
                              
                              const fundingPercentage = Math.round((campaign.raised / campaign.goal) * 100);
                              
                              return (
                                <div key={campaign.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      {campaign.coverImageUrl ? (
                                        <img 
                                          src={campaign.coverImageUrl} 
                                          alt={campaign.title}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      ) : (
                                        <span className="text-xs font-medium text-gray-500">
                                          {campaign.title.substring(0, 3).toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">{campaign.title}</h4>
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1">
                                        <span>{formatCurrency(campaign.raised)} raised</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{fundingPercentage}% funded</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnassignCampaign(campaign.id)}
                                    className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Available Campaigns Section */}
                    <div ref={availableCampaignsRef}>
                      <div className="flex items-center gap-2 mb-4">
                        <Plus className="w-5 h-5 text-gray-400" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Available Campaigns</h3>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                          {campaigns.filter(c => !newKiosk.assignedCampaigns.includes(c.id)).length}
                        </Badge>
                      </div>
                      
                      {/* Scrollable container for mobile */}
                      <div className="max-h-64 sm:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                        <div className="space-y-3">
                          {campaigns
                            .filter(campaign => !newKiosk.assignedCampaigns.includes(campaign.id))
                            .map(campaign => {
                              const fundingPercentage = Math.round((campaign.raised / campaign.goal) * 100);
                              
                              return (
                                <div key={campaign.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border">
                                      {campaign.coverImageUrl ? (
                                        <img 
                                          src={campaign.coverImageUrl} 
                                          alt={campaign.title}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      ) : (
                                        <span className="text-xs font-medium text-gray-500">
                                          {campaign.title.substring(0, 3).toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">{campaign.title}</h4>
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1">
                                        <span>{formatCurrency(campaign.raised)} raised</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{fundingPercentage}% funded</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAssignCampaign(campaign.id)}
                                    className="text-green-600 border-green-200 hover:bg-green-50 w-full sm:w-auto"
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    ASSIGN
                                  </Button>
                                </div>
                              );
                            })}
                          
                          {campaigns.filter(c => !newKiosk.assignedCampaigns.includes(c.id)).length === 0 && (
                            <div className="text-center py-6 sm:py-8 text-gray-500">
                              <p className="text-sm sm:text-base">All available campaigns have been assigned to this kiosk.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Display Section */}
                <section 
                  id="display"
                  ref={(el) => { sectionRefs.current['display'] = el; }}
                  className="p-4 sm:p-6 lg:p-8"
                  aria-labelledby="display-heading"
                >
                  <div className="max-w-4xl">
                    <h2 id="display-heading" className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
                      Campaign View
                    </h2>
                    
                    {/* Display Layout Selection */}
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">DISPLAY LAYOUT</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Grid Option */}
                        <button
                          onClick={() => setNewKiosk(prev => ({ ...prev, displayLayout: 'grid' }))}
                          className={`flex flex-col items-center justify-center w-full h-32 sm:h-36 rounded-2xl transition-all ${
                            newKiosk.displayLayout === 'grid'
                              ? 'border-2 border-green-500 bg-green-50'
                              : 'border-2 border-gray-200 bg-transparent hover:bg-gray-50 hover:border-gray-300'
                          }`}
                          aria-pressed={newKiosk.displayLayout === 'grid'}
                        >
                          <Grid3X3 className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 ${
                            newKiosk.displayLayout === 'grid' ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <span className={`text-sm sm:text-base font-medium ${
                            newKiosk.displayLayout === 'grid' ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            GRID
                          </span>
                        </button>

                        {/* List Option */}
                        <button
                          onClick={() => setNewKiosk(prev => ({ ...prev, displayLayout: 'list' }))}
                          className={`flex flex-col items-center justify-center w-full h-32 sm:h-36 rounded-2xl transition-all ${
                            newKiosk.displayLayout === 'list'
                              ? 'border-2 border-green-500 bg-green-50'
                              : 'border-2 border-gray-200 bg-transparent hover:bg-gray-50 hover:border-gray-300'
                          }`}
                          aria-pressed={newKiosk.displayLayout === 'list'}
                        >
                          <List className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 ${
                            newKiosk.displayLayout === 'list' ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <span className={`text-sm sm:text-base font-medium ${
                            newKiosk.displayLayout === 'list' ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            LIST
                          </span>
                        </button>

                        {/* Carousel Option */}
                        <button
                          onClick={() => setNewKiosk(prev => ({ ...prev, displayLayout: 'carousel' }))}
                          className={`flex flex-col items-center justify-center w-full h-32 sm:h-36 rounded-2xl transition-all ${
                            newKiosk.displayLayout === 'carousel'
                              ? 'border-2 border-green-500 bg-green-50'
                              : 'border-2 border-gray-200 bg-transparent hover:bg-gray-50 hover:border-gray-300'
                          }`}
                          aria-pressed={newKiosk.displayLayout === 'carousel'}
                        >
                          <GalleryThumbnails className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 ${
                            newKiosk.displayLayout === 'carousel' ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <span className={`text-sm sm:text-base font-medium ${
                            newKiosk.displayLayout === 'carousel' ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            CAROUSEL
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Layout Preview */}
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">LAYOUT PREVIEW</h3>
                      
                      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 min-h-[300px] sm:min-h-[400px]">
                        {/* Mock Device Frame */}
                        <div className="bg-gray-100 rounded-lg p-3 sm:p-4 max-w-2xl mx-auto">
                          {/* Device Header */}
                          <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs text-gray-500">
                            <span>9:41 AM</span>
                            <div className="flex gap-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            </div>
                          </div>
                          
                          {/* Content Area */}
                          <div className="bg-white rounded-lg p-3 sm:p-4 min-h-[200px] sm:min-h-[300px]">
                            {newKiosk.displayLayout === 'grid' && (
                              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {[1, 2, 3, 4].map((item) => (
                                  <div key={item} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Image className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {newKiosk.displayLayout === 'list' && (
                              <div className="space-y-3 sm:space-y-4">
                                {[1, 2, 3, 4].map((item) => (
                                  <div key={item} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <Image className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="h-2 sm:h-3 bg-gray-200 rounded mb-1 sm:mb-2"></div>
                                      <div className="h-1.5 sm:h-2 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                    <div className="w-12 h-6 sm:w-16 sm:h-8 bg-green-200 rounded"></div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {newKiosk.displayLayout === 'carousel' && (
                              <div className="relative">
                                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                  <Image className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                                </div>
                                <div className="flex justify-center gap-2 mb-3 sm:mb-4">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                <div className="text-center">
                                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 mx-auto w-3/4"></div>
                                  <div className="h-2 sm:h-3 bg-gray-200 rounded mx-auto w-1/2"></div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Bottom Navigation */}
                          <div className="flex justify-center mt-3 sm:mt-4 gap-2">
                            <div className="w-10 h-1.5 sm:w-12 sm:h-2 bg-gray-800 rounded-full"></div>
                            <div className="w-6 h-1.5 sm:w-8 sm:h-2 bg-green-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <footer className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 lg:p-8 border-t border-gray-200 bg-gray-50 gap-4 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setActiveSection('basic-info');
                    setIsMobileSidebarOpen(false);
                  }}
                  className="text-gray-600 hover:text-gray-800 w-full sm:w-auto order-2 sm:order-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  SAVE DRAFT
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setActiveSection('basic-info');
                      setIsMobileSidebarOpen(false);
                    }}
                    className="px-6 w-full sm:w-auto"
                  >
                    CANCEL
                  </Button>
                  <Button
                    onClick={handleCreateKiosk}
                    disabled={!newKiosk.name || !newKiosk.location}
                    className="bg-black hover:bg-gray-800 text-white px-6 w-full sm:w-auto h-12 sm:h-auto"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    SAVE KIOSK
                  </Button>
                </div>
              </footer>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <KioskCampaignAssignmentDialog 
        open={isAssignmentDialogOpen} 
        onOpenChange={setIsAssignmentDialogOpen} 
        kiosk={assigningKiosk} 
        campaigns={campaigns} 
        onSave={handleSaveKioskAssignment} 
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
    </AdminLayout>
  );
}