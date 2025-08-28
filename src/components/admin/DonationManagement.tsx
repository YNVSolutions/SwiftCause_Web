import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Search,
  ArrowLeft,
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
  AlertCircle
} from 'lucide-react';
import { Screen, AdminSession, Permission, Donation } from '../../App';
import { getDonations } from '../../hooks/donationsService';

import { getAllCampaigns } from '../../api/firestoreService';
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
  hasPermission: (permission: Permission) => void;
}

export function DonationManagement({ onNavigate, onLogout, userSession, hasPermission }: DonationManagementProps) {
  const [donations, setDonations] = useState<FetchedDonation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
       
        const [donationData, campaignData] = await Promise.all([
          getDonations(),
          getAllCampaigns()
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
  }, []);

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
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  const exportToCsv = (data: FetchedDonation[]) => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const csvContent = data.map(row => Object.values(row).map(value => {
      const stringValue = String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',')).join('\n');

    const csv = `${headers}\n${csvContent}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `donations_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-xl font-semibold text-gray-900">Donation Management</h1>
                <p className="text-sm text-gray-600">Track and analyze donation transactions</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCsv(donations)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* ... Stat Cards ... */}
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search donations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>{campaign.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                {/* ... Popover content ... */}
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donations ({filteredDonations.length})</CardTitle>
            <CardDescription>All donation transactions and their details</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <span className="animate-spin h-8 w-8 border-4 rounded-full border-t-transparent border-blue-500"></span>
                <p className="ml-4 text-lg text-gray-600">Loading donations...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-8">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="ml-4 text-lg text-red-600">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor & Transaction</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date & Platform</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{donation.donorName || 'Anonymous'}</span>
                            </div>
                            <p className="text-sm text-gray-500">{donation.donorId}</p>
                            <p className="text-xs font-mono text-gray-400">{donation.stripePaymentIntentId}</p>
                          </div>
                        </TableCell>

                 
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">
                                {campaignMap[donation.campaignId] || donation.campaignId}
                            </p>
                            {donation.isGiftAid && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                Gift Aid
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(donation.amount, donation.currency)}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{donation.platform}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{getStatusBadge(donation.paymentStatus)}</TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{donation.timestamp}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <Badge variant="secondary" className="text-xs">
                                {donation.platform}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {!loading && filteredDonations.length === 0 && (
              <div className="flex items-center justify-center p-8 text-gray-500">
                No donations found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}