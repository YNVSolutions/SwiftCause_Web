import { useState, useEffect } from "react";
import { Screen, AdminSession, Permission } from "../../shared/types";
import { GiftAidDeclaration } from "../../entities/giftAid/model/types";
import { AdminLayout } from "./AdminLayout";
import { db } from "../../shared/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { generateGiftAidCSV } from "../../entities/giftAid/lib/giftAidCsv";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/ui/table";
import { Badge } from "../../shared/ui/badge";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Skeleton } from "../../shared/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/ui/select";
import {
  Gift,
  Search,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Target,
  Banknote,
  CalendarDays,
  Building2,
} from "lucide-react";
import { AdminSearchFilterHeader, AdminSearchFilterConfig } from "./components/AdminSearchFilterHeader";
import { SortableTableHeader } from "./components/SortableTableHeader";
import { useTableSort } from "../../shared/lib/hooks/useTableSort";
import { formatCurrency } from "../../shared/lib/currencyFormatter";

interface GiftAidManagementProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}



export function GiftAidManagement({
  onNavigate,
  onLogout,
  userSession,
  hasPermission,
}: GiftAidManagementProps) {
  const [giftAidDonations, setGiftAidDonations] = useState<GiftAidDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDonation, setSelectedDonation] = useState<GiftAidDeclaration | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Fetch Gift Aid declarations from Firebase
  useEffect(() => {
    if (!userSession.user.organizationId) {
      setError("No organization ID found");
      setLoading(false);
      return;
    }

    const fetchGiftAidDeclarations = async () => {
      try {
        setLoading(true);
        setError(null);

        const giftAidRef = collection(db, "giftAidDeclarations");
        const orgQuery = query(
          giftAidRef,
          where("organizationId", "==", userSession.user.organizationId)
        );

        const querySnapshot = await getDocs(orgQuery);
        const declarations: GiftAidDeclaration[] = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            
            return {
              id: doc.id,
              donationId: data.donationId,
              donorFirstName: data.donorFirstName,
              donorSurname: data.donorSurname,
              donorHouseNumber: data.donorHouseNumber,
              donorAddressLine1: data.donorAddressLine1,
              donorAddressLine2: data.donorAddressLine2,
              donorTown: data.donorTown,
              donorPostcode: data.donorPostcode,
              declarationText: data.declarationText,
              declarationDate: data.declarationDate,
              ukTaxpayerConfirmation: data.ukTaxpayerConfirmation,
              donationAmount: data.donationAmount,
              giftAidAmount: data.giftAidAmount,
              campaignId: data.campaignId,
              campaignTitle: data.campaignTitle,
              organizationId: data.organizationId,
              donationDate: data.donationDate,
              taxYear: data.taxYear,
              giftAidStatus: data.giftAidStatus,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            } as GiftAidDeclaration;
          })
          .sort((a, b) => {
            // Sort by donation date, newest first
            const dateA = a.donationDate ? new Date(a.donationDate).getTime() : 0;
            const dateB = b.donationDate ? new Date(b.donationDate).getTime() : 0;
            return dateB - dateA;
          });

        setGiftAidDonations(declarations);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching Gift Aid declarations:", err);
        // Handle different types of errors gracefully
        if (err.code === 'permission-denied') {
          setError("Permission denied. Please check your access rights.");
        } else if (err.code === 'failed-precondition') {
          setError("Database index required. Please contact your administrator.");
        } else if (err.code === 'not-found') {
          // Collection doesn't exist yet, which is fine
          setGiftAidDonations([]);
          setError(null);
        } else {
          // For development, show a more helpful error message
          console.log("Full error details:", err);
          setError(`Failed to load Gift Aid declarations: ${err.message || 'Unknown error'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGiftAidDeclarations();
  }, [userSession.user.organizationId]);

  // Configuration for AdminSearchFilterHeader
  const searchFilterConfig: AdminSearchFilterConfig = {
    filters: [
      {
        key: "statusFilter",
        label: "Status",
        type: "select",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Claimed", value: "claimed" },
          { label: "Rejected", value: "rejected" }
        ]
      }
    ]
  };

  const filterValues = {
    statusFilter
  };

  const handleFilterChange = (key: string, value: any) => {
    if (key === "statusFilter") {
      setStatusFilter(value);
    }
  };

  // Filter donations first
  const filteredDonationsData = giftAidDonations.filter((donation) => {
    const donorName = `${donation.donorFirstName} ${donation.donorSurname}`.trim();
    const matchesSearch = 
      donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donation.campaignTitle || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || donation.giftAidStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Use sorting hook
  const { sortedData: filteredDonations, sortKey, sortDirection, handleSort } = useTableSort({
    data: filteredDonationsData
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "claimed":
        return <Badge variant="outline" className="bg-[#064e3b]/10 text-[#064e3b] border-[#064e3b]/20"><CheckCircle className="w-3 h-3 mr-1" />Claimed</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Total gift aid amount for donations shown in the table (filtered donations)
  const totalGiftAidPending = filteredDonations
    .reduce((sum, d) => sum + (d.giftAidAmount || 0), 0);

  // Total gift aid amount for all donations (regardless of status)
  const totalGiftAidClaimed = giftAidDonations
    .reduce((sum, d) => sum + (d.giftAidAmount || 0), 0);

  const handleViewDetails = (donation: GiftAidDeclaration) => {
    setSelectedDonation(donation);
    setShowDetailsDialog(true);
  };

  const handleExportData = () => {
    // Use HMRC-compliant CSV generation
    const csvContent = generateGiftAidCSV(filteredDonations);
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'gift-aid-declarations.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = async () => {
    if (!userSession.user.organizationId) return;

    try {
      setLoading(true);
      setError(null);

      const giftAidRef = collection(db, "giftAidDeclarations");
      const orgQuery = query(
        giftAidRef,
        where("organizationId", "==", userSession.user.organizationId)
      );

      const querySnapshot = await getDocs(orgQuery);
      const declarations: GiftAidDeclaration[] = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          
          return {
            id: doc.id,
            donationId: data.donationId,
            donorFirstName: data.donorFirstName,
            donorSurname: data.donorSurname,
            donorHouseNumber: data.donorHouseNumber,
            donorAddressLine1: data.donorAddressLine1,
            donorAddressLine2: data.donorAddressLine2,
            donorTown: data.donorTown,
            donorPostcode: data.donorPostcode,
            declarationText: data.declarationText,
            declarationDate: data.declarationDate,
            ukTaxpayerConfirmation: data.ukTaxpayerConfirmation,
            donationAmount: data.donationAmount,
            giftAidAmount: data.giftAidAmount,
            campaignId: data.campaignId,
            campaignTitle: data.campaignTitle,
            organizationId: data.organizationId,
            donationDate: data.donationDate,
            taxYear: data.taxYear,
            giftAidStatus: data.giftAidStatus,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as GiftAidDeclaration;
        })
        .sort((a, b) => {
          // Sort by donation date, newest first
          const dateA = a.donationDate ? new Date(a.donationDate).getTime() : 0;
          const dateB = b.donationDate ? new Date(b.donationDate).getTime() : 0;
          return dateB - dateA;
        });

      setGiftAidDonations(declarations);
    } catch (err) {
      console.error("Error refreshing Gift Aid declarations:", err);
      setError("Failed to refresh Gift Aid declarations");
    } finally {
      setLoading(false);
    }
  };

  // Check permissions
  if (!hasPermission("view_donations")) {
    return (
      <AdminLayout 
        onNavigate={onNavigate} 
        onLogout={onLogout} 
        userSession={userSession} 
        hasPermission={hasPermission}
        activeScreen="admin-gift-aid"
      >
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Access Denied</p>
              </div>
              <p className="text-red-700 mt-2">
                You don't have permission to view Gift Aid donations. Please contact your administrator.
              </p>
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
      activeScreen="admin-gift-aid"
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
            Gift Aid
          </h1>
        </div>
      )}
      headerSubtitle="Manage and track Gift Aid eligible donations for tax reclaim"
      headerSearchPlaceholder="Search by donor name or campaign..."
      headerSearchValue={searchTerm}
      onHeaderSearchChange={setSearchTerm}
      headerTopRightActions={(
        <Button
          variant="outline"
          size="sm"
          className="rounded-2xl border-[#064e3b] bg-transparent text-[#064e3b] hover:bg-emerald-50 hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-900/10 hover:scale-105 transition-all duration-300 px-5"
          onClick={handleExportData}
        >
          <Download className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      )}
    >
      <div className="px-6 lg:px-8 pt-12 pb-8 space-y-6 sm:space-y-8">
        {/* Error Alert */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gift Aid (Shown)</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {loading ? "..." : formatCurrency(totalGiftAidPending)}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gift Aid</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#064e3b]">
                    {loading ? "..." : formatCurrency(totalGiftAidClaimed)}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#064e3b]/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#064e3b]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                    {loading ? "..." : giftAidDonations.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
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
              onClick={handleRefresh}
              disabled={loading}
              aria-label="Refresh"
              className="border-[#064e3b]/20 text-[#064e3b] hover:bg-[#064e3b]/10 hover:text-[#064e3b] hover:border-[#064e3b]/30"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""} sm:mr-2`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          }
        />

        {/* Donations Table - Desktop */}
        <Card className="overflow-hidden hidden md:block">
          <CardContent className="p-0">
            <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-gray-100 border-b-2 border-gray-300 text-gray-700">
                    <SortableTableHeader 
                      sortKey="donorName" 
                      currentSortKey={sortKey} 
                      currentSortDirection={sortDirection} 
                      onSort={handleSort}
                      className="w-[22%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="whitespace-nowrap">Donor</span>
                      </div>
                    </SortableTableHeader>
                    <SortableTableHeader 
                      sortKey="campaignTitle" 
                      currentSortKey={sortKey} 
                      currentSortDirection={sortDirection} 
                      onSort={handleSort}
                      className="w-[22%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
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
                      className="w-[13%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
                    >
                      <div className="flex items-center justify-end gap-2">
                        <Banknote className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="whitespace-nowrap">Donation</span>
                      </div>
                    </SortableTableHeader>
                    <SortableTableHeader 
                      sortKey="giftAidAmount" 
                      currentSortKey={sortKey} 
                      currentSortDirection={sortDirection} 
                      onSort={handleSort}
                      className="w-[13%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
                    >
                      <div className="flex items-center justify-end gap-2">
                        <Gift className="h-4 w-4 text-[#064e3b] shrink-0" />
                        <span className="whitespace-nowrap">Gift Aid</span>
                      </div>
                    </SortableTableHeader>
                    <SortableTableHeader 
                      sortKey="donationDate" 
                      currentSortKey={sortKey} 
                      currentSortDirection={sortDirection} 
                      onSort={handleSort}
                      className="w-[15%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
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
                      className="w-[10%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center [&>div]:justify-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="whitespace-nowrap">Actions</span>
                      </div>
                    </SortableTableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="h-16">
                        <TableCell className="py-4"><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-8 w-8 rounded" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredDonations.length > 0 ? (
                    filteredDonations.map((donation) => (
                      <TableRow 
                        key={donation.id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors h-16"
                        onClick={() => handleViewDetails(donation)}
                      >
                        <TableCell className="px-4 py-4 text-center">
                          <p className="text-base text-gray-900 truncate max-w-[200px] mx-auto" title={`${donation.donorFirstName} ${donation.donorSurname}`.trim()}>
                            {`${donation.donorFirstName} ${donation.donorSurname}`.trim()}
                          </p>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <p className="text-base text-gray-800 truncate max-w-[260px] mx-auto" title={donation.campaignTitle}>
                            {donation.campaignTitle}
                          </p>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <p className="text-base font-bold text-gray-900">{formatCurrency(donation.donationAmount || 0)}</p>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <p className="text-base font-bold text-[#064e3b]">{formatCurrency(donation.giftAidAmount || 0)}</p>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <p className="text-base text-gray-700">{donation.donationDate ? (() => {
                            const date = new Date(donation.donationDate);
                            return isNaN(date.getTime()) ? "Invalid Date" : date.toISOString().split('T')[0];
                          })() : "N/A"}</p>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(donation);
                            }}
                            className="h-8 w-8 p-0 hover:bg-indigo-100 hover:text-indigo-600 transition-colors mx-auto"
                            title="View donation details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 p-6">
                        <div className="flex flex-col items-center gap-2">
                          <Gift className="h-12 w-12 text-gray-400" />
                          <p className="text-xl font-bold text-gray-600">No Gift Aid donations found</p>
                          <p className="text-base text-gray-500 mt-2">
                            {searchTerm || statusFilter !== "all" 
                              ? "Try adjusting your search or filters" 
                              : "Gift Aid eligible donations will appear here when donors opt-in for Gift Aid"}
                          </p>
                          {!searchTerm && statusFilter === "all" && (
                            <p className="text-sm text-gray-400 mt-2">
                              Gift Aid declarations are created automatically when donors opt-in during the donation process.
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </CardContent>
        </Card>

        {/* Donations Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredDonations.length > 0 ? (
            filteredDonations.map((donation) => (
              <Card 
                key={donation.id} 
                className="overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(donation)}
              >
                <div className="p-4 flex justify-between items-start border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#064e3b]/10 flex items-center justify-center text-[#064e3b]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg leading-tight text-slate-900">
                        {`${donation.donorFirstName} ${donation.donorSurname}`.trim() || "N/A"}
                      </h2>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Donor</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900">
                      {formatCurrency(donation.donationAmount || 0)}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Amount</span>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-600">{donation.campaignTitle || "N/A"}</span>
                      <div className="flex mt-1">
                        <span className="bg-[#064e3b]/10 text-[#064e3b] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          {formatCurrency(donation.giftAidAmount || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(donation.giftAidStatus)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays className="w-4 h-4" />
                      {donation.donationDate && donation.donationDate !== "Unknown Date" 
                        ? new Date(donation.donationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Gift className="h-12 w-12 text-gray-400" />
                  <p className="text-xl font-bold text-gray-600">No Gift Aid donations found</p>
                  <p className="text-base text-gray-500 mt-2">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Gift Aid eligible donations will appear here when donors opt-in for Gift Aid"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-indigo-600" />
                Gift Aid Donation Details
              </DialogTitle>
              <DialogDescription>
                Complete information about this Gift Aid eligible donation
              </DialogDescription>
            </DialogHeader>
            
            {selectedDonation && (
              <div className="grid gap-4 py-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Donor Name</Label>
                  <p className="text-sm text-gray-900 mt-1">{`${selectedDonation.donorFirstName} ${selectedDonation.donorSurname}`.trim()}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Donation Amount</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(selectedDonation.donationAmount || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Gift Aid Amount</Label>
                    <p className="text-sm font-semibold text-[#064e3b] mt-1">{formatCurrency(selectedDonation.giftAidAmount || 0)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Campaign</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedDonation.campaignTitle}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Donation Date</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedDonation.donationDate ? (() => {
                      const date = new Date(selectedDonation.donationDate);
                      return isNaN(date.getTime()) ? "Invalid Date" : date.toISOString().split('T')[0];
                    })() : "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tax Year</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedDonation.taxYear}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Address</Label>
                  <p className="text-sm text-gray-900 mt-1">{`${selectedDonation.donorHouseNumber}, ${selectedDonation.donorAddressLine1}, ${selectedDonation.donorTown}`}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Postcode</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedDonation.donorPostcode}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedDonation.giftAidStatus || "pending")}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Transaction ID</Label>
                  <p className="text-xs text-gray-700 font-mono mt-1 bg-[#064e3b]/10 px-2 py-1 rounded border border-[#064e3b]/20 inline-block">
                    {selectedDonation.donationId}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
