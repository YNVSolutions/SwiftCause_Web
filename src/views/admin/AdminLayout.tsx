"use client";

import React, { useState } from "react";
import { Screen, AdminSession, Permission } from "../../shared/types";
import { Button } from "../../shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../shared/ui/avatar";
import { SidebarProvider } from "../../shared/ui/sidebar";
import {
  LayoutDashboard,
  Settings,
  Monitor,
  Database,
  Users,
  Gift,
  LogOut,
  Compass,
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

interface AdminLayoutProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
  children: React.ReactNode;
  activeScreen?: Screen;
  onStartTour?: () => void;
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

export function AdminLayout({
  onNavigate,
  onLogout,
  userSession,
  hasPermission,
  children,
  activeScreen = "admin-dashboard",
  onStartTour,
}: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logoAnimating, setLogoAnimating] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Handle ESC key to close profile panel
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showUserProfile) {
        setShowUserProfile(false);
      }
    };

    if (showUserProfile) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [showUserProfile]);
  const isActive = (...screens: Screen[]) => screens.includes(activeScreen);
  const currentLabel = SCREEN_LABELS[activeScreen] ?? "Admin";

  const toggleSidebar = () => {
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
        flex items-center w-full transition-all duration-300 ease-in-out text-left group rounded-lg
        ${isCollapsed 
          ? 'px-2 py-3 justify-center' 
          : 'px-4 py-3 justify-between'
        }
        ${isActiveButton
          ? "text-white"
          : isCollapsed 
            ? "text-white hover:text-white hover:bg-white/15"
            : "text-white/90 hover:text-white hover:bg-white/10"
        }
      `,
      style: isActiveButton ? {
        background: '#1E293B',
        boxShadow: isCollapsed ? '0 0 12px rgba(30,41,59,0.4), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(30,41,59,0.3)'
      } : {},
      onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isActiveButton) {
          e.currentTarget.style.backgroundColor = isCollapsed ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)';
        }
      },
      onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isActiveButton) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      },
      title: isCollapsed ? title : ""
    };
  };

  // Centralized icon props
  const getIconProps = () => ({
    className: `flex-shrink-0 ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`,
    strokeWidth: isCollapsed ? 2.2 : 2
  });

  // Centralized text span props
  const getTextSpanProps = () => ({
    className: `font-medium ml-3 ${isCollapsed ? 'hidden' : 'block'}`
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
      `}</style>
      <div className="flex h-screen w-full">
        {/* Custom Green Gradient Sidebar */}
        <div 
          className={`${isCollapsed ? 'w-16' : 'w-80'} flex flex-col shadow-2xl border-r border-green-700/30 flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}
          style={{
            background: 'linear-gradient(180deg, #16A34A 0%, #059669 100%)'
          }}
        >
          {/* Header Card */}
          <div 
            className={`mb-4 overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'p-2' : 'p-4'}`}
            style={{
              background: 'rgba(0,0,0,0.15)',
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
                className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 flex-shrink-0 ml-auto"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-6 w-6" />
                ) : (
                  <ChevronLeft className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          {!isCollapsed && (
            <div 
              className="mb-4 overflow-hidden transition-all duration-300 ease-in-out p-6"
              style={{
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '12px',
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
                      <AvatarFallback className="bg-transparent text-green-700 text-lg font-bold transition-all duration-300">
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
          <div className={`mt-auto ${isCollapsed ? 'p-3' : 'p-4'}`}>
            {!isCollapsed ? (
              <button
                onClick={onLogout}
                className="signout-btn w-full flex items-center justify-center px-4 py-4 rounded-xl text-white border border-red-900/30"
                style={{
                  background: '#7F1D1D'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#B91C1C';
                  e.currentTarget.style.borderColor = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#7F1D1D';
                  e.currentTarget.style.borderColor = 'rgba(127,29,29,0.3)';
                }}
              >
                <LogOut className="signout-icon h-5 w-5 mr-3" />
                <span className="font-medium text-base">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="signout-btn w-full flex items-center justify-center p-3.5 rounded-xl text-white"
                style={{
                  background: '#7F1D1D'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#7F1D1D';
                }}
                title="Sign Out"
              >
                <LogOut className="signout-icon h-6 w-6" strokeWidth={2.2} />
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 sm:px-6 h-16">
              <div className="flex items-center gap-3">
                <h1 className="font-bold text-lg text-gray-900">{currentLabel}</h1>
              </div>
              
              {/* Right side buttons */}
              <div className="flex items-center gap-2">
                {/* Get a Tour Button */}
                {onStartTour && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onStartTour}
                    className="hidden sm:flex items-center gap-2 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors animate-pulse"
                  >
                    <Compass className="h-4 w-4" />
                    <span className="font-medium">Get a Tour</span>
                  </Button>
                )}
                
                {/* User Profile Avatar */}
                <div className="flex items-center gap-3 ml-4 relative">
                  <div className="relative">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl"
                      style={{
                        background: '#1E293B',
                        border: '2px solid rgba(255,255,255,0.2)'
                      }}
                      onClick={() => setShowUserProfile(!showUserProfile)}
                    >
                      <Avatar className="w-8 h-8 transition-all duration-300">
                        <AvatarImage src={userSession.user.photoURL || undefined} />
                        <AvatarFallback className="bg-transparent text-white text-sm font-bold transition-all duration-300">
                          {getInitials(userSession.user.username || userSession.user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  {/* User Info - Hidden on small screens */}
                  <div 
                    className="hidden md:block cursor-pointer"
                    onClick={() => setShowUserProfile(!showUserProfile)}
                  >
                    <p className="text-gray-900 font-semibold text-sm leading-tight">
                      {userSession.user.username || 'Ayush Bhatia'}
                    </p>
                    <p className="text-gray-500 text-xs">System Administrator</p>
                  </div>

                  {/* User Profile Quick View Panel */}
                  {showUserProfile && (
                    <>
                      {/* Backdrop with blur */}
                      <div 
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
                        onClick={() => setShowUserProfile(false)}
                      ></div>
                      
                      {/* Quick View Panel */}
                      <div className="fixed top-20 right-6 w-80 bg-white rounded-xl shadow-2xl z-50 transform transition-all duration-300 ease-out border border-gray-100">
                        {/* Header */}
                        <div className="relative px-6 py-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-xl">
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
                                  {getInitials(userSession.user.username || userSession.user.email || 'U')}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            
                            <div className="text-white">
                              <h3 className="font-semibold text-lg leading-tight">
                                {userSession.user.username || 'Ayush Bhatia'}
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

                        {/* Content */}
                        <div className="p-6 max-h-96 overflow-y-auto">
                          {/* Account Information */}
                          <div className="space-y-3 mb-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Account Information</h4>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-gray-500 text-xs">Email Address</p>
                                  <p className="text-gray-900 font-medium truncate">{userSession.user.email || 'ayushbhatia590@gmail.com'}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
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
                                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
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

                          {/* Permissions */}
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

                          {/* Quick Actions */}
                          <div className="pt-4 border-t border-gray-100">
                            <button
                              onClick={() => {
                                setShowUserProfile(false);
                                onLogout();
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm border border-red-200"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 w-full bg-slate-50 overflow-y-auto overflow-x-hidden" data-testid="main-content-area">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
