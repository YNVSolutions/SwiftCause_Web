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
      return (
        <div className="header-title-row">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight leading-tight">
            <span className="header-title-text">{title}</span>
          </h1>
        </div>
      );
    }
    return <div className="header-title-row">{title}</div>;
  };

  const renderSubtitle = () => {
    if (!subtitle) return null;
    if (typeof subtitle === "string") {
      return <p className="text-sm text-gray-500 leading-snug">{subtitle}</p>;
    }
    return subtitle;
  };

  return (
    <>
      <style>{`
        .header-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .header-title-text {
          position: relative;
          display: inline-block;
          padding-bottom: 4px;
        }
        .header-title-text::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 2px;
          background: linear-gradient(90deg, #86EFAC, #22C55E, #16A34A, #22C55E, #86EFAC);
          background-size: 200% 100%;
          animation: headerUnderline 2.6s linear infinite;
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.45);
        }
        @keyframes headerUnderline {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes pulseGreen {
          0%, 100% { background-color: #F0FDF4; }
          50% { background-color: #DCFCE7; }
        }
        .header-action-group button {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          transition: box-shadow 200ms ease, transform 200ms ease, color 200ms ease;
        }
        .header-action-group button::before {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-110%);
          transition: transform 300ms ease;
          background: linear-gradient(90deg, rgba(187, 247, 208, 0.9), rgba(74, 222, 128, 0.9));
          z-index: -1;
        }
        .header-action-group button:hover::before {
          transform: translateX(0);
        }
        .header-action-group button:hover {
          animation: pulseGreen 1.2s ease-in-out infinite;
          box-shadow: 0 10px 20px rgba(22, 163, 74, 0.2);
          transform: translateY(-1px);
          color: #15803D;
        }
        .header-action-group button svg {
          transition: transform 200ms ease;
        }
        .header-action-group button:hover svg {
          transform: translateX(3px) scale(1.05);
        }
      `}</style>
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {showSidebarTrigger && (
            <SidebarTrigger className="h-10 w-10 rounded-lg border border-green-100 bg-white text-green-700 hover:bg-green-50 hover:text-green-800 shadow-sm transition-colors" />
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            {renderTitle()}
            {renderSubtitle()}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <div className="header-action-group flex items-center gap-2">
            {actions}
            {onStartTour && (
              <Button
                variant="outline"
                size="sm"
                onClick={onStartTour}
                className="hidden sm:flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition-colors"
              >
                <Compass className="h-4 w-4" />
                <span className="font-medium">Get a Tour</span>
              </Button>
            )}
          </div>
          <div className="hidden sm:block h-7 w-px bg-green-200/70" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onProfileClick}
            className="h-10 w-10 rounded-full hover:bg-green-50 transition-colors"
            title="View Profile"
          >
            <Avatar className="h-8 w-8 ring-2 ring-green-200 hover:ring-green-300 transition-all">
              <AvatarImage src={userPhotoUrl || undefined} />
              <AvatarFallback className="bg-linear-to-br from-green-600 to-emerald-600 text-white text-xs font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </>
  );
}

