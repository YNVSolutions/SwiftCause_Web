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
import { ImageWithFallback } from "../../shared/ui/figma/ImageWithFallback";
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
  TrendingDown,
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
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Medal,
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
import { SystemAlertsWidget } from "./components/SystemAlertsWidget";
import { useSystemAlerts } from "../../shared/lib/hooks/useSystemAlerts";

interface AdminDashboardProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
  onOrganizationSwitch: (organizationId: string) => void;
}

// Professional color palette
const CHART_COLORS = [
  "#4F46E5", // Indigo-600 (Primary)
  "#10B981", // Emerald-500 (Secondary)
  "#8B5CF6", // Violet-500
  "#F59E0B", // Amber-500
  "#06B6D4", // Cyan-500
  "#EC4899", // Pink-500
  "#F97316", // Orange-500
  "#84CC16", // Lime-500
  "#14B8A6", // Teal-500
  "#64748B"  // Slate-500
]

// Custom Tooltip Component for Charts
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-sm">
        {label && <p className="font-semibold text-gray-900 mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
            </div>
            <span className="font-semibold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

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

  const { alerts: systemAlerts, loading: systemAlertsLoading } = useSystemAlerts({
    organization,
    organizationId: userSession.user.organizationId,
  });

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

        const averageDonation: { [key: string]: number } = {};
        let average = 0;
        allCampaignsSnapshot.forEach((doc) => {
          const raisedAmount = (doc.data() as Campaign).raised;
          const donationCount = (doc.data() as Campaign).donationCount;

          if (raisedAmount > 0) {
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
  }, [userSession.user.organizationId]);

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
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {organization ? organization.name : 'Dashboard'}
                </h1>
                <Badge className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {userSession.user.role.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {userSession.user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {userSession.user.role === 'super_admin' && hasPermission('system_admin') && (
              <div className="w-full sm:w-auto">
                <OrganizationSwitcher userSession={userSession} onOrganizationChange={onOrganizationSwitch} />
              </div>
            )}
            {organization && organization.stripe && (
              <Dialog open={showStripeStatusDialog} onOpenChange={setShowStripeStatusDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`relative rounded-lg
                      ${!organization.stripe.chargesEnabled || !organization.stripe.payoutsEnabled
                        ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 animate-pulse'
                        : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    aria-label="Stripe Status"
                  >
                    <CreditCard className="h-4 w-4" />
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={loading} 
              className="rounded-lg border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
          </div>
        </div>

        {stripeStatusMessage && (
          <Card className={`mb-6 ${stripeStatusMessage.type === 'success' ? 'border-green-400 bg-green-50 text-green-800' : stripeStatusMessage.type === 'warning' ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-red-400 bg-red-50 text-red-800'}`}>
            <CardContent className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4">
              {stripeStatusMessage.type === 'success' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
              {stripeStatusMessage.type === 'warning' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
              {stripeStatusMessage.type === 'error' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
              <p className="font-medium text-xs sm:text-sm break-words">{stripeStatusMessage.message}</p>
            </CardContent>
          </Card>
        )}
        {orgLoading ? (
          <p>Loading organization data...</p>
        ) : orgError ? (
          <p className="text-red-500">Error: {orgError}</p>
        ) : null}
        
        {/* Bento Grid Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Raised Card */}
          <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Raised</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : formatLargeCurrency(stats.totalRaised)}
                </p>
                <div className="flex items-center text-sm text-emerald-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="font-medium">12% vs last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Donations Card */}
          <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Heart className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : formatNumber(stats.totalDonations)}
                </p>
                <div className="flex items-center text-sm text-emerald-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="font-medium">8% vs last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Campaigns Card */}
          <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Globe className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.activeCampaigns}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Running now</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Kiosks Card */}
          <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Monitor className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Active Kiosks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.activeKiosks}
                </p>
                <div className="flex items-center text-sm text-red-600">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span className="font-medium">3% vs last month</span>
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
        {/* Bento Grid Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Campaign Goal Comparison - Spans 2 columns */}
          <Card className="bg-white rounded-xl border border-gray-200 shadow-sm md:col-span-2">
            <CardHeader className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    Campaign Goal Comparison
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1 ml-11">
                    Track progress towards fundraising goals
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[250px] sm:h-[300px] w-full" />
                </div>
              ) : goalComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <BarChart data={goalComparisonData}>
                    <CartesianGrid 
                      vertical={false} 
                      strokeDasharray="3 3" 
                      stroke="#E5E7EB" 
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(value) => formatShortCurrency(value as number)}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px' }}
                      iconType="circle"
                    />
                    <Bar 
                      dataKey="Collected" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="Goal" 
                      fill="#94A3B8" 
                      radius={[4, 4, 0, 0]}
                    />
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

          {/* Average Donation - Spans 2 columns */}
          <Card className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm md:col-span-2">
            <CardHeader className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mr-3">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    Average Donation Per Campaign
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1 ml-11">
                    Analyze donation patterns across campaigns
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-6">
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
                      <CartesianGrid 
                        vertical={false} 
                        strokeDasharray="3 3" 
                        stroke="#E5E7EB" 
                      />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }} 
                      />
                      <YAxis 
                        tickFormatter={(value) => formatShortCurrency(value as number)}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#4F46E5" 
                        strokeWidth={2} 
                        dot={false}
                        activeDot={{ r: 6, fill: '#4F46E5' }}
                      />
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

        
        {/* Top Performing Campaigns - Gamified Leaderboard */}
        <div className="mb-8">
          <Card className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
            <CardHeader className="p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50/50 to-orange-50/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                      Top Performing Campaigns
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 flex items-center gap-2">
                      <span>Ranked by fundraising progress</span>
                      <span className="hidden sm:inline text-gray-400">•</span>
                      <span className="hidden sm:inline text-indigo-600 font-medium">
                        {topCampaigns.length} {topCampaigns.length === 1 ? 'Campaign' : 'Campaigns'}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                {hasPermission("view_campaigns") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate("admin-campaigns")}
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-300 shadow-sm font-medium"
                  >
                    View All Campaigns
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-32 w-full rounded-lg" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-1.5 w-full" />
                    </div>
                  ))}
                </div>
              ) : topCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topCampaigns.map((campaign: Campaign, index: number) => {
                    const collected = campaign.raised || 0;
                    const goal = campaign.goal || 1;
                    const progressRaw = (collected / goal) * 100;
                    const progressValue = Math.min(progressRaw, 100);
                    const rank = index + 1;
                    
                    // Rank overlay styling
                    const getRankOverlay = () => {
                      if (rank === 1) {
                        return (
                          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center shadow-lg">
                            <Trophy className="w-4 h-4 text-white" />
                          </div>
                        );
                      } else if (rank === 2) {
                        return (
                          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center shadow-lg">
                            <Medal className="w-4 h-4 text-white" />
                          </div>
                        );
                      } else if (rank === 3) {
                        return (
                          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center shadow-lg">
                            <Medal className="w-4 h-4 text-white" />
                          </div>
                        );
                      } else {
                        return (
                          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-600 border-2 border-white flex items-center justify-center shadow-lg">
                            <span className="text-sm font-bold text-white">{rank}</span>
                          </div>
                        );
                      }
                    };

                    return (
                      <div 
                        key={campaign.id} 
                        className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
                      >
                        {/* Campaign Image */}
                        <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
                          <ImageWithFallback
                            src={campaign.coverImageUrl}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                            fallbackType="campaign"
                          />
                          {getRankOverlay()}
                        </div>

                        {/* Campaign Info */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900 truncate mb-1">
                              {campaign.title}
                            </h4>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(collected)}
                            </p>
                          </div>

                          <Progress 
                            value={progressValue} 
                            className={`h-1.5 rounded-full ${progressRaw >= 100 ? '[&>div]:bg-green-500' : '[&>div]:bg-indigo-500'}`}
                          />

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              {formatShortCurrency(goal)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {campaign.donationCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-lg font-medium mb-2 text-gray-900">No Campaigns Yet</p>
                  <p className="text-sm mb-4 text-gray-600">
                    Start by creating your first fundraising campaign to track progress.
                  </p>
                  {hasPermission("create_campaign") && (
                    <Button onClick={() => onNavigate("admin-campaigns")} size="sm">
                      <Plus className="w-4 h-4 mr-2" /> Create New Campaign
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

       
        {/* Donation Distribution and Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Donation Distribution - Spans 2 columns */}
          <Card className="bg-white rounded-xl border border-gray-200 shadow-sm md:col-span-2">
            <CardHeader className="p-6 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mr-3">
                  <DollarSign className="w-4 h-4" />
                </div>
                Donation Distribution by Amount
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1 ml-11">
                Number of donations in different amount ranges
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[250px] sm:h-[300px] w-full" />
                </div>
              ) : stats.donationDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <LineChart data={stats.donationDistribution}>
                    <CartesianGrid 
                      vertical={false} 
                      strokeDasharray="3 3" 
                      stroke="#E5E7EB" 
                    />
                    <XAxis 
                      dataKey="range" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      label={{ 
                        value: 'Number of Donations', 
                        angle: -90, 
                        position: 'insideLeft', 
                        style: { fontSize: 12, fill: '#6B7280' } 
                      }}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px' }}
                      iconType="circle"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#4F46E5" 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 6, fill: '#4F46E5' }}
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

          {/* Recent Activity - Spans 2 columns */}
          <Card className="bg-white rounded-xl border border-gray-200 shadow-sm md:col-span-2">
            <CardHeader className="p-6 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center mr-3">
                  <ActivityIcon className="w-4 h-4" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1 ml-11">
                Latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="max-h-[320px] overflow-y-auto space-y-3 sm:space-y-4">
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

        {/* System Alerts and Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* System Alerts - Spans 2 columns */}
          <div className="md:col-span-2">
            <SystemAlertsWidget
              alerts={systemAlerts}
              loading={systemAlertsLoading}
              onNavigate={onNavigate}
            />
          </div>
          
          {/* Quick Actions - Spans 2 columns */}
          <Card className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm md:col-span-2">
            <CardHeader className="p-6 border-b border-gray-100 bg-white rounded-t-xl">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center mr-3 shadow-sm">
                  <Rocket className="w-5 h-5" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1 ml-12">
                Navigate to key management areas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hasPermission("view_campaigns") && (
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-4 text-left hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group border-gray-200 bg-white"
                    onClick={() => onNavigate("admin-campaigns")}
                  >
                    <div className="flex items-start w-full">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-gray-900 text-sm">Manage Campaigns</span>
                        <span className="text-xs text-gray-500 mt-0.5">Create and edit campaigns</span>
                      </div>
                    </div>
                  </Button>
                )}
                {hasPermission("view_kiosks") && (
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-4 text-left hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all duration-200 group border-gray-200 bg-white"
                    onClick={() => onNavigate("admin-kiosks")}
                  >
                    <div className="flex items-start w-full">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                        <Monitor className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-gray-900 text-sm">Configure Kiosks</span>
                        <span className="text-xs text-gray-500 mt-0.5">Manage kiosk settings</span>
                      </div>
                    </div>
                  </Button>
                )}
                {hasPermission("view_donations") && (
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-4 text-left hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-200 group border-gray-200 bg-white"
                    onClick={() => onNavigate("admin-donations")}
                  >
                    <div className="flex items-start w-full">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-gray-900 text-sm">View Donations</span>
                        <span className="text-xs text-gray-500 mt-0.5">Track donation history</span>
                      </div>
                    </div>
                  </Button>
                )}
                {hasPermission("view_users") && (
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-4 text-left hover:bg-orange-50 hover:border-orange-300 hover:shadow-md transition-all duration-200 group border-gray-200 bg-white"
                    onClick={() => onNavigate("admin-users")}
                  >
                    <div className="flex items-start w-full">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                        <UserCog className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-gray-900 text-sm">User Management</span>
                        <span className="text-xs text-gray-500 mt-0.5">Manage user accounts</span>
                      </div>
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
      </div>
    </AdminLayout>
  );
}
