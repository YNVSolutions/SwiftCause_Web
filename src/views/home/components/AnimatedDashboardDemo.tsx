'use client'

import { useState, useEffect } from 'react';
import { TrendingUp, Heart, Users, Zap, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

export function AnimatedDashboardDemo() {
  const [totalRaised, setTotalRaised] = useState(145.39);
  const [campaigns, setCampaigns] = useState(75);
  const [donations, setDonations] = useState(76);
  const [giftAid, setGiftAid] = useState(7.23);
  const [activeMetric, setActiveMetric] = useState(0);

  // Animate numbers
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalRaised(prev => prev + Math.random() * 5);
      setDonations(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      setGiftAid(prev => prev + Math.random() * 0.5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Cycle through metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric(prev => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#064e3b]/5 rounded-full blur-3xl"></div>
      <div className="relative glass-card border border-white p-6 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="bg-white rounded-2xl overflow-hidden shadow-inner border border-slate-100">
          {/* Mac Window Header */}
          <div className="h-10 bg-slate-50 border-b flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          
          {/* Mini Dashboard Content */}
          <div className="flex h-[480px]">
            {/* Sidebar */}
            <div className="w-40 bg-[#064e3b] p-4 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Image 
                    src="/logo.png" 
                    alt="Logo" 
                    width={20} 
                    height={20}
                    className="rounded"
                  />
                  <div className="text-white text-xs font-bold">SwiftCause</div>
                </div>
                <div className="text-[8px] text-white/60">Admin Portal</div>
              </div>
              
              <div className="space-y-1 flex-1">
                <div className="px-2 py-1.5 bg-white/10 rounded text-white text-[10px] font-medium">
                  Dashboard
                </div>
                <div className="px-2 py-1.5 text-white/60 text-[10px] font-medium">
                  Campaigns
                </div>
                <div className="px-2 py-1.5 text-white/60 text-[10px] font-medium">
                  Donations
                </div>
                <div className="px-2 py-1.5 text-white/60 text-[10px] font-medium">
                  Kiosks
                </div>
                <div className="px-2 py-1.5 text-white/60 text-[10px] font-medium">
                  Users
                </div>
                <div className="px-2 py-1.5 text-white/60 text-[10px] font-medium">
                  Gift Aid
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 bg-[#F7F6F2] p-4 overflow-hidden">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-[#064e3b]">Dashboard</h3>
                <p className="text-[8px] text-slate-500">Real-time view of fundraising activity</p>
              </div>
              
              {/* Animated Stats Cards */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className={`bg-white rounded-lg p-2 border transition-all duration-300 ${
                  activeMetric === 0 ? 'border-emerald-500 shadow-lg scale-105' : 'border-slate-100'
                }`}>
                  <div className="text-[8px] text-slate-500 mb-1 flex items-center justify-between">
                    <span>TOTAL RAISED</span>
                    {activeMetric === 0 && <ArrowUpRight className="w-2 h-2 text-emerald-600 animate-bounce" />}
                  </div>
                  <div className="text-sm font-bold text-[#064e3b]">£{totalRaised.toFixed(2)}</div>
                  {activeMetric === 0 && (
                    <div className="text-[7px] text-emerald-600 mt-1">+12.5% today</div>
                  )}
                </div>
                
                <div className={`bg-white rounded-lg p-2 border transition-all duration-300 ${
                  activeMetric === 1 ? 'border-blue-500 shadow-lg scale-105' : 'border-slate-100'
                }`}>
                  <div className="text-[8px] text-slate-500 mb-1 flex items-center justify-between">
                    <span>CAMPAIGNS</span>
                    {activeMetric === 1 && <Heart className="w-2 h-2 text-blue-600 animate-pulse" />}
                  </div>
                  <div className="text-sm font-bold text-[#064e3b]">{campaigns}</div>
                  {activeMetric === 1 && (
                    <div className="text-[7px] text-blue-600 mt-1">23 active</div>
                  )}
                </div>
                
                <div className={`bg-white rounded-lg p-2 border transition-all duration-300 ${
                  activeMetric === 2 ? 'border-purple-500 shadow-lg scale-105' : 'border-slate-100'
                }`}>
                  <div className="text-[8px] text-slate-500 mb-1 flex items-center justify-between">
                    <span>DONATIONS</span>
                    {activeMetric === 2 && <Users className="w-2 h-2 text-purple-600 animate-pulse" />}
                  </div>
                  <div className="text-sm font-bold text-[#064e3b]">{donations}</div>
                  {activeMetric === 2 && (
                    <div className="text-[7px] text-purple-600 mt-1">3 this hour</div>
                  )}
                </div>
                
                <div className={`bg-white rounded-lg p-2 border transition-all duration-300 ${
                  activeMetric === 3 ? 'border-amber-500 shadow-lg scale-105' : 'border-slate-100'
                }`}>
                  <div className="text-[8px] text-slate-500 mb-1 flex items-center justify-between">
                    <span>GIFT AID</span>
                    {activeMetric === 3 && <Zap className="w-2 h-2 text-amber-600 animate-bounce" />}
                  </div>
                  <div className="text-sm font-bold text-[#064e3b]">£{giftAid.toFixed(2)}</div>
                  {activeMetric === 3 && (
                    <div className="text-[7px] text-amber-600 mt-1">+25% boost</div>
                  )}
                </div>
              </div>
              
              {/* Revenue Chart with Animation */}
              <div className="bg-white rounded-lg p-3 border border-slate-100 mb-3">
                <div className="flex items-center gap-1 mb-2">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <h4 className="text-[10px] font-bold text-[#064e3b]">Revenue Growth</h4>
                  <div className="ml-auto">
                    <span className="text-[8px] text-emerald-600 font-semibold">↑ 24.3%</span>
                  </div>
                </div>
                <p className="text-[7px] text-slate-500 mb-3">Monthly revenue trends including Gift Aid uplift</p>
                
                {/* Animated Line Chart */}
                <div className="relative h-24 pl-8">
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="25" x2="300" y2="25" stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="#e2e8f0" strokeWidth="0.5" />
                    
                    {/* Revenue line (going up) with gradient */}
                    <defs>
                      <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#064e3b" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Area fill */}
                    <polygon
                      points="0,85 50,72 100,63 150,50 200,38 250,29 300,21 300,100 0,100"
                      fill="url(#revenueGradient)"
                      className="animate-pulse"
                      style={{ animationDuration: '3s' }}
                    />
                    
                    {/* Revenue line */}
                    <polyline
                      points="0,85 50,72 100,63 150,50 200,38 250,29 300,21"
                      fill="none"
                      stroke="#064e3b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Animated dots on line */}
                    <circle cx="300" cy="21" r="3" fill="#064e3b" className="animate-pulse" />
                    <circle cx="250" cy="29" r="2" fill="#064e3b" opacity="0.6" />
                    <circle cx="200" cy="38" r="2" fill="#064e3b" opacity="0.4" />
                    
                    {/* Donations line (dashed, going up) */}
                    <polyline
                      points="0,90 50,78 100,69 150,57 200,43 250,35 300,27"
                      fill="none"
                      stroke="#0f5132"
                      strokeWidth="1.5"
                      strokeDasharray="3,3"
                    />
                  </svg>
                  
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[7px] text-slate-400">
                    <span>£50</span>
                    <span>£40</span>
                    <span>£30</span>
                    <span>£20</span>
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[7px] text-slate-400 -mb-4">
                    <span>Dec</span>
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex gap-3 mt-5 justify-center">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-[#0f5132]"></div>
                    <span className="text-[7px] text-slate-600">Donations</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-[#064e3b]"></div>
                    <span className="text-[7px] text-slate-600">Total Revenue</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Activity Heatmap & Pie Chart */}
              <div className="grid grid-cols-2 gap-3">
                {/* Activity Heatmap with Animation */}
                <div className="bg-white rounded-lg p-3 border border-slate-100">
                  <h4 className="text-[10px] font-bold text-[#064e3b] mb-2">Activity Heatmap</h4>
                  <div className="space-y-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                      <div key={day} className="flex items-center gap-1">
                        <span className="text-[7px] text-slate-500 w-6">{day}</span>
                        <div className="flex gap-0.5 flex-1">
                          {Array.from({ length: 12 }).map((_, j) => {
                            const intensity = Math.random();
                            const bgColor = intensity > 0.7 ? 'bg-emerald-600' : 
                                           intensity > 0.5 ? 'bg-emerald-400' : 
                                           intensity > 0.3 ? 'bg-emerald-200' : 'bg-slate-100';
                            return (
                              <div 
                                key={j} 
                                className={`h-2 flex-1 rounded-sm ${bgColor} transition-all duration-500`}
                                style={{ 
                                  animationDelay: `${(i * 12 + j) * 50}ms`,
                                  animation: 'fadeIn 0.5s ease-in-out'
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[6px] text-slate-400">
                    <span>Less</span>
                    <div className="flex gap-0.5">
                      <div className="w-2 h-2 bg-slate-100 rounded-sm"></div>
                      <div className="w-2 h-2 bg-emerald-200 rounded-sm"></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-sm"></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-sm"></div>
                    </div>
                    <span>More</span>
                  </div>
                </div>

                {/* Animated Pie Chart */}
                <div className="bg-white rounded-lg p-3 border border-slate-100">
                  <h4 className="text-[10px] font-bold text-[#064e3b] mb-2">Donation Sources</h4>
                  <div className="flex items-center justify-center h-24">
                    <svg width="80" height="80" viewBox="0 0 100 100">
                      {/* Online - 60% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray="150.8 251.2"
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-1000"
                      />
                      {/* Kiosk - 30% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth="20"
                        strokeDasharray="75.4 326.6"
                        strokeDashoffset="-150.8"
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-1000"
                      />
                      {/* Events - 10% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#a855f7"
                        strokeWidth="20"
                        strokeDasharray="25.1 376.9"
                        strokeDashoffset="-226.2"
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-1000"
                      />
                    </svg>
                  </div>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center justify-between text-[7px]">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-slate-600">Online</span>
                      </div>
                      <span className="font-bold text-slate-700">60%</span>
                    </div>
                    <div className="flex items-center justify-between text-[7px]">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600">Kiosk</span>
                      </div>
                      <span className="font-bold text-slate-700">30%</span>
                    </div>
                    <div className="flex items-center justify-between text-[7px]">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-slate-600">Events</span>
                      </div>
                      <span className="font-bold text-slate-700">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
