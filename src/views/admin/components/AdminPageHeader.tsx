"use client";

import React from "react";
import { Button } from "../../../shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../shared/ui/avatar";
import { SidebarTrigger } from "../../../shared/ui/sidebar";
import { Compass } from "lucide-react";

interface AdminPageHeaderProps {
  title: React.ReactNode | null;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  showSidebarTrigger?: boolean;
  onStartTour?: () => void;
  onProfileClick: () => void;
  profileSlot?: React.ReactNode;
  userPhotoUrl?: string;
  userInitials: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  showSidebarTrigger = true,
  onStartTour,
  onProfileClick,
  profileSlot,
  userPhotoUrl,
  userInitials,
}: AdminPageHeaderProps) {
  const renderTitle = () => {
    if (title === null) return null;
    if (typeof title === "string") {
      return (
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight font-['Helvetica',sans-serif]">
          {title}
        </h1>
      );
    }
    return title;
  };

  const renderSubtitle = () => {
    if (!subtitle) return null;
    if (typeof subtitle === "string") {
      return <p className="text-sm text-slate-600 mt-1 font-light">{subtitle}</p>;
    }
    return subtitle;
  };

  return (
    <div className="flex w-full items-center justify-between gap-4 px-6 py-5 glass-card border-b border-[#F3F1EA]/60">
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>
      <div className="flex items-center gap-4 min-w-0">
        {showSidebarTrigger && (
          <SidebarTrigger className="h-10 w-10 rounded-2xl border border-[#F3F1EA]/60 bg-[#F7F6F2] text-slate-600 hover:bg-[#F3F1EA] hover:text-slate-800 transition-all duration-300 shadow-sm hover:shadow-md" />
        )}
        <div className="flex flex-col min-w-0">
          {renderTitle()}
          {renderSubtitle()}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
        {onStartTour && (
          <Button
            variant="outline"
            size="sm"
            onClick={onStartTour}
            className="hidden sm:flex items-center gap-2 border-[#064e3b] bg-transparent text-[#064e3b] hover:bg-[#064e3b] hover:text-stone-50 transition-all duration-300 rounded-2xl px-6 py-3 font-semibold"
          >
            <Compass className="h-4 w-4" />
            <span className="font-medium">Get a Tour</span>
          </Button>
        )}
        {(profileSlot || userInitials) && actions && (
          <div className="hidden sm:block h-6 w-px bg-[#F3F1EA]/60" />
        )}
        {profileSlot ? (
          profileSlot
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onProfileClick}
            className="h-10 w-10 rounded-full hover:bg-[#F3F1EA] transition-all duration-300"
            title="View Profile"
          >
            <Avatar className="h-8 w-8 ring-2 ring-[#F3F1EA]/60">
              <AvatarImage src={userPhotoUrl || undefined} />
              <AvatarFallback className="bg-[#064e3b] text-white text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        )}
      </div>
    </div>
  );
}
