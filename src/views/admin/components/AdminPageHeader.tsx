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
  userPhotoUrl,
  userInitials,
}: AdminPageHeaderProps) {
  const renderTitle = () => {
    if (title === null) return null;
    if (typeof title === "string") {
      return <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>;
    }
    return title;
  };

  const renderSubtitle = () => {
    if (!subtitle) return null;
    if (typeof subtitle === "string") {
      return <p className="text-sm text-gray-500">{subtitle}</p>;
    }
    return subtitle;
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {showSidebarTrigger && (
          <>
            <SidebarTrigger className="text-gray-600 hover:text-gray-900" />
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
          </>
        )}
        <div className="flex flex-col leading-tight">
          {renderTitle()}
          {renderSubtitle()}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actions}
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onProfileClick}
          className="h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
          title="View Profile"
        >
          <Avatar className="h-8 w-8 ring-2 ring-gray-200 hover:ring-blue-300 transition-all">
            <AvatarImage src={userPhotoUrl || undefined} />
            <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </>
  );
}
