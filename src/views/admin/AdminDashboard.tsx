import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
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
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Medal,
  X,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  useDashboardData,
  Activity,
  Alert,
} from "../../shared/lib/hooks/useDashboardData";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { useOrganization } from "../../shared/lib/hooks/useOrganization";
import { auth } from "../../shared/lib/firebase";

import { AdminLayout } from "./AdminLayout";
import { SystemAlertsWidget } from "./components/SystemAlertsWidget";
import { useSystemAlerts } from "../../shared/lib/hooks/useSystemAlerts";
import { useStripeOnboarding, StripeOnboardingDialog } from "../../features/stripe-onboarding";
import { useToast } from "../../shared/ui/ToastProvider";
import { CampaignCreationForm } from "../../components/campaign/CampaignCreationForm";
import { KioskForm, KioskFormData } from "./components/KioskForm";

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
            <span className="font-semibold text-gray-900">
              {typeof entry.value === 'number' ? `£${entry.value.toLocaleString('en-GB')}` : entry.value}
            </span>
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
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showKioskForm, setShowKioskForm] = useState(false);
  const [showLinkingForm, setShowLinkingForm] = useState(false);
  const [showKioskFormDialog, setShowKioskFormDialog] = useState(false);
  const [kioskFormData, setKioskFormData] = useState<KioskFormData>({
    name: '',
    location: '',
    accessCode: '',
    status: 'offline',
    assignedCampaigns: [],
    displayLayout: 'grid',
  });
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [assignedCampaignIds, setAssignedCampaignIds] = useState<string[]>([]);
  const [newKiosk, setNewKiosk] = useState({ name: '', location: '', accessCode: '' });
  const [allKiosks, setAllKiosks] = useState<any[]>([]);
  const [assignedKioskIds, setAssignedKioskIds] = useState<string[]>([]);
  const [isGlobalCampaign, setIsGlobalCampaign] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isCreatingKiosk, setIsCreatingKiosk] = useState(false);
  const [linkingCampaignId, setLinkingCampaignId] = useState<string | null>(null);
  const [createdCampaignId, setCreatedCampaignId] = useState<string>('');
  const [createdKioskId, setCreatedKioskId] = useState<string>('');
  const [campaignCountChecked, setCampaignCountChecked] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showStripeStep, setShowStripeStep] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [campaignFormKey, setCampaignFormKey] = useState(0); // Key to force form remount when needed
  const previousStepRef = useRef<string>(''); // Track previous step to avoid duplicate history entries
  const [newCampaign, setNewCampaign] = useState({ 
    title: '', 
    description: '', 
    goal: 0, 
    status: 'active',
    startDate: '',
    endDate: '',
    tags: [] as string[],
    coverImageUrl: '',
    category: '',
    isGlobal: false,
    donationTiers: ['', '', ''] as [string, string, string],
  });

  const { organization, loading: orgLoading, error: orgError } = useOrganization(
    userSession.user.organizationId ?? null
  );

  const { alerts: systemAlerts, loading: systemAlertsLoading } = useSystemAlerts({
    organization,
    organizationId: userSession.user.organizationId,
  });


  const { isStripeOnboarded, needsOnboarding } = useStripeOnboarding(organization);
  const { showToast } = useToast();
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [showSmallPopup, setShowSmallPopup] = useState(false);
  const [hasSavedTour, setHasSavedTour] = useState(false);

  // Cookie key for tour state
  const TOUR_STATE_COOKIE = 'swiftcause_tour_state';

  // Save tour state to cookies
  const saveTourState = () => {
    if (!showOnboarding) return;
    
    const tourState = {
      showCampaignForm,
      showKioskForm,
      showLinkingForm,
      showStripeStep,
      newCampaign,
      newKiosk,
      createdCampaignId,
      createdKioskId,
      assignedKioskIds,
      isGlobalCampaign,
      kioskFormData,
      timestamp: Date.now(),
    };
    
    console.log('=== SAVING TOUR STATE TO COOKIES ===');
    console.log('Tour state being saved:', tourState);
    console.log('Campaign data:', newCampaign);
    console.log('====================================');
    
    Cookies.set(TOUR_STATE_COOKIE, JSON.stringify(tourState), { expires: 7 }); // Expires in 7 days
  };

  // Load tour state from cookies
  const loadTourState = () => {
    const savedState = Cookies.get(TOUR_STATE_COOKIE);
    if (!savedState) return null;
    
    try {
      return JSON.parse(savedState);
    } catch (error) {
      console.error('Error parsing saved tour state:', error);
      Cookies.remove(TOUR_STATE_COOKIE);
      return null;
    }
  };

  // Clear tour state from cookies
  const clearTourState = () => {
    Cookies.remove(TOUR_STATE_COOKIE);
    setHasSavedTour(false);
  };

  // Check for saved tour state on mount
  useEffect(() => {
    const savedState = loadTourState();
    if (savedState) {
      setHasSavedTour(true);
      // Automatically show onboarding if there's saved state
      setShowOnboarding(true);
    }
  }, []);

  // Check for saved tour state when returning to welcome screen
  useEffect(() => {
    if (showOnboarding && !showCampaignForm && !showKioskForm && !showLinkingForm && !showStripeStep) {
      // We're on the welcome screen, check if there's saved data
      const savedState = loadTourState();
      if (savedState) {
        setHasSavedTour(true);
      } else {
        setHasSavedTour(false);
      }
    }
  }, [showOnboarding, showCampaignForm, showKioskForm, showLinkingForm, showStripeStep]);

  // Save tour state whenever relevant state changes (with debounce to prevent infinite loops)
  useEffect(() => {
    if (showOnboarding && (showCampaignForm || showKioskForm || showLinkingForm || showStripeStep)) {
      const timeoutId = setTimeout(() => {
        saveTourState();
      }, 300); // Debounce for 300ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [
    showOnboarding, 
    showCampaignForm, 
    showKioskForm, 
    showLinkingForm, 
    showStripeStep, 
    JSON.stringify(newCampaign), 
    JSON.stringify(newKiosk), 
    createdCampaignId, 
    createdKioskId, 
    JSON.stringify(assignedKioskIds), 
    isGlobalCampaign, 
    JSON.stringify(kioskFormData)
  ]);

  // Handle return from Stripe onboarding

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
      showToast("Stripe onboarding completed successfully!", "success", 3000);
      // Organization data will auto-refresh via Firestore listener
    } else if (stripeStatus === "refresh") {
      setStripeStatusMessage({
        type: "warning",
        message: "Stripe onboarding session expired or was cancelled. Please try again.",
      });
      showToast("Stripe onboarding was cancelled. Please try again.", "warning", 3000);
    }

    if (stripeStatus) {
      const newHash = hash.split("?")[0];
      window.history.replaceState(null, '', newHash);
    }
  }, [showToast]);

  // Auto-open Stripe onboarding popup on mount if not onboarded
  useEffect(() => {
    if (!orgLoading && organization && needsOnboarding) {
      // Show small popup after a short delay for better UX
      const timer = setTimeout(() => {
        setShowSmallPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [orgLoading, organization, needsOnboarding]);

  // Handle browser back button during tour
  useEffect(() => {
    if (!showOnboarding) return;

    const handlePopState = (event: PopStateEvent) => {
      // Check if this is a tour navigation
      if (event.state?.tourStep) {
        console.log('Back button pressed. Current states:', {
          showStripeStep,
          showLinkingForm,
          showKioskForm,
          showCampaignForm,
        });
        
        // Navigate within the tour based on current step
        if (showStripeStep) {
          console.log('Going back from Stripe to Linking');
          setShowStripeStep(false);
          setShowLinkingForm(true);
          previousStepRef.current = 'linking';
        } else if (showLinkingForm) {
          console.log('Going back from Linking to Kiosk');
          setShowLinkingForm(false);
          setShowKioskForm(true);
          previousStepRef.current = 'kiosk';
        } else if (showKioskForm) {
          console.log('Going back from Kiosk to Campaign');
          setShowKioskForm(false);
          setShowCampaignForm(true);
          previousStepRef.current = 'campaign';
        } else if (showCampaignForm) {
          console.log('Going back from Campaign to Welcome');
          setShowCampaignForm(false);
          previousStepRef.current = 'welcome';
          // Back to welcome screen
        } else {
          console.log('Exiting tour from Welcome');
          // On welcome screen, exit tour
          setShowOnboarding(false);
          previousStepRef.current = '';
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showOnboarding, showCampaignForm, showKioskForm, showLinkingForm, showStripeStep]);

  // Push history state when moving forward in the tour
  useEffect(() => {
    if (!showOnboarding) return;
    
    // Determine current step
    const currentStep = showStripeStep ? 'stripe' : showLinkingForm ? 'linking' : showKioskForm ? 'kiosk' : showCampaignForm ? 'campaign' : 'welcome';
    
    // Only push state if we've moved to a different step
    if (currentStep !== previousStepRef.current && currentStep !== 'welcome') {
      window.history.pushState({ tourStep: true, step: currentStep }, '');
      previousStepRef.current = currentStep;
    }
  }, [showOnboarding, showCampaignForm, showKioskForm, showLinkingForm, showStripeStep]);


  const gettingStartedSteps = [
    {
      step: 1,
      title: "Create Your First Campaign",
      description:
        "Set up a donation campaign with custom goals, pricing, and branding",
      action: "Create Campaign",
      actionFunction: () => {
        onNavigate("admin-campaigns");
      },
      icon: <Target className="w-5 h-5" />,
      estimated: "5 minutes",
      canAccess: hasPermission("create_campaign"),
      requiresStripe: false,
    },
    {
      step: 2,
      title: "Configure Donation Kiosks",
      description:
        "Set up kiosks in your locations with QR codes and access controls",
      action: "Setup Kiosks",
      actionFunction: () => {
        onNavigate("admin-kiosks");
      },
      icon: <Monitor className="w-5 h-5" />,
      estimated: "10 minutes",
      canAccess: hasPermission("create_kiosk"),
      requiresStripe: false,
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
      requiresStripe: false,
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
      requiresStripe: false,
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
        
        // Check if there are no campaigns and show onboarding (but not if tour is already active or has saved state)
        if (allCampaigns.length === 0 && !showOnboarding && !isTourActive && !hasSavedTour) {
          setShowOnboarding(true);
        }
        setCampaignCountChecked(true);
        
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
  }, [userSession.user.organizationId, showOnboarding]);

  const handleRefresh = () => {
    refreshDashboard();
  };

  const handleCreateCampaign = async (campaignFormData: any) => {
    // Validate all required fields
    if (!campaignFormData.title || !campaignFormData.briefOverview || !campaignFormData.fundraisingTarget || !campaignFormData.startDate || !campaignFormData.endDate || !userSession) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Validate goal is a positive number
    if (!campaignFormData.fundraisingTarget || campaignFormData.fundraisingTarget <= 0) {
      alert("Fundraising goal must be greater than 0");
      return;
    }
    
    // Validate dates
    const startDate = new Date(campaignFormData.startDate);
    const endDate = new Date(campaignFormData.endDate);
    
    if (endDate <= startDate) {
      alert("End date must be after start date");
      return;
    }
    
    setIsCreatingCampaign(true);
    try {
      // Save the campaign to database
      const campaignData = {
        title: campaignFormData.title,
        description: campaignFormData.briefOverview,
        detailedStory: campaignFormData.detailedStory,
        goal: Number(campaignFormData.fundraisingTarget),
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        organizationId: userSession.user.organizationId,
        raised: 0,
        donationCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isGlobal: false,
        tags: [],
        coverImageUrl: campaignFormData.coverImageUrl || '',
        category: 'General',
        youtubePresentation: campaignFormData.youtubePresentation || '',
        donationTiers: campaignFormData.donationTiers || ['', '', ''],
      };
      const docRef = await addDoc(collection(db, 'campaigns'), campaignData);
      
      // Save the created campaign ID
      setCreatedCampaignId(docRef.id);
      
      console.log("Campaign created successfully with ID:", docRef.id);
      
      // Move to kiosk form
      setShowCampaignForm(false);
      setShowKioskForm(true);
    } catch (error) {
      console.error("Error creating campaign: ", error);
      alert("Failed to create campaign. Please try again.");
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const handleCreateKiosk = async () => {
    if (!newKiosk.name || !newKiosk.location || !userSession) return;
    
    // Validate access code
    if (!newKiosk.accessCode || newKiosk.accessCode.length < 4) {
      alert("Access code must be at least 4 characters");
      return;
    }
    
    setIsCreatingKiosk(true);
    try {
      // Create the kiosk (campaign was already created in previous step)
      const newKioskData = {
        name: newKiosk.name,
        location: newKiosk.location,
        accessCode: newKiosk.accessCode,
        status: 'offline',
        lastActive: new Date().toISOString(),
        totalDonations: 0,
        totalRaised: 0,
        assignedCampaigns: [],
        defaultCampaign: '',
        deviceInfo: {},
        operatingHours: {},
        settings: { displayMode: 'grid', showAllCampaigns: true, maxCampaignsDisplay: 6, autoRotateCampaigns: false },
        organizationId: userSession.user.organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const docRef = await addDoc(collection(db, 'kiosks'), newKioskData);
      
      // Save the created kiosk ID
      setCreatedKioskId(docRef.id);
      
      // Show success message
      console.log("Kiosk created successfully with ID:", docRef.id);
      
      // Move to linking form
      setShowLinkingForm(true);
    } catch (error) {
      console.error("Error adding kiosk: ", error);
      alert("Failed to create kiosk. Please try again.");
    } finally {
      setIsCreatingKiosk(false);
    }
  };

  // Handler for KioskForm dialog submission
  const handleKioskFormSubmit = async () => {
    if (!kioskFormData.name || !kioskFormData.location || !userSession) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (!kioskFormData.accessCode || kioskFormData.accessCode.length < 4) {
      alert("Access code must be at least 4 characters");
      return;
    }
    
    setIsCreatingKiosk(true);
    try {
      const newKioskData = {
        name: kioskFormData.name,
        location: kioskFormData.location,
        accessCode: kioskFormData.accessCode,
        status: kioskFormData.status,
        lastActive: new Date().toISOString(),
        totalDonations: 0,
        totalRaised: 0,
        assignedCampaigns: kioskFormData.assignedCampaigns,
        defaultCampaign: kioskFormData.assignedCampaigns[0] || '',
        deviceInfo: {},
        operatingHours: {},
        settings: { 
          displayMode: kioskFormData.displayLayout, 
          showAllCampaigns: true, 
          maxCampaignsDisplay: 6, 
          autoRotateCampaigns: false 
        },
        organizationId: userSession.user.organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const docRef = await addDoc(collection(db, 'kiosks'), newKioskData);
      
      // Add the new kiosk to the local state
      setAllKiosks(prev => [...prev, { id: docRef.id, ...newKioskData }]);
      
      // Reset form and close dialog
      setKioskFormData({
        name: '',
        location: '',
        accessCode: '',
        status: 'offline',
        assignedCampaigns: [],
        displayLayout: 'grid',
      });
      setShowKioskFormDialog(false);
      
      showToast("Kiosk created successfully!", "success", 3000);
    } catch (error) {
      console.error("Error creating kiosk: ", error);
      alert("Failed to create kiosk. Please try again.");
    } finally {
      setIsCreatingKiosk(false);
    }
  };

  const handleKioskFormAssignCampaign = (campaignId: string) => {
    setKioskFormData(prev => ({
      ...prev,
      assignedCampaigns: [...prev.assignedCampaigns, campaignId],
    }));
  };

  const handleKioskFormUnassignCampaign = (campaignId: string) => {
    setKioskFormData(prev => ({
      ...prev,
      assignedCampaigns: prev.assignedCampaigns.filter(id => id !== campaignId),
    }));
  };

  const handleLinkCampaignToKiosk = async (campaignId: string) => {
    if (!campaignId || !createdKioskId) {
      alert("Campaign or Kiosk ID is missing");
      return;
    }
    
    setLinkingCampaignId(campaignId);
    try {
      // Update kiosk with the campaign assignment
      const kioskRef = doc(db, 'kiosks', createdKioskId);
      
      // Add campaign to assigned campaigns if not already assigned
      const updatedAssignedCampaigns = assignedCampaignIds.includes(campaignId)
        ? assignedCampaignIds
        : [...assignedCampaignIds, campaignId];
      
      await updateDoc(kioskRef, {
        assignedCampaigns: updatedAssignedCampaigns,
        defaultCampaign: updatedAssignedCampaigns[0], // Set first campaign as default
        updatedAt: new Date(),
      });
      
      // Update local state
      setAssignedCampaignIds(updatedAssignedCampaigns);
      
      console.log("Campaign linked to kiosk successfully!");
    } catch (error) {
      console.error("Error linking campaign to kiosk: ", error);
      alert("Failed to link campaign. Please try again.");
    } finally {
      setLinkingCampaignId(null);
    }
  };

  // Fetch all campaigns when linking form is shown
  useEffect(() => {
    const fetchAllCampaigns = async () => {
      if (!showLinkingForm || !userSession.user.organizationId) return;
      
      try {
        const campaignsRef = collection(db, "campaigns");
        const q = query(
          campaignsRef,
          where("organizationId", "==", userSession.user.organizationId)
        );
        const snapshot = await getDocs(q);
        const campaigns = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Campaign)
        );
        setAllCampaigns(campaigns);
      } catch (error) {
        console.error("Error fetching campaigns: ", error);
      }
    };

    fetchAllCampaigns();
  }, [showLinkingForm, userSession.user.organizationId]);

  // Fetch all kiosks when kiosk form is shown
  useEffect(() => {
    const fetchAllKiosks = async () => {
      if (!showKioskForm || !userSession.user.organizationId) return;
      
      try {
        const kiosksRef = collection(db, "kiosks");
        const q = query(
          kiosksRef,
          where("organizationId", "==", userSession.user.organizationId)
        );
        const snapshot = await getDocs(q);
        const kiosks = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() })
        );
        setAllKiosks(kiosks);
      } catch (error) {
        console.error("Error fetching kiosks: ", error);
      }
    };

    fetchAllKiosks();
  }, [showKioskForm, userSession.user.organizationId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
    }).format(amount);
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-GB").format(num);

  const formatLargeCurrency = (amount: number) => {
    if (amount === 0) return "£0";
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
      return `£${value}${tier.name}`;
    }

    return formatCurrency(amount);
  };
  const formatShortCurrency = (amount: number) => {
    if (amount === 0) return "£0";
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
      return `£${value}${tier.name}`;
    }
    return `£${amount}`;
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

  const handleStartTour = () => {
    // Clear any saved tour state - this will set hasSavedTour to false
    clearTourState();
    
    // Reset all form states first
    setShowCampaignForm(false);
    setShowKioskForm(false);
    setShowLinkingForm(false);
    setShowStripeStep(false);
    setIsTourActive(false);
    
    // Reset form key to force fresh mount
    setCampaignFormKey(prev => prev + 1);
    
    // Reset form data
    setNewCampaign({ 
      title: '', 
      description: '', 
      goal: 0, 
      status: 'active',
      startDate: '',
      endDate: '',
      tags: [],
      coverImageUrl: '',
      category: '',
      isGlobal: false,
      donationTiers: ['', '', ''],
    });
    setNewKiosk({ name: '', location: '', accessCode: '' });
    setCreatedCampaignId('');
    setCreatedKioskId('');
    setAssignedKioskIds([]);
    setIsGlobalCampaign(false);
    setKioskFormData({
      name: '',
      location: '',
      accessCode: '',
      status: 'offline',
      assignedCampaigns: [],
      displayLayout: 'grid',
    });
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      setIsTourActive(true);
      setShowOnboarding(true);
      // Don't set showCampaignForm - stay on welcome screen
    }, 0);
  };

  const handleResumeTour = () => {
    const savedState = loadTourState();
    
    // Log the fetched data from cookies
    console.log('=== RESUME TOUR - Data from Cookies ===');
    console.log('Full saved state:', savedState);
    
    if (!savedState) {
      console.log('No saved state found in cookies');
      showToast("No saved tour found. Starting fresh.", "info", 3000);
      handleStartTour();
      return;
    }
    
    console.log('Campaign Form State:', savedState.showCampaignForm);
    console.log('Kiosk Form State:', savedState.showKioskForm);
    console.log('Linking Form State:', savedState.showLinkingForm);
    console.log('Stripe Step State:', savedState.showStripeStep);
    console.log('New Campaign Data:', savedState.newCampaign);
    console.log('New Kiosk Data:', savedState.newKiosk);
    console.log('Created Campaign ID:', savedState.createdCampaignId);
    console.log('Created Kiosk ID:', savedState.createdKioskId);
    console.log('Assigned Kiosk IDs:', savedState.assignedKioskIds);
    console.log('Is Global Campaign:', savedState.isGlobalCampaign);
    console.log('Kiosk Form Data:', savedState.kioskFormData);
    console.log('Timestamp:', savedState.timestamp);
    console.log('========================================');
    
    // First, restore all saved state without showing forms
    setShowCampaignForm(false);
    setShowKioskForm(false);
    setShowLinkingForm(false);
    setShowStripeStep(false);
    
    setNewCampaign(savedState.newCampaign || { 
      title: '', 
      description: '', 
      goal: 0, 
      status: 'active',
      startDate: '',
      endDate: '',
      tags: [],
      coverImageUrl: '',
      category: '',
      isGlobal: false,
      donationTiers: ['', '', ''],
    });
    setNewKiosk(savedState.newKiosk || { name: '', location: '', accessCode: '' });
    setCreatedCampaignId(savedState.createdCampaignId || '');
    setCreatedKioskId(savedState.createdKioskId || '');
    setAssignedKioskIds(savedState.assignedKioskIds || []);
    setIsGlobalCampaign(savedState.isGlobalCampaign || false);
    setKioskFormData(savedState.kioskFormData || {
      name: '',
      location: '',
      accessCode: '',
      status: 'offline',
      assignedCampaigns: [],
      displayLayout: 'grid',
    });
    
    setIsTourActive(true);
    setShowOnboarding(true);
    
    // Increment form key to force remount with restored data
    setCampaignFormKey(prev => prev + 1);
    
    // Use setTimeout to ensure state is updated before showing the forms
    setTimeout(() => {
      setShowCampaignForm(savedState.showCampaignForm || false);
      setShowKioskForm(savedState.showKioskForm || false);
      setShowLinkingForm(savedState.showLinkingForm || false);
      setShowStripeStep(savedState.showStripeStep || false);
      showToast("Tour resumed from where you left off!", "success", 3000);
    }, 100);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 text-red-700">
        <AlertCircle className="w-6 h-6 mr-2" />
        <p>Error loading dashboard data: {error}</p>
      </div>
    );
  }

  return (
    <AdminLayout 
      onNavigate={onNavigate} 
      onLogout={onLogout} 
      userSession={userSession} 
      hasPermission={hasPermission}
      onStartTour={handleStartTour}
    >
      {/* Onboarding Flow with Sliding Animation */}
      {showOnboarding && !loading && campaignCountChecked ? (
        <div className="absolute inset-0 bg-white overflow-hidden z-10">
          <div className="flex h-full transition-transform duration-700 ease-in-out" style={{
            transform: showStripeStep ? 'translateX(-400%)' : showLinkingForm ? 'translateX(-300%)' : showKioskForm ? 'translateX(-200%)' : showCampaignForm ? 'translateX(-100%)' : 'translateX(0)'
          }}>
            {/* Step 1: Welcome Screen */}
            <div className="min-w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
              <div className="w-full max-w-5xl">
                <div className="p-8 sm:p-12">
                  <div className="max-w-4xl mx-auto">
                    {/* Header Badge */}
                    <div className="flex justify-center mb-6">
                      <Badge className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white">
                        ACTION REQUIRED
                      </Badge>
                    </div>

                    {/* Main Title */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
                      Ready to start <span className="text-indigo-600">raising funds</span>?
                    </h2>

                    {/* Description */}
                    <p className="text-center text-gray-600 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
                      Welcome to SwiftCause. Your organization's dashboard is almost ready.
                      Let's walk through setting up your first donation kiosk and campaign in
                      just 2 minutes.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                      {hasSavedTour ? (
                        <Button
                          onClick={handleResumeTour}
                          size="lg"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Resume Tour
                        </Button>
                      ) : null}
                      <Button
                        onClick={() => {
                          // Clear saved tour state when starting fresh
                          clearTourState();
                          setShowCampaignForm(true);
                        }}
                        size="lg"
                        className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                      >
                        Start Hands-on Guide
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                      <Button
                        onClick={() => {
                          clearTourState();
                          setShowOnboarding(false);
                        }}
                        variant="ghost"
                        size="lg"
                        className="text-gray-600 hover:text-gray-900 px-8 py-6 text-base font-medium w-full sm:w-auto"
                      >
                        SKIP AND EXPLORE
                      </Button>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {/* Deploy Kiosks */}
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                          <Monitor className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Deploy Kiosks</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Register physical donation points for contactless giving.
                        </p>
                        <ul className="space-y-1 text-xs text-gray-500">
                          <li>• Mobile-first design</li>
                          <li>• QR code access</li>
                          <li>• Real-time tracking</li>
                        </ul>
                      </div>

                      {/* Track Campaigns */}
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                          <Target className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Track Campaigns</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Link kiosks to specific goals and monitor real-time progress.
                        </p>
                        <ul className="space-y-1 text-xs text-gray-500">
                          <li>• Custom goals</li>
                          <li>• Progress tracking</li>
                          <li>• Performance metrics</li>
                        </ul>
                      </div>

                      {/* Automated Payouts */}
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                          <CreditCard className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Automated Payouts</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Receive funds directly to your organization's bank account.
                        </p>
                        <ul className="space-y-1 text-xs text-gray-500">
                          <li>• Secure processing</li>
                          <li>• Direct deposits</li>
                          <li>• Transparent fees</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Campaign Form */}
            <div className="min-w-full h-full flex flex-col bg-white">
              {/* Progress Stepper - Outside form, at top */}
              <div className="w-full bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 pt-20 mb-8">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between">
                    {/* Step 1: Campaign */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-green-600">Create Campaign</span>
                    </div>
                    
                    {/* Connector Line */}
                    <div className="flex-1 h-0.5 bg-gray-300 mx-2 -mt-6"></div>
                    
                    {/* Step 2: Kiosk */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                        <Monitor className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-400">Add Kiosk</span>
                    </div>
                    
                    {/* Connector Line */}
                    <div className="flex-1 h-0.5 bg-gray-300 mx-2 -mt-6"></div>
                    
                    {/* Step 3: Stripe */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                        <CreditCard className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-400">Setup Payments</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="w-full">
                  <div className="bg-white">
                    <div className="px-4 sm:px-6 lg:px-8 py-8">
                      {/* Header with Title and Skip Button */}
                      <div className="max-w-5xl mx-auto flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h2>
                          <p className="text-base text-gray-500">Configure a new fundraising campaign for your organization.</p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowCampaignForm(false);
                            setShowKioskForm(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium ml-4"
                        >
                          Skip
                        </Button>
                      </div>

                    {/* What is a Campaign Info */}
                    <div className="max-w-5xl mx-auto mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Target className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-blue-900 mb-1">What is a Campaign?</h4>
                            <p className="text-xs text-blue-700 leading-relaxed">
                              A campaign is a fundraising initiative with a specific goal. Donors can contribute to campaigns through your kiosks.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Campaign Creation Form */}
                    <CampaignCreationForm
                      key={`campaign-form-${campaignFormKey}`}
                      onSubmit={handleCreateCampaign}
                      onCancel={() => {
                        // Go back to welcome screen
                        setShowCampaignForm(false);
                      }}
                      onChange={(formData) => {
                        // Update newCampaign state whenever form data changes
                        setNewCampaign({
                          title: formData.title,
                          description: formData.briefOverview,
                          goal: formData.fundraisingTarget,
                          status: 'active',
                          startDate: formData.startDate,
                          endDate: formData.endDate,
                          tags: [],
                          coverImageUrl: formData.coverImageUrl || '',
                          category: 'General',
                          isGlobal: false,
                          donationTiers: formData.donationTiers,
                        });
                      }}
                      initialData={{
                        title: newCampaign.title,
                        briefOverview: newCampaign.description,
                        detailedStory: newCampaign.description,
                        coverImageUrl: newCampaign.coverImageUrl,
                        youtubePresentation: '',
                        fundraisingTarget: newCampaign.goal,
                        donationTiers: newCampaign.donationTiers,
                        startDate: newCampaign.startDate,
                        endDate: newCampaign.endDate,
                        kioskDistribution: []
                      }}
                      isLoading={isCreatingCampaign}
                    />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Kiosk Assignment Form */}
            <div className="min-w-full h-full flex flex-col bg-gradient-to-b from-emerald-50/50 to-white">
              {/* Form Content - Centered vertically and horizontally */}
              <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
                <div className="w-full max-w-xl">
                  {/* Header with Title and Skip Button */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">Assign Campaign to Kiosks</h1>
                      <p className="text-base text-gray-500">Choose which kiosks will display your campaign content.</p>
                    </div>
                    <Button
                      onClick={() => {
                        setShowKioskForm(false);
                        setShowLinkingForm(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Skip
                    </Button>
                  </div>

                  {/* Make Campaign Global Button */}
                  <div className="mb-6">
                    <Button
                      onClick={() => setIsGlobalCampaign(!isGlobalCampaign)}
                      className={`w-full h-14 text-base font-semibold rounded-xl transition-all duration-200 shadow-sm ${
                        isGlobalCampaign
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      {isGlobalCampaign ? 'Your Campaign is Now Global' : 'Make Your Campaign Global'}
                    </Button>
                    <p className="text-sm text-gray-400 mt-3 text-center">
                      This will automatically assign your campaign to all {allKiosks.length} active kiosks in your organization.
                    </p>
                  </div>

                  {/* Kiosks List */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Available Kiosks</h3>
                      <span className="text-sm font-medium text-emerald-600">
                        {assignedKioskIds.length} Selected
                      </span>
                    </div>
                    {allKiosks.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                        <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No kiosks found in your organization</p>
                        <p className="text-sm text-gray-400 mt-1">Create kiosks first to assign campaigns</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[280px] overflow-y-auto">
                        {allKiosks.map((kiosk) => (
                          <div 
                            key={kiosk.id} 
                            className={`flex items-center justify-between p-4 bg-white border rounded-xl transition-all duration-200 ${
                              assignedKioskIds.includes(kiosk.id)
                                ? 'border-emerald-200 bg-emerald-50/30'
                                : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Monitor className="w-5 h-5 text-blue-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">{kiosk.name}</h4>
                                  <span className={`w-2 h-2 rounded-full ${
                                    kiosk.status === 'online' 
                                      ? 'bg-emerald-500' 
                                      : 'bg-gray-300'
                                  }`}></span>
                                </div>
                                <p className="text-sm text-gray-400">{kiosk.location}</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                if (assignedKioskIds.includes(kiosk.id)) {
                                  setAssignedKioskIds(prev => prev.filter(id => id !== kiosk.id));
                                } else {
                                  setAssignedKioskIds(prev => [...prev, kiosk.id]);
                                }
                              }}
                              variant={assignedKioskIds.includes(kiosk.id) ? "outline" : "default"}
                              className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                                assignedKioskIds.includes(kiosk.id)
                                  ? 'border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50'
                                  : 'bg-gray-900 hover:bg-gray-800 text-white'
                              }`}
                            >
                              {assignedKioskIds.includes(kiosk.id) ? 'Assigned' : 'Assign'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Create New Kiosk Button */}
                  <div className="mb-8">
                    <button
                      onClick={() => {
                        setShowKioskFormDialog(true);
                      }}
                      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-gray-300 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Create New Kiosk
                    </button>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowKioskForm(false);
                        setShowCampaignForm(true);
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Back
                    </button>
                    <Button
                      onClick={() => {
                        setShowKioskForm(false);
                        setShowLinkingForm(true);
                      }}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Step 4: Link Campaign to Kiosk */}
            <div className="min-w-full h-full flex flex-col bg-white">
              {/* Progress Stepper - Outside form, at top */}
              <div className="w-full bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 pt-20 mb-8">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between">
                    {/* Step 1: Campaign - Completed */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-green-600">Create Campaign</span>
                    </div>
                    
                    {/* Connector Line - Completed */}
                    <div className="flex-1 h-0.5 bg-green-500 mx-2 -mt-6"></div>
                    
                    {/* Step 2: Kiosk - Completed */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-green-600">Add Kiosk</span>
                    </div>
                    
                    {/* Connector Line - Completed */}
                    <div className="flex-1 h-0.5 bg-green-500 mx-2 -mt-6"></div>
                    
                    {/* Step 3: Link - Active */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                        <Workflow className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-green-600">Link Campaign</span>
                    </div>
                    
                    {/* Connector Line - Inactive */}
                    <div className="flex-1 h-0.5 bg-gray-300 mx-2 -mt-6"></div>
                    
                    {/* Step 4: Stripe - Inactive */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                        <CreditCard className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="text-xs font-medium text-gray-400">Setup Payments</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl mx-auto">
                  <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <CardContent className="p-8">
                      {/* Header with Title and Skip Button */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-gray-900 mb-2">Link Campaign to Kiosk</h2>
                          <p className="text-base text-gray-500">Assign your campaign to the kiosk you just created.</p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowLinkingForm(false);
                            setShowStripeStep(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium ml-4"
                        >
                          Skip
                        </Button>
                      </div>

                      {/* No Campaigns Assigned Message */}
                      {assignedCampaignIds.length === 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-6 text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns assigned</h3>
                          <p className="text-sm text-gray-500">Select campaigns from the available list below to get started</p>
                        </div>
                      )}

                      {/* Assigned Campaigns Section */}
                      {assignedCampaignIds.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Assigned Campaigns</h3>
                            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">{assignedCampaignIds.length} assigned</Badge>
                          </div>

                          <div className="space-y-3">
                            {allCampaigns
                              .filter(campaign => assignedCampaignIds.includes(campaign.id))
                              .map((campaign) => (
                                <div key={campaign.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                        <Target className="w-6 h-6 text-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 mb-1">{campaign.title}</h4>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                          <span>${campaign.raised || 0} raised</span>
                                          <span>•</span>
                                          <span>{campaign.goal ? Math.round(((campaign.raised || 0) / campaign.goal) * 100) : 0}% funded</span>
                                        </div>
                                      </div>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-green-600 ml-4" />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Available Campaigns Section */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Plus className="w-5 h-5 text-gray-700" />
                          <h3 className="text-lg font-semibold text-gray-900">Available Campaigns</h3>
                          <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-600">
                            {allCampaigns.filter(c => !assignedCampaignIds.includes(c.id)).length} available
                          </Badge>
                        </div>

                        {/* Campaign Cards */}
                        <div className="space-y-3">
                          {allCampaigns.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <p>Loading campaigns...</p>
                            </div>
                          ) : allCampaigns.filter(c => !assignedCampaignIds.includes(c.id)).length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <p>All campaigns have been assigned</p>
                            </div>
                          ) : (
                            allCampaigns
                              .filter(campaign => !assignedCampaignIds.includes(campaign.id))
                              .map((campaign) => (
                                <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <Target className="w-6 h-6 text-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 mb-1">{campaign.title}</h4>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                          <span>${campaign.raised || 0} raised</span>
                                          <span>•</span>
                                          <span>{campaign.goal ? Math.round(((campaign.raised || 0) / campaign.goal) * 100) : 0}% funded</span>
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      onClick={() => handleLinkCampaignToKiosk(campaign.id)}
                                      disabled={linkingCampaignId !== null}
                                      variant="outline"
                                      className="ml-4 border-gray-300 hover:bg-gray-50"
                                    >
                                      {linkingCampaignId === campaign.id ? (
                                        <>
                                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                          Assigning...
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-4 h-4 mr-2" />
                                          Assign
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowLinkingForm(false);
                            setShowStripeStep(true);
                          }}
                          className="px-6"
                          disabled={linkingCampaignId !== null}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            // If campaign is already linked, just move to next step
                            setShowStripeStep(true);
                          }}
                          disabled={linkingCampaignId !== null}
                          className="bg-indigo-600 hover:bg-indigo-700 px-6"
                        >
                          Save Configuration
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Step 5: Stripe Account Status */}
            <div className="min-w-full h-full flex flex-col bg-white">
              {/* Progress Stepper - Outside form, at top */}
              <div className="w-full bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 pt-20 mb-8">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between">
                    {/* Step 1: Campaign - Completed */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-green-600">Create Campaign</span>
                    </div>
                    
                    {/* Connector Line - Completed */}
                    <div className="flex-1 h-0.5 bg-green-500 mx-2 -mt-6"></div>
                    
                    {/* Step 2: Kiosk - Completed */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-green-600">Add Kiosk</span>
                    </div>
                    
                    {/* Connector Line - Completed */}
                    <div className="flex-1 h-0.5 bg-green-500 mx-2 -mt-6"></div>
                    
                    {/* Step 3: Link - Completed */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-green-600">Link Campaign</span>
                    </div>
                    
                    {/* Connector Line - Completed */}
                    <div className="flex-1 h-0.5 bg-green-500 mx-2 -mt-6"></div>
                    
                    {/* Step 4: Stripe - Active */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-green-600">Setup Payments</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl mx-auto">
                  <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <CardContent className="p-8">
                      {/* Header with Title and Skip Button */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-gray-900 mb-2">Setup Payments</h2>
                          <p className="text-base text-gray-500">Connect your Stripe account to accept donations.</p>
                        </div>
                        <Button
                          onClick={() => {
                          setNewKiosk({ name: '', location: '', accessCode: '' });
                          setNewCampaign({ title: '', description: '', goal: 0, status: 'active', startDate: '', endDate: '', tags: [], coverImageUrl: '', category: '', isGlobal: false, donationTiers: ['', '', ''] });
                          setShowStripeStep(false);
                          setShowCampaignForm(false);
                          setShowKioskForm(false);
                          setShowLinkingForm(false);
                          setShowOnboarding(false);
                          // Clear saved tour state
                          clearTourState();
                          // Refresh dashboard data
                          refreshDashboard();
                          // Navigate to dashboard to see the new data
                          onNavigate('admin-dashboard');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium ml-4"
                      >
                        Skip
                      </Button>
                    </div>

                    {/* Stripe Status Content */}
                    <div className="space-y-6">
                      {orgLoading ? (
                        <div className="text-center py-8">
                          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400 mb-3" />
                          <p className="text-sm text-gray-600">Loading organization data...</p>
                        </div>
                      ) : orgError ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-700">Error: {orgError}</p>
                        </div>
                      ) : organization && organization.stripe && !organization.stripe.chargesEnabled ? (
                        <>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <div className="flex items-start gap-3">
                              <TriangleAlert className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h3 className="font-semibold text-yellow-900 mb-2">Action Required</h3>
                                <p className="text-sm text-yellow-800 leading-relaxed">
                                  Your organization needs to complete Stripe onboarding to accept donations and receive payouts.
                                </p>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => setShowStripeStatusDialog(true)}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 h-12 text-base font-semibold"
                          >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Complete Stripe Onboarding
                          </Button>
                        </>
                      ) : organization && organization.stripe && organization.stripe.chargesEnabled && !organization.stripe.payoutsEnabled ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <div className="flex items-start gap-3">
                            <RefreshCw className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h3 className="font-semibold text-blue-900 mb-2">Under Review</h3>
                              <p className="text-sm text-blue-800 leading-relaxed">
                                Your Stripe account is being reviewed. Payouts will be enabled shortly.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h3 className="font-semibold text-green-900 mb-2">All Set!</h3>
                              <p className="text-sm text-green-800 leading-relaxed">
                                Your Stripe account is fully configured and ready to accept donations and process payouts.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 mt-8">
                      <Button
                        onClick={() => {
                          setNewKiosk({ name: '', location: '', accessCode: '' });
                          setNewCampaign({ title: '', description: '', goal: 0, status: 'active', startDate: '', endDate: '', tags: [], coverImageUrl: '', category: '', isGlobal: false, donationTiers: ['', '', ''] });
                          setShowStripeStep(false);
                          setShowCampaignForm(false);
                          setShowKioskForm(false);
                          setShowOnboarding(false);
                          // Clear saved tour state
                          clearTourState();
                          // Refresh dashboard data
                          refreshDashboard();
                          // Navigate to dashboard to see the new data
                          onNavigate('admin-dashboard');
                        }}
                        className="bg-gray-900 hover:bg-gray-800 px-8"
                      >
                        Close & View Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      ) : campaignCountChecked && !showOnboarding ? (
        <>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Dashboard
                </h1>
                <Badge className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {userSession.user.role.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-nowrap ml-auto">
            {userSession.user.role === 'super_admin' && hasPermission('system_admin') && (
              <div className="w-auto">
                <OrganizationSwitcher userSession={userSession} onOrganizationChange={onOrganizationSwitch} />
              </div>
            )}
            {organization && organization.stripe && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStripeStatusDialog(true)}
                  className={`relative rounded-lg
                    ${!organization.stripe.chargesEnabled || !organization.stripe.payoutsEnabled
                      ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 animate-pulse'
                      : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  aria-label="Stripe Status"
                >
                  <CreditCard className="h-4 w-4" />
                </Button>
                {needsOnboarding && (
                  <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}

                {/* Small popup notification */}
                {showSmallPopup && needsOnboarding && (
                  <div className="fixed sm:absolute top-16 sm:top-full right-2 sm:right-0 mt-2 w-[calc(100vw-1rem)] sm:w-80 max-w-sm bg-white rounded-lg shadow-xl border-2 border-yellow-400 p-3 sm:p-4 z-50 animate-in slide-in-from-top-2">
                    <button
                      onClick={() => setShowSmallPopup(false)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10"
                      aria-label="Close notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0">
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                          Complete Stripe Onboarding
                        </h4>
                        <p className="text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3">
                          You need to onboard with Stripe to accept donations and create campaigns.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setShowSmallPopup(false);
                            setShowStripeStatusDialog(true);
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 text-xs h-7 sm:h-8 w-full sm:w-auto"
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Onboard Now
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Stripe Onboarding Alert Card */}
        {needsOnboarding && organization && (
          <Card className="mb-8 border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-100 flex items-center justify-center animate-pulse">
                      <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      Complete Stripe Onboarding
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 mb-3">
                      Your organization needs to connect with Stripe to accept donations and process payments. 
                      <span className="hidden sm:inline"> This quick setup takes only 5-10 minutes.</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-purple-600" />
                        <span>Fast Setup</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span>Accept Donations</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex-shrink-0">
                  <Button
                    onClick={() => setShowStripeStatusDialog(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all h-11 sm:h-12 px-6"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Start Onboarding
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Campaign Goal Comparison - Spans 2 columns */}
          <Card className="bg-white rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
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
          <Card className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        onClick={() => onNavigate("admin-campaigns")}
                      >
                        {/* Campaign Image */}
                        <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
                          <ImageWithFallback
                            src={campaign.coverImageUrl}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
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
              ) : stats.donationDistributionError ? (
                <div className="text-center py-6 sm:py-8 text-red-500">
                  <AlertCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-400 mb-3" />
                  <p className="text-base sm:text-lg font-medium mb-2">Error in fetching donation data</p>
                  <p className="text-xs sm:text-sm mb-4 px-4">
                    Unable to load donation distribution. Please try refreshing the page.
                  </p>
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
                        offset: 10,
                        style: { 
                          fontSize: 12, 
                          fill: '#6B7280',
                          textAnchor: 'middle'
                        } 
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
                    onClick={() => {
                      onNavigate("admin-campaigns");
                    }}
                  >
                    <div className="flex items-start w-full">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-gray-900 text-sm">Manage Campaigns</span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          Create and edit campaigns
                        </span>
                      </div>
                    </div>
                  </Button>
                )}
                {hasPermission("view_kiosks") && (
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-4 px-4 text-left hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all duration-200 group border-gray-200 bg-white"
                    onClick={() => {
                      onNavigate("admin-kiosks");
                    }}
                  >
                    <div className="flex items-start w-full">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                        <Monitor className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-gray-900 text-sm">Configure Kiosks</span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          Manage kiosk settings
                        </span>
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

      {/* Centralized Stripe Onboarding Dialog - New Redesigned Version */}
      <StripeOnboardingDialog
        open={showStripeStatusDialog}
        onOpenChange={setShowStripeStatusDialog}
        organization={organization}
        loading={orgLoading}
      />

      {/* Additional Onboarding Dialog for other triggers */}
      <StripeOnboardingDialog
        open={showOnboardingPopup}
        onOpenChange={setShowOnboardingPopup}
        organization={organization}
        loading={orgLoading}
      />
      </div>
      </>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      )}

      {/* Kiosk Form Dialog */}
      <KioskForm
        open={showKioskFormDialog}
        onOpenChange={setShowKioskFormDialog}
        editingKiosk={null}
        kioskData={kioskFormData}
        setKioskData={setKioskFormData}
        campaigns={allCampaigns.map(c => ({
          id: c.id,
          title: c.title,
          raised: c.raised || 0,
          goal: c.goal || 0,
          coverImageUrl: c.coverImageUrl,
        }))}
        onSubmit={handleKioskFormSubmit}
        onCancel={() => setShowKioskFormDialog(false)}
        onAssignCampaign={handleKioskFormAssignCampaign}
        onUnassignCampaign={handleKioskFormUnassignCampaign}
        formatCurrency={formatCurrency}
      />
    </AdminLayout>
  );
}
