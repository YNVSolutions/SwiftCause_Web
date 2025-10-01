import React, { useState, useEffect } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { SignupScreen } from "./components/SignupScreen";
import { CampaignListContainer } from "./features/campaigns/containers/CampaignListContainer";
import { CampaignScreen } from "./components/CampaignScreen";
import { PaymentContainer } from "./features/payment/containers/PaymentContainer";
import { ResultScreen } from "./components/ResultScreen";
import { EmailConfirmationScreen } from "./components/EmailConfirmationScreen";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { KioskManagement } from "./components/admin/KioskManagement";
import { DonationManagement } from "./components/admin/DonationManagement";
import { UserManagement } from "./components/admin/UserManagement";
import CampaignManagement from "./components/admin/CampaignManagement";
import { doc, getDoc, db } from "./lib/firebase";
import { HomePage } from "./components/HomePage";
import { AboutPage } from "./components/pages/AboutPage";
import { ContactPage } from "./components/pages/ContactPage";
import { DocumentationPage } from "./components/pages/DocumentationPage";
import { TermsPage } from "./components/pages/TermsPage";
import { Toast, ToastHost } from "./components/ui/Toast";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseAuthUser,
} from "firebase/auth";
import { getFirestore, setDoc } from "firebase/firestore";


const auth = getAuth();
const firestore = getFirestore();

export type Screen =
  | "home"
  | "login"
  | "signup"
  | "campaigns"
  | "campaign"
  | "payment"
  | "result"
  | "email-confirmation"
  | "admin-dashboard"
  | "admin-campaigns"
  | "admin-kiosks"
  | "admin-donations"
  | "admin-users"
  // marketing/info pages
  | "about"
  | "contact"
  | "docs"
  | "terms";

export type UserRole =
  | "super_admin"
  | "admin"
  | "manager"
  | "operator"
  | "viewer"
  | "kiosk";

export type Permission =
  | "view_dashboard"
  | "view_campaigns"
  | "create_campaign"
  | "edit_campaign"
  | "delete_campaign"
  | "view_kiosks"
  | "create_kiosk"
  | "edit_kiosk"
  | "delete_kiosk"
  | "assign_campaigns"
  | "view_donations"
  | "export_donations"
  | "view_users"
  | "create_user"
  | "edit_user"
  | "delete_user"
  | "manage_permissions"
  | "system_admin";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[]
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
  organizationId?: string;
}

export interface CampaignConfiguration {
  predefinedAmounts: number[];
  allowCustomAmount: boolean;
  minCustomAmount: number;
  maxCustomAmount: number;
  suggestedAmounts: number[];
  enableRecurring: boolean;
  recurringIntervals: ("monthly" | "quarterly" | "yearly")[];
  defaultRecurringInterval: "monthly" | "quarterly" | "yearly";
  recurringDiscount?: number;
  displayStyle: "grid" | "list" | "carousel";
  showProgressBar: boolean;
  showDonorCount: boolean;
  showRecentDonations: boolean;
  maxRecentDonations: number;
  primaryCTAText: string;
  secondaryCTAText?: string;
  urgencyMessage?: string;
  accentColor?: string;
  backgroundImage?: string;
  theme: "default" | "minimal" | "vibrant" | "elegant";
  requiredFields: ("email" | "name" | "phone" | "address")[];
  optionalFields: ("email" | "name" | "phone" | "address" | "message")[];
  enableAnonymousDonations: boolean;
  enableSocialSharing: boolean;
  shareMessage?: string;
  enableDonorWall: boolean;
  enableComments: boolean;
}
export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  coverImageUrl: string;
  category: string;
  tags?: string[];
  status?: "active" | "paused" | "completed";
  createdAt?: string;
  endDate?: string;
  organizationId?: string;
  donationCount?: number;
  configuration: CampaignConfiguration;
  assignedKiosks?: string[];
  isGlobal?: boolean;
  longDescription?: string;
  videoUrl?: string;
  galleryImages?: string[];
  organizationInfo?: {
    name: string;
    description: string;
    website?: string;
    logo?: string;
  };
  impactMetrics?: {
    peopleHelped?: number;
    itemsProvided?: number;
    customMetric?: {
      label: string;
      value: number;
      unit: string;
    };
  };
}

export interface Organization {
  id: string;
  name: string;
  currency: string;
}

export interface Donation {
  campaignId: string;
  amount: number;
  isRecurring: boolean;
  recurringInterval?: "monthly" | "quarterly" | "yearly";
  id?: string;
  donorEmail?: string;
  donorName?: string;
  donorPhone?: string;
  donorMessage?: string;
  isAnonymous?: boolean;
  timestamp?: string;
  kioskId?: string;
  transactionId?: string;
  isGiftAid?: boolean;
  organizationId?: string;
}
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}
export interface Kiosk {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "maintenance";
  lastActive?: string;
  totalDonations?: number;
  totalRaised?: number;
  accessCode: string;
  qrCode?: string;
  assignedCampaigns?: string[];
  defaultCampaign?: string;
  settings?: {
    displayMode: "grid" | "list" | "carousel";
    showAllCampaigns: boolean;
    maxCampaignsDisplay: number;
    autoRotateCampaigns: boolean;
    rotationInterval?: number;
  };
  deviceInfo?: {
    model?: string;
    os?: string;
    screenSize?: string;
    touchCapable?: boolean;
  };
  operatingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  organizationId?: string;
}

export interface KioskSession {
  kioskId: string;
  kioskName: string;
  startTime: string;
  assignedCampaigns: string[];
  defaultCampaign?: string;
  settings: Kiosk["settings"];
  loginMethod: "qr" | "manual";
  organizationId?: string;
  organizationCurrency?: string;
}
export interface AdminSession {
  user: User;
  loginTime: string;
}
export interface SignupFormData {

  firstName: string;
  lastName: string;
  email: string;


  organizationName: string;
  organizationType: string;
  organizationSize: string;
  organizationId: string;
  website?: string;


  password: string;
  confirmPassword: string;


  currency: string;


  agreeToTerms: boolean;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [campaignView, setCampaignView] = useState<"overview" | "donate">(
    "overview"
  );
  const [donation, setDonation] = useState<Donation | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [currentKioskSession, setCurrentKioskSession] =
    useState<KioskSession | null>(null);
  const [currentAdminSession, setCurrentAdminSession] =
    useState<AdminSession | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error" | "warning" | "info">("info");

  const showToast = (
    message: string,
    variant: "success" | "error" | "warning" | "info" = "info",
    durationMs = 2500
  ) => {
    setToastMessage(message);
    setToastVariant(variant);
    setIsToastVisible(true);

  };



  useEffect(() => {
    console.log("App: onAuthStateChanged listener set up.");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        "App: onAuthStateChanged triggered. FirebaseUser:",
        firebaseUser
      );
      if (firebaseUser) {

        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as User;
          setUserRole(userData.role);
          setCurrentAdminSession({
            user: userData,
            loginTime: new Date().toISOString(),
          });

        
          if (
            userData.role === "admin" ||
            userData.role === "super_admin" ||
            userData.role === "manager" ||
            userData.role === "operator" ||
            userData.role === "viewer"
          ) {
            setCurrentScreen("admin-dashboard");
          } else if (userData.role === "kiosk") {
            setCurrentKioskSession(null); 
            setCurrentScreen("campaigns");
          }

        } else {
         
          console.warn(
            "App: User document not found for UID:",
            firebaseUser.uid
          );
          handleLogout();
        }
      } else {
      
        console.log("App: Firebase user is signed out.");
        handleLogout(); 
        setCurrentScreen("home"); 
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []); 



  const navigate = (screen: string) => {
    console.log("App: navigate called with screen:", screen);
    setCurrentScreen(screen as Screen);
  };

  const handleGoToLogin = () => {
    navigate("login");
  };

  const handleGoToSignup = () => {
    navigate("signup");
  };

  const handleGoBackToHome = () => {
    navigate("home");
  };

  const handleLogin = async (
    role: UserRole,
    sessionData?: KioskSession | AdminSession
  ) => {
    setUserRole(role);
    if (
      role === "admin" ||
      role === "super_admin" ||
      role === "manager" ||
      role === "operator" ||
      role === "viewer"
    ) {
      setCurrentAdminSession(sessionData as AdminSession);
      navigate("admin-dashboard");
      showToast("Sign in successful", "success");
    } else if (role === "kiosk") {
      setCurrentKioskSession(sessionData as KioskSession);
      await refreshCurrentKioskSession((sessionData as KioskSession).kioskId);
      navigate("campaigns");
      showToast("Sign in successful", "success");
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setSelectedCampaign(null);
    setDonation(null);
    setPaymentResult(null);
    setCurrentKioskSession(null);
    setCurrentAdminSession(null);
    setCampaignView("overview");
    navigate("login");
  };
  const refreshCurrentKioskSession = async (kioskIdToRefresh?: string) => {
    const targetKioskId = kioskIdToRefresh || currentKioskSession?.kioskId;
    if (targetKioskId) {
      try {
        const kioskRef = doc(db, "kiosks", targetKioskId);
        const kioskSnap = await getDoc(kioskRef);
        if (kioskSnap.exists()) {
          setCurrentKioskSession((prev) => ({
            ...prev!,
            ...(kioskSnap.data() as Kiosk),
          }));
        } else {
          console.warn(
            "Kiosk document not found during refresh:",
            targetKioskId
          );
        }
      } catch (error) {
        console.error("Error refreshing kiosk session:", error);
      }
    }
  };
  const handleCampaignSelect = (
    campaign: Campaign,
    initialShowDetails: boolean = false
  ) => {
    setSelectedCampaign(campaign);
    setCampaignView(initialShowDetails ? "overview" : "donate");
    navigate("campaign");
  };
  const handleCampaignViewChange = (view: "overview" | "donate") => {
    setCampaignView(view);
  };
  const handleDonationSubmit = (donationData: Donation) => {
    const donationWithKiosk = {
      ...donationData,
      kioskId: currentKioskSession?.kioskId,
    };
    setDonation(donationWithKiosk);
    navigate("payment");
  };
  const handlePaymentSubmit = (result: PaymentResult) => {
    setPaymentResult(result);
    navigate("result");
  };
  const handleEmailConfirmation = () => {
    navigate("email-confirmation");
  };
  const handlePaymentSuccess = (paymentIntentId: string) => {
    handlePaymentSubmit({ success: true, transactionId: paymentIntentId });
  };
  const handleReturnToStart = () => {
    setSelectedCampaign(null);
    setDonation(null);
    setPaymentResult(null);
    setCampaignView("overview");
    if (userRole === "admin") {
      navigate("admin-dashboard");
    } else {
      navigate("campaigns");
    }
  };

  const handleOrganizationSwitch = (organizationId: string) => {
    if (currentAdminSession) {
      setCurrentAdminSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          user: {
            ...prev.user,
            organizationId: organizationId,
          },
        };
      });
    }
  };

  const handleBackFromCampaign = () => {
    if (campaignView === "donate") {
      setCampaignView("overview");
    } else {
      navigate("campaigns");
    }
  };
  const handleSignup = async (signupData: SignupFormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupData.email,
        signupData.password
      );
      const userId = userCredential.user.uid;

      await setDoc(doc(firestore, "users", userId), {
        username: `${signupData.firstName} ${signupData.lastName}`,
        email: signupData.email,
        role: "admin",
        permissions: [
          "view_dashboard",
          "view_campaigns",
          "create_campaign",
          "edit_campaign",
          "delete_campaign",
          "view_kiosks",
          "create_kiosk",
          "edit_kiosk",
          "delete_kiosk",
          "assign_campaigns",
          "view_donations",
          "export_donations",
          "view_users",
          "create_user",
          "edit_user",
          "delete_user",
          "manage_permissions",
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        organizationId: signupData.organizationId,
      });

      await setDoc(doc(firestore, "organizations", signupData.organizationId), {
        name: signupData.organizationName,
        type: signupData.organizationType,
        size: signupData.organizationSize,
        website: signupData.website,
        createdAt: new Date().toISOString(),
      });
      showToast("Signup successful", "success");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Signup error:", error);
        showToast(`Signup failed: ${error.message}`, "error", 3500);
      } else {
        console.error("Unknown signup error:", error);
        showToast("Signup failed due to an unknown error.", "error", 3500);
      }
    }
  };
  const hasPermission = (permission: Permission): boolean => {
    if (
      !currentAdminSession ||
      !Array.isArray(currentAdminSession.user.permissions)
    ) {
      return false;
    }
    return (
      currentAdminSession.user.permissions.includes(permission) ||
      currentAdminSession.user.permissions.includes("system_admin")
    );
  };

  // Main application rendering logic based on authentication state and current screen
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-700">Loading application...</p>
      </div>
    );
  }

  if (userRole === "admin" && currentAdminSession) {
    return (
      <div className="min-h-screen bg-background">
        <ToastHost visible={isToastVisible} onClose={() => setIsToastVisible(false)} align="top">
          <Toast message={toastMessage} variant={toastVariant} onClose={() => setIsToastVisible(false)} />
        </ToastHost>
        {currentScreen === "admin-dashboard" && (
          <AdminDashboard
            onNavigate={navigate}
            onLogout={handleLogout}
            userSession={currentAdminSession}
            hasPermission={hasPermission}
            onOrganizationSwitch={handleOrganizationSwitch}
          />
        )}
        {currentScreen === "admin-campaigns" && (
          <CampaignManagement
            onNavigate={navigate}
            onLogout={handleLogout}
            userSession={currentAdminSession}
            hasPermission={hasPermission}
          />
        )}
        {currentScreen === "admin-kiosks" && (
          <KioskManagement
            onNavigate={navigate}
            onLogout={handleLogout}
            userSession={currentAdminSession}
            hasPermission={hasPermission}
          />
        )}
        {currentScreen === "admin-donations" && (
          <DonationManagement
            onNavigate={navigate}
            onLogout={handleLogout}
            userSession={currentAdminSession}
            hasPermission={hasPermission}
          />
        )}
        {currentScreen === "admin-users" && (
          <UserManagement
            onNavigate={navigate}
            onLogout={handleLogout}
            userSession={currentAdminSession}
            hasPermission={hasPermission}
          />
        )}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <ToastHost visible={isToastVisible} onClose={() => setIsToastVisible(false)} align="top">
        <Toast message={toastMessage} variant={toastVariant} onClose={() => setIsToastVisible(false)} />
      </ToastHost>
      {currentScreen === "home" && (
        <HomePage onLogin={handleGoToLogin} onSignup={handleGoToSignup} onNavigate={navigate} />
      )}
      {currentScreen === "about" && <AboutPage onNavigate={navigate} />}
      {currentScreen === "contact" && <ContactPage onNavigate={navigate} />}
      {currentScreen === "docs" && <DocumentationPage onNavigate={navigate} />}
      {currentScreen === "terms" && <TermsPage onNavigate={navigate} />}
      {currentScreen === "login" && (
        <LoginScreen
          onLogin={handleLogin}
          onGoBackToHome={handleGoBackToHome}
        />
      )}
      {currentScreen === "signup" && (
        <SignupScreen
          onSignup={handleSignup}
          onBack={() => navigate("home")}
          onLogin={() => navigate("login")}
          onViewTerms={() => navigate("terms")}
        />
      )}
      {currentScreen === "campaigns" && (
        <CampaignListContainer
          onSelectCampaign={(campaign) => handleCampaignSelect(campaign, false)}
          onViewDetails={(campaign) => handleCampaignSelect(campaign, true)}
          kioskSession={currentKioskSession}
          onLogout={handleLogout}
          refreshCurrentKioskSession={refreshCurrentKioskSession}
        />
      )}
      {currentScreen === "campaign" && selectedCampaign && (
        <CampaignScreen
          campaign={selectedCampaign}
          initialShowDetails={campaignView === "overview"}
          onSubmit={handleDonationSubmit}
          onBack={handleBackFromCampaign}
          onViewChange={handleCampaignViewChange}
        />
      )}
      {currentScreen === "payment" && donation && selectedCampaign && (
        <PaymentContainer
          campaign={selectedCampaign}
          donation={donation}
          onPaymentComplete={handlePaymentSubmit}
          onBack={() => {
            setCampaignView("donate");
            navigate("campaign");
          }}
        />
      )}
      {currentScreen === "result" && paymentResult && (
        <ResultScreen
          result={paymentResult}
          onEmailConfirmation={
            paymentResult.success ? handleEmailConfirmation : undefined
          }
          onReturnToStart={handleReturnToStart}
        />
      )}
      {currentScreen === "email-confirmation" && paymentResult && (
        <EmailConfirmationScreen
          transactionId={paymentResult.transactionId}
          onComplete={handleReturnToStart}
        />
      )}
    </div>
  );
}
