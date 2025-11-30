"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface FuturisticBarChartProps {
  data: any[];
  formatValue?: (value: number) => string;
}

const GRADIENT_COLORS = [
  { start: '#6366F1', end: '#8B5CF6' },
  { start: '#10B981', end: '#06B6D4' },
  { start: '#F59E0B', end: '#F97316' },
  { start: '#EC4899', end: '#8B5CF6' },
  { start: '#14B8A6', end: '#10B981' },
];

export function FuturisticBarChart({ data, formatValue }: FuturisticBarChartProps) {
  return (
    <div className="relative bg-gradient-to-br from-blue-50/20 via-indigo-50/10 to-purple-50/20 rounded-b-lg p-6">
      <div className="relative">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              {GRADIENT_COLORS.map((color, index) => (
                <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color.start} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color.end} stopOpacity={0.7} />
                </linearGradient>
              ))}
              <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#CBD5E1" stopOpacity={0.4} />
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
              cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
            />
            
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '13px',
                color: '#64748B'
              }}
              iconType="circle"
            />
            
            <Bar 
              dataKey="Collected" 
              fill="url(#barGradient0)" 
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#barGradient${index % GRADIENT_COLORS.length})`} />
              ))}
            </Bar>
            
            <Bar 
              dataKey="Goal" 
              fill="url(#goalGradient)" 
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-indigo-200 rounded-tl-lg opacity-50" />
      </div>
    </div>
  );
}
