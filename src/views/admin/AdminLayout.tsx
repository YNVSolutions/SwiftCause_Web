"use client";

import React, { useState } from "react";
import { Screen, AdminSession, Permission } from "../../shared/types";
import { Avatar, AvatarFallback, AvatarImage } from "../../shared/ui/avatar";
import { Button } from "../../shared/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,

  SidebarInset,
  useSidebar,
} from "../../shared/ui/sidebar";
import { AdminPageHeader } from "./components/AdminPageHeader";
import {
  LayoutDashboard,
  Settings,
  Monitor,
  Database,
  Users,
  Gift,
  LogOut,
  X,
  Mail,
  Building2,
  Shield,
  Calendar,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SCREEN_LABELS: Partial<Record<Screen, string>> = {
  admin: "Dashboard",
  "admin-dashboard": "Dashboard",
  "admin-campaigns": "Campaigns",
  "admin-kiosks": "Kiosks",
  "admin-donations": "Donations",
  "admin-gift-aid": "Gift Aid Donations",
  "admin-users": "Users",
  "admin-bank-details": "Bank Details",
};

const SCREEN_SUBTITLES: Partial<Record<Screen, string>> = {
  admin: "Overview of key metrics and activity.",
  "admin-dashboard": "Overview of key metrics and activity.",
  "admin-campaigns": "Create, edit, and monitor campaign performance.",
  "admin-kiosks": "Manage kiosk devices, access, and assignments.",
  "admin-donations": "Review donations, exports, and recent activity.",
  "admin-gift-aid": "Track Gift Aid claims and eligible donations.",
  "admin-users": "Manage admin users, access, and roles.",
  "admin-bank-details": "Manage your payment settings and Stripe integration.",
};

interface AdminLayoutProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
  children: React.ReactNode;
  activeScreen?: Screen;
  onStartTour?: () => void;
  headerTitle?: React.ReactNode;
  headerSubtitle?: React.ReactNode;
  hideHeaderDivider?: boolean;
  headerActions?: React.ReactNode;
  hideSidebarTrigger?: boolean;
  hideHeader?: boolean;
}

// Get user initials for avatar
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const SIDEBAR_COLORS = {
  base: "#14532D",
  dark: "#0F3D23",
  panel: "#1B5E36",
  panelSoft: "rgba(27, 94, 54, 0.6)",
  accent: "#22C55E",
  accentHover: "rgba(34, 197, 94, 0.22)",
  accentHoverCompact: "rgba(34, 197, 94, 0.28)",
};

export function AdminLayout({
  onNavigate,
  onLogout,
  userSession,
  hasPermission,
  children,
  activeScreen = "admin-dashboard",
  onStartTour,
  headerTitle,
  headerSubtitle,
  headerActions,
  hideHeaderDivider,
  hideSidebarTrigger,
  hideHeader,
}: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoAnimating, setLogoAnimating] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const handleChange = () => {
      const matches = mediaQuery.matches;
      setIsMobile(matches);
      if (matches) {
        setIsCollapsed(false);
        setIsMobileMenuOpen(false);
      }
    };

    handleChange();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Handle ESC key to close profile panel
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showUserProfile) {
        setShowUserProfile(false);
      }
    };

    if (showUserProfile) {
      document.addEventListener("keydown", handleEscKey);
      return () => document.removeEventListener("keydown", handleEscKey);
    }
  }, [showUserProfile]);
  const isActive = (...screens: Screen[]) => screens.includes(activeScreen);
  const currentLabel = SCREEN_LABELS[activeScreen] ?? "Admin";
  const resolvedTitle = headerTitle ?? currentLabel;
  const resolvedSubtitle =
    headerSubtitle ?? SCREEN_SUBTITLES[activeScreen] ?? undefined;
  const userInitials = getInitials(userSession.user.username || userSession.user.email || "U");

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen((open) => !open);
      return;
    }
    setIsCollapsed(!isCollapsed);
  };

  const handleLogoClick = () => {
    setLogoAnimating(true);
    setTimeout(() => setLogoAnimating(false), 500); // Animation duration
  };

  // Centralized navigation button attributes
  const getNavButtonProps = (screen: Screen | Screen[], title: string) => {
    const isActiveButton = Array.isArray(screen) ? isActive(...screen) : isActive(screen);
    
    return {
      className: `
        sidebar-item flex items-center w-full text-left group rounded-lg transition-all duration-300 ease-in-out hover:translate-x-1 hover:shadow-md
        ${isCollapsed 
          ? 'px-2 py-3 justify-center' 
          : 'px-4 py-3 justify-between'
        }
        ${isActiveButton
          ? "text-white sidebar-item-active"
          : "text-white/90 hover:text-white"
        }
      `,
      style: isActiveButton ? {
        background: SIDEBAR_COLORS.accent,
        boxShadow: isCollapsed
          ? 'inset 3px 0 0 rgba(255,255,255,0.7), 0 0 12px rgba(34,197,94,0.45), 0 2px 8px rgba(0,0,0,0.2)'
          : 'inset 3px 0 0 rgba(255,255,255,0.7), 0 2px 10px rgba(34,197,94,0.35)'
      } : {},
      onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isActiveButton) {
          e.currentTarget.style.backgroundColor = isCollapsed
            ? SIDEBAR_COLORS.accentHoverCompact
            : SIDEBAR_COLORS.accentHover;
          e.currentTarget.style.boxShadow = '0 10px 24px rgba(22,163,74,0.2)';
        }
      },
      onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isActiveButton) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }
      },
      title: isCollapsed ? title : ""
    };
  };

  // Centralized icon props
  const getIconProps = () => ({
    className: `flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`,
    strokeWidth: isCollapsed ? 2.2 : 2
  });

  // Centralized text span props
  const getTextSpanProps = () => ({
    className: `font-medium ml-3 transition-colors duration-200 group-hover:text-white group-hover:font-semibold ${isCollapsed ? 'hidden' : 'block'}`
  });

  // Centralized arrow icon for active states
  const renderActiveArrow = (screenToCheck: Screen | Screen[]) => {
    const isActiveButton = Array.isArray(screenToCheck) ? isActive(...screenToCheck) : isActive(screenToCheck);
    return !isCollapsed && isActiveButton && (
      <svg className="h-4 w-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    );
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <style>{`
        @keyframes wobble {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-5deg) scale(0.9); }
          50% { transform: rotate(5deg) scale(1.1); }
          75% { transform: rotate(-5deg) scale(0.95); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .logo-wobble.animate {
          animation: wobble 0.5s ease-in-out;
        }
        .signout-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .signout-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        .signout-btn:hover::before {
          left: 100%;
        }
        .signout-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 15px rgba(185, 28, 28, 0.4);
        }
        .signout-btn:active {
          transform: scale(0.98);
        }
        .signout-icon {
          transition: transform 0.3s ease;
        }
        .signout-btn:hover .signout-icon {
          transform: translateX(3px);
        }
        .sidebar-item {
          position: relative;
          overflow: hidden;
        }
        .sidebar-item::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
          opacity: 0;
          transform: translateX(-12%);
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
        }
        .sidebar-item:hover::before {
          opacity: 1;
          transform: translateX(0);
        }
        .sidebar-item-active::after {
          content: "";
          position: absolute;
          left: 0;
          top: 12%;
          bottom: 12%;
          width: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.7);
        }
      `}</style>
      <div className="relative h-screen w-full">
        {isMobile && isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <div className={`flex h-full w-full transition-[filter] duration-300 ${showUserProfile ? "blur-sm" : ""}`}>
          {/* Custom Green Gradient Sidebar */}
          <div 
            className={`${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"} ${isCollapsed ? 'w-16' : 'w-80'} flex flex-col shadow-2xl border-r border-emerald-900/60 shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isMobile ? (isMobileMenuOpen ? "translate-x-0" : "-translate-x-full") : ""}`}
            style={{
              background: `linear-gradient(180deg, ${SIDEBAR_COLORS.base} 0%, ${SIDEBAR_COLORS.dark} 100%)`
            }}
          >
          <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-white/15 blur-3xl"></div>
          <div className="pointer-events-none absolute bottom-20 -left-24 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl"></div>
          <div className="pointer-events-none absolute bottom-6 left-8 h-28 w-28 rounded-full bg-white/10 blur-2xl"></div>
          {/* Header Card */}
          <div 
            className={`mb-4 overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'p-2' : 'p-4'}`}
            style={{
              background: SIDEBAR_COLORS.panelSoft,
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-between">
              {/* Logo Section */}
              {!isCollapsed && (
                <div className="flex items-center gap-3 flex-1">
                  <img 
                    src="/logo.png" 
                    alt="SwiftCause Logo" 
                    className={`w-10 h-10 rounded-lg logo-wobble cursor-pointer ${logoAnimating ? 'animate' : ''}`}
                    onClick={handleLogoClick}
                  />
                  <div>
                    <h1 className="text-white font-bold text-lg leading-tight">SwiftCause</h1>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wide">ADMIN CONTROL</p>
                  </div>
                </div>
              )}
              
              {/* Collapse/Expand Arrow Button */}
              <button
                onClick={toggleSidebar}
                className="p-3 text-white/80 hover:text-white hover:bg-emerald-500/20 rounded-lg transition-colors duration-200 shrink-0 ml-auto"
              >
                {isMobile ? (
                  <X className="h-6 w-6" />
                ) : (
                  <>
                    {isCollapsed ? (
                      <ChevronRight className="h-6 w-6" />
                    ) : (
                      <ChevronLeft className="h-6 w-6" />
                    )}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          {!isCollapsed && (
            <div 
              className="mb-4 rounded-2xl p-5 transition-all duration-300 ease-in-out shadow-[0_12px_26px_rgba(6,78,59,0.35)] border border-white/12"
              style={{
                background: SIDEBAR_COLORS.panel,
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex flex-col items-center text-center">
                {/* User Profile Avatar */}
                <div className="relative mb-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                      border: '3px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    <Avatar className="w-12 h-12 transition-all duration-300">
                      <AvatarImage src={userSession.user.photoURL || undefined} />
                      <AvatarFallback className="bg-transparent text-green-500 text-lg font-bold transition-all duration-300">
                        {getInitials(userSession.user.username || userSession.user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Online indicator */}
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                {/* User Info */}
                <h2 className="text-white font-semibold text-lg mb-1">
                  {userSession.user.username || 'Ayush Bhatia'}
                </h2>
                <p className="text-white/60 text-sm">System Administrator</p>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto">
            <div className={`${isCollapsed ? 'space-y-2 px-1' : 'space-y-1 px-4'} transition-all duration-300 ease-in-out`}>
              {/* Dashboard */}
              <button
                onClick={() => onNavigate("admin")}
                {...getNavButtonProps(["admin", "admin-dashboard"], "Dashboard")}
              >
                <div className="flex items-center">
                  <LayoutDashboard {...getIconProps()} />
                  <span {...getTextSpanProps()}>Dashboard</span>
                </div>
                {renderActiveArrow(["admin", "admin-dashboard"])}
              </button>
              
              {/* Campaigns */}
              {hasPermission("view_campaigns") && (
                <button
                  onClick={() => onNavigate("admin-campaigns")}
                  {...getNavButtonProps("admin-campaigns", "Campaigns")}
                >
                  <div className="flex items-center">
                    <Settings {...getIconProps()} />
                    <span {...getTextSpanProps()}>Campaigns</span>
                  </div>
                  {renderActiveArrow("admin-campaigns")}
                </button>
              )}
              
              {/* Kiosks */}
              {hasPermission("view_kiosks") && (
                <button
                  onClick={() => onNavigate("admin-kiosks")}
                  {...getNavButtonProps("admin-kiosks", "Kiosks")}
                >
                  <div className="flex items-center">
                    <Monitor {...getIconProps()} />
                    <span {...getTextSpanProps()}>Kiosks</span>
                  </div>
                  {renderActiveArrow("admin-kiosks")}
                </button>
              )}
              
              {/* Donations */}
              {hasPermission("view_donations") && (
                <button
                  onClick={() => onNavigate("admin-donations")}
                  {...getNavButtonProps("admin-donations", "Donations")}
                >
                  <div className="flex items-center">
                    <Database {...getIconProps()} />
                    <span {...getTextSpanProps()}>Donations</span>
                  </div>
                  {renderActiveArrow("admin-donations")}
                </button>
              )}
              
              {/* Gift Aid Donations */}
              {hasPermission("view_donations") && (
                <button
                  onClick={() => onNavigate("admin-gift-aid")}
                  {...getNavButtonProps("admin-gift-aid", "Gift Aid Donations")}
                >
                  <div className="flex items-center">
                    <Gift {...getIconProps()} />
                    <span {...getTextSpanProps()}>Gift Aid Donations</span>
                  </div>
                  {renderActiveArrow("admin-gift-aid")}
                </button>
              )}
              
              {/* Users */}
              {hasPermission("view_users") && (
                <button
                  onClick={() => onNavigate("admin-users")}
                  {...getNavButtonProps("admin-users", "Users")}
                >
                  <div className="flex items-center">
                    <Users {...getIconProps()} />
                    <span {...getTextSpanProps()}>Users</span>
                  </div>
                  {renderActiveArrow("admin-users")}
                </button>
              )}
              
              {/* Bank Details */}
              <button
                onClick={() => onNavigate("admin-bank-details")}
                {...getNavButtonProps("admin-bank-details", "Bank Details")}
              >
                <div className="flex items-center">
                  <Wallet {...getIconProps()} />
                  <span {...getTextSpanProps()}>Bank Details</span>
                </div>
                {renderActiveArrow("admin-bank-details")}
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className={`mt-auto ${isCollapsed ? 'p-4 flex justify-center' : 'p-4'}`}>
            {!isCollapsed ? (
              <button
                onClick={onLogout}
                className="signout-btn w-full flex items-center justify-center px-4 py-4 rounded-xl text-white border border-red-900/30"
                style={{
                  background: '#7F1D1D'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#7F1D1D';
                  e.currentTarget.style.borderColor = '#7F1D1D';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#B91C1C';
                  e.currentTarget.style.borderColor = '#B91C1C';
                }}
              >
                <LogOut className="signout-icon h-5 w-5 mr-3" />
                <span className="font-medium text-base">Log Out</span>
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="signout-btn mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                style={{
                  background: '#7F1D1D'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#7F1D1D';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#B91C1C';
                }}
                title="Log Out"
              >
                <LogOut className="signout-icon h-6 w-6 text-white" strokeWidth={2.2} />
              </button>
            )}
          </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!hideHeader && (
            <header className="sticky top-0 z-20 px-4 sm:px-6 py-4 bg-slate-50/95 backdrop-blur supports-backdrop-filter:bg-slate-50/80">
              <AdminPageHeader
                title={resolvedTitle}
                subtitle={resolvedSubtitle}
                actions={headerActions}
                showSidebarTrigger={!hideSidebarTrigger}
                onStartTour={onStartTour}
                onProfileClick={() => setShowUserProfile(!showUserProfile)}
                userPhotoUrl={userSession.user.photoURL || undefined}
                userInitials={userInitials}
                profileSlot={(
                  <div className="flex items-center gap-3 ml-4 relative">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowUserProfile(!showUserProfile)}
                        className="group h-10 w-10 p-0 rounded-full border-0 bg-green-500 text-white shadow-md hover:bg-green-600 hover:shadow-lg transition-colors"
                        aria-label="Open profile"
                      >
                        <Avatar className="h-8 w-8 transition-transform duration-200 group-hover:scale-105">
                          <AvatarImage src={userSession.user.photoURL || undefined} />
                          <AvatarFallback className="bg-transparent text-white text-sm font-semibold">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-[0_0_6px_rgba(16,185,129,0.8)]"></div>
                    </div>
                  </div>
                )}
              />
            </header>
            )}
          
          <main
            className="flex-1 w-full bg-slate-50 overflow-y-auto overflow-x-hidden relative"
            style={{ scrollbarGutter: "stable" }}
            data-testid="main-content-area"
          >
            {isMobile && !isMobileMenuOpen && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="fixed left-0 top-10 z-30 flex h-12  items-center justify-center rounded-r-2xl bg-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.35)] transition-transform duration-200 hover:translate-x-1"
                aria-label="Open menu"
                title="Open menu"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
            {children}
          </main>
          </div>
        </div>

        {showUserProfile && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-50 transition-all duration-300"
              onClick={() => setShowUserProfile(false)}
            ></div>

            <div className="fixed top-20 right-6 w-80 bg-white rounded-xl shadow-2xl z-60 transform transition-all duration-300 ease-out border border-gray-100">
              <div className="relative px-6 py-5 bg-linear-to-r from-green-600 to-emerald-600 rounded-t-xl">
                <button
                  onClick={() => setShowUserProfile(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={userSession.user.photoURL || undefined} />
                      <AvatarFallback className="bg-white text-green-600 text-lg font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="text-white">
                    <h3 className="font-semibold text-lg leading-tight">
                      {userSession.user.username || "Ayush Bhatia"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30">
                        Administrator
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Account Information</h4>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-500 text-xs">Email Address</p>
                        <p className="text-gray-900 font-medium truncate">{userSession.user.email || "ayushbhatia590@gmail.com"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Role</p>
                        <p className="text-gray-900 font-medium">Administrator</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Member Since</p>
                        <p className="text-gray-900 font-medium">November 16, 2025</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Permissions</h4>

                  <div className="flex flex-wrap gap-1.5">
                    {hasPermission("view_dashboard") && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                        view dashboard
                      </span>
                    )}
                    {hasPermission("view_campaigns") && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                        view campaigns
                      </span>
                    )}
                    {hasPermission("create_campaign") && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">
                        create campaign
                      </span>
                    )}
                    {hasPermission("edit_campaign") && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-md">
                        edit campaign
                      </span>
                    )}
                    {hasPermission("delete_campaign") && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md">
                        delete campaign
                      </span>
                    )}
                    {hasPermission("view_kiosks") && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                        view kiosks
                      </span>
                    )}
                    {hasPermission("create_kiosk") && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">
                        create kiosk
                      </span>
                    )}
                    {hasPermission("edit_kiosk") && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-md">
                        edit kiosk
                      </span>
                    )}
                    {hasPermission("delete_kiosk") && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md">
                        delete kiosk
                      </span>
                    )}
                    {hasPermission("assign_campaigns") && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md">
                        assign campaigns
                      </span>
                    )}
                    {hasPermission("view_donations") && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                        view donations
                      </span>
                    )}
                    {hasPermission("export_donations") && (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-md">
                        export donations
                      </span>
                    )}
                    {hasPermission("view_users") && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                        view users
                      </span>
                    )}
                    {hasPermission("create_user") && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">
                        create user
                      </span>
                    )}
                    {hasPermission("edit_user") && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-md">
                        edit user
                      </span>
                    )}
                    {hasPermission("delete_user") && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md">
                        delete user
                      </span>
                    )}
                    {hasPermission("manage_permissions") && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                        manage permissions
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowUserProfile(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm border border-red-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SidebarProvider>
  );
}
