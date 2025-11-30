"use client";

import React from 'react';
import { Badge } from '../../../shared/ui/badge';
import { Heart, TrendingUp, Settings, Activity as ActivityIcon } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  kioskId?: string;
}

interface FuturisticActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "donation":
      return <Heart className="w-4 h-4 text-green-600" />;
    case "campaign":
      return <TrendingUp className="w-4 h-4 text-blue-600" />;
    case "kiosk":
      return <Settings className="w-4 h-4 text-orange-600" />;
    default:
      return <ActivityIcon className="w-4 h-4 text-gray-600" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "donation":
      return "from-green-50 to-emerald-50 border-green-100";
    case "campaign":
      return "from-blue-50 to-indigo-50 border-blue-100";
    case "kiosk":
      return "from-orange-50 to-red-50 border-orange-100";
    default:
      return "from-gray-50 to-slate-50 border-gray-100";
  }
};

export function FuturisticActivityFeed({ activities, loading = false }: FuturisticActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse border border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <ActivityIcon className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-lg font-medium text-gray-700 mb-2">No Recent Activity</p>
        <p className="text-sm text-gray-500">Activity will appear here as it happens</p>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-green-50/10 via-emerald-50/5 to-teal-50/10 rounded-b-lg p-6">
      <div className="relative space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar-light">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`relative group bg-gradient-to-r ${getActivityColor(activity.type)} rounded-lg p-4 border hover:shadow-sm transition-all duration-300`}
          >
            {index < activities.length - 1 && (
              <div className="absolute left-6 top-12 w-px h-6 bg-gradient-to-b from-gray-300 to-transparent" />
            )}
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5 relative">
                <div className="h-8 w-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center relative z-10 shadow-sm">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 break-words leading-relaxed font-medium">
                  {activity.message}
                </p>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <p className="text-xs text-gray-500">
                    {activity.timestamp}
                  </p>
                  {activity.kioskId && (
                    <Badge variant="secondary" className="text-xs bg-white/80 text-gray-700 border-gray-200">
                      {activity.kioskId}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
