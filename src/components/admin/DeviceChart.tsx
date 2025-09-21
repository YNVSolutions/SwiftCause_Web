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
}

interface DeviceChartProps {
  data: DeviceData[];
}

const CHART_COLORS = [
  "#6366F1", // Sophisticated Blue
  "#8B5CF6", // Vibrant Purple
  "#EC4899", // Modern Pink
  "#10B981", // Fresh Green
  "#F59E0B", // Warm Amber
  "#06B6D4", // Refreshing Cyan
  "#F97316", // Earthy Orange
  "#84CC16", // Lime Green
  "#14B8A6", // Teal
  "#64748B"  // Cool Slate Gray
];

export function DeviceChart({ data }: DeviceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No Device Data</p>
          <p className="text-sm">No kiosks with device information found.</p>
        </div>
      </div>
    );
  }

  // Add colors to the data
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataWithColors}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
          >
            {dataWithColors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value} kiosks`, name]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="mt-4 border-t pt-4">
        <div className="grid grid-cols-1 gap-2">
          {dataWithColors.map((entry) => (
            <div
              key={entry.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600 truncate">
                  {entry.name}
                </span>
              </div>
              <span className="font-semibold text-gray-800">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
