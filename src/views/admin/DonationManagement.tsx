import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  RefreshCw,
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
  CalendarDays,
  Gift
} from 'lucide-react';
import { Skeleton } from "../../shared/ui/skeleton"; // Import Skeleton
import { Ghost } from "lucide-react"; // Import Ghost
import { Screen, AdminSession, Permission, Donation } from '../../shared/types';
import { getDonations } from '../../shared/lib/hooks/donationsService';
import { AdminSearchFilterHeader, AdminSearchFilterConfig } from './components/AdminSearchFilterHeader';
import { SortableTableHeader } from './components/SortableTableHeader';
import { useTableSort } from '../../shared/lib/hooks/useTableSort';
import { formatCurrency } from '../../shared/lib/currencyFormatter';

import { getAllCampaigns } from '../../shared/api';
import { AdminLayout } from './AdminLayout';
import { exportToCsv } from '../../shared/utils/csvExport';
import { useOrganization } from "../../shared/lib/hooks/useOrganization";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../shared/lib/firebase';
import { Kiosk } from '../../shared/types';

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
  transactionId?: string;
  timestamp: string;
  kioskId?: string;
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

function parseDonationDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDonationDate(value?: string, withLeadingZero = true): string {
  const parsed = parseDonationDate(value);
  if (!parsed) return 'N/A';

  return parsed.toLocaleDateString('en-GB', {
    day: withLeadingZero ? '2-digit' : 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function DonationManagement({ onNavigate, onLogout, userSession, hasPermission }: DonationManagementProps) {
  const [donations, setDonations] = useState<FetchedDonation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
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

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
     
      // Fetch kiosks
      const kiosksRef = collection(db, 'kiosks');
      const kiosksQuery = query(kiosksRef, where('organizationId', '==', userSession.user.organizationId || ''));
      const kiosksSnapshot = await getDocs(kiosksQuery);
      const kiosksData = kiosksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Kiosk[];

      const [donationData, campaignData] = await Promise.all([
        getDonations(userSession.user.organizationId || ''),
        getAllCampaigns(userSession.user.organizationId || '')
      ]);
      setDonations(donationData as FetchedDonation[]);
      setCampaigns(campaignData as Campaign[]);
      setKiosks(kiosksData);
      setError(null);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [userSession.user.organizationId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const campaignMap = useMemo(() => {
    return campaigns.reduce((acc, campaign) => {
        acc[campaign.id] = campaign.title;
        return acc;
    }, {} as Record<string, string>);
  }, [campaigns]);

  const kioskMap = useMemo(() => {
    return kiosks.reduce((acc, kiosk) => {
        acc[kiosk.id] = kiosk;
        return acc;
    }, {} as Record<string, Kiosk>);
  }, [kiosks]);

  const getCampaignDisplayName = (campaignId: string) =>
    campaignMap[campaignId] || 'Unknown Campaign';

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
                         (donation.transactionId && donation.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (campaignName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || donation.paymentStatus === statusFilter;
    const matchesCampaign = campaignFilter === 'all' || donation.campaignId === campaignFilter;
    const donationDate = parseDonationDate(donation.timestamp);
    const matchesDate =
      !dateFilter || (donationDate ? donationDate.toDateString() === dateFilter.toDateString() : false);
    
    return matchesSearch && matchesStatus && matchesCampaign && matchesDate;
  });

  // Use sorting hook
  const { sortedData: filteredDonations, sortKey, sortDirection, handleSort } = useTableSort({
    data: filteredDonationsData
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-green-100 text-green-800">
            Success
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-red-100 text-red-800">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const totalStats = {
    totalAmount: filteredDonations.reduce((sum, d) => sum + (d.paymentStatus === 'success' ? (d.amount || 0) : 0), 0),
    totalDonations: filteredDonations.length,
    completedDonations: filteredDonations.filter(d => d.paymentStatus === 'success').length,
    avgDonation: filteredDonations.length > 0 
      ? filteredDonations.reduce((sum, d) => sum + (d.amount || 0), 0) / filteredDonations.length 
      : 0,
  };

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
      headerTopRightActions={
        hasPermission('export_donations') ? (
          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl border-[#064e3b] bg-transparent text-[#064e3b] hover:bg-[#064e3b] hover:text-blue-800 transition-all duration-300 px-5"
            onClick={handleExportDonations}
          >
            <Download className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6 sm:space-y-8">
        <main className="px-6 lg:px-8 pt-12 pb-8">
          {/* Stat Cards Section */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card className="rounded-3xl border border-gray-100 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Total Raised</p>
                  <div className="mt-2">
                    <span className="text-2xl font-semibold text-gray-900">{formatCurrency(totalStats.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-gray-100 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Total Donations</p>
                  <div className="mt-2">
                    <span className="text-2xl font-semibold text-gray-900">{totalStats.totalDonations}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-gray-100 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Completed</p>
                  <div className="mt-2">
                    <span className="text-2xl font-semibold text-gray-900">{totalStats.completedDonations}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-gray-100 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Average Donation</p>
                  <div className="mt-2">
                    <span className="text-2xl font-semibold text-gray-900">{formatCurrency(totalStats.avgDonation)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Unified Header Component */}
          <AdminSearchFilterHeader
            config={searchFilterConfig}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            actions={
              <Button
                variant="outline"
                onClick={fetchAllData}
                disabled={loading}
                aria-label="Refresh"
                className="border-[#064e3b]/20 text-[#064e3b] hover:bg-[#064e3b]/10 hover:text-[#064e3b] hover:border-[#064e3b]/30"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""} sm:mr-2`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            }
          />

          {/* Modern Table Container - Desktop */}
          <Card className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm mt-6 hidden md:block">
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 py-4 border-b border-gray-100">
                      <Skeleton className="h-10 w-full col-span-1" />
                      <Skeleton className="h-10 w-full col-span-1" />
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
                          className="w-[24%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <User className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Donor</span>
                          </div>
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="campaignId" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[21%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Target className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Campaign</span>
                          </div>
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="amount" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[14%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Banknote className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Amount</span>
                          </div>
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="kioskId" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[13%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Kiosk</span>
                          </div>
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="paymentStatus" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[12%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Status</span>
                          </div>
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="timestamp" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="w-[14%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-500 shrink-0" />
                            <span className="whitespace-nowrap">Date</span>
                          </div>
                        </SortableTableHeader>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {filteredDonations.map((donation) => {
                      const kiosk = donation.kioskId ? kioskMap[donation.kioskId] : null;
                      return (
                        <TableRow 
                          key={donation.id} 
                          className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 align-middle"
                          onClick={() => handleViewDetails(donation)}
                        >
                          <TableCell className="px-4 py-4 text-center align-middle">
                            <div className="flex items-center justify-center gap-2 min-w-0">
                              <span className="text-sm font-medium text-gray-900 block truncate" title={donation.donorName || 'Anonymous'}>
                                {donation.donorName || 'Anonymous'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-4 text-center align-middle">
                            <div className="flex items-center justify-center min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate" title={getCampaignDisplayName(donation.campaignId)}>
                                {getCampaignDisplayName(donation.campaignId)}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-4 text-center align-middle">
                            <p className="mx-auto grid w-[120px] grid-cols-[20px_1fr] items-center gap-2 text-sm font-semibold text-gray-900 tabular-nums">
                              <span className="h-5 w-5 inline-flex items-center justify-center">
                                {donation.isGiftAid ? (
                                  <span
                                    className="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-purple-700 ring-1 ring-purple-600/20"
                                    title="Gift Aid donation"
                                  >
                                    <Gift className="h-3 w-3" />
                                  </span>
                                ) : (
                                  <span className="h-3 w-3 opacity-0">
                                    <Gift className="h-3 w-3" />
                                  </span>
                                )}
                              </span>
                              <span className="text-left">{formatCurrency(donation.amount || 0)}</span>
                            </p>
                          </TableCell>

                          <TableCell className="px-4 py-4 text-center align-middle">
                            <div className="flex items-center justify-center min-w-0">
                              {kiosk ? (
                                <span className="text-sm font-medium text-gray-900 block truncate" title={kiosk.name}>
                                  {kiosk.name}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500">Online</span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-4 text-center align-middle">
                            <div className="flex justify-center">{getStatusBadge(donation.paymentStatus)}</div>
                          </TableCell>

                          <TableCell className="px-4 py-4 text-center align-middle">
                            <span className="text-sm text-gray-500">
                              {donation.timestamp
                                ? formatDonationDate(donation.timestamp, true)
                                : "N/A"}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

          {/* Donations Cards - Mobile */}
          <div className="md:hidden space-y-4 mt-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-3xl">
                  <CardContent className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              <Card className="overflow-hidden rounded-3xl border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center text-center text-red-600">
                    <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
                    <p className="text-lg">{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredDonations.length > 0 ? (
              filteredDonations.map((donation) => {
                const kiosk = donation.kioskId ? kioskMap[donation.kioskId] : null;
                return (
                  <Card 
                    key={donation.id} 
                    className="overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer rounded-3xl"
                    onClick={() => handleViewDetails(donation)}
                  >
                    <div className="p-4 flex justify-between items-start border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#064e3b]/10 flex items-center justify-center text-[#064e3b]">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-lg leading-tight text-slate-900">
                              {donation.donorName || 'Anonymous'}
                            </h2>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Donor</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="ml-auto grid w-[140px] grid-cols-[20px_1fr] items-center gap-2 text-xl font-bold text-slate-900 tabular-nums">
                          <span className="h-5 w-5 inline-flex items-center justify-center">
                            {donation.isGiftAid ? (
                              <span
                                className="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-purple-700 ring-1 ring-purple-600/20"
                                title="Gift Aid donation"
                              >
                                <Gift className="h-3 w-3" />
                              </span>
                            ) : (
                              <span className="h-3 w-3 opacity-0">
                                <Gift className="h-3 w-3" />
                              </span>
                            )}
                          </span>
                          <span className="text-left">{formatCurrency(donation.amount || 0)}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Amount</span>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-600">
                            {getCampaignDisplayName(donation.campaignId)}
                          </span>
                          <div className="flex gap-2 mt-1">
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {kiosk ? kiosk.name : 'Online'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(donation.paymentStatus)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays className="w-4 h-4" />
                          {donation.timestamp 
                            ? formatDonationDate(donation.timestamp, false)
                            : "N/A"}
                        </div>
                        <button 
                          className="flex items-center gap-1 text-[#064e3b] text-sm font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(donation);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="overflow-hidden rounded-3xl">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Ghost className="h-12 w-12 text-gray-400" />
                    <p className="text-xl font-bold text-gray-600">No Donations Found</p>
                    <p className="text-base text-gray-500 mt-2">
                      {searchTerm || statusFilter !== 'all' || campaignFilter !== 'all' || dateFilter
                        ? "Try adjusting your search or filters" 
                        : "No donations have been made to your organization yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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
                      {formatCurrency(selectedDonation.amount || 0)}
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
                        ? formatDonationDate(selectedDonation.timestamp, true)
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
                    {selectedDonation.stripePaymentIntentId || selectedDonation.transactionId || selectedDonation.id || "N/A"}
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
