"use client";

import React from "react";
import { Screen, AdminSession, Permission } from "../../shared/types";
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
  SidebarSeparator,
  SidebarInset,
  SidebarTrigger,
} from "../../shared/ui/sidebar";
import { Button } from "../../shared/ui/button";
import { Badge } from "../../shared/ui/badge";
import {
  LayoutDashboard,
  Settings,
  Monitor,
  Database,
  Users,
  LogOut,
} from "lucide-react";

const SCREEN_LABELS: Partial<Record<Screen, string>> = {
  admin: "Dashboard",
  "admin-dashboard": "Dashboard",
  "admin-campaigns": "Campaigns",
  "admin-kiosks": "Kiosks",
  "admin-donations": "Donations",
  "admin-users": "Users",
};

interface AdminLayoutProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
  children: React.ReactNode;
  activeScreen?: Screen;
}

export function AdminLayout({
  onNavigate,
  onLogout,
  userSession,
  hasPermission,
  children,
  activeScreen = "admin-dashboard",
}: AdminLayoutProps) {
  const isActive = (...screens: Screen[]) => screens.includes(activeScreen);
  const currentLabel = SCREEN_LABELS[activeScreen] ?? "Admin";

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="offcanvas" className="bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 border-r border-gray-200">
        <SidebarHeader>
          <div className="relative p-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg blur opacity-50" />
                <img src="/logo.png" alt="Logo" className="relative h-10 w-10 rounded-lg shadow-lg" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">SwiftCause</span>
                <span className="text-xs text-gray-600 font-medium">
                  {userSession.user.username}
                </span>
              </div>
            </div>
            {/* Decorative line */}
            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              Navigation
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onNavigate("admin")}
                  isActive={isActive("admin", "admin-dashboard")}
                  tooltip="Dashboard"
                  className={
                    isActive("admin", "admin-dashboard")
                      ? "relative bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600 text-indigo-700 font-semibold shadow-sm hover:shadow-md transition-all"
                      : "hover:bg-white hover:shadow-sm transition-all text-gray-700 hover:text-indigo-600"
                  }
                >
                  <LayoutDashboard className={isActive("admin", "admin-dashboard") ? "text-indigo-600" : ""} />
                  <span>Dashboard</span>
                  {isActive("admin", "admin-dashboard") && (
                    <div className="absolute right-2 w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                  )}
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
                        ? "relative bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600 text-purple-700 font-semibold shadow-sm hover:shadow-md transition-all"
                        : "hover:bg-white hover:shadow-sm transition-all text-gray-700 hover:text-purple-600"
                    }
                  >
                    <Settings className={isActive("admin-campaigns") ? "text-purple-600" : ""} />
                    <span>Campaigns</span>
                    {isActive("admin-campaigns") && (
                      <div className="absolute right-2 w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                    )}
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
                        ? "relative bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-600 text-cyan-700 font-semibold shadow-sm hover:shadow-md transition-all"
                        : "hover:bg-white hover:shadow-sm transition-all text-gray-700 hover:text-cyan-600"
                    }
                  >
                    <Monitor className={isActive("admin-kiosks") ? "text-cyan-600" : ""} />
                    <span>Kiosks</span>
                    {isActive("admin-kiosks") && (
                      <div className="absolute right-2 w-2 h-2 bg-cyan-600 rounded-full animate-pulse" />
                    )}
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
                        ? "relative bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 text-green-700 font-semibold shadow-sm hover:shadow-md transition-all"
                        : "hover:bg-white hover:shadow-sm transition-all text-gray-700 hover:text-green-600"
                    }
                  >
                    <Database className={isActive("admin-donations") ? "text-green-600" : ""} />
                    <span>Donations</span>
                    {isActive("admin-donations") && (
                      <div className="absolute right-2 w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                    )}
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
                        ? "relative bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-600 text-orange-700 font-semibold shadow-sm hover:shadow-md transition-all"
                        : "hover:bg-white hover:shadow-sm transition-all text-gray-700 hover:text-orange-600"
                    }
                  >
                    <Users className={isActive("admin-users") ? "text-orange-600" : ""} />
                    <span>Users</span>
                    {isActive("admin-users") && (
                      <div className="absolute right-2 w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator className="my-4 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </SidebarContent>
        
        <SidebarFooter>
          <div className="p-3 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Badge 
                variant="secondary" 
                className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200 font-semibold"
              >
                {userSession.user.role}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout} 
              className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="h-4 w-4 mr-2" /> 
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="overflow-x-hidden">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-3 sm:px-4 h-14 sm:h-16 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <SidebarTrigger className="hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex-shrink-0" />
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full flex-shrink-0" />
                <span className="font-bold text-gray-900 text-base sm:text-lg truncate">{currentLabel}</span>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-700 whitespace-nowrap">System Online</span>
            </div>
            
            {/* Mobile status indicator */}
            <div className="sm:hidden flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded-full flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
          
          {/* Bottom gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        </header>
        
        <div className="flex-1 w-full max-w-full overflow-x-hidden bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
          <div className="px-3 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 w-full max-w-full">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


