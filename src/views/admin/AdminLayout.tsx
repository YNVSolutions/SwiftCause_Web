"use client";

import React, { useState } from "react";
import { Screen, AdminSession, Permission } from "../../shared/types";
import { Button } from "../../shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../shared/ui/avatar";
import { Badge } from "../../shared/ui/badge";
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
  SidebarTrigger,
  useSidebar,
} from "../../shared/ui/sidebar";
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
  Compass,
  Wallet,
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
  headerTitle?: React.ReactNode;
  hideHeaderDivider?: boolean;
  headerActions?: React.ReactNode;
  hideSidebarTrigger?: boolean;
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

// Format role display name
const getRoleDisplayName = (role: string) => {
  const roleMap: Record<string, string> = {
    'super_admin': 'Super Admin',
    'admin': 'Administrator',
    'manager': 'Manager',
    'operator': 'Operator',
    'viewer': 'Viewer',
    'kiosk': 'Kiosk User'
  };
  return roleMap[role] || role;
};

// Get role badge color
const getRoleBadgeColor = (role: string) => {
  const colorMap: Record<string, string> = {
    'super_admin': 'bg-red-500/20 text-red-100 border-red-400/30',
    'admin': 'bg-purple-500/20 text-purple-100 border-purple-400/30',
    'manager': 'bg-blue-500/20 text-blue-100 border-blue-400/30',
    'operator': 'bg-green-500/20 text-green-100 border-green-400/30',
    'viewer': 'bg-gray-500/20 text-gray-100 border-gray-400/30',
    'kiosk': 'bg-orange-500/20 text-orange-100 border-orange-400/30'
  };
  return colorMap[role] || 'bg-white/20 text-white border-white/30';
};

function ProfileSidebar({
  isOpen,
  onClose,
  userSession,
  onLogout
}: {
  isOpen: boolean;
  onClose: () => void;
  userSession: AdminSession;
  onLogout: () => void;
}) {
  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Profile Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-6 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-col items-center text-center mt-8">
            <Avatar className="h-24 w-24 ring-4 ring-white/30 shadow-xl mb-4">
              <AvatarImage src={userSession.user.photoURL || undefined} />
              <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                {getInitials(userSession.user.username || userSession.user.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-white mb-1">
              {userSession.user.username || 'User'}
            </h2>
            <Badge className={`${getRoleBadgeColor(userSession.user.role)} hover:bg-white/30 font-semibold`}>
              {getRoleDisplayName(userSession.user.role)}
            </Badge>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-280px)]">
          {/* User Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Account Information
            </h3>
            
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">Email Address</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userSession.user.email}
                  </p>
                </div>
              </div>
              
              {/* Organization */}
              {userSession.user.organizationName && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-1">Organization</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {userSession.user.organizationName}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Role */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">Role</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {getRoleDisplayName(userSession.user.role)}
                  </p>
                </div>
              </div>
              
              {/* Member Since */}
              {userSession.user.createdAt && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-1">Member Since</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(userSession.user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Permissions Section */}
          {userSession.permissions && userSession.permissions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Permissions
              </h3>
              <div className="flex flex-wrap gap-2">
                {userSession.permissions.map((permission) => (
                  <Badge
                    key={permission}
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {permission.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer with Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50 border-t border-gray-200">
          <Button
            onClick={onLogout}
            className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}

function SidebarUserFooter({
  userSession,
  onLogout,
  onProfileClick
}: {
  userSession: AdminSession;
  onLogout: () => void;
  onProfileClick: () => void;
}) {
  const { state } = useSidebar();
  
  return (
    <div className="border-t border-gray-200 p-3 bg-gray-50/50">
      <div className="flex items-center gap-3">
        <button
          onClick={onProfileClick}
          className="flex items-center gap-3 flex-1 min-w-0 hover:bg-gray-100 rounded-lg p-1 transition-colors"
        >
          <Avatar className="h-9 w-9 ring-2 ring-indigo-100 shadow-sm">
            <AvatarImage src={userSession.user.photoURL || undefined} />
            <AvatarFallback className="bg-linear-to-br from-indigo-500 to-indigo-600 text-white text-xs font-semibold">
              {getInitials(userSession.user.username || userSession.user.email || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left overflow-hidden transition-[opacity,transform] duration-500 ease-in-out max-w-48 opacity-100 translate-x-0 transform-gpu will-change-[opacity,transform] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:-translate-x-3">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userSession.user.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userSession.user.email}
            </p>
          </div>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors group-data-[collapsible=icon]:hidden"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SidebarHeaderContent() {
  return (
    <div className="flex items-center gap-3 px-4 py-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:gap-0">
      <div className="relative h-10 w-10 shrink-0 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11">
        <img src="/logo.png" alt="SwiftCause Logo" className="h-10 w-10 rounded-xl shadow-md group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11" />
        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div className="flex flex-col overflow-hidden transition-[opacity,transform] duration-500 ease-in-out max-w-48 opacity-100 translate-x-0 transform-gpu will-change-[opacity,transform] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:-translate-x-3">
        <span className="text-base font-bold text-gray-900 whitespace-nowrap">SwiftCause</span>
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          Admin Portal
        </span>
      </div>
    </div>
  );
}

export function AdminLayout({
  onNavigate,
  onLogout,
  userSession,
  hasPermission,
  children,
  activeScreen = "admin-dashboard",
  onStartTour,
  headerTitle,
  hideHeaderDivider = false,
  headerActions,
  hideSidebarTrigger = false,
}: AdminLayoutProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isActive = (...screens: Screen[]) => screens.includes(activeScreen);
  const currentLabel = SCREEN_LABELS[activeScreen] ?? "Admin";
  const resolvedHeaderTitle = headerTitle === undefined ? currentLabel : headerTitle;

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar 
        side="left" 
        variant="sidebar" 
        collapsible="icon" 
        className="bg-white border-r border-gray-200"
      >
        <SidebarHeader className="border-b border-gray-100 shrink-0">
          <SidebarHeaderContent />
        </SidebarHeader>
        
        <SidebarContent className="px-3 py-4 flex-1 overflow-y-auto group-data-[collapsible=icon]:px-0">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
              Main Menu
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onNavigate("admin")}
                  isActive={isActive("admin", "admin-dashboard")}
                  tooltip="Dashboard"
                  className={
                    isActive("admin", "admin-dashboard")
                      ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm rounded-md hover:bg-indigo-100"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                  }
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="whitespace-nowrap overflow-hidden transition-[opacity,transform] duration-500 ease-in-out max-w-48 opacity-100 translate-x-0 transform-gpu will-change-[opacity,transform] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:-translate-x-3">
                    Dashboard
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {hasPermission("view_campaigns") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onNavigate("admin-campaigns")}
                    tooltip="Campaigns"
                    isActive={isActive("admin-campaigns")}
                    className={
                      isActive("admin-campaigns")
                        ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm rounded-md hover:bg-indigo-100"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                    }
                  >
                    <Settings className="h-5 w-5" />
                    <span className="whitespace-nowrap overflow-hidden transition-[opacity,transform] duration-500 ease-in-out max-w-48 opacity-100 translate-x-0 transform-gpu will-change-[opacity,transform] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:-translate-x-3">
                      Campaigns
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {hasPermission("view_kiosks") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onNavigate("admin-kiosks")}
                    tooltip="Kiosks"
                    isActive={isActive("admin-kiosks")}
                    className={
                      isActive("admin-kiosks")
                        ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm rounded-md hover:bg-indigo-100"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                    }
                  >
                    <Monitor className="h-5 w-5" />
                    <span className="whitespace-nowrap overflow-hidden transition-[opacity,transform] duration-500 ease-in-out max-w-48 opacity-100 translate-x-0 transform-gpu will-change-[opacity,transform] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:-translate-x-3">
                      Kiosks
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {hasPermission("view_donations") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onNavigate("admin-donations")}
                    tooltip="Donations"
                    isActive={isActive("admin-donations")}
                    className={
                      isActive("admin-donations")
                        ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm rounded-md hover:bg-indigo-100"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                    }
                  >
                    <Database className="h-5 w-5" />
                    <span className="whitespace-nowrap overflow-hidden transition-[opacity,transform] duration-500 ease-in-out max-w-48 opacity-100 translate-x-0 transform-gpu will-change-[opacity,transform] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:-translate-x-3">
                      Donations
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {hasPermission("view_donations") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onNavigate("admin-gift-aid")}
                    tooltip="Gift Aid Donations"
                    isActive={isActive("admin-gift-aid")}
                    className={
                      isActive("admin-gift-aid")
                        ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm rounded-md hover:bg-indigo-100"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                    }
                  >
                    <Gift className="h-5 w-5" />
                    <span className="whitespace-nowrap overflow-hidden transition-[opacity,transform] duration-500 ease-in-out max-w-48 opacity-100 translate-x-0 transform-gpu will-change-[opacity,transform] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:-translate-x-3">
                      Gift Aid Donations
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {hasPermission("view_users") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onNavigate("admin-users")}
                    tooltip="Users"
                    isActive={isActive("admin-users")}
                    className={
                      isActive("admin-users")
                        ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm rounded-md hover:bg-indigo-100"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                    }
                  >
                    <Users className="h-5 w-5" />
                    <span className="whitespace-nowrap overflow-hidden transition-[opacity,transform] duration-500 ease-in-out max-w-48 opacity-100 translate-x-0 transform-gpu will-change-[opacity,transform] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:-translate-x-3">
                      Users
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onNavigate("admin-bank-details")}
                  tooltip="Bank Details"
                  isActive={isActive("admin-bank-details")}
                  className={
                    isActive("admin-bank-details")
                      ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm rounded-md hover:bg-indigo-100"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                  }
                >
                  <Wallet className="h-5 w-5" />
                  <span className="whitespace-nowrap overflow-hidden transition-[opacity,transform] duration-500 ease-in-out max-w-48 opacity-100 translate-x-0 transform-gpu will-change-[opacity,transform] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:-translate-x-3">
                    Bank Details
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="mt-auto shrink-0">
          <SidebarUserFooter 
            userSession={userSession}
            onLogout={onLogout}
            onProfileClick={() => setIsProfileOpen(true)}
          />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex-1 flex flex-col overflow-hidden relative">
        <header
          className={`absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm ${
            hideHeaderDivider ? "" : "border-b border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              {!hideSidebarTrigger && (
                <>
                  <SidebarTrigger className="text-gray-600 hover:text-gray-900" />
                  <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                </>
              )}
              {resolvedHeaderTitle !== null && (
                typeof resolvedHeaderTitle === "string" ? (
                  <h1 className="font-bold text-lg text-gray-900">{resolvedHeaderTitle}</h1>
                ) : (
                  resolvedHeaderTitle
                )
              )}
            </div>
            
            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {headerActions}
              {/* Get a Tour Button */}
              {onStartTour && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStartTour}
                  className="hidden sm:flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors animate-pulse"
                >
                  <Compass className="h-4 w-4" />
                  <span className="font-medium">Get a Tour</span>
                </Button>
              )}
              
              {/* Profile Icon in Header */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsProfileOpen(true)}
                className="h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
                title="View Profile"
              >
                <Avatar className="h-8 w-8 ring-2 ring-gray-200 hover:ring-blue-300 transition-all">
                  <AvatarImage src={userSession.user.photoURL || undefined} />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold">
                    {getInitials(userSession.user.username || userSession.user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </header>
        
        <main
          className="flex-1 w-full bg-slate-50 overflow-y-auto overflow-x-hidden pt-16"
          data-testid="main-content-area"
        >
          {children}
        </main>
      </SidebarInset>

      {/* Profile Sidebar */}
      <ProfileSidebar
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userSession={userSession}
        onLogout={onLogout}
      />
    </SidebarProvider>
  );
}
