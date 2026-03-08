import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
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
  Download,
  Building2
} from 'lucide-react';
import { getSubscriptionsByOrganization, getSubscriptionStats } from '../../entities/subscription/api/subscriptionApi';
import { Subscription } from '../../shared/types/subscription';
import { formatCurrencyFromMajor } from '../../shared/lib/currencyFormatter';
import { getSubscriptionDisplayInterval } from '../../entities/subscription/model/selectors';
import { SortableTableHeader } from './components/SortableTableHeader';
import { useTableSort } from '../../shared/lib/hooks/useTableSort';
import { exportToCsv } from '../../shared/utils/csvExport';
import { AdminLayout } from './AdminLayout';
import { Screen, AdminSession, Permission } from '../../shared/types';

interface SubscriptionManagementProps {
  organizationId: string;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
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

export function SubscriptionManagement({
  organizationId,
  onNavigate,
  onLogout,
  userSession,
  hasPermission,
}: SubscriptionManagementProps) {
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

  return (
    <AdminLayout
      onNavigate={onNavigate}
      onLogout={onLogout}
      userSession={userSession}
      hasPermission={hasPermission}
      activeScreen="admin-subscriptions"
      headerTitle={(
        <div className="flex flex-col">
          {userSession.user.organizationName && (
            <div className="flex items-center gap-1.5 mb-1">
              <Building2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 tracking-wide">
                {userSession.user.organizationName}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Subscriptions
          </h1>
        </div>
      )}
      headerSubtitle="Manage recurring donations and lifecycle health"
      headerSearchPlaceholder="Search donor, email, subscription ID..."
      headerSearchValue={searchTerm}
      onHeaderSearchChange={setSearchTerm}
      headerTopRightActions={(
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl border-[#064e3b] bg-transparent text-[#064e3b] hover:bg-emerald-50 hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-900/10 hover:scale-105 transition-all duration-300 px-5"
            onClick={handleExport}
            disabled={sortedData.length === 0}
          >
            <Download className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl border-[#064e3b] bg-transparent text-[#064e3b] hover:bg-emerald-50 hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-900/10 hover:scale-105 transition-all duration-300 px-5"
            onClick={loadSubscriptions}
          >
            <RefreshCw className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      )}
    >
      <div className="space-y-6 sm:space-y-8">
        <main className="px-6 lg:px-8 pt-12 pb-8 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="rounded-3xl border border-gray-100 shadow-sm">
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

                  <Card className="rounded-3xl border border-gray-100 shadow-sm">
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

                  <Card className="rounded-3xl border border-gray-100 shadow-sm">
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

                  <Card className="rounded-3xl border border-gray-100 shadow-sm">
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

              <Card className="rounded-3xl border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle>Recurring Subscriptions</CardTitle>
                  <CardDescription>Manage all recurring donations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </>
          )}
        </main>
      </div>
    </AdminLayout>
  );
}
