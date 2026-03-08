import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { Input } from '../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/table';
import { Alert, AlertDescription } from '../../shared/ui/alert';
import { 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  XCircle,
  CheckCircle,
  AlertCircle,
  Search,
  Download
} from 'lucide-react';
import { getSubscriptionsByOrganization, getSubscriptionStats } from '../../entities/subscription/api/subscriptionApi';
import { Subscription } from '../../shared/types/subscription';
import { formatCurrencyFromMajor } from '../../shared/lib/currencyFormatter';
import { getSubscriptionDisplayInterval } from '../../entities/subscription/model/selectors';
import { SortableTableHeader } from './components/SortableTableHeader';
import { useTableSort } from '../../shared/lib/hooks/useTableSort';
import { exportToCsv } from '../../shared/utils/csvExport';

interface SubscriptionManagementProps {
  organizationId: string;
}

type DateLike = string | Date | { seconds: number; nanoseconds?: number } | null | undefined;

interface SubscriptionStats {
  total: number;
  active: number;
  canceled: number;
  pastDue: number;
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
  averageAmount: number;
}

export function SubscriptionManagement({ organizationId }: SubscriptionManagementProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [intervalFilter, setIntervalFilter] = useState('all');

  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [subs, statistics] = await Promise.all([
        getSubscriptionsByOrganization(organizationId),
        getSubscriptionStats(organizationId)
      ]);
      
      setSubscriptions(subs);
      setStats(statistics);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const getStatusBadge = (status: Subscription['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Past Due' },
      canceled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Canceled' },
      incomplete: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Incomplete' },
      incomplete_expired: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Expired' },
      trialing: { color: 'bg-blue-100 text-blue-800', icon: Calendar, label: 'Trial' },
      unpaid: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Unpaid' },
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: DateLike) => {
    if (!date) return 'N/A';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const toTimestamp = (date: DateLike) => {
    if (!date) return 0;
    if (typeof date === 'object' && typeof date.seconds === 'number') {
      return date.seconds * 1000;
    }
    const value = new Date(date).getTime();
    return Number.isNaN(value) ? 0 : value;
  };

  const tableData = useMemo(() => {
    return subscriptions.map((sub) => {
      const donorName = sub.metadata?.donorName || 'Anonymous';
      const donorEmail = sub.metadata?.donorEmail || '';
      const intervalLabel = getSubscriptionDisplayInterval(sub.interval, sub.intervalCount);
      const nextPayment = sub.nextPaymentAt || sub.currentPeriodEnd;

      return {
        ...sub,
        donorName,
        donorEmail,
        intervalLabel,
        nextPayment,
        createdAtTs: toTimestamp(sub.createdAt),
        nextPaymentTs: toTimestamp(nextPayment),
      };
    });
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tableData.filter((sub) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        sub.donorName.toLowerCase().includes(normalizedSearch) ||
        sub.donorEmail.toLowerCase().includes(normalizedSearch) ||
        sub.stripeSubscriptionId.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      const matchesInterval = intervalFilter === 'all' || sub.intervalLabel === intervalFilter;

      return matchesSearch && matchesStatus && matchesInterval;
    });
  }, [tableData, searchTerm, statusFilter, intervalFilter]);

  const { sortedData, sortKey, sortDirection, handleSort } = useTableSort({
    data: filteredSubscriptions,
    defaultSortKey: 'createdAtTs',
    defaultSortDirection: 'desc',
  });

  const intervalOptions = useMemo(() => {
    const unique = Array.from(new Set(tableData.map((s) => s.intervalLabel)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [tableData]);

  const handleExport = () => {
    const rows = sortedData.map((sub) => ({
      donorName: sub.donorName,
      donorEmail: sub.donorEmail || 'N/A',
      stripeSubscriptionId: sub.stripeSubscriptionId,
      status: sub.status,
      amountMinor: sub.amount,
      amountDisplay: formatCurrencyFromMajor(sub.amount / 100),
      interval: sub.intervalLabel,
      nextPayment: formatDate(sub.nextPayment),
      startedAt: formatDate(sub.startedAt),
      createdAt: formatDate(sub.createdAt),
      canceledAt: formatDate(sub.canceledAt),
      cancelReason: sub.cancelReason || '',
    }));

    exportToCsv(rows, 'subscriptions');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-gray-500">of {stats.total} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Monthly Revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrencyFromMajor(stats.totalMonthlyRevenue / 100)}
              </div>
              <p className="text-xs text-gray-500">recurring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Annual Revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrencyFromMajor(stats.totalAnnualRevenue / 100)}
              </div>
              <p className="text-xs text-gray-500">projected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Average Amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrencyFromMajor(stats.averageAmount / 100)}
              </div>
              <p className="text-xs text-gray-500">per month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recurring Subscriptions</CardTitle>
              <CardDescription>Manage all recurring donations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleExport} variant="outline" size="sm" disabled={sortedData.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={loadSubscriptions} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search donor, email, subscription ID..."
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="past_due">Past due</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="incomplete_expired">Expired</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={intervalFilter} onValueChange={setIntervalFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All intervals</SelectItem>
                {intervalOptions.map((intervalLabel) => (
                  <SelectItem key={intervalLabel} value={intervalLabel}>
                    {intervalLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-3 text-sm text-gray-600">
            Showing {sortedData.length} of {subscriptions.length} subscriptions
          </div>

          {sortedData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No subscriptions match your current filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHeader
                    sortKey="donorName"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="p-3"
                  >
                    Donor
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="amount"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="p-3"
                  >
                    Amount
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="intervalLabel"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="p-3"
                  >
                    Interval
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="status"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="p-3"
                  >
                    Status
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="nextPaymentTs"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="p-3"
                  >
                    Next Payment
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="createdAtTs"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="p-3"
                  >
                    Created
                  </SortableTableHeader>
                  <TableHead className="p-3">Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="p-3">
                        <div>
                          <div className="font-medium">
                            {sub.metadata?.donorName || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sub.metadata?.donorEmail || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 font-semibold">
                        {formatCurrencyFromMajor(sub.amount / 100)}
                      </TableCell>
                      <TableCell className="p-3">
                        <Badge variant="outline">
                          {getSubscriptionDisplayInterval(sub.interval, sub.intervalCount)}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3">{getStatusBadge(sub.status)}</TableCell>
                      <TableCell className="p-3 text-sm">
                        {sub.status === 'active' || sub.status === 'trialing' ? formatDate(sub.nextPayment) : 'N/A'}
                      </TableCell>
                      <TableCell className="p-3 text-sm text-gray-500">
                        {formatDate(sub.createdAt)}
                      </TableCell>
                      <TableCell className="p-3 text-sm text-gray-500">
                        {formatDate(sub.startedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
