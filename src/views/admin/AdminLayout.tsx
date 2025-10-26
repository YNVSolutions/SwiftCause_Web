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

interface AdminLayoutProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
  children: React.ReactNode;
}

export function AdminLayout({ onNavigate, onLogout, userSession, hasPermission, children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="offcanvas" className="bg-white">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-md" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">SwiftCause Admin</span>
              <span className="text-xs text-gray-500 truncate">{userSession.user.username}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onNavigate("admin")} isActive tooltip="Dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {hasPermission("view_campaigns") && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onNavigate("admin-campaigns")} tooltip="Campaigns">
                    <Settings />
                    <span>Campaigns</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasPermission("view_kiosks") && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onNavigate("admin-kiosks")} tooltip="Kiosks">
                    <Monitor />
                    <span>Kiosks</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasPermission("view_donations") && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onNavigate("admin-donations")} tooltip="Donations">
                    <Database />
                    <span>Donations</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasPermission("view_users") && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onNavigate("admin-users")} tooltip="Users">
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
            <Badge variant="secondary" className="text-xs">{userSession.user.role}</Badge>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-600">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
          <div className="flex items-center justify-between px-3 h-14">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="font-semibold">Admin</span>
            </div>
          </div>
        </header>
        <div className="px-2 sm:px-6 lg:px-8 py-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


