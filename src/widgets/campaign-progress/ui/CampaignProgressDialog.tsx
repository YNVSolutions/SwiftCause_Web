import React, { useState } from 'react';
import { X, Target, TrendingUp, Search, Filter, CheckCircle2, AlertCircle, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { CampaignProgress, sortCampaignProgress } from '../lib/progressCalculations';

interface CampaignProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: CampaignProgress[];
  onCampaignClick?: (campaignId: string) => void;
  formatCurrency?: (amount: number) => string;
}

export const CampaignProgressDialog: React.FC<CampaignProgressDialogProps> = ({
  isOpen,
  onClose,
  campaigns,
  onCampaignClick,
  formatCurrency = (amount) => `£${amount.toLocaleString()}`,
}) => {
  type FilterStatus = 'all' | CampaignProgress['status'];
  const [sortBy, setSortBy] = useState<'progress' | 'raised' | 'goal' | 'name'>('progress');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedCampaigns = sortCampaignProgress(filteredCampaigns, sortBy);

  // Calculate summary stats
  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalGoal = campaigns.reduce((sum, c) => sum + c.goal, 0);
  const overallProgress = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;
  const completedCount = campaigns.filter((c) => c.status === 'completed').length;
  const criticalCount = campaigns.filter((c) => c.status === 'critical').length;

  const getStatusIcon = (status: CampaignProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'good':
        return <TrendingUp className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: CampaignProgress['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'good':
        return 'On Track';
      case 'warning':
        return 'Needs Attention';
      case 'critical':
        return 'Critical';
    }
  };

  const handleSort = () => {
    const sortOrder: Array<'progress' | 'raised' | 'goal' | 'name'> = ['progress', 'raised', 'goal', 'name'];
    const currentIndex = sortOrder.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOrder.length;
    setSortBy(sortOrder[nextIndex]);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'progress':
        return 'Progress %';
      case 'raised':
        return 'Amount Raised';
      case 'goal':
        return 'Goal Amount';
      case 'name':
        return 'Name';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Campaign Progress Overview</h2>
              <p className="text-sm text-gray-600">Detailed view of all campaign goals and progress</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                <div className="text-xs font-medium text-blue-900 mb-2">Total Campaigns</div>
                <p className="text-3xl font-bold text-blue-900">{campaigns.length}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-5 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-900 mb-2">Overall Progress</div>
                <p className="text-3xl font-bold text-emerald-900">{overallProgress}%</p>
                <p className="text-xs text-emerald-700 mt-1">
                  {formatCurrency(totalRaised)} / {formatCurrency(totalGoal)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200">
                <div className="text-xs font-medium text-purple-900 mb-2">Completed</div>
                <p className="text-3xl font-bold text-purple-900">{completedCount}</p>
                <p className="text-xs text-purple-700 mt-1">
                  {campaigns.length > 0 ? Math.round((completedCount / campaigns.length) * 100) : 0}% of total
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-5 border border-red-200">
                <div className="text-xs font-medium text-red-900 mb-2">Need Attention</div>
                <p className="text-3xl font-bold text-red-900">{criticalCount}</p>
                <p className="text-xs text-red-700 mt-1">Critical campaigns</p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="good">On Track</option>
                  <option value="warning">Needs Attention</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Sort */}
              <button
                onClick={handleSort}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="text-sm font-medium">Sort: {getSortLabel()}</span>
              </button>
            </div>

            {/* Campaign Cards */}
            <div className="space-y-3">
              {sortedCampaigns.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium mb-2">No campaigns found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                sortedCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`group relative ${
                      onCampaignClick ? 'cursor-pointer hover:shadow-md' : ''
                    } p-5 rounded-xl transition-all border-2 ${
                      campaign.status === 'completed'
                        ? 'border-blue-200 bg-blue-50/50'
                        : campaign.status === 'good'
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : campaign.status === 'warning'
                        ? 'border-amber-200 bg-amber-50/50'
                        : 'border-red-200 bg-red-50/50'
                    }`}
                    onClick={() => onCampaignClick?.(campaign.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={campaign.statusColor}>
                          {getStatusIcon(campaign.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-gray-900 mb-1">{campaign.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              campaign.status === 'completed'
                                ? 'bg-blue-100 text-blue-700'
                                : campaign.status === 'good'
                                ? 'bg-emerald-100 text-emerald-700'
                                : campaign.status === 'warning'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {getStatusLabel(campaign.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 ml-4">
                        <span className={`text-2xl font-bold ${campaign.statusColor}`}>
                          {campaign.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full h-3 bg-white rounded-full overflow-hidden mb-3 shadow-inner">
                      <div
                        className={`absolute top-0 left-0 h-full ${campaign.progressColor} transition-all duration-500 ease-out rounded-full`}
                        style={{ width: `${Math.min(100, campaign.percentage)}%` }}
                      >
                        {campaign.status !== 'completed' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        )}
                      </div>
                    </div>

                    {/* Amount Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Raised</div>
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(campaign.raised)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">Goal</div>
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(campaign.goal)}</div>
                      </div>
                    </div>

                    {/* Remaining amount */}
                    {campaign.status !== 'completed' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-600">
                          Remaining: <span className="font-semibold text-gray-900">{formatCurrency(campaign.goal - campaign.raised)}</span>
                        </div>
                      </div>
                    )}

                    {/* Hover indicator */}
                    {onCampaignClick && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Results count */}
            {sortedCampaigns.length > 0 && (
              <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
                Showing {sortedCampaigns.length} of {campaigns.length} campaigns
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
