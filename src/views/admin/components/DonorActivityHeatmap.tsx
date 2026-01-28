import React from 'react';
import { Card, CardContent } from '../../../shared/ui/card';
import { Skeleton } from '../../../shared/ui/skeleton';

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
  donations: number;
}

interface DonorActivityHeatmapProps {
  data?: HeatmapData[];
  loading?: boolean;
  className?: string;
}

// Fixed grid constants for stability
const GRID_COLS = 24;
const CELL_SIZE = 14;
const GAP = 6;

// Calculate intrinsic grid width
const GRID_WIDTH = GRID_COLS * CELL_SIZE + (GRID_COLS - 1) * GAP; // 474px

// Enterprise-grade legend colors - softer, more muted
const LEGEND_COLORS = [
  'bg-gray-50 border-gray-100',
  'bg-emerald-50 border-emerald-100',
  'bg-emerald-100 border-emerald-200',
  'bg-emerald-300 border-emerald-400',
  'bg-emerald-500 border-emerald-600',
];

const getCellClass = (intensity: number): string => {
  if (intensity === 0) return 'bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors';
  if (intensity <= 0.25) return 'bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors';
  if (intensity <= 0.5) return 'bg-emerald-100 border border-emerald-200 hover:bg-emerald-200 transition-colors';
  if (intensity <= 0.75) return 'bg-emerald-300 border border-emerald-400 hover:bg-emerald-400 transition-colors';
  return 'bg-emerald-500 border border-emerald-600 hover:bg-emerald-600 transition-colors';
};

export const DonorActivityHeatmap: React.FC<DonorActivityHeatmapProps> = ({
  data = [],
  loading = false,
  className = '',
}) => {
  // Fixed grid dimensions - 7 days × 24 hours
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <Card className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pre-initialize the complete 7×24 grid with zeros
  const initializeGrid = (): Map<string, { count: number; intensity: number }> => {
    const grid = new Map<string, { count: number; intensity: number }>();
    
    days.forEach(day => {
      hours.forEach(hour => {
        const key = `${day}-${hour}`;
        grid.set(key, { count: 0, intensity: 0 });
      });
    });
    
    return grid;
  };

  // Process incoming data and populate grid
  const processGridData = (): Map<string, { count: number; intensity: number }> => {
    const grid = initializeGrid();
    
    // Find max count for normalization
    let maxCount = 0;
    data.forEach(item => {
      if (item.donations > maxCount) {
        maxCount = item.donations;
      }
    });
    
    // Populate grid with actual data
    data.forEach(item => {
      const key = `${item.day}-${item.hour}`;
      if (grid.has(key)) {
        const count = item.donations || 0;
        const intensity = maxCount > 0 ? count / maxCount : 0;
        grid.set(key, { count, intensity });
      }
    });
    
    return grid;
  };

  const gridData = processGridData();

  const getCellData = (day: string, hour: number): { count: number; intensity: number } => {
    const key = `${day}-${hour}`;
    return gridData.get(key) || { count: 0, intensity: 0 };
  };

  return (
    <Card className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-5">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Donor Activity Heatmap
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 leading-relaxed">
                Weekly engagement patterns by hour and day
              </p>
              
              {/* Enterprise Legend - Aligned right */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-xs font-medium text-gray-400">LOW</span>
                <div className="flex gap-1">
                  {LEGEND_COLORS.map((color, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-sm ${color}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-400">HIGH</span>
              </div>
            </div>
          </div>

          {/* Heatmap Container - Fixed Layout */}
          <div className="relative">
            {/* Hour labels - Aligned with grid */}
            <div className="flex mb-3">
              <div className="w-12 flex-shrink-0"></div>
              <div style={{ width: GRID_WIDTH }}>
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
                    gap: `${GAP}px`,
                  }}
                >
                  {hours.map(hour => (
                    <div
                      key={hour}
                      className="text-[10px] text-gray-400 text-center font-medium"
                    >
                      {hour % 4 === 0 ? `${hour.toString().padStart(2, '0')}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Fixed Grid: 7 rows × 24 columns - No layout shift */}
            {days.map((day) => (
              <div key={day} className="flex items-center mb-1">
                {/* Day label - Fixed width, enterprise typography */}
                <div className="w-12 flex-shrink-0 text-xs font-medium text-gray-500">
                  {day.toUpperCase()}
                </div>
                
                {/* Hour cells - Fixed width grid */}
                <div style={{ width: GRID_WIDTH }}>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
                      gridAutoRows: `${CELL_SIZE}px`,
                      gap: `${GAP}px`,
                    }}
                  >
                    {hours.map(hour => {
                      const cellData = getCellData(day, hour);
                      const { count, intensity } = cellData;
                      
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={`rounded-sm cursor-pointer ${getCellClass(intensity)}`}
                          style={{
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            minWidth: CELL_SIZE,
                            minHeight: CELL_SIZE,
                          }}
                          title={
                            count > 0
                              ? `${day} ${hour}:00–${hour + 1}:00 — ${count} donations`
                              : `${day} ${hour}:00–${hour + 1}:00 — No activity`
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};