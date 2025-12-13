"use client";

import React from "react";
import { Screen, AdminSession, Permission } from "../../shared/types";
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
  SidebarSeparator,
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
} from "lucide-react";

const SCREEN_LABELS: Partial<Record<Screen, string>> = {
  admin: "Dashboard",
  "admin-dashboard": "Dashboard",
  "admin-campaigns": "Campaigns",
  "admin-kiosks": "Kiosks",
  "admin-donations": "Donations",
  "admin-gift-aid": "Gift Aid Donations",
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

function SidebarHeaderContent({ userSession }: { userSession: AdminSession }) {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-md" />
      {isExpanded && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold">SwiftCause Admin</span>
          <span className="text-xs text-gray-500 truncate">
            {userSession.user.username}
          </span>
        </div>
      )}
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
}: AdminLayoutProps) {
  const isActive = (...screens: Screen[]) => screens.includes(activeScreen);
  const currentLabel = SCREEN_LABELS[activeScreen] ?? "Admin";

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="bg-white border-r">
        <SidebarHeader>
          <SidebarHeaderContent userSession={userSession} />
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
              {hasPermission("view_donations") && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onNavigate("admin-gift-aid")}
                    tooltip="Gift Aid Donations"
                    isActive={isActive("admin-gift-aid")}
                    className={isActive("admin-gift-aid") ? "border-l-4 border-indigo-600 bg-sidebar-accent" : ""}
                  >
                    <Gift />
                    <span>Gift Aid Donations</span>
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
        </SidebarContent>
        <SidebarFooter className="p-3">
          <Button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            size="sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="overflow-x-hidden">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
          <div className="flex items-center justify-between px-3 h-14">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="font-semibold text-sm sm:text-base">{currentLabel}</span>
            </div>
          </div>
        </header>
        <div
          className="flex-1 w-full bg-slate-50 overflow-x-hidden"
          data-testid="main-content-area"
        >
          <div
            className="w-full max-w-full transition-all duration-200"
            style={{
              paddingLeft: 0,
              paddingRight: 0,
            }}
            data-slot="main-content-inner"
          >
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


