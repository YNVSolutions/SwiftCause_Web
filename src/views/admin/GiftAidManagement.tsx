import { useState, useEffect } from "react";
import { Screen, AdminSession, Permission } from "../../shared/types";
import { GiftAidDeclaration } from "../../shared/types/donation";
import { AdminLayout } from "./AdminLayout";
import { db } from "../../shared/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { exportToCsv } from "../../shared/utils/csvExport";
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
} from "lucide-react";
import { AdminSearchFilterHeader, AdminSearchFilterConfig } from "./components/AdminSearchFilterHeader";
import { SortableTableHeader } from "./components/SortableTableHeader";
import { useTableSort } from "../../shared/lib/hooks/useTableSort";

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

            
            // Map Firebase fields to our interface
            const donationAmount = data.donationAmount || 0;
            const giftAidAmount = donationAmount * 0.25; // 25% Gift Aid rate
            
            // Determine status based on available fields
            let giftAidStatus: "pending" | "claimed" | "rejected" = "pending";
            
            if (data.declarationAccepted && data.giftAidConsent && data.ukTaxpayerConfirmation && data.confirmationChecked) {
              giftAidStatus = "pending"; // All requirements met, ready to be claimed
            } else if (!data.declarationAccepted || !data.giftAidConsent || !data.ukTaxpayerConfirmation) {
              giftAidStatus = "rejected"; // Missing required consents
            }
            
            // If there's a specific status field in the future, use that
            if (data.giftAidStatus) {
              giftAidStatus = data.giftAidStatus;
            }
            
            return {
              id: doc.id,
              donationId: data.donationId || doc.id,
              donorName: data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim(),
              donorAddress: data.address || `${data.houseNumber || ""} ${data.streetAddress || ""}, ${data.townCity || ""}, ${data.county || ""}`.trim(),
              donorPostcode: data.postcode || "",
              amount: donationAmount,
              giftAidAmount: giftAidAmount,
              campaignId: data.campaignId || "",
              campaignTitle: data.campaignTitle || "Unknown Campaign",
              donationDate: data.donationDate || data.date || data.createdAt || "Unknown Date",
              giftAidStatus: giftAidStatus,
              transactionId: data.transactionId || "",
              taxYear: data.taxYear || "Unknown Year",
              organizationId: data.organizationId || "",
              createdAt: data.createdAt || data.timestamp,
              updatedAt: data.updatedAt || data.timestamp,
            } as GiftAidDeclaration;
          })
          .sort((a, b) => {
            // Sort by donation date, newest first
            const dateA = a.donationDate === "Unknown Date" ? 0 : new Date(a.donationDate).getTime();
            const dateB = b.donationDate === "Unknown Date" ? 0 : new Date(b.donationDate).getTime();
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
    searchPlaceholder: "Search by donor name or campaign...",
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
    const matchesSearch = 
      (donation.donorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Claimed</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);

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
    // Transform data for export with custom field names
    const exportData = filteredDonations.map(donation => ({
      "Donor Name": donation.donorName || "N/A",
      "Address": donation.donorAddress || "N/A",
      "Postcode": donation.donorPostcode || "N/A",
      "Donation Amount": donation.amount || 0,
      "Gift Aid Amount": donation.giftAidAmount || 0,
      "Campaign": donation.campaignTitle || "N/A",
      "Date": donation.donationDate || "N/A",
      "Status": donation.giftAidStatus || "pending",
      "Tax Year": donation.taxYear || "N/A",
      "Transaction ID": donation.transactionId || "N/A"
    }));

    exportToCsv(exportData, "gift-aid-declarations");
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
          
          // Map Firebase fields to our interface
          const donationAmount = data.donationAmount || 0;
          const giftAidAmount = donationAmount * 0.25; // 25% Gift Aid rate
          
          // Determine status based on available fields
          let giftAidStatus: "pending" | "claimed" | "rejected" = "pending";
          
          if (data.declarationAccepted && data.giftAidConsent && data.ukTaxpayerConfirmation && data.confirmationChecked) {
            giftAidStatus = "pending"; // All requirements met, ready to be claimed
          } else if (!data.declarationAccepted || !data.giftAidConsent || !data.ukTaxpayerConfirmation) {
            giftAidStatus = "rejected"; // Missing required consents
          }
          
          // If there's a specific status field in the future, use that
          if (data.giftAidStatus) {
            giftAidStatus = data.giftAidStatus;
          }
          
          return {
            id: doc.id,
            donationId: data.donationId || doc.id,
            donorName: data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim(),
            donorAddress: data.address || `${data.houseNumber || ""} ${data.streetAddress || ""}, ${data.townCity || ""}, ${data.county || ""}`.trim(),
            donorPostcode: data.postcode || "",
            amount: donationAmount,
            giftAidAmount: giftAidAmount,
            campaignId: data.campaignId || "",
            campaignTitle: data.campaignTitle || "Unknown Campaign",
            donationDate: data.donationDate || data.date || data.createdAt || "Unknown Date",
            giftAidStatus: giftAidStatus,
            transactionId: data.transactionId || "",
            taxYear: data.taxYear || "2024-25",
            organizationId: data.organizationId || "",
            createdAt: data.createdAt || data.timestamp,
            updatedAt: data.updatedAt || data.timestamp,
          } as GiftAidDeclaration;
        })
        .sort((a, b) => {
          // Sort by donation date, newest first
          const dateA = a.donationDate === "Unknown Date" ? 0 : new Date(a.donationDate).getTime();
          const dateB = b.donationDate === "Unknown Date" ? 0 : new Date(b.donationDate).getTime();
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
      hideSidebarTrigger
    >
      <div className="px-2 sm:px-4 lg:px-8 pb-4 sm:pb-8 space-y-4 sm:space-y-6">
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
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {loading ? "..." : formatCurrency(totalGiftAidClaimed)}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
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
          title={`Gift Aid Donations (${filteredDonations.length})`}
          subtitle="Manage and track Gift Aid eligible donations for tax reclaim"
          config={searchFilterConfig}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          exportData={filteredDonations}
          onExport={handleExportData}
          actions={
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              aria-label="Refresh"
              className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""} sm:mr-2`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          }
        />

        {/* Donations Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <>
                <div className="md:hidden space-y-4 px-4 py-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-emerald-100 bg-white px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table className="w-full table-fixed">
                    <TableHeader>
                      <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                        <TableHead className="w-[20%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Donor</TableHead>
                        <TableHead className="w-[18%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Campaign</TableHead>
                        <TableHead className="w-[12%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-right">Donation</TableHead>
                        <TableHead className="w-[12%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-right">Gift Aid</TableHead>
                        <TableHead className="w-[20%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Date</TableHead>
                        <TableHead className="w-[18%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="h-16">
                          <TableCell className="py-4"><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell className="py-4"><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="py-4"><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="py-4"><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="py-4"><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell className="py-4"><Skeleton className="h-8 w-8 rounded" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : filteredDonations.length > 0 ? (
              <>
                <div className="md:hidden space-y-4 px-4 py-5">
                  {filteredDonations.map((donation) => (
                    <button
                      key={donation.id}
                      type="button"
                      onClick={() => handleViewDetails(donation)}
                      className="group relative w-full rounded-2xl border border-emerald-100 bg-white px-4 pb-4 pt-3 text-left shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <span className="absolute left-0 top-4 h-12 w-1.5 rounded-full bg-emerald-500" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-gray-900 truncate">
                              {donation.donorName || "N/A"}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500 truncate">{donation.donorPostcode || "Postcode unavailable"}</div>
                          <div className="text-[11px] font-mono text-gray-400 truncate">
                            {donation.transactionId || "No transaction ID"}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(donation.amount || 0)}
                          </span>
                          <span className="text-sm font-semibold text-emerald-700">
                            {formatCurrency(donation.giftAidAmount || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {donation.campaignTitle || "N/A"}
                          </p>
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                            <Gift className="h-3.5 w-3.5" />
                            Gift Aid
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(donation.giftAidStatus || "pending")}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                          <span className="truncate">
                            {donation.donationDate && donation.donationDate !== "Unknown Date"
                              ? new Date(donation.donationDate).toLocaleDateString()
                              : "Unknown Date"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Badge variant="secondary" className="text-[11px]">
                            {donation.taxYear || "Tax year"}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                          <Eye className="h-3.5 w-3.5" />
                          View details
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="hidden md:block overflow-hidden">
                  <Table className="w-full table-fixed">
                      <TableHeader>
                        <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                          <SortableTableHeader 
                            sortKey="donorName" 
                            currentSortKey={sortKey} 
                            currentSortDirection={sortDirection} 
                            onSort={handleSort}
                            className="w-[20%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <span className="whitespace-nowrap">Donor</span>
                            </div>
                          </SortableTableHeader>
                          <SortableTableHeader 
                            sortKey="campaignTitle" 
                            currentSortKey={sortKey} 
                            currentSortDirection={sortDirection} 
                            onSort={handleSort}
                            className="w-[18%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                          >
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-gray-500 flex-shrink-0" />
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
                              <Banknote className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <span className="whitespace-nowrap">Donation</span>
                            </div>
                          </SortableTableHeader>
                          <SortableTableHeader 
                            sortKey="giftAidAmount" 
                            currentSortKey={sortKey} 
                            currentSortDirection={sortDirection} 
                            onSort={handleSort}
                            className="w-[12%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-right"
                          >
                            <div className="flex items-center justify-end gap-2">
                              <Gift className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span className="whitespace-nowrap">Gift Aid</span>
                            </div>
                          </SortableTableHeader>
                          <SortableTableHeader 
                            sortKey="donationDate" 
                            currentSortKey={sortKey} 
                            currentSortDirection={sortDirection} 
                            onSort={handleSort}
                            className="w-[20%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                          >
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <span className="whitespace-nowrap">Date</span>
                            </div>
                          </SortableTableHeader>
                          <SortableTableHeader 
                            sortable={false}
                            sortKey="actions" 
                            currentSortKey={sortKey} 
                            currentSortDirection={sortDirection} 
                            onSort={handleSort}
                            className="w-[18%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Eye className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <span className="whitespace-nowrap">Actions</span>
                            </div>
                          </SortableTableHeader>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDonations.map((donation) => (
                          <TableRow 
                            key={donation.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors h-16"
                            onClick={() => handleViewDetails(donation)}
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <p className="text-base text-gray-900">{donation.donorName || "N/A"}</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <p className="text-base text-gray-800">{donation.campaignTitle || "N/A"}</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <Banknote className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <p className="text-base font-bold text-gray-900">{formatCurrency(donation.amount || 0)}</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <Gift className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <p className="text-base font-bold text-green-700">{formatCurrency(donation.giftAidAmount || 0)}</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <p className="text-base text-gray-700">{donation.donationDate && donation.donationDate !== "Unknown Date" ? new Date(donation.donationDate).toLocaleDateString() : "Unknown Date"}</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(donation);
                                }}
                                className="h-8 w-8 p-0 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
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
              </>
            ) : (
              <div className="text-center py-8 px-6">
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
              </div>
            )}
          </CardContent>
        </Card>

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
                  <p className="text-sm text-gray-900 mt-1">{selectedDonation.donorName || "N/A"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Donation Amount</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(selectedDonation.amount || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Gift Aid Amount</Label>
                    <p className="text-sm font-semibold text-green-600 mt-1">{formatCurrency(selectedDonation.giftAidAmount || 0)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Campaign</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedDonation.campaignTitle || "N/A"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Donation Date</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedDonation.donationDate && selectedDonation.donationDate !== "Unknown Date" ? new Date(selectedDonation.donationDate).toLocaleDateString() : "Unknown Date"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tax Year</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedDonation.taxYear || "N/A"}</p>
                  </div>
                </div>
                
                {selectedDonation.donorAddress && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Address</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedDonation.donorAddress}</p>
                    {selectedDonation.donorPostcode && (
                      <p className="text-sm text-gray-900">{selectedDonation.donorPostcode}</p>
                    )}
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedDonation.giftAidStatus || "pending")}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Transaction ID</Label>
                  <p className="text-xs text-gray-700 font-mono mt-1 bg-green-50 px-2 py-1 rounded border border-green-100 inline-block">
                    {selectedDonation.transactionId || "N/A"}
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
