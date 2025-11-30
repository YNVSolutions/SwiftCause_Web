"use client";

import React from 'react';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { LucideIcon, ArrowLeft } from 'lucide-react';

interface FuturisticPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconGradient?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
  };
  actions?: React.ReactNode;
  onBack?: () => void;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: LucideIcon;
  }>;
}

export function FuturisticPageHeader({
  title,
  description,
  icon: Icon,
  iconGradient = 'from-indigo-500 to-purple-600',
  badge,
  actions,
  onBack,
  stats,
}: FuturisticPageHeaderProps) {
  const getBadgeClasses = (variant?: string) => {
    switch (variant) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white border-0';
      default:
        return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0';
    }
  };

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden mb-6">
      {/* Gradient top accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${iconGradient}`} />
      
      <div className="px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="flex-shrink-0 border-gray-300 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            <div className="relative flex-shrink-0">
              <div className={`absolute inset-0 bg-gradient-to-br ${iconGradient} rounded-xl blur opacity-40`} />
              <div className={`relative h-14 w-14 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg`}>
                <Icon className="h-7 w-7 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {title}
                </h1>
                {badge && (
                  <Badge className={`${getBadgeClasses(badge.variant)} px-3 py-1`}>
                    {badge.text}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                {description}
              </p>
            </div>
          </div>

          {/* Right Section - Actions */}
          {actions && (
            <div className="flex items-center gap-2 flex-wrap">
              {actions}
            </div>
          )}
        </div>

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                {stat.icon && (
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${iconGradient} bg-opacity-10 flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Bottom gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
    </div>
  );
}
