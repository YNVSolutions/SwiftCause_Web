import React, { useState } from 'react';
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
  Filter,
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
import { Screen, Donation, AdminSession, Permission } from '../../App';

interface DonationManagementProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}

export function DonationManagement({ onNavigate, onLogout, userSession, hasPermission }: DonationManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  // Mock donations data
  const [donations] = useState<(Donation & {
    id: string;
    donorName: string;
    donorEmail: string;
    timestamp: string;
    kioskId: string;
    transactionId: string;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    campaignTitle: string;
    paymentMethod: string;
    processingFee: number;
    netAmount: number;
  })[]>([
    {
      id: 'DON-001',
      campaignId: '1',
      campaignTitle: 'Clean Water for All',
      amount: 250,
      isRecurring: false,
      donorName: 'Sarah Johnson',
      donorEmail: 'sarah.j@email.com',
      timestamp: '2024-01-07T14:30:00Z',
      kioskId: 'KIOSK-NYC-001',
      transactionId: 'TXN-7891234567',
      status: 'completed',
      paymentMethod: 'Credit Card',
      processingFee: 7.50,
      netAmount: 242.50
    },
    {
      id: 'DON-002',
      campaignId: '2',
      campaignTitle: 'Education for Every Child',
      amount: 100,
      isRecurring: true,
      donorName: 'Michael Chen',
      donorEmail: 'mchen@email.com',
      timestamp: '2024-01-07T13:15:00Z',
      kioskId: 'KIOSK-LA-002',
      transactionId: 'TXN-7891234568',
      status: 'completed',
      paymentMethod: 'Debit Card',
      processingFee: 3.00,
      netAmount: 97.00
    },
    {
      id: 'DON-003',
      campaignId: '3',
      campaignTitle: 'Emergency Disaster Relief',
      amount: 500,
      isRecurring: false,
      donorName: 'Emily Rodriguez',
      donorEmail: 'e.rodriguez@email.com',
      timestamp: '2024-01-07T12:45:00Z',
      kioskId: 'KIOSK-CHI-003',
      transactionId: 'TXN-7891234569',
      status: 'completed',
      paymentMethod: 'Credit Card',
      processingFee: 15.00,
      netAmount: 485.00
    },
    {
      id: 'DON-004',
      campaignId: '1',
      campaignTitle: 'Clean Water for All',
      amount: 75,
      isRecurring: false,
      donorName: 'David Wilson',
      donorEmail: 'dwilson@email.com',
      timestamp: '2024-01-07T11:20:00Z',
      kioskId: 'KIOSK-NYC-001',
      transactionId: 'TXN-7891234570',
      status: 'pending',
      paymentMethod: 'Credit Card',
      processingFee: 2.25,
      netAmount: 72.75
    },
    {
      id: 'DON-005',
      campaignId: '4',
      campaignTitle: 'Local Food Bank Support',
      amount: 150,
      isRecurring: true,
      donorName: 'Lisa Thompson',
      donorEmail: 'lisa.t@email.com',
      timestamp: '2024-01-06T16:30:00Z',
      kioskId: 'KIOSK-MIA-004',
      transactionId: 'TXN-7891234571',
      status: 'failed',
      paymentMethod: 'Credit Card',
      processingFee: 0,
      netAmount: 0
    }
  ]);

  const campaigns = [
    { id: '1', title: 'Clean Water for All' },
    { id: '2', title: 'Education for Every Child' },
    { id: '3', title: 'Emergency Disaster Relief' },
    { id: '4', title: 'Local Food Bank Support' }
  ];

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
    const matchesCampaign = campaignFilter === 'all' || donation.campaignId === campaignFilter;
    const matchesDate = !dateFilter || new Date(donation.timestamp).toDateString() === dateFilter.toDateString();
    
    return matchesSearch && matchesStatus && matchesCampaign && matchesDate;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
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
      case 'refunded':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <FileText className="w-3 h-3 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalStats = {
    totalAmount: filteredDonations.reduce((sum, d) => sum + (d.status === 'completed' ? d.amount : 0), 0),
    totalDonations: filteredDonations.length,
    completedDonations: filteredDonations.filter(d => d.status === 'completed').length,
    avgDonation: filteredDonations.length > 0 
      ? filteredDonations.reduce((sum, d) => sum + d.amount, 0) / filteredDonations.length 
      : 0,
    totalFees: filteredDonations.reduce((sum, d) => sum + (d.status === 'completed' ? d.processingFee : 0), 0),
    netAmount: filteredDonations.reduce((sum, d) => sum + (d.status === 'completed' ? d.netAmount : 0), 0)
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
                    {formatCurrency(totalStats.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Net: {formatCurrency(totalStats.netAmount)}
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
                    {formatCurrency(totalStats.avgDonation)}
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
                    {formatCurrency(totalStats.totalFees)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((totalStats.totalFees / totalStats.totalAmount) * 100).toFixed(1)}% of total
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor & Transaction</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Amount & Fees</TableHead>
                    <TableHead>Payment Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date & Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{donation.donorName}</span>
                          </div>
                          <p className="text-sm text-gray-500">{donation.donorEmail}</p>
                          <p className="text-xs font-mono text-gray-400">{donation.transactionId}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{donation.campaignTitle}</p>
                          {donation.isRecurring && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(donation.amount)}
                          </p>
                          <div className="text-xs text-gray-500">
                            <p>Fee: {formatCurrency(donation.processingFee)}</p>
                            <p>Net: {formatCurrency(donation.netAmount)}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{donation.paymentMethod}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{getStatusBadge(donation.status)}</TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{formatDate(donation.timestamp)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <Badge variant="secondary" className="text-xs">
                              {donation.kioskId}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}