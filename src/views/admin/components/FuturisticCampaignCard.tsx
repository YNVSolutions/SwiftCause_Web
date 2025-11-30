"use client";

import React from 'react';
import { Progress } from '../../../shared/ui/progress';
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  raised: number;
  goal: number;
  donationCount?: number;
}

interface FuturisticCampaignCardProps {
  campaign: Campaign;
  formatCurrency: (amount: number) => string;
  rank: number;
}

const RANK_COLORS = [
  { gradient: 'from-yellow-400 to-amber-500', text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { gradient: 'from-gray-300 to-gray-400', text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
  { gradient: 'from-orange-400 to-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { gradient: 'from-indigo-400 to-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
];

export function FuturisticCampaignCard({ campaign, formatCurrency, rank }: FuturisticCampaignCardProps) {
  const collected = campaign.raised || 0;
  const goal = campaign.goal || 1;
  const progressRaw = (collected / goal) * 100;
  const progress = progressRaw < 1 ? progressRaw.toFixed(2) : Math.round(progressRaw);
  const progressValue = progressRaw < 1 ? progressRaw : Math.round(progressRaw);
  
  const rankColor = RANK_COLORS[rank - 1] || RANK_COLORS[3];
  const isTopThree = rank <= 3;

  return (
    <div className="relative group">
      {/* Hover glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${rankColor.gradient} rounded-lg opacity-0 group-hover:opacity-20 blur transition duration-300`} />
      
      <div className={`relative bg-white rounded-lg border ${rankColor.border} p-4 hover:shadow-lg transition-all duration-300`}>
        <div className="flex items-start gap-4">
          {/* Rank Badge */}
          <div className={`flex-shrink-0 relative ${isTopThree ? 'w-14 h-14' : 'w-12 h-12'}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${rankColor.gradient} rounded-lg ${isTopThree ? 'animate-pulse' : ''}`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`${isTopThree ? 'text-2xl' : 'text-xl'} font-bold text-white drop-shadow-lg`}>
                #{rank}
              </span>
            </div>
            {isTopThree && (
              <div className={`absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br ${rankColor.gradient} rounded-full flex items-center justify-center border-2 border-white`}>
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Campaign Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h4 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2">
                {campaign.title}
              </h4>
              <div className={`flex-shrink-0 px-2 py-1 rounded-md ${rankColor.bg} border ${rankColor.border}`}>
                <span className={`text-xs font-bold ${rankColor.text}`}>
                  {progress}%
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className={`${rankColor.bg} rounded-lg p-2 border ${rankColor.border}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className={`w-3.5 h-3.5 ${rankColor.text}`} />
                  <span className="text-xs text-gray-600 font-medium">Raised</span>
                </div>
                <p className={`text-sm font-bold ${rankColor.text}`}>
                  {formatCurrency(collected)}
                </p>
              </div>
              
              <div className={`${rankColor.bg} rounded-lg p-2 border ${rankColor.border}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className={`w-3.5 h-3.5 ${rankColor.text}`} />
                  <span className="text-xs text-gray-600 font-medium">Donors</span>
                </div>
                <p className={`text-sm font-bold ${rankColor.text}`}>
                  {campaign.donationCount || 0}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Progress 
                  value={progressValue} 
                  className={`h-2.5 bg-gray-100 border ${rankColor.border}`}
                />
                {/* Gradient overlay on progress */}
                <div 
                  className={`absolute top-0 left-0 h-2.5 bg-gradient-to-r ${rankColor.gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(progressValue, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-600">
                  <Target className="w-3 h-3" />
                  <span>Goal: {formatCurrency(goal)}</span>
                </div>
                <span className={`font-semibold ${rankColor.text}`}>
                  {formatCurrency(goal - collected)} to go
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${rankColor.gradient} rounded-b-lg`} />
      </div>
    </div>
  );
}
