"use client";

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DeviceData {
  name: string;
  value: number;
  color?: string;
}

interface FuturisticPieChartProps {
  data: DeviceData[];
}

const CHART_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Green
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
];

export function FuturisticPieChart({ data }: FuturisticPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">No Device Data</p>
          <p className="text-sm text-gray-500">No kiosks with device information found.</p>
        </div>
      </div>
    );
  }

  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || CHART_COLORS[index % CHART_COLORS.length],
  }));

  const total = dataWithColors.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
          <p className="text-gray-900 font-semibold mb-1">{data.name}</p>
          <p className="text-indigo-600 text-sm font-medium">{data.value} kiosks</p>
          <p className="text-gray-500 text-xs">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative bg-gradient-to-br from-indigo-50/20 via-purple-50/10 to-pink-50/20 rounded-b-lg p-6">
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataWithColors}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              animationBegin={0}
              animationDuration={800}
            >
              {dataWithColors.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="#ffffff"
                  strokeWidth={3}
                />
              ))}
            </Pie>
            
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center circle with total */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm rounded-full w-28 h-28 flex flex-col items-center justify-center border-2 border-gray-200 shadow-lg">
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {total}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-medium">Total Kiosks</p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            {dataWithColors.map((entry, index) => {
              const percentage = ((entry.value / total) * 100).toFixed(1);
              return (
                <div
                  key={entry.name}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5 hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div 
                      className="h-3 w-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-700 text-sm font-medium truncate">
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-semibold text-gray-900 text-sm">
                      {entry.value}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-indigo-200 rounded-tr-lg opacity-50" />
      </div>
    </div>
  );
}
