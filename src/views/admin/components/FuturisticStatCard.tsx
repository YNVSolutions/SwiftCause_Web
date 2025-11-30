"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FuturisticStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  loading?: boolean;
}

export function FuturisticStatCard({ 
  title, 
  value, 
  icon: Icon, 
  gradient,
  loading = false 
}: FuturisticStatCardProps) {
  return (
    <div className="relative group h-full">
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full">
        {/* Subtle gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />
        
        {/* Top corner accent */}
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full`} />
        
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider truncate">
                {title}
              </p>
            </div>
            
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {value}
                </p>
                <div className={`h-1 w-12 bg-gradient-to-r ${gradient} rounded-full`} />
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom subtle border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>
    </div>
  );
}
