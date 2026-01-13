"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../../shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../shared/ui/avatar";
import { SidebarTrigger } from "../../../shared/ui/sidebar";
import { Compass, Heart } from "lucide-react";

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
  const [floatingParticles, setFloatingParticles] = useState<
    Array<{
      id: number;
      left: number;
      size: number;
      duration: number;
      delay: number;
    }>
  >([]);
  const timeoutIds = useRef<number[]>([]);

  useEffect(() => {
    const generateParticle = () => {
      const newParticle = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        size: Math.random() * 20 + 15,
        duration: Math.random() * 5 + 8,
        delay: 0,
      };

      setFloatingParticles((prev) => [...prev, newParticle]);
      const removalId = window.setTimeout(() => {
        setFloatingParticles((prev) =>
          prev.filter((particle) => particle.id !== newParticle.id),
        );
      }, newParticle.duration * 1000);
      timeoutIds.current.push(removalId);
    };

    for (let i = 0; i < 8; i += 1) {
      const burstId = window.setTimeout(() => generateParticle(), i * 600);
      timeoutIds.current.push(burstId);
    }

    const intervalId = window.setInterval(() => {
      generateParticle();
    }, 1500);

    return () => {
      window.clearInterval(intervalId);
      timeoutIds.current.forEach((id) => window.clearTimeout(id));
      timeoutIds.current = [];
    };
  }, []);

  const renderTitle = () => {
    if (title === null) return null;
    if (typeof title === "string") {
      return (
        <div className="header-title-row">
          <h1 className="header-title text-gray-900">
            <span className="header-title-text">{title}</span>
          </h1>
        </div>
      );
    }
    return <div className="header-title-row">{title}</div>;
  };

  const renderSubtitle = () => {
    if (!subtitle) {
      return <p className="header-subtitle header-subtitle-placeholder">Placeholder</p>;
    }
    if (typeof subtitle === "string") {
      return <p className="header-subtitle text-gray-600">{subtitle}</p>;
    }
    return subtitle;
  };

  return (
    <>
      <style>{`
        .header-shell {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          background: linear-gradient(120deg, #FFFFFF 0%, #F0FDF4 55%, #ECFEFF 100%);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
        }
        .header-shell::before {
          content: "";
          position: absolute;
          right: -70px;
          top: -90px;
          width: 240px;
          height: 240px;
          background: radial-gradient(circle at center, rgba(34, 197, 94, 0.18) 0%, rgba(34, 197, 94, 0) 65%);
        }
        .header-shell::after {
          content: "";
          position: absolute;
          left: -60px;
          bottom: -80px;
          width: 220px;
          height: 220px;
          background: radial-gradient(circle at center, rgba(14, 116, 144, 0.16) 0%, rgba(14, 116, 144, 0) 70%);
        }
        .header-content {
          position: relative;
          z-index: 1;
        }
        .header-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .header-title {
          font-size: 1.9rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .header-title-text {
          position: relative;
          display: inline-block;
          padding-bottom: 6px;
        }
        .header-title-text::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(90deg, #22C55E, #16A34A, #0EA5A4);
          background-size: 160% 100%;
          animation: headerUnderline 3s ease-in-out infinite;
          box-shadow: 0 8px 16px rgba(34, 197, 94, 0.2);
        }
        @keyframes headerUnderline {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .header-subtitle {
          font-size: 0.95rem;
          line-height: 1.4;
          border-left: 3px solid rgba(34, 197, 94, 0.5);
          padding-left: 12px;
          margin-top: 4px;
        }
        .header-subtitle-placeholder {
          visibility: hidden;
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
      <div className="header-shell">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floatingParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute bottom-0 animate-float-particle"
              style={{
                left: `${particle.left}%`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
              }}
            >
              <Heart
                className="text-green-400 fill-green-400 opacity-60"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))",
                }}
              />
            </div>
          ))}
        </div>
        <div className="header-content flex w-full items-center justify-between gap-4 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-center gap-3 min-w-0">
            {showSidebarTrigger && (
              <SidebarTrigger className="h-10 w-10 rounded-lg border border-green-100 bg-white/80 text-green-700 hover:bg-green-50 hover:text-green-800 shadow-sm transition-colors" />
            )}
            <div className="flex flex-col gap-1 min-w-0">
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
            {(profileSlot || userInitials) && (
              <div className="hidden sm:block h-7 w-px bg-green-200/70" />
            )}
            {profileSlot ? (
              profileSlot
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
