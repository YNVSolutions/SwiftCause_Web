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
  Menu,
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
  const isActive = (...screens: Screen[]) => screens.includes(activeScreen);
  const currentLabel = SCREEN_LABELS[activeScreen] ?? "Admin";

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogoClick = () => {
    setLogoAnimating(true);
    setTimeout(() => setLogoAnimating(false), 500); // Animation duration
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
          className={`${isCollapsed ? 'w-24' : 'w-80'} flex flex-col shadow-2xl border-r border-green-700/30 flex-shrink-0 transition-[width] duration-700 ease-in-out p-4 overflow-hidden`}
          style={{
            background: 'linear-gradient(180deg, #16A34A 0%, #059669 100%)'
          }}
        >
          {/* Header Card */}
          <div 
            className={`mb-4 transition-all duration-700 ease-in-out overflow-hidden`}
            style={{
              background: 'rgba(0,0,0,0.15)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              padding: isCollapsed ? '12px 8px' : '16px 16px'
            }}
          >
            <div className="flex items-center justify-center relative">
              {/* Logo Section */}
              <div 
                className={`flex items-center gap-3 transition-all duration-700 ease-in-out ${isCollapsed ? 'opacity-0 -translate-x-4 pointer-events-none absolute' : 'opacity-100 translate-x-0 flex-1'}`}
              >
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
              
              {/* Collapse Button */}
              <button
                onClick={toggleSidebar}
                className={`p-2 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-all duration-700 ease-in-out ${isCollapsed ? 'relative' : 'absolute right-0'}`}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          <div 
            className={`mb-4 transition-all duration-700 ease-in-out overflow-hidden`}
            style={{
              background: isCollapsed ? 'transparent' : 'rgba(0,0,0,0.15)',
              borderRadius: '12px',
              backdropFilter: isCollapsed ? 'none' : 'blur(10px)',
              maxHeight: isCollapsed ? '0px' : '200px',
              padding: isCollapsed ? '0px' : '24px 16px',
              marginBottom: isCollapsed ? '0px' : '16px'
            }}
          >
            <div 
              className={`flex flex-col items-center text-center transition-all duration-700 ease-in-out ${isCollapsed ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}
            >
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

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto transition-all duration-700 ease-in-out">
            <div className={`transition-all duration-700 ease-in-out ${isCollapsed ? 'space-y-3 px-2' : 'space-y-1'}`}>
              {/* Dashboard */}
              <button
                onClick={() => onNavigate("admin")}
                className={`
                  flex items-center w-full transition-all duration-700 ease-in-out text-left group rounded-lg relative overflow-hidden
                  ${isCollapsed 
                    ? 'px-3 py-3.5 justify-center' 
                    : 'px-4 py-3 justify-between'
                  }
                  ${isActive("admin", "admin-dashboard")
                    ? "text-white"
                    : isCollapsed 
                      ? "text-white hover:text-white hover:bg-white/15"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }
                `}
                style={isActive("admin", "admin-dashboard") ? {
                  background: '#1E293B',
                  boxShadow: isCollapsed ? '0 0 12px rgba(30,41,59,0.4), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(30,41,59,0.3)'
                } : {}}
                onMouseEnter={(e) => {
                  if (!isActive("admin", "admin-dashboard")) {
                    e.currentTarget.style.backgroundColor = isCollapsed ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive("admin", "admin-dashboard")) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={isCollapsed ? "Dashboard" : ""}
              >
                <div className="flex items-center relative">
                  <LayoutDashboard 
                    className={`flex-shrink-0 transition-all duration-700 ease-in-out ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`}
                    strokeWidth={isCollapsed ? 2.2 : 2}
                  />
                  <span 
                    className={`font-medium transition-all duration-700 ease-in-out ${isCollapsed ? 'opacity-0 -translate-x-4 absolute left-8 pointer-events-none' : 'opacity-100 translate-x-0 ml-3'}`}
                  >
                    Dashboard
                  </span>
                </div>
                {!isCollapsed && isActive("admin", "admin-dashboard") && (
                  <svg className="h-4 w-4 text-white/70 transition-all duration-700 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
              
              {/* Campaigns */}
              {hasPermission("view_campaigns") && (
                <button
                  onClick={() => onNavigate("admin-campaigns")}
                  className={`
                    flex items-center w-full transition-all duration-700 ease-in-out text-left group rounded-lg relative overflow-hidden
                    ${isCollapsed 
                      ? 'px-3 py-3.5 justify-center' 
                      : 'px-4 py-3 justify-between'
                    }
                    ${isActive("admin-campaigns")
                      ? "text-white"
                      : isCollapsed 
                        ? "text-white hover:text-white hover:bg-white/15"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }
                  `}
                  style={isActive("admin-campaigns") ? {
                    background: '#1E293B',
                    boxShadow: isCollapsed ? '0 0 12px rgba(30,41,59,0.4), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(30,41,59,0.3)'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (!isActive("admin-campaigns")) {
                      e.currentTarget.style.backgroundColor = isCollapsed ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive("admin-campaigns")) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={isCollapsed ? "Campaigns" : ""}
                >
                  <div className="flex items-center relative">
                    <Settings 
                      className={`flex-shrink-0 transition-all duration-700 ease-in-out ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`}
                      strokeWidth={isCollapsed ? 2.2 : 2}
                    />
                    <span 
                      className={`font-medium transition-all duration-700 ease-in-out ${isCollapsed ? 'opacity-0 -translate-x-4 absolute left-8 pointer-events-none' : 'opacity-100 translate-x-0 ml-3'}`}
                    >
                      Campaigns
                    </span>
                  </div>
                  {!isCollapsed && isActive("admin-campaigns") && (
                    <svg className="h-4 w-4 text-white/70 transition-all duration-700 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              )}
              
              {/* Kiosks */}
              {hasPermission("view_kiosks") && (
                <button
                  onClick={() => onNavigate("admin-kiosks")}
                  className={`
                    flex items-center w-full transition-all duration-700 ease-in-out text-left group rounded-lg relative overflow-hidden
                    ${isCollapsed 
                      ? 'px-3 py-3.5 justify-center' 
                      : 'px-4 py-3 justify-between'
                    }
                    ${isActive("admin-kiosks")
                      ? "text-white"
                      : isCollapsed 
                        ? "text-white hover:text-white hover:bg-white/15"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }
                  `}
                  style={isActive("admin-kiosks") ? {
                    background: '#1E293B',
                    boxShadow: isCollapsed ? '0 0 12px rgba(30,41,59,0.4), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(30,41,59,0.3)'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (!isActive("admin-kiosks")) {
                      e.currentTarget.style.backgroundColor = isCollapsed ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive("admin-kiosks")) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={isCollapsed ? "Kiosks" : ""}
                >
                  <div className="flex items-center relative">
                    <Monitor 
                      className={`flex-shrink-0 transition-all duration-700 ease-in-out ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`}
                      strokeWidth={isCollapsed ? 2.2 : 2}
                    />
                    <span 
                      className={`font-medium transition-all duration-700 ease-in-out ${isCollapsed ? 'opacity-0 -translate-x-4 absolute left-8 pointer-events-none' : 'opacity-100 translate-x-0 ml-3'}`}
                    >
                      Kiosks
                    </span>
                  </div>
                  {!isCollapsed && isActive("admin-kiosks") && (
                    <svg className="h-4 w-4 text-white/70 transition-all duration-700 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              )}
              
              {/* Donations */}
              {hasPermission("view_donations") && (
                <button
                  onClick={() => onNavigate("admin-donations")}
                  className={`
                    flex items-center w-full transition-all duration-700 ease-in-out text-left group rounded-lg relative overflow-hidden
                    ${isCollapsed 
                      ? 'px-3 py-3.5 justify-center' 
                      : 'px-4 py-3 justify-between'
                    }
                    ${isActive("admin-donations")
                      ? "text-white"
                      : isCollapsed 
                        ? "text-white hover:text-white hover:bg-white/15"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }
                  `}
                  style={isActive("admin-donations") ? {
                    background: '#1E293B',
                    boxShadow: isCollapsed ? '0 0 12px rgba(30,41,59,0.4), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(30,41,59,0.3)'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (!isActive("admin-donations")) {
                      e.currentTarget.style.backgroundColor = isCollapsed ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive("admin-donations")) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={isCollapsed ? "Donations" : ""}
                >
                  <div className="flex items-center relative">
                    <Database 
                      className={`flex-shrink-0 transition-all duration-700 ease-in-out ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`}
                      strokeWidth={isCollapsed ? 2.2 : 2}
                    />
                    <span 
                      className={`font-medium transition-all duration-700 ease-in-out ${isCollapsed ? 'opacity-0 -translate-x-4 absolute left-8 pointer-events-none' : 'opacity-100 translate-x-0 ml-3'}`}
                    >
                      Donations
                    </span>
                  </div>
                  {!isCollapsed && isActive("admin-donations") && (
                    <svg className="h-4 w-4 text-white/70 transition-all duration-700 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              )}
              
              {/* Gift Aid Donations */}
              {hasPermission("view_donations") && (
                <button
                  onClick={() => onNavigate("admin-gift-aid")}
                  className={`
                    flex items-center w-full transition-all duration-700 ease-in-out text-left group rounded-lg relative overflow-hidden
                    ${isCollapsed 
                      ? 'px-3 py-3.5 justify-center' 
                      : 'px-4 py-3 justify-between'
                    }
                    ${isActive("admin-gift-aid")
                      ? "text-white"
                      : isCollapsed 
                        ? "text-white hover:text-white hover:bg-white/15"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }
                  `}
                  style={isActive("admin-gift-aid") ? {
                    background: '#1E293B',
                    boxShadow: isCollapsed ? '0 0 12px rgba(30,41,59,0.4), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(30,41,59,0.3)'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (!isActive("admin-gift-aid")) {
                      e.currentTarget.style.backgroundColor = isCollapsed ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive("admin-gift-aid")) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={isCollapsed ? "Gift Aid Donations" : ""}
                >
                  <div className="flex items-center relative">
                    <Gift 
                      className={`flex-shrink-0 transition-all duration-700 ease-in-out ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`}
                      strokeWidth={isCollapsed ? 2.2 : 2}
                    />
                    <span 
                      className={`font-medium transition-all duration-700 ease-in-out ${isCollapsed ? 'opacity-0 -translate-x-4 absolute left-8 pointer-events-none' : 'opacity-100 translate-x-0 ml-3'}`}
                    >
                      Gift Aid Donations
                    </span>
                  </div>
                  {!isCollapsed && isActive("admin-gift-aid") && (
                    <svg className="h-4 w-4 text-white/70 transition-all duration-700 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              )}
              
              {/* Users */}
              {hasPermission("view_users") && (
                <button
                  onClick={() => onNavigate("admin-users")}
                  className={`
                    flex items-center w-full transition-all duration-700 ease-in-out text-left group rounded-lg relative overflow-hidden
                    ${isCollapsed 
                      ? 'px-3 py-3.5 justify-center' 
                      : 'px-4 py-3 justify-between'
                    }
                    ${isActive("admin-users")
                      ? "text-white"
                      : isCollapsed 
                        ? "text-white hover:text-white hover:bg-white/15"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }
                  `}
                  style={isActive("admin-users") ? {
                    background: '#1E293B',
                    boxShadow: isCollapsed ? '0 0 12px rgba(30,41,59,0.4), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(30,41,59,0.3)'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (!isActive("admin-users")) {
                      e.currentTarget.style.backgroundColor = isCollapsed ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive("admin-users")) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={isCollapsed ? "Users" : ""}
                >
                  <div className="flex items-center relative">
                    <Users 
                      className={`flex-shrink-0 transition-all duration-700 ease-in-out ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`}
                      strokeWidth={isCollapsed ? 2.2 : 2}
                    />
                    <span 
                      className={`font-medium transition-all duration-700 ease-in-out ${isCollapsed ? 'opacity-0 -translate-x-4 absolute left-8 pointer-events-none' : 'opacity-100 translate-x-0 ml-3'}`}
                    >
                      Users
                    </span>
                  </div>
                  {!isCollapsed && isActive("admin-users") && (
                    <svg className="h-4 w-4 text-white/70 transition-all duration-700 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              )}
              
              {/* Bank Details */}
              <button
                onClick={() => onNavigate("admin-bank-details")}
                className={`
                  flex items-center w-full transition-all duration-700 ease-in-out text-left group rounded-lg relative overflow-hidden
                  ${isCollapsed 
                    ? 'px-3 py-3.5 justify-center' 
                    : 'px-4 py-3 justify-between'
                  }
                  ${isActive("admin-bank-details")
                    ? "text-white"
                    : isCollapsed 
                      ? "text-white hover:text-white hover:bg-white/15"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }
                `}
                style={isActive("admin-bank-details") ? {
                  background: '#1E293B',
                  boxShadow: isCollapsed ? '0 0 12px rgba(30,41,59,0.4), 0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(30,41,59,0.3)'
                } : {}}
                onMouseEnter={(e) => {
                  if (!isActive("admin-bank-details")) {
                    e.currentTarget.style.backgroundColor = isCollapsed ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive("admin-bank-details")) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={isCollapsed ? "Bank Details" : ""}
              >
                <div className="flex items-center relative">
                  <Wallet 
                    className={`flex-shrink-0 transition-all duration-700 ease-in-out ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'}`}
                    strokeWidth={isCollapsed ? 2.2 : 2}
                  />
                  <span 
                    className={`font-medium transition-all duration-700 ease-in-out ${isCollapsed ? 'opacity-0 -translate-x-4 absolute left-8 pointer-events-none' : 'opacity-100 translate-x-0 ml-3'}`}
                  >
                    Bank Details
                  </span>
                </div>
                {!isCollapsed && isActive("admin-bank-details") && (
                  <svg className="h-4 w-4 text-white/70 transition-all duration-700 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className={`mt-auto ${isCollapsed ? 'p-3' : 'p-4'} transition-all duration-700 ease-in-out`}>
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


