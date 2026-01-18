import React, { useState } from 'react';
import { DollarSign, TrendingUp, Award } from 'lucide-react';
import {
  calculateDistributionSummary,
  getHoverColor,
  estimateRangeTotal,
} from '../lib/distributionCalculations';

interface DonationDistributionChartProps {
  data: Array<{ range: string; count: number }>;
  totalRaised: number;
  formatCurrency?: (amount: number) => string;
}

export const DonationDistributionChart: React.FC<DonationDistributionChartProps> = ({
  data,
  totalRaised,
  formatCurrency = (amount) => `£${amount.toLocaleString()}`,
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-lg font-medium mb-2">No Donation Data</p>
        <p className="text-sm">Start receiving donations to see distribution trends.</p>
      </div>
    );
  }

  const summary = calculateDistributionSummary(data, totalRaised);
  const maxCount = Math.max(...summary.ranges.map((r) => r.count));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Donations */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-blue-900">Total Donations</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{summary.totalDonations.toLocaleString()}</p>
          <p className="text-xs text-blue-700 mt-1">
            {formatCurrency(totalRaised)} raised
          </p>
        </div>

        {/* Most Popular Range */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-purple-900">Most Popular</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{summary.mostPopularRange}</p>
          <p className="text-xs text-purple-700 mt-1">
            {summary.mostPopularCount} donations
          </p>
        </div>

        {/* Average Donation */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-emerald-900">Average Donation</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">
            {formatCurrency(Math.round(summary.averageDonation))}
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            per transaction
          </p>
        </div>
      </div>

      {/* Vertical Bar Chart */}
      <div className="relative">
        <div className="flex items-end justify-between gap-2 h-64 px-2">
          {summary.ranges.map((range, index) => {
            const heightPercentage = maxCount > 0 ? (range.count / maxCount) * 100 : 0;
            const estimatedTotal = estimateRangeTotal(range.range, range.count);
            const isHovered = hoveredBar === index;

            return (
              <div
                key={range.range}
                className="flex-1 flex flex-col items-center justify-end group relative"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                    <div className="font-semibold mb-1">{range.range}</div>
                    <div className="space-y-0.5">
                      <div>Count: {range.count}</div>
                      <div>Percentage: {range.percentage}%</div>
                      <div>Est. Total: {formatCurrency(Math.round(estimatedTotal))}</div>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                      <div className="w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`w-full ${range.color} ${getHoverColor(range.color)} rounded-t-lg transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isHovered ? 'opacity-100 scale-105' : 'opacity-90'
                  }`}
                  style={{ height: `${heightPercentage}%`, minHeight: range.count > 0 ? '8px' : '0px' }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  
                  {/* Count label on bar */}
                  {range.count > 0 && heightPercentage > 15 && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white font-bold text-xs">
                      {range.count}
                    </div>
                  )}
                </div>

                {/* Range label */}
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {range.range}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {range.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis label */}
        <div className="absolute left-0 top-0 -translate-x-full pr-2 h-full flex items-center">
          <div className="text-xs text-gray-600 font-medium -rotate-90 whitespace-nowrap">
            Number of Donations
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-200" />
          <span className="text-xs text-gray-600">Lower amounts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-xs text-gray-600">Mid-range</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-700" />
          <span className="text-xs text-gray-600">Higher amounts</span>
        </div>
      </div>
    </div>
  );
};
