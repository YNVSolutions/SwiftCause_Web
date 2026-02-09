'use client'

import { useState } from 'react';
import { PenTool, Tv, Activity, X, Heart, Zap, Plus, Layout, Menu } from 'lucide-react';
import Image from 'next/image';

export function DemoSection() {
  const [activeTab, setActiveTab] = useState<'campaign' | 'kiosk' | 'dashboard'>('campaign');

  const demoContent = {
    campaign: {
      title: "Create Campaigns in Seconds",
      description: "Build and launch fundraising campaigns instantly.",
      icon: <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    kiosk: {
      title: "Assign to Kiosk",
      description: "Connect campaigns to physical donation terminals.",
      icon: <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    dashboard: {
      title: "Admin Dashboard",
      description: "Track performance and manage your organization.",
      icon: <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  };

  return (
    <section id="demo" className="py-16 sm:py-20 md:py-24 bg-[#F3F1EA] px-4 sm:px-6 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="w-full lg:w-1/3 space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#064e3b] leading-tight">
              Simplified tools for complex goals.
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {(Object.keys(demoContent) as Array<'campaign' | 'kiosk' | 'dashboard'>).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full p-4 sm:p-5 rounded-2xl flex items-center gap-3 sm:gap-4 text-left transition-all border ${
                    activeTab === tab 
                      ? 'bg-white border-[#064e3b]/10 shadow-lg scale-[1.02]' 
                      : 'bg-transparent border-transparent hover:bg-white/50 text-slate-500'
                  }`}
                >
                  <div className={`p-2 sm:p-3 rounded-xl ${activeTab === tab ? 'bg-[#064e3b] text-white' : 'bg-slate-200'}`}>
                    {demoContent[tab].icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-sm sm:text-base ${activeTab === tab ? 'text-[#064e3b]' : 'text-slate-600'}`}>
                      {demoContent[tab].title}
                    </h4>
                    <p className="text-xs sm:text-sm opacity-80 line-clamp-1">{demoContent[tab].description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content - Demo Preview - Hidden on mobile, visible on lg+ */}
          <div className="hidden lg:block w-full lg:w-2/3 relative">
            <div className="w-full min-h-[300px] sm:min-h-[400px] p-4 sm:p-6 flex items-stretch justify-center">
              {/* Campaign Builder Demo */}
              {activeTab === 'campaign' && (
                <div className="w-full max-w-2xl flex items-center justify-center animate-fade-in">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full overflow-hidden border border-slate-200">
                    {/* Modal Header */}
                    <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Edit • Campaign</div>
                        <h3 className="text-xs sm:text-sm font-bold text-[#064e3b]">General Information</h3>
                      </div>
                      <button className="w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400">
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row">
                      {/* Sidebar - Hidden on mobile */}
                      <div className="hidden sm:block w-32 md:w-36 bg-slate-50 border-r border-slate-200 p-2 sm:p-2.5">
                        <div className="mb-2">
                          <div className="text-[8px] sm:text-[9px] font-bold text-slate-500 mb-1">Campaign</div>
                          <div className="text-[7px] sm:text-[8px] text-slate-400">Configuration</div>
                        </div>
                        <div className="space-y-1 sm:space-y-1.5">
                          <div className="px-2 sm:px-2.5 py-1.5 sm:py-2 bg-emerald-600 text-white rounded-lg font-semibold text-[9px] sm:text-[10px]">
                            BASIC INFO
                          </div>
                          <div className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-slate-600 hover:bg-white rounded-lg font-medium text-[9px] sm:text-[10px] cursor-pointer">
                            DETAILS
                          </div>
                          <div className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-slate-600 hover:bg-white rounded-lg font-medium text-[9px] sm:text-[10px] cursor-pointer">
                            MEDIA
                          </div>
                        </div>
                      </div>

                      {/* Main Form Content */}
                      <div className="flex-1 p-3 sm:p-4 overflow-y-auto max-h-[300px] sm:max-h-[400px]">
                        <div className="space-y-3 sm:space-y-3.5">
                          {/* Campaign Title */}
                          <div>
                            <label className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5 block">
                              Campaign Title
                            </label>
                            <input
                              type="text"
                              value="Warm Clothes & Meals Can Bring Back The Lost Smiles"
                              readOnly
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-[10px] sm:text-[11px] text-slate-700"
                            />
                          </div>

                          {/* Brief Overview */}
                          <div>
                            <label className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5 block">
                              Brief Overview
                            </label>
                            <textarea
                              value="Let us all join hands and support SPYM in their efforts to help those in dire need."
                              readOnly
                              rows={2}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-[10px] sm:text-[11px] text-slate-700 resize-none"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-200">
                          <button className="hidden sm:flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-[9px] sm:text-[10px] font-medium">
                            <Layout className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            SAVE DRAFT
                          </button>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none px-2 sm:px-3 py-1 sm:py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-[9px] sm:text-[10px] font-semibold">
                              CANCEL
                            </button>
                            <button className="flex-1 sm:flex-none px-2 sm:px-3 py-1 sm:py-1.5 bg-[#064e3b] text-white rounded-lg text-[9px] sm:text-[10px] font-semibold hover:bg-[#0f5132] flex items-center justify-center gap-1 sm:gap-1.5">
                              <Layout className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              UPDATE
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Kiosk Demo */}
              {activeTab === 'kiosk' && (
                <div className="w-full max-w-2xl flex items-center justify-center animate-fade-in">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full overflow-hidden border border-slate-200">
                    {/* Modal Header */}
                    <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Edit • Kiosk</div>
                        <h3 className="text-xs sm:text-sm font-bold text-[#064e3b]">Kiosk Configuration</h3>
                      </div>
                      <button className="w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400">
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row">
                      {/* Sidebar - Hidden on mobile */}
                      <div className="hidden sm:block w-32 md:w-36 bg-slate-50 border-r border-slate-200 p-2 sm:p-2.5">
                        <div className="mb-2">
                          <div className="text-[8px] sm:text-[9px] font-bold text-slate-500 mb-1">Kiosk</div>
                          <div className="text-[7px] sm:text-[8px] text-slate-400">Configuration</div>
                        </div>
                        <div className="space-y-1 sm:space-y-1.5">
                          <div className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-slate-600 hover:bg-white rounded-lg font-medium text-[9px] sm:text-[10px] cursor-pointer">
                            BASIC INFO
                          </div>
                          <div className="px-2 sm:px-2.5 py-1.5 sm:py-2 bg-emerald-600 text-white rounded-lg font-semibold text-[9px] sm:text-[10px]">
                            CAMPAIGNS
                          </div>
                          <div className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-slate-600 hover:bg-white rounded-lg font-medium text-[9px] sm:text-[10px] cursor-pointer">
                            DISPLAY
                          </div>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 p-3 sm:p-4 overflow-y-auto max-h-[300px] sm:max-h-[400px]">
                        <div className="space-y-3 sm:space-y-4">
                          {/* Available Campaigns */}
                          <div>
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                              <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-700">Available Campaigns</h4>
                              <span className="text-[9px] sm:text-[10px] text-slate-400">2</span>
                            </div>
                            
                            <div className="space-y-2">
                              {/* Campaign 1 */}
                              <div className="bg-slate-50 rounded-lg p-2 sm:p-3 flex items-center gap-2 sm:gap-3 border border-slate-200">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 truncate">
                                    Warm Clothes & Meals...
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                                    <span className="text-[8px] sm:text-[9px] text-slate-500">£12.22</span>
                                    <span className="text-[8px] sm:text-[9px] text-slate-400">•</span>
                                    <span className="text-[8px] sm:text-[9px] text-slate-500">17%</span>
                                  </div>
                                </div>
                                <button className="text-emerald-600 text-[9px] sm:text-[10px] font-semibold flex items-center gap-1">
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span className="hidden sm:inline">ASSIGN</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Display Layout */}
                          <div className="pt-3 sm:pt-4 border-t border-slate-200">
                            <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-700 mb-2 sm:mb-3">Campaign View</h4>
                            
                            <div className="mb-2 sm:mb-3">
                              <div className="text-[9px] sm:text-[10px] font-bold text-slate-600 mb-2">DISPLAY LAYOUT</div>
                              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                <div className="border-2 border-emerald-500 bg-emerald-50 rounded-lg p-2 sm:p-3 flex flex-col items-center gap-1 sm:gap-2 cursor-pointer">
                                  <Layout className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
                                  <span className="text-[8px] sm:text-[10px] font-semibold text-emerald-700">GRID</span>
                                </div>
                                <div className="border border-slate-200 bg-white rounded-lg p-2 sm:p-3 flex flex-col items-center gap-1 sm:gap-2 cursor-pointer hover:border-slate-300">
                                  <Menu className="w-4 h-4 sm:w-6 sm:h-6 text-slate-400" />
                                  <span className="text-[8px] sm:text-[10px] font-semibold text-slate-500">LIST</span>
                                </div>
                                <div className="border border-slate-200 bg-white rounded-lg p-2 sm:p-3 flex flex-col items-center gap-1 sm:gap-2 cursor-pointer hover:border-slate-300">
                                  <Tv className="w-4 h-4 sm:w-6 sm:h-6 text-slate-400" />
                                  <span className="text-[8px] sm:text-[10px] font-semibold text-slate-500">SLIDE</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dashboard Demo */}
              {activeTab === 'dashboard' && (
                <div className="w-full max-w-2xl flex items-center justify-center animate-fade-in">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full overflow-hidden border border-slate-200">
                    {/* Mac Window Header */}
                    <div className="h-8 sm:h-10 bg-slate-50 border-b flex items-center px-3 sm:px-4 gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
                    </div>
                    
                    {/* Mini Dashboard Content */}
                    <div className="flex">
                      {/* Sidebar - Hidden on mobile */}
                      <div className="hidden sm:block w-24 md:w-32 bg-[#064e3b] p-2 sm:p-3 flex flex-col">
                        <div className="mb-3 sm:mb-4">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                            <Image 
                              src="/logo.png" 
                              alt="Logo" 
                              width={14} 
                              height={14}
                              className="sm:w-4 sm:h-4 rounded"
                            />
                            <div className="text-white text-[8px] sm:text-[10px] font-bold">SwiftCause</div>
                          </div>
                          <div className="text-[6px] sm:text-[7px] text-white/60">Admin Portal</div>
                        </div>
                        
                        <div className="space-y-0.5 sm:space-y-1 flex-1">
                          <div className="px-1.5 sm:px-2 py-1 sm:py-1.5 bg-white/10 rounded text-white text-[8px] sm:text-[9px] font-medium">
                            Dashboard
                          </div>
                          <div className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-white/60 text-[8px] sm:text-[9px] font-medium">
                            Campaigns
                          </div>
                          <div className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-white/60 text-[8px] sm:text-[9px] font-medium">
                            Donations
                          </div>
                        </div>
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1 bg-[#F7F6F2] p-2 sm:p-3 overflow-hidden max-h-[300px] sm:max-h-[400px]">
                        <div className="mb-2">
                          <h3 className="text-[10px] sm:text-xs font-bold text-[#064e3b]">Dashboard</h3>
                          <p className="text-[6px] sm:text-[7px] text-slate-500">Real-time fundraising activity</p>
                        </div>
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5 mb-2">
                          <div className="bg-white rounded-lg p-1.5 border border-slate-100">
                            <div className="text-[6px] sm:text-[7px] text-slate-500 mb-0.5">RAISED</div>
                            <div className="text-[10px] sm:text-[11px] font-bold text-[#064e3b]">£145</div>
                          </div>
                          <div className="bg-white rounded-lg p-1.5 border border-slate-100">
                            <div className="text-[6px] sm:text-[7px] text-slate-500 mb-0.5">CAMPAIGNS</div>
                            <div className="text-[10px] sm:text-[11px] font-bold text-[#064e3b]">75</div>
                          </div>
                          <div className="bg-white rounded-lg p-1.5 border border-slate-100">
                            <div className="text-[6px] sm:text-[7px] text-slate-500 mb-0.5">DONATIONS</div>
                            <div className="text-[10px] sm:text-[11px] font-bold text-[#064e3b]">76</div>
                          </div>
                          <div className="bg-white rounded-lg p-1.5 border border-slate-100">
                            <div className="text-[6px] sm:text-[7px] text-slate-500 mb-0.5">GIFT AID</div>
                            <div className="text-[10px] sm:text-[11px] font-bold text-[#064e3b]">£7</div>
                          </div>
                        </div>
                        
                        <div className="text-[7px] sm:text-[8px] text-slate-500 text-center py-4">
                          View full analytics in admin panel
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0f5132]/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#064e3b]/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
