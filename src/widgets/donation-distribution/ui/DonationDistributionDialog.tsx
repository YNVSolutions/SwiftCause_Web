import React, { useState } from 'react';
import { X, DollarSign, TrendingUp, Award, ArrowUpDown } from 'lucide-react';
import {
  calculateDistributionSummary,
  getHoverColor,
  estimateRangeTotal,
} from '../lib/distributionCalculations';

interface DonationDistributionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: Array<{ range: string; count: number }>;
  totalRaised: number;
  formatCurrency?: (amount: number) => string;
}

export const DonationDistributionDialog: React.FC<DonationDistributionDialogProps> = ({
  isOpen,
  onClose,
  data,
  totalRaised,
  formatCurrency = (amount) => `£${amount.toLocaleString()}`,
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'range' | 'count' | 'percentage'>('count');

  if (!isOpen) return null;

  const summary = calculateDistributionSummary(data, totalRaised);
  const maxCount = Math.max(...summary.ranges.map((r) => r.count));

  // Sort ranges based on selected criteria
  const sortedRanges = [...summary.ranges].sort((a, b) => {
    switch (sortBy) {
      case 'count':
        return b.count - a.count;
      case 'percentage':
        return b.percentage - a.percentage;
      case 'range':
      default:
        return 0; // Keep original order for range
    }
  });

  const handleSort = () => {
    const sortOrder: Array<'range' | 'count' | 'percentage'> = ['count', 'percentage', 'range'];
    const currentIndex = sortOrder.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOrder.length;
    setSortBy(sortOrder[nextIndex]);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'count':
        return 'Count';
      case 'percentage':
        return 'Percentage';
      case 'range':
        return 'Range';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Donation Distribution Analysis</h2>
              <p className="text-sm text-gray-600">Detailed breakdown by amount ranges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-blue-900">Total Donations</span>
                </div>
                <p className="text-3xl font-bold text-blue-900 mb-1">{summary.totalDonations.toLocaleString()}</p>
                <p className="text-sm text-blue-700">
                  {formatCurrency(totalRaised)} raised
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-purple-900">Most Popular</span>
                </div>
                <p className="text-3xl font-bold text-purple-900 mb-1">{summary.mostPopularRange}</p>
                <p className="text-sm text-purple-700">
                  {summary.mostPopularCount} donations ({Math.round((summary.mostPopularCount / summary.totalDonations) * 100)}%)
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-5 border border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-emerald-900">Average Donation</span>
                </div>
                <p className="text-3xl font-bold text-emerald-900 mb-1">
                  {formatCurrency(Math.round(summary.averageDonation))}
                </p>
                <p className="text-sm text-emerald-700">
                  per transaction
                </p>
              </div>
            </div>

            {/* Enhanced Bar Chart */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Distribution Chart</h3>
                <button
                  onClick={handleSort}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-white"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  Sort by: {getSortLabel()}
                </button>
              </div>
              
              <div className="relative">
                <div className="flex items-end justify-between gap-3 h-80 px-2">
                  {sortedRanges.map((range, index) => {
                    const heightPercentage = maxCount > 0 ? (range.count / maxCount) * 100 : 0;
                    const estimatedTotal = estimateRangeTotal(range.range, range.count);
                    const isHovered = hoveredBar === index;

                    return (
                      <div
                        key={`${range.range}-${index}`}
                        className="flex-1 flex flex-col items-center justify-end group relative"
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {/* Tooltip */}
                        {isHovered && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 bg-gray-900 text-white text-xs rounded-lg px-4 py-3 shadow-xl whitespace-nowrap">
                            <div className="font-semibold mb-2 text-sm">{range.range}</div>
                            <div className="space-y-1">
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-300">Count:</span>
                                <span className="font-medium">{range.count}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-300">Percentage:</span>
                                <span className="font-medium">{range.percentage}%</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-300">Est. Total:</span>
                                <span className="font-medium">{formatCurrency(Math.round(estimatedTotal))}</span>
                              </div>
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
                          style={{ height: `${heightPercentage}%`, minHeight: range.count > 0 ? '12px' : '0px' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                          
                          {range.count > 0 && heightPercentage > 20 && (
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-white font-bold text-sm">
                              {range.count}
                            </div>
                          )}
                        </div>

                        {/* Range label */}
                        <div className="mt-3 text-center">
                          <div className="text-sm font-semibold text-gray-700">
                            {range.range}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {range.percentage}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Y-axis label */}
                <div className="absolute left-0 top-0 -translate-x-full pr-3 h-full flex items-center">
                  <div className="text-sm text-gray-600 font-medium -rotate-90 whitespace-nowrap">
                    Number of Donations
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Range
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Count
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Est. Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedRanges.map((range, index) => {
                      const estimatedTotal = estimateRangeTotal(range.range, range.count);
                      return (
                        <tr key={`${range.range}-${index}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded ${range.color}`} />
                              <span className="text-sm font-medium text-gray-900">{range.range}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                            {range.count.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                            {range.percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {formatCurrency(Math.round(estimatedTotal))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">Total</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        {summary.totalDonations.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">100%</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(totalRaised)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
