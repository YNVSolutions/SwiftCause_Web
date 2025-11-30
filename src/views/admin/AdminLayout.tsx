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
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="bg-white border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-md" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">SwiftCause Admin</span>
              <span className="text-xs text-gray-500 truncate">
                {userSession.user.username}
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onNavigate("admin")}
                  isActive={isActive("admin", "admin-dashboard")}
                  tooltip="Dashboard"
                  className={isActive("admin", "admin-dashboard") ? "border-l-4 border-indigo-600 bg-sidebar-accent" : ""}
                >
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {hasPermission("view_campaigns") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onNavigate("admin-campaigns")}
                    tooltip="Campaigns"
                    isActive={isActive("admin-campaigns")}
                    className={isActive("admin-campaigns") ? "border-l-4 border-indigo-600 bg-sidebar-accent" : ""}
                  >
                    <Settings />
                    <span>Campaigns</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasPermission("view_kiosks") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onNavigate("admin-kiosks")}
                    tooltip="Kiosks"
                    isActive={isActive("admin-kiosks")}
                    className={isActive("admin-kiosks") ? "border-l-4 border-indigo-600 bg-sidebar-accent" : ""}
                  >
                    <Monitor />
                    <span>Kiosks</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasPermission("view_donations") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onNavigate("admin-donations")}
                    tooltip="Donations"
                    isActive={isActive("admin-donations")}
                    className={isActive("admin-donations") ? "border-l-4 border-indigo-600 bg-sidebar-accent" : ""}
                  >
                    <Database />
                    <span>Donations</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasPermission("view_users") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onNavigate("admin-users")}
                    tooltip="Users"
                    isActive={isActive("admin-users")}
                    className={isActive("admin-users") ? "border-l-4 border-indigo-600 bg-sidebar-accent" : ""}
                  >
                    <Users />
                    <span>Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 py-2 flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {userSession.user.role}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-600">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="overflow-x-hidden">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
          <div className="flex items-center justify-between px-3 h-14">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="lg:hidden" />
              <span className="font-semibold text-sm sm:text-base">{currentLabel}</span>
            </div>
          </div>
        </header>
        <div className="flex-1 w-full bg-slate-50 overflow-x-hidden">
          <div className="px-2 sm:px-4 lg:px-6 py-4 sm:py-6 w-full max-w-full">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


