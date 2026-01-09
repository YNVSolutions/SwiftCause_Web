import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/table';
import { Calendar } from '../../shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../shared/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../shared/ui/dialog';
import {
  Search,
  ChevronLeft,
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
  Eye
} from 'lucide-react';
import { Skeleton } from "../../shared/ui/skeleton"; // Import Skeleton
import { Ghost } from "lucide-react"; // Import Ghost
import { Screen, AdminSession, Permission, Donation } from '../../shared/types';
import { getDonations } from '../../shared/lib/hooks/donationsService';

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
  const [showCalendar, setShowCalendar] = useState(false);
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




  const filteredDonations = donations.filter(donation => {
    const campaignName = campaignMap[donation.campaignId] || '';
    const matchesSearch = (donation.donorName && donation.donorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (donation.stripePaymentIntentId && donation.stripePaymentIntentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (campaignName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || donation.paymentStatus === statusFilter;
    const matchesCampaign = campaignFilter === 'all' || donation.campaignId === campaignFilter;
    const matchesDate = !dateFilter || new Date(donation.timestamp).toDateString() === dateFilter.toDateString();
    
    return matchesSearch && matchesStatus && matchesCampaign && matchesDate;
  });

  const formatCurrency = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2
      }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-600/20">
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
    >
      <div className="space-y-4">
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('admin')}
                  className="-ml-3 w-fit px-0 text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-gray-800"
                >
                  <ChevronLeft className="w-4 h-4 mr-0" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Donation Management</h1>
                  <p className="text-sm text-gray-600">Track and analyze donation transactions</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-gray-100 transition-colors shrink-0"
                onClick={handleExportDonations}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </header>

        <main className="px-2 sm:px-6 lg:px-8 pt-2 pb-4 sm:pt-4 sm:pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Raised</p><p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalStats.totalAmount, summaryCurrency)}</p></div><DollarSign className="w-8 h-8 text-green-500" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Donations</p><p className="text-2xl font-semibold text-gray-900">{totalStats.totalDonations}</p></div><Users className="w-8 h-8 text-indigo-500" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Completed</p><p className="text-2xl font-semibold text-gray-900">{totalStats.completedDonations}</p></div><CheckCircle className="w-8 h-8 text-emerald-500" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Average Donation</p><p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalStats.avgDonation, summaryCurrency)}</p></div><TrendingUp className="w-8 h-8 text-orange-500" /></div></CardContent></Card>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full h-12 border-0 focus:ring-0"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                  <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                    <SelectTrigger className="w-full h-12 border-0 focus:ring-0"><SelectValue placeholder="Filter by campaign" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campaigns</SelectItem>
                      {campaigns.map(campaign => (
                        <SelectItem key={campaign.id} value={campaign.id}>{campaign.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border !border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors justify-start text-left font-normal w-full h-12 px-3 flex items-center hover:bg-gray-100"><CalendarIcon className="mr-2 h-4 w-4" />{dateFilter ? dateFilter.toLocaleDateString() : "Filter by date"}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom" sideOffset={8} avoidCollisions={false} collisionPadding={0}>
                    <Calendar mode="single" selected={dateFilter} onSelect={(date) => { setDateFilter(date); setShowCalendar(false); }} />
                    <div className="p-3 border-t"><Button variant="ghost" size="sm" onClick={() => { setDateFilter(undefined); setShowCalendar(false); }} className="w-full">Clear Date Filter</Button></div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Modern Table Container */}
          <Card>
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div className="w-full max-w-sm">
                  <div className="relative border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search donations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-0 focus-visible:ring-0 focus-visible:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Donations ({filteredDonations.length})</h3>
              <p className="text-sm text-gray-600 mt-1">All donation transactions and their details</p>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
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
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Donor & Transaction</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Platform</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-500" />
                          Actions
                        </div>
                      </TableHead>
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Ghost className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium mb-2">No Donations Found</p>
                  <p className="text-sm mb-4">No donations have been made to your organization yet.</p>
                </div>
              )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminLayout>
  );
}
