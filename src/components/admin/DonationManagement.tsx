import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  FileText
} from 'lucide-react';
import { Screen, AdminSession, Permission, Donation } from '../../App';
import { getDonations } from '../../hooks/donationsService';

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
  timestamp: string; // The formatted string
}

interface DonationManagementProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => void;
}

export function DonationManagement({ onNavigate, onLogout, userSession, hasPermission }: DonationManagementProps) {
  const [donations, setDonations] = useState<FetchedDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  // Fetch donations on component mount
  useEffect(() => {
    const fetchDonationData = async () => {
      try {
        setLoading(true);
        const data = await getDonations();
        setDonations(data as FetchedDonation[]);
        setError(null);
      } catch (err) {
        setError("Failed to load donations. Please try again.");
        console.error("Error fetching donations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonationData();
  }, []);

  // Mock campaigns data for the filter select dropdown
  const campaigns = [
    { id: '1', title: 'Clean Water for All' },
    { id: '2', title: 'Education for Every Child' },
    { id: '3', title: 'Emergency Disaster Relief' },
    { id: '4', title: 'Local Food Bank Support' }
  ];

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = (donation.donorName && donation.donorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (donation.stripePaymentIntentId && donation.stripePaymentIntentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (donation.campaignId && donation.campaignId.toLowerCase().includes(searchTerm.toLowerCase()));
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
                <h1 className="text-xl font-semibold text-gray-900">Donation Management</h1>
                <p className="text-sm text-gray-600">Track and analyze donation transactions</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
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
                  <p className="text-sm font-medium text-gray-600">Total Raised</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalStats.totalAmount, 'gbp')}
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
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalStats.totalDonations.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalStats.completedDonations} completed
                  </p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Donation</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalStats.avgDonation, 'gbp')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Per transaction</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing Fees</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    N/A
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Fees are not in the fetched data)
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? dateFilter.toLocaleDateString() : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={(date) => {
                      setDateFilter(date);
                      setShowCalendar(false);
                    }}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setDateFilter(undefined);
                        setShowCalendar(false);
                      }}
                      className="w-full"
                    >
                      Clear filter
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Donations Table */}
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
                            <p className="font-medium text-gray-900">{donation.campaignId}</p>
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