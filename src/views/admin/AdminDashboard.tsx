import { useState, useEffect } from "react";
import { Button } from "../../shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../shared/ui/card";
import { Badge } from "../../shared/ui/badge";
import { Progress } from "../../shared/ui/progress";
import { Skeleton } from "../../shared/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../shared/ui/collapsible";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  Users,
  TrendingUp,
  Settings,
  Heart,
  Globe,
  Activity as ActivityIcon,
  AlertCircle,
  CheckCircle,
  Database,
  UserCog,
  LogOut,
  Plus,
  RefreshCw,
  Smartphone,
  CreditCard,
  Shield,
  BookOpen,
  HelpCircle,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Monitor,
  QrCode,
  BarChart3,
  Target,
  Workflow,
  Bell,
  Lightbulb,
  Rocket,
  Play,
  TriangleAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "../../shared/ui/dialog";
import { Screen, AdminSession, Permission, Campaign } from "../../shared/types";
import { db } from "../../shared/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import {
  useDashboardData,
  Activity,
  Alert,
} from "../../shared/lib/hooks/useDashboardData";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { useOrganization } from "../../shared/lib/hooks/useOrganization";
import { auth } from "../../shared/lib/firebase";
import { DeviceChart } from "./DeviceChart";
import { AdminLayout } from "./AdminLayout";

interface AdminDashboardProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
  onOrganizationSwitch: (organizationId: string) => void;
}

const CHART_COLORS = [
  "#6366F1", // Sophisticated Blue
  "#8B5CF6", // Vibrant Purple
  "#EC4899", // Modern Pink
  "#10B981", // Fresh Green
  "#F59E0B", // Warm Amber
  "#06B6D4", // Refreshing Cyan
  "#F97316", // Earthy Orange
  "#84CC16", // Lime Green
  "#14B8A6", // Teal
  "#64748B"  // Cool Slate Gray
]

export function AdminDashboard({
  onNavigate,
  onLogout,
  userSession,
  hasPermission,
  onOrganizationSwitch,
}: AdminDashboardProps) {
  const { stats, recentActivities, alerts, loading, error, refreshDashboard } =
    useDashboardData(userSession.user.organizationId);
  
  const { deviceDistribution } = stats;

  const [topCampaigns, setTopCampaigns] = useState<Campaign[]>([]);
  const [goalComparisonData, setGoalComparisonData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(false);
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);
  const [stripeStatusMessage, setStripeStatusMessage] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);
  const [showStripeStatusDialog, setShowStripeStatusDialog] = useState(false);
  const [isStripeOnboardingLoading, setIsStripeOnboardingLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showActivityDialog, setShowActivityDialog] = useState(false);

  const { organization, loading: orgLoading, error: orgError } = useOrganization(
    userSession.user.organizationId ?? null
  );

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split("?")[1]);
    const stripeStatus = params.get("stripe_status");

    if (stripeStatus === "success") {
      setStripeStatusMessage({
        type: "success",
        message:
          "Stripe onboarding complete! Your account is being reviewed and will be payout-ready shortly.",
      });
    } else if (stripeStatus === "refresh") {
      setStripeStatusMessage({
        type: "warning",
        message: "Stripe onboarding session expired or was cancelled. Please try again.",
      });
    }

    if (stripeStatus) {
      const newHash = hash.split("?")[0];
      window.history.replaceState(null, '', newHash);
    }
  }, []);

  const handleStripeOnboarding = async () => {
    if (!organization?.id) {
      console.error("Organization ID not available for Stripe onboarding.");
      return;
    }

    if (!auth.currentUser) {
      console.error("No authenticated Firebase user found.");
      return;
    }

    try {
      setIsStripeOnboardingLoading(true);
      const idToken = await auth.currentUser.getIdToken();
      
      const response = await fetch('https://createonboardinglink-j2f5w4qwxq-uc.a.run.app', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ orgId: organization.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText || "Failed to create onboarding link.");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating Stripe onboarding link:", error);
      setStripeStatusMessage({ type: 'error', message: `Failed to start Stripe onboarding: ${(error as Error).message}` });
    } finally {
      setIsStripeOnboardingLoading(false);
    }
  };


  const platformFeatures = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Touch-Friendly Kiosks",
      description:
        "Intuitive donation kiosks optimized for mobile and touch interfaces",
      benefits: [
        "Mobile-first design",
        "Responsive layouts",
        "Touch gestures",
        "iOS/Android compatibility",
      ],
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Secure Payment Processing",
      description:
        "PCI-compliant payment processing with multiple payment methods",
      benefits: [
        "Credit/Debit cards",
        "Digital wallets",
        "Recurring donations",
        "Fraud protection",
      ],
      color: "bg-green-50 text-green-600 border-green-200",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description:
        "Real-time insights and detailed reporting for data-driven decisions",
      benefits: [
        "Real-time dashboards",
        "Custom reports",
        "Donor insights",
        "Performance metrics",
      ],
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Campaign Management",
      description:
        "Fully customizable campaigns with flexible configuration options",
      benefits: [
        "Custom pricing tiers",
        "Visual themes",
        "Goal tracking",
        "Multi-location support",
      ],
      color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "QR Code Access",
      description:
        "Quick kiosk access via QR codes or device-specific access codes",
      benefits: [
        "QR code login",
        "Secure access codes",
        "Session management",
        "User tracking",
      ],
      color: "bg-orange-50 text-orange-600 border-orange-200",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "User & Permission System",
      description:
        "Granular permission controls for different user roles and access levels",
      benefits: [
        "Role-based access",
        "Granular permissions",
        "User management",
        "Audit trails",
      ],
      color: "bg-red-50 text-red-600 border-red-200",
    },
  ];

  const gettingStartedSteps = [
    {
      step: 1,
      title: "Create Your First Campaign",
      description:
        "Set up a donation campaign with custom goals, pricing, and branding",
      action: "Create Campaign",
      actionFunction: () => onNavigate("admin-campaigns"),
      icon: <Target className="w-5 h-5" />,
      estimated: "5 minutes",
      canAccess: hasPermission("create_campaign"),
    },
    {
      step: 2,
      title: "Configure Donation Kiosks",
      description:
        "Set up kiosks in your locations with QR codes and access controls",
      action: "Setup Kiosks",
      actionFunction: () => onNavigate("admin-kiosks"),
      icon: <Monitor className="w-5 h-5" />,
      estimated: "10 minutes",
      canAccess: hasPermission("create_kiosk"),
    },
    {
      step: 3,
      title: "Assign Campaigns to Kiosks",
      description:
        "Connect your campaigns to specific kiosk locations for targeted fundraising",
      action: "Assign Campaigns",
      actionFunction: () => onNavigate("admin-kiosks"),
      icon: <Workflow className="w-5 h-5" />,
      estimated: "3 minutes",
      canAccess: hasPermission("assign_campaigns"),
    },
    {
      step: 4,
      title: "Invite Team Members",
      description:
        "Add users with appropriate permissions to help manage your platform",
      action: "Manage Users",
      actionFunction: () => onNavigate("admin-users"),
      icon: <Users className="w-5 h-5" />,
      estimated: "5 minutes",
      canAccess: hasPermission("create_user"),
    },
  ];


  const quickTips = [
    {
      icon: <Lightbulb className="w-5 h-5 text-yellow-600" />,
      title: "Pro Tip: Use Global Campaigns",
      description:
        'Mark campaigns as "Global" to display them across all kiosks automatically.',
    },
    {
      icon: <Star className="w-5 h-5 text-blue-600" />,
      title: "Feature Campaigns",
      description:
        "Set default campaigns for each kiosk to highlight your most important causes.",
    },
    {
      icon: <Bell className="w-5 h-5 text-green-600" />,
      title: "Monitor Performance",
      description:
        "Check the analytics regularly to optimize campaign performance and kiosk placement.",
    },
  ];

  useEffect(() => {
    const fetchChartData = async () => {
      if (!userSession.user.organizationId) return;
      try {
        const campaignsRef = collection(db, "campaigns");
        const orgQuery = where("organizationId", "==", userSession.user.organizationId);

        const topListQuery = query(
          campaignsRef,
          orgQuery
        );
        const topListSnapshot = await getDocs(topListQuery);
        const allCampaigns = topListSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Campaign)
        );
        
        // Sort by percentage of goal completion
        const sortedByPercentage = allCampaigns
          .filter(campaign => campaign.goal && campaign.goal > 0)
          .sort((a, b) => {
            const percentA = (a.raised || 0) / (a.goal || 1);
            const percentB = (b.raised || 0) / (b.goal || 1);
            return percentB - percentA;
          })
          .slice(0, 4);
        
        setTopCampaigns(sortedByPercentage);

        const topChartQuery = query(
          campaignsRef,
          orgQuery,
          orderBy("raised", "desc"),
          limit(5)
        );
        const topChartSnapshot = await getDocs(topChartQuery);
        const comparisonData = topChartSnapshot.docs.map((doc) => {
          const data = doc.data() as Campaign;
          return {
            name: data.title,
            Collected: data.raised || 0,
            Goal: data.goal || 0,
          };
        });
        setGoalComparisonData(comparisonData);

        const allCampaignsQuery = query(campaignsRef, orgQuery);
        const allCampaignsSnapshot = await getDocs(allCampaignsQuery);
        console.log("all campaigns snapshot", allCampaignsSnapshot)
        const averageDonation: { [key: string]: number } = {};
        let average = 0;
        allCampaignsSnapshot.forEach((doc) => {
          const raisedAmount = (doc.data() as Campaign).raised;
          const donationCount = (doc.data() as Campaign).donationCount;

          if (raisedAmount > 0) {
            console.log("raised amount", raisedAmount);
            // console.log("campaign", title);
            const average = raisedAmount / (donationCount || 1);
            averageDonation[doc.id] = average;
          }
        });
        // Build categoryData from per-campaign average donation values so the
        // pie chart shows the relative average donation per campaign.
        const averages: { id: string; name: string; avg: number }[] = [];
        allCampaignsSnapshot.forEach((doc) => {
          const data = doc.data() as Campaign;
          const raised = data.raised || 0;
          const count = data.donationCount || 0;
          const avgValue = count > 0 ? raised / count : 0;
          averages.push({ id: doc.id, name: data.title || `Campaign ${doc.id}`, avg: avgValue });
        });

        // Only include campaigns with non-zero averages
        const nonZeroAverages = averages.filter((a) => a.avg > 0);
        const totalAvg = nonZeroAverages.reduce((sum, a) => sum + a.avg, 0);

        if (totalAvg > 0) {
          // Use the raw average donation amount as the slice value so the pie
          // chart proportions reflect actual average dollar amounts.
          let formattedCategoryData = nonZeroAverages.map((entry, index) => ({
            name: entry.name,
            value: entry.avg,
            color: CHART_COLORS[index % CHART_COLORS.length],
          }));

          // Sort descending by value so the chart displays largest -> smallest
          formattedCategoryData = formattedCategoryData.sort((a, b) => b.value - a.value);

          setCategoryData(formattedCategoryData);
        } else {
          setCategoryData([]);
        }
      } catch (error) {
        console.error("Error fetching chart data: ", error);
      }
    };

    fetchChartData();
  }, [userSession.user.organizationId, refreshDashboard]);

  const handleRefresh = () => {
    refreshDashboard();
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  const formatLargeCurrency = (amount: number) => {
    if (amount === 0) return "$0";
    if (typeof amount !== "number") return "...";

    const tiers = [
      { value: 1e12, name: "T" },
      { value: 1e9, name: "B" },
      { value: 1e6, name: "M" },
      { value: 1e3, name: "K" },
    ];

    const tier = tiers.find((t) => amount >= t.value);

    if (tier) {
      const value = (amount / tier.value).toFixed(1);
      return `$${value}${tier.name}`;
    }

    return formatCurrency(amount);
  };
  const formatShortCurrency = (amount: number) => {
    if (amount === 0) return "$0";
    if (typeof amount !== "number") return "...";
    const tiers = [
      { value: 1e12, name: "T" },
      { value: 1e9, name: "B" },
      { value: 1e6, name: "M" },
      { value: 1e3, name: "K" },
    ];
    const tier = tiers.find((t) => amount >= t.value);
    if (tier) {
      const value = (amount / tier.value).toFixed(1);
      return `$${value}${tier.name}`;
    }
    return `$${amount}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "donation":
        return <Heart className="w-4 h-4 text-green-600" />;
      case "campaign":
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case "kiosk":
        return <Settings className="w-4 h-4 text-orange-600" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-blue-600" />;
    }
  };

  const displayedCategories = isLegendExpanded
    ? categoryData
    : categoryData.slice(0, 6);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 text-red-700">
        <AlertCircle className="w-6 h-6 mr-2" />
        <p>Error loading dashboard data: {error}</p>
      </div>
    );
  }

  return (
    <AdminLayout onNavigate={onNavigate} onLogout={onLogout} userSession={userSession} hasPermission={hasPermission}>
      <header className="bg-white shadow-sm border rounded-md">
        <div className="px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col gap-4 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <img src="/logo.png" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shadow-md flex-shrink-0" alt="Logo" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 sm:gap-x-3 min-w-0 flex-1">
                    <h1 className="text-base sm:text-xl font-semibold text-gray-900 flex items-center flex-wrap gap-1 sm:gap-2">
                      <span className="whitespace-nowrap">Admin Dashboard</span>
                      {organization && (
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-700 truncate max-w-[200px] sm:max-w-none">
                          {organization.name}
                        </span>
                      )}
                    </h1>
                    <Badge variant="secondary" className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium rounded-full bg-gray-200 text-gray-700 whitespace-nowrap flex-shrink-0">
                      {userSession.user.role}
                    </Badge>
                  </div>
                </div>
                {userSession.user.role === 'super_admin' && hasPermission('system_admin') && (
                  <div className="w-full sm:w-auto">
                    <OrganizationSwitcher userSession={userSession} onOrganizationChange={onOrganizationSwitch} />
                  </div>
                )}
              </div>
              <div className="flex flex-row items-center gap-2 w-full sm:w-auto justify-end">
                {organization && organization.stripe && (
                  <Dialog open={showStripeStatusDialog} onOpenChange={setShowStripeStatusDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`relative rounded-full p-2 sm:p-2.5
                          ${!organization.stripe.chargesEnabled || !organization.stripe.payoutsEnabled
                            ? 'text-red-600 hover:text-red-700 animate-pulse bg-red-100'
                            : 'text-green-600 hover:text-green-700 bg-green-100'
                          }`}
                        aria-label="Stripe Status"
                      >
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] mx-4">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
                          {!organization.stripe.chargesEnabled || !organization.stripe.payoutsEnabled ? (
                            <CreditCard className="h-5 w-5 text-red-600" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-green-600" />
                          )}
                          <span>Stripe Account Status</span>
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                          Review the current status of your Stripe integration.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {orgLoading ? (
                          <p className="text-sm">Loading organization data...</p>
                        ) : orgError ? (
                          <p className="text-sm text-red-500">Error: {orgError}</p>
                        ) : organization &&
                          organization.stripe &&
                          !organization.stripe.chargesEnabled ? (
                          <>
                            <p className="text-sm text-yellow-700">
                              Your organization needs to complete Stripe onboarding to accept donations and receive payouts.
                            </p>
                            <Button
                              onClick={handleStripeOnboarding}
                              className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto"
                              disabled={isStripeOnboardingLoading}
                            >
                              {isStripeOnboardingLoading ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CreditCard className="w-4 h-4 mr-2" />
                              )}
                              {isStripeOnboardingLoading ? "Processing..." : "Complete Stripe Onboarding"}
                            </Button>
                          </>
                        ) : organization &&
                          organization.stripe &&
                          organization.stripe.chargesEnabled &&
                          !organization.stripe.payoutsEnabled ? (
                          <p className="text-sm text-blue-700">
                            Your Stripe account is being reviewed. Payouts will be enabled shortly.
                          </p>
                        ) : (
                          <p className="text-sm text-green-700">
                            Your Stripe account is fully configured and ready to accept donations and process payouts.
                          </p>
                        )}
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="secondary" className="w-full sm:w-auto">
                            Close
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="flex items-center space-x-2">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Welcome back, {userSession.user.username}</p>
          </div>
        </div>
      </header>

      <main className="px-1 sm:px-2 lg:px-4 py-4 sm:py-6">
        {stripeStatusMessage && (
          <Card className={`mb-6 sm:mb-8 ${stripeStatusMessage.type === 'success' ? 'border-green-400 bg-green-50 text-green-800' : stripeStatusMessage.type === 'warning' ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-red-400 bg-red-50 text-red-800'}`}>
            <CardContent className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4">
              {stripeStatusMessage.type === 'success' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
              {stripeStatusMessage.type === 'warning' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
              {stripeStatusMessage.type === 'error' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
              <p className="font-medium text-xs sm:text-sm break-words">{stripeStatusMessage.message}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">Overview</h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
              Manage campaigns, configure kiosks, and track donations across your organization
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {hasPermission("create_campaign") && (
              <Button onClick={() => onNavigate("admin-campaigns")} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto text-sm sm:text-base">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Manage Campaigns</span>
                <span className="sm:hidden">Campaigns</span>
              </Button>
            )}
            {hasPermission("view_kiosks") && (
              <Button variant="ghost" onClick={() => onNavigate("admin-kiosks")} className="w-full sm:w-auto text-sm sm:text-base">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Manage Kiosks</span>
                <span className="sm:hidden">Kiosks</span>
              </Button>
            )}
          </div>
        </div>
        {orgLoading ? (
          <p>Loading organization data...</p>
        ) : orgError ? (
          <p className="text-red-500">Error: {orgError}</p>
        ) : null}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="aspect-square lg:aspect-auto">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">
                    Total Raised
                  </p>
                  <p className="font-semibold text-gray-900 text-base sm:text-lg md:text-xl lg:text-2xl truncate">
                    {loading ? "..." : formatLargeCurrency(stats.totalRaised)}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="aspect-square lg:aspect-auto">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">
                    Total Donations
                  </p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
                    {loading ? "..." : formatNumber(stats.totalDonations)}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="aspect-square lg:aspect-auto">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">
                    Active Campaigns
                  </p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
                    {loading ? "..." : stats.activeCampaigns}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="aspect-square lg:aspect-auto">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">
                    Active Kiosks
                  </p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
                    {loading ? "..." : stats.activeKiosks}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mb-8">
          <Collapsible open={showFeatures} onOpenChange={setShowFeatures}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-2 sm:p-3 h-auto mb-2 text-left"
              >
                <div className="flex items-center space-x-2">
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                    Platform Features
                  </h3>
                </div>
                {showFeatures ? (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mb-6 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {platformFeatures.map((feature, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div
                        className={`inline-flex p-2 sm:p-3 rounded-lg ${feature.color} mb-3 sm:mb-4`}
                      >
                        {feature.icon}
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                        {feature.description}
                      </p>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-xs sm:text-sm text-gray-600"
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={showGettingStarted}
            onOpenChange={setShowGettingStarted}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-2 sm:p-3 h-auto mb-2 text-left"
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                    Getting Started
                  </h3>
                </div>
                {showGettingStarted ? (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mb-6 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {gettingStartedSteps.map((step, index) => (
                  <Card
                    key={index}
                    className={`${
                      step.canAccess
                        ? "hover:shadow-md transition-shadow"
                        : "opacity-60"
                    }`}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 text-indigo-600 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0">
                          {step.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2 flex-wrap">
                            <div className="text-indigo-600 flex-shrink-0">{step.icon}</div>
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900">
                              {step.title}
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                            {step.description}
                          </p>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            {step.canAccess ? (
                              <Button
                                onClick={step.actionFunction}
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm"
                              >
                                <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">{step.action}</span>
                                <span className="sm:hidden">Go</span>
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <HelpCircle className="w-3 h-3 mr-1" />
                                Requires permission
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              ~{step.estimated}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center space-x-2 text-blue-900 text-base sm:text-lg">
                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Quick Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickTips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                        <div className="flex-shrink-0">{tip.icon}</div>
                        <div className="min-w-0">
                          <h5 className="font-medium text-sm sm:text-base text-gray-900 mb-1">
                            {tip.title}
                          </h5>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {tip.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Campaign Goal Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[250px] sm:h-[300px] w-full" />
                </div>
              ) : goalComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <BarChart data={goalComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={false}
                      className="text-xs"
                    />
                    <YAxis
                      tickFormatter={(value) => formatShortCurrency(value as number)}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value) => formatShortCurrency(value as number)}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Collected" fill="#10B981" />
                    <Bar dataKey="Goal" fill="#94A3B8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Target className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
                  <p className="text-base sm:text-lg font-medium mb-2">No Campaigns Yet</p>
                  <p className="text-xs sm:text-sm mb-4 px-4">
                    Start by creating your first fundraising campaign to track progress.
                  </p>
                  {hasPermission("create_campaign") && (
                    <Button onClick={() => onNavigate("admin-campaigns")} size="sm" className="text-xs sm:text-sm">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> Create New Campaign
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Average Donation Per Campaign</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 sm:p-6 pt-0">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[260px] sm:h-[300px] w-full mb-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-5 w-full" />
                    ))}
                  </div>
                </div>
              ) : categoryData.length > 0 ? (
                <div className="flex-1 flex items-end">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={categoryData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(value) => formatShortCurrency(value as number)} />
                      <Tooltip formatter={(value) => formatShortCurrency(value as number)} contentStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <TriangleAlert className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
                  <p className="text-base sm:text-lg font-medium mb-2">No Categories Yet</p>
                  <p className="text-xs sm:text-sm mb-4 px-4">
                      Start by creating your first fundraising campaign to track progress.
                    </p>
                    {hasPermission("create_campaign") && (
                      <Button onClick={() => onNavigate("admin-campaigns")} size="sm" className="text-xs sm:text-sm">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> Create New Campaign
                      </Button>
                    )}
                </div>
              )}
              <div className="mt-2 border-t pt-2">                 
                {categoryData.length > 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm"
                    onClick={() => setIsLegendExpanded(!isLegendExpanded)}
                  >
                    {isLegendExpanded ? (
                      <span className="flex items-center justify-center">
                        Show Less <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Show More <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        
        <div className="mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-lg mb-1">Top Performing Campaigns</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Campaigns by fundraising progress
                </CardDescription>
              </div>
              {hasPermission("view_campaigns") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate("admin-campaigns")}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  View All
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-4 sm:h-5 w-3/4" />
                        <Skeleton className="h-4 sm:h-5 w-1/4" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                      <div className="flex justify-between text-xs text-gray-500 gap-2">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))
                ) : topCampaigns.length > 0 ? (
                  topCampaigns.map((campaign: Campaign) => {
                    const collected = campaign.raised || 0;
                    const goal = campaign.goal || 1;
                    const progressRaw = (collected / goal) * 100;
                    const progress = progressRaw < 1 ? progressRaw.toFixed(2) : Math.round(progressRaw);
                    const progressValue = progressRaw < 1 ? progressRaw : Math.round(progressRaw);
                    return (
                      <div key={campaign.id} className="space-y-2">
                        <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                          <h4 className="font-medium text-sm sm:text-base text-gray-900 flex-1 min-w-0 truncate">
                            {campaign.title}
                          </h4>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs sm:text-sm font-medium text-green-600">
                              {formatCurrency(collected)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {campaign.donationCount || 0} donors
                            </p>
                          </div>
                        </div>
                        <Progress value={progressValue} className="h-1.5 sm:h-2" />
                        <div className="flex justify-between text-xs text-gray-500 gap-2">
                          <span>{progress}% complete</span>
                          <span className="truncate">Goal: {formatCurrency(goal)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <Target className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
                    <p className="text-base sm:text-lg font-medium mb-2">No Campaigns Yet</p>
                    <p className="text-xs sm:text-sm mb-4 px-4">
                      Start by creating your first fundraising campaign to track progress.
                    </p>
                    {hasPermission("create_campaign") && (
                      <Button onClick={() => onNavigate("admin-campaigns")} size="sm" className="text-xs sm:text-sm">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> Create New Campaign
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Donation Distribution by Amount</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Number of donations in different amount ranges
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[250px] sm:h-[300px] w-full" />
                </div>
              ) : stats.donationDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <LineChart data={stats.donationDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="range" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Number of Donations', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                    />
                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#6366F1" 
                      strokeWidth={2} 
                      dot={{ fill: '#6366F1', r: 4 }}
                      name="Donations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <TrendingUp className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
                  <p className="text-base sm:text-lg font-medium mb-2">No Donation Data</p>
                  <p className="text-xs sm:text-sm mb-4 px-4">
                    Start receiving donations to see distribution trends.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-2 sm:space-x-3">
                      <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <Skeleton className="h-3 sm:h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity: Activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedActivity(activity);
                        setShowActivityDialog(true);
                      }}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-900 break-words">
                          {activity.message}
                        </p>
                        <div className="flex items-center flex-wrap space-x-2 mt-1 gap-1">
                          <p className="text-xs text-gray-500">
                            {activity.timeAgo}
                          </p>
                          {activity.kioskId && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.kioskId}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <ActivityIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
                    <p className="text-base sm:text-lg font-medium mb-2">No Recent Activity</p>
                    <p className="text-xs sm:text-sm mb-4 px-4">
                      Start by managing campaigns or configuring kiosks to see activity here.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                      {hasPermission("create_campaign") && (
                        <Button onClick={() => onNavigate("admin-campaigns")} size="sm" className="text-xs sm:text-sm">
                          <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> 
                          <span className="hidden sm:inline">Manage Campaigns</span>
                          <span className="sm:hidden">Campaigns</span>
                        </Button>
                      )}
                      {hasPermission("create_kiosk") && (
                        <Button onClick={() => onNavigate("admin-kiosks")} size="sm" variant="outline" className="text-xs sm:text-sm">
                          <Monitor className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> 
                          <span className="hidden sm:inline">Configure Kiosks</span>
                          <span className="sm:hidden">Kiosks</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                <span>System Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-2 sm:space-y-3">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-gray-50">
                      <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full flex-shrink-0" />
                      <Skeleton className="h-3 sm:h-4 w-3/4" />
                    </div>
                  ))
                ) : alerts.length > 0 ? (
                  alerts.map((alert: Alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-900 break-words">{alert.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <AlertCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
                    <p className="text-base sm:text-lg font-medium mb-2">No System Alerts</p>
                    <p className="text-xs sm:text-sm mb-4 px-4">
                      Your system is running smoothly. No alerts to display.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">More Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {hasPermission("view_campaigns") && (
                  <Button
                    variant="outline"
                    className="justify-start h-10 sm:h-12 text-xs sm:text-sm"
                    onClick={() => onNavigate("admin-campaigns")}
                  >
                    <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="truncate">Manage Campaigns</span>
                  </Button>
                )}
                {hasPermission("view_kiosks") && (
                  <Button
                    variant="outline"
                    className="justify-start h-10 sm:h-12 text-xs sm:text-sm"
                    onClick={() => onNavigate("admin-kiosks")}
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="truncate">Configure Kiosks</span>
                  </Button>
                )}
                {hasPermission("view_donations") && (
                  <Button
                    variant="outline"
                    className="justify-start h-10 sm:h-12 text-xs sm:text-sm"
                    onClick={() => onNavigate("admin-donations")}
                  >
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="truncate">View Donations</span>
                  </Button>
                )}
                {hasPermission("view_users") && (
                  <Button
                    variant="outline"
                    className="justify-start h-10 sm:h-12 text-xs sm:text-sm"
                    onClick={() => onNavigate("admin-users")}
                  >
                    <UserCog className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="truncate">User Management</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Donation Details Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="sm:max-w-[500px] mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Heart className="h-5 w-5 text-green-600" />
              <span>Donation Details</span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              Complete information about this donation
            </DialogDescription>
          </DialogHeader>
          
          {selectedActivity && selectedActivity.donationData && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Amount:</span>
                <span className="col-span-2 text-sm font-semibold text-green-600">
                  ${selectedActivity.donationData.amount}
                </span>
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Campaign:</span>
                <span className="col-span-2 text-sm text-gray-900">
                  {selectedActivity.campaignName || 'N/A'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Date & Time:</span>
                <span className="col-span-2 text-sm text-gray-900">
                  {selectedActivity.displayTime}
                </span>
              </div>
              
              {selectedActivity.donationData.donorName && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Donor Name:</span>
                  <span className="col-span-2 text-sm text-gray-900">
                    {selectedActivity.donationData.donorName}
                  </span>
                </div>
              )}
              
              {selectedActivity.donationData.donorEmail && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="col-span-2 text-sm text-gray-900 break-all">
                    {selectedActivity.donationData.donorEmail}
                  </span>
                </div>
              )}
              
              {selectedActivity.donationData.donorPhone && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <span className="col-span-2 text-sm text-gray-900">
                    {selectedActivity.donationData.donorPhone}
                  </span>
                </div>
              )}
              
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <span className="col-span-2 text-sm">
                  {selectedActivity.donationData.isRecurring ? (
                    <Badge variant="default" className="bg-blue-600">
                      Recurring ({selectedActivity.donationData.recurringInterval})
                    </Badge>
                  ) : (
                    <Badge variant="secondary">One-time</Badge>
                  )}
                </span>
              </div>
              
              {selectedActivity.donationData.isAnonymous && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Anonymous:</span>
                  <span className="col-span-2 text-sm">
                    <Badge variant="outline">Anonymous Donation</Badge>
                  </span>
                </div>
              )}
              
              {selectedActivity.donationData.isGiftAid && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Gift Aid:</span>
                  <span className="col-span-2 text-sm">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Gift Aid Eligible
                    </Badge>
                  </span>
                </div>
              )}
              
              {selectedActivity.kioskId && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Platform:</span>
                  <span className="col-span-2 text-sm text-gray-900">
                    {selectedActivity.kioskId}
                  </span>
                </div>
              )}
              
              {selectedActivity.donationData.transactionId && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Transaction ID:</span>
                  <span className="col-span-2 text-xs text-gray-600 font-mono break-all">
                    {selectedActivity.donationData.transactionId}
                  </span>
                </div>
              )}
              
              {selectedActivity.donationData.donorMessage && (
                <div className="grid grid-cols-3 items-start gap-4">
                  <span className="text-sm font-medium text-gray-700">Message:</span>
                  <span className="col-span-2 text-sm text-gray-900 italic">
                    "{selectedActivity.donationData.donorMessage}"
                  </span>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="w-full sm:w-auto">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
