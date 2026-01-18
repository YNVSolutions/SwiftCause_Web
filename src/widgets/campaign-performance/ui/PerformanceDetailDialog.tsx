import React from 'react';
import { 
  X, 
  TrendingUp, 
  Target, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Percent,
  DollarSign
} from 'lucide-react';
import { FundraisingEfficiencyGauge } from './FundraisingEfficiencyGauge';
import { Campaign } from '../../../shared/types';
import { calculatePerformanceMetrics, calculateCampaignCompletion, isCampaignWon } from '../lib/calculateMetrics';

interface PerformanceDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
}

export const PerformanceDetailDialog: React.FC<PerformanceDetailDialogProps> = ({ 
  isOpen, 
  onClose, 
  campaigns
}) => {
  if (!isOpen) return null;

  // Calculate all metrics using extracted business logic
  const metrics = calculatePerformanceMetrics(campaigns);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2">
              Performance Intelligence
            </p>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Fundraising Analysis
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-slate-50 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-3xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Big Gauge & Primary Stats */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center">
                <div className="scale-125 mb-6 origin-top">
                  <FundraisingEfficiencyGauge value={metrics.efficiencyRating} />
                </div>
                
                <div className="w-full space-y-3 mt-6">
                  <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Aggregate Goal
                    </span>
                    <span className="text-lg font-black text-slate-950">
                      £{metrics.aggregateGoal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-indigo-600/5 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      Total Collected
                    </span>
                    <span className="text-lg font-black text-indigo-600">
                      £{metrics.aggregateRaised.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-emerald-500 p-5 rounded-[2.5rem] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Trophy className="w-12 h-12" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-1">
                    Win Rate
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{metrics.winRate}%</span>
                  </div>
                  <p className="text-[9px] text-emerald-100 font-medium mt-1">
                    {metrics.wonCampaigns.length} of {campaigns.length} campaigns reached goal
                  </p>
                </div>

                <div className="bg-indigo-600 p-5 rounded-[2.5rem] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <DollarSign className="w-12 h-12" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-1">
                    Overall Funding
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{metrics.overallFundingPct}%</span>
                  </div>
                  <p className="text-[9px] text-indigo-100 font-medium mt-1">
                    Total raised vs total goals across all campaigns
                  </p>
                </div>

                <div className="bg-slate-950 p-5 rounded-[2.5rem] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Percent className="w-12 h-12" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                    Avg Completion Rate
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{metrics.avgCompletionRate}%</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium mt-1">
                    Average progress across all campaigns
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Detailed Breakdown */}
            <div className="lg:col-span-7 space-y-6 flex flex-col">
              {/* Campaign Status Bento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Won Campaigns
                  </p>
                  <h3 className="text-2xl font-black text-slate-950">{metrics.wonCampaigns.length}</h3>
                  <p className="text-[9px] font-bold text-emerald-600 mt-1">
                    Goal fully reached
                  </p>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-600/5 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Active Pursuit
                  </p>
                  <h3 className="text-2xl font-black text-slate-950">{metrics.activeCampaigns.length}</h3>
                  <p className="text-[9px] font-bold text-indigo-600 mt-1">
                    In progress funding
                  </p>
                </div>
              </div>

              {/* Campaign List */}
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="p-6 border-b border-slate-50">
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-600" /> Campaign Performance
                  </h3>
                </div>
                <div className="p-2 space-y-1 overflow-y-auto flex-1">
                  {campaigns.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <p className="text-sm font-medium">No campaigns yet</p>
                    </div>
                  ) : (
                    campaigns.map(c => {
                      const isWon = isCampaignWon(c.raised || 0, c.goal || 0);
                      const pct = calculateCampaignCompletion(c.raised || 0, c.goal || 0);
                      return (
                        <div 
                          key={c.id} 
                          className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {c.coverImageUrl ? (
                              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                <img 
                                  src={c.coverImageUrl} 
                                  alt={c.title}
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Target className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-900 leading-none mb-1 truncate">
                                {c.title}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                £{(c.raised || 0).toLocaleString()} / £{(c.goal || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <p className={`text-xs font-black ${isWon ? 'text-emerald-500' : 'text-slate-900'}`}>
                                {pct}%
                              </p>
                              <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${isWon ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                                  style={{ width: `${Math.min(100, pct)}%` }} 
                                />
                              </div>
                            </div>
                            {isWon ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-slate-200 group-hover:text-indigo-600 transition-colors" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
