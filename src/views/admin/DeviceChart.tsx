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

// Professional color palette
const CHART_COLORS = [
  "#4F46E5", // Indigo-600 (Primary)
  "#10B981", // Emerald-500 (Secondary)
  "#8B5CF6", // Violet-500
  "#F59E0B", // Amber-500
  "#06B6D4", // Cyan-500
  "#EC4899", // Pink-500
  "#F97316", // Orange-500
  "#84CC16", // Lime-500
  "#14B8A6", // Teal-500
  "#64748B"  // Slate-500
];

type TooltipPayloadEntry = {
  name?: string;
  value?: number;
};

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-sm">
        <p className="font-semibold text-gray-900 mb-1">{payload[0].name}</p>
        <p className="text-gray-600">
          <span className="font-medium text-gray-900">{payload[0].value}</span> kiosks
        </p>
      </div>
    );
  }
  return null;
};

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
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            strokeWidth={0}
          >
            {dataWithColors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
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
                  className="h-3 w-3 rounded-sm shrink-0"
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
