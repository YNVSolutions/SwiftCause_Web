"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface FuturisticLineChartProps {
  data: any[];
  formatValue?: (value: number) => string;
}

export function FuturisticLineChart({ data, formatValue }: FuturisticLineChartProps) {
  return (
    <div className="relative bg-gradient-to-br from-cyan-50/20 via-blue-50/10 to-indigo-50/20 rounded-b-lg p-6">
      <div className="relative">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.2} />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E2E8F0" 
              vertical={false}
            />
            
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748B', fontSize: 12 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            
            <YAxis
              tick={{ fill: '#64748B', fontSize: 12 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              tickFormatter={formatValue}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#1E293B', fontWeight: 600, marginBottom: '8px' }}
              itemStyle={{ color: '#475569', fontSize: '13px' }}
              formatter={formatValue}
              cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }}
            />
            
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill="url(#areaGradient)"
            />
            
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{ 
                fill: '#6366F1', 
                r: 5, 
                strokeWidth: 2, 
                stroke: '#ffffff'
              }}
              activeDot={{ 
                r: 7, 
                fill: '#8B5CF6',
                stroke: '#ffffff',
                strokeWidth: 3
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-200 rounded-tr-lg opacity-50" />
      </div>
    </div>
  );
}
