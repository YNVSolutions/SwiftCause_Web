import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/table';
import { Calendar } from '../../shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../shared/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import {
  Search,
  Download,
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  TrendingUp,
  Heart,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Eye,
  User,
  Target,
  Banknote,
  CalendarDays
} from 'lucide-react';
import { Skeleton } from "../../shared/ui/skeleton"; // Import Skeleton
import { Ghost } from "lucide-react"; // Import Ghost
import { Screen, AdminSession, Permission, Donation } from '../../shared/types';
import { getDonations } from '../../shared/lib/hooks/donationsService';
import { AdminSearchFilterHeader, AdminSearchFilterConfig } from './components/AdminSearchFilterHeader';
import { SortableTableHeader } from './components/SortableTableHeader';
import { useTableSort } from '../../shared/lib/hooks/useTableSort';

import { getAllCampaigns } from '../../shared/api';
import { AdminLayout } from './AdminLayout';
import { exportToCsv } from '../../shared/utils/csvExport';
import { useOrganization } from "../../shared/lib/hooks/useOrganization";
interface FetchedDonation extends Omit<Donation, 'timestamp'> {
  id: string;
  amount: number;
  campaignId: string;
  currency: string;
  donorId: string;
  donorName: string;
  isGiftAid: boolean;
  paymentStatus: string;
  platform: string;
  stripePaymentIntentId: string;
  timestamp: string;
}

interface Campaign {
    id: string;
    title: string;
}

interface DonationManagementProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}

export function DonationManagement({ onNavigate, onLogout, userSession, hasPermission }: DonationManagementProps) {
  const [donations, setDonations] = useState<FetchedDonation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { organization, loading: orgLoading } = useOrganization(
    userSession.user.organizationId ?? null
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [ selectedDonation, setSelectedDonation] = useState<FetchedDonation | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
       
        const [donationData, campaignData] = await Promise.all([
          getDonations(userSession.user.organizationId || ''),
          getAllCampaigns(userSession.user.organizationId || '')
        ]);
        setDonations(donationData as FetchedDonation[]);
        setCampaigns(campaignData as Campaign[]);
        setError(null);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [userSession.user.organizationId]);

  const campaignMap = useMemo(() => {
    return campaigns.reduce((acc, campaign) => {
        acc[campaign.id] = campaign.title;
        return acc;
    }, {} as Record<string, string>);
  }, [campaigns]);

  // Configuration for AdminSearchFilterHeader
  const searchFilterConfig: AdminSearchFilterConfig = {
    filters: [
      {
        key: "statusFilter",
        label: "Status",
        type: "select",
        options: [
          { label: "Success", value: "success" },
          { label: "Pending", value: "pending" },
          { label: "Failed", value: "failed" }
        ]
      },
      {
        key: "campaignFilter",
        label: "Campaign",
        type: "select",
        options: campaigns.map(campaign => ({ label: campaign.title, value: campaign.id }))
      },
      {
        key: "dateFilter",
        label: "Filter by date",
        type: "date"
      }
    ]
  };

  const filterValues = {
    statusFilter,
    campaignFilter,
    dateFilter
  };

  const handleFilterChange = (key: string, value: any) => {
    switch (key) {
      case "statusFilter":
        setStatusFilter(value);
        break;
      case "campaignFilter":
        setCampaignFilter(value);
        break;
      case "dateFilter":
        setDateFilter(value);
        break;
    }
  };


  // Filter donations first
  const filteredDonationsData = donations.filter(donation => {
    const campaignName = campaignMap[donation.campaignId] || '';
    const matchesSearch = (donation.donorName && donation.donorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (donation.stripePaymentIntentId && donation.stripePaymentIntentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (campaignName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || donation.paymentStatus === statusFilter;
    const matchesCampaign = campaignFilter === 'all' || donation.campaignId === campaignFilter;
    const matchesDate = !dateFilter || new Date(donation.timestamp).toDateString() === dateFilter.toDateString();
    
    return matchesSearch && matchesStatus && matchesCampaign && matchesDate;
  });

  // Use sorting hook
  const { sortedData: filteredDonations, sortKey, sortDirection, handleSort } = useTableSort({
    data: filteredDonationsData
  });

  const formatCurrency = (amount: number, currency?: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: (currency || 'USD').toUpperCase(),
        minimumFractionDigits: 2
      }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#064e3b]/10 text-[#064e3b] ring-1 ring-[#064e3b]/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-red-600/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
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

  const totalStats = {
    totalAmount: filteredDonations.reduce((sum, d) => sum + (d.paymentStatus === 'success' ? d.amount : 0), 0),
    totalDonations: filteredDonations.length,
    completedDonations: filteredDonations.filter(d => d.paymentStatus === 'success').length,
    avgDonation: filteredDonations.length > 0 
      ? filteredDonations.reduce((sum, d) => sum + d.amount, 0) / filteredDonations.length 
      : 0,
  };

  const summaryCurrency =
    filteredDonations[0]?.currency ||
    donations[0]?.currency ||
    "USD";

  const handleExportDonations = () => {
    exportToCsv(donations, "donations");
  };

  const handleViewDetails = (donation: FetchedDonation) => {
    setSelectedDonation(donation);
    setIsDetailsDialogOpen(true);
  };

  return (
    <AdminLayout
      onNavigate={onNavigate}
      onLogout={onLogout}
      userSession={userSession}
      hasPermission={hasPermission}
      activeScreen="admin-donations"
      headerSubtitle="Track and analyze donation transactions"
      headerSearchPlaceholder="Search donations..."
      headerSearchValue={searchTerm}
      onHeaderSearchChange={setSearchTerm}
      headerTopRightActions={(
        <Button
          variant="outline"
          size="sm"
          className="rounded-2xl border-[#064e3b] bg-transparent text-[#064e3b] hover:bg-[#064e3b] hover:text-stone-50 transition-all duration-300 px-5"
          onClick={handleExportDonations}
        >
          <Download className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      )}
    >
      <div className="space-y-6 sm:space-y-8">
        <main className="px-6 lg:px-8 pt-12 pb-8">
          {/* Stat Cards Section */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
            <Card><CardContent className="p-3 sm:p-4 lg:p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Total Raised</p><p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{formatCurrency(totalStats.totalAmount, summaryCurrency)}</p></div><DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:w-8 lg:h-8 text-[#064e3b]" /></div></CardContent></Card>
            <Card><CardContent className="p-3 sm:p-4 lg:p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Total Donations</p><p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{totalStats.totalDonations}</p></div><Users className="h-6 w-6 sm:h-7 sm:w-7 lg:w-8 lg:h-8 text-indigo-500" /></div></CardContent></Card>
            <Card><CardContent className="p-3 sm:p-4 lg:p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p><p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{totalStats.completedDonations}</p></div><CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:w-8 lg:h-8 text-[#064e3b]" /></div></CardContent></Card>
            <Card><CardContent className="p-3 sm:p-4 lg:p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Average Donation</p><p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{formatCurrency(totalStats.avgDonation, summaryCurrency)}</p></div><TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:w-8 lg:h-8 text-orange-500" /></div></CardContent></Card>
          </div>

          {/* Unified Header Component */}
          <AdminSearchFilterHeader
            config={searchFilterConfig}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
          />

          {/* Modern Table Container */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 py-4 border-b border-gray-100">
                      <Skeleton className="h-10 w-full col-span-2" />
                      <Skeleton className="h-10 w-full col-span-1" />
                      <Skeleton className="h-10 w-full col-span-1" />
                      <Skeleton className="h-10 w-full col-span-1" />
                      <Skeleton className="h-10 w-full col-span-1" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-red-600">
                  <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
                  <p className="text-lg">{error}</p>
                </div>
              ) : filteredDonations.length > 0 ? (
                <div className="overflow-hidden">
                  <Table className="w-full table-fixed">
                    <TableHeader>
                      <TableRow className="bg-gray-100 border-b-2 border-gray-300 text-gray-700">
                        <SortableTableHeader 
                          sortKey="donorName" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[22%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                        >
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Donor</span>
                          </div>
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="campaignId" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[20%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                        >
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Campaign</span>
                          </div>
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="amount" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[12%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-right"
                        >
                          <div className="flex items-center justify-end gap-2">
                            <Banknote className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Amount</span>
                          </div>
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="paymentMethod" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[16%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Payment</span>
                          </div>
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="paymentStatus" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[12%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Status</span>
                          </div>
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="timestamp" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[14%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                        >
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Date</span>
                          </div>
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortable={false}
                          sortKey="actions" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[8%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Eye className="h-4 w-4 text-gray-500" />
                            <span className="whitespace-nowrap">Actions</span>
                          </div>
                        </SortableTableHeader>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {filteredDonations.map((donation) => (
                      <TableRow 
                        key={donation.id} 
                        className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                        onClick={() => handleViewDetails(donation)}
                      >
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{donation.donorName || 'Anonymous'}</span>
                            </div>
                            <p className="text-sm text-gray-500">{donation.donorId}</p>
                            <p className="text-xs font-mono text-gray-400">{donation.stripePaymentIntentId}</p>
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              {campaignMap[donation.campaignId] || donation.campaignId}
                            </p>
                            {donation.isGiftAid && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 ring-1 ring-purple-600/20">
                                Gift Aid
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(donation.amount, donation.currency)}
                          </p>
                        </TableCell>

                        <TableCell className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{donation.platform}</span>
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4">{getStatusBadge(donation.paymentStatus)}</TableCell>

                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-500">{donation.timestamp}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <Badge variant="secondary" className="text-xs">
                                {donation.platform}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(donation);
                            }}
                            className="hover:bg-gray-100"
                            title="View donation details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Ghost className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium mb-2">No Donations Found</p>
                  <p className="text-sm mb-4">No donations have been made to your organization yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Donation Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-indigo-600" />
                Donation Details
              </DialogTitle>
              <DialogDescription>
                Complete information about this donation
              </DialogDescription>
            </DialogHeader>
            
            {selectedDonation && (
              <div className="grid gap-4 py-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Donor Name</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedDonation.donorName || "Anonymous"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Donation Amount</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {new Intl.NumberFormat('en-GB', {
                        style: 'currency',
                        currency: selectedDonation.currency || 'GBP',
                      }).format(selectedDonation.amount || 0)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedDonation.paymentStatus)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Campaign</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {campaigns.find(c => c.id === selectedDonation.campaignId)?.title || "N/A"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Donation Date</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedDonation.timestamp 
                        ? new Date(selectedDonation.timestamp).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Platform</Label>
                    <p className="text-sm text-gray-900 mt-1 capitalize">{selectedDonation.platform || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Gift Aid Eligible</Label>
                  <div className="mt-1">
                    {selectedDonation.isGiftAid ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        No
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Transaction ID</Label>
                  <p className="text-xs text-gray-700 font-mono mt-1 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                    {selectedDonation.stripePaymentIntentId || selectedDonation.id || "N/A"}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
