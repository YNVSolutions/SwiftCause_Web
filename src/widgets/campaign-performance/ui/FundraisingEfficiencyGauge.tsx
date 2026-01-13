import React from 'react';
import { RotateCw } from 'lucide-react';

interface FundraisingEfficiencyGaugeProps {
  value: number;
  onDetailsClick?: () => void;
  onRefresh?: () => void;
}

export const FundraisingEfficiencyGauge: React.FC<FundraisingEfficiencyGaugeProps> = ({ 
  value,
  onDetailsClick,
  onRefresh
}) => {
  const timeStr = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Clamp value between 0 and 100 for safety
  const clampedValue = Math.max(0, Math.min(100, value));

  const radius = 75;
  const strokeWidth = 14;
  const cx = 100;
  const cy = 100;

  // Angle for needle: 180 is left (0%), 0 is right (100%)
  const angle = 180 - (clampedValue / 100) * 180;
  const needleAngleRad = angle * (Math.PI / 180);
  const needleLength = radius - 10;
  const needleX = cx + needleLength * Math.cos(needleAngleRad);
  const needleY = cy - needleLength * Math.sin(needleAngleRad);

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top right actions */}
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        {onRefresh && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Refresh data"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600 transition-colors" />
          </button>
        )}
      </div>

      <div 
        className={`flex-1 flex items-center justify-center relative py-4 ${onDetailsClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
        onClick={onDetailsClick}
      >
        <svg width="100%" height="160" viewBox="0 0 200 110" className="overflow-visible" preserveAspectRatio="xMidYMid meet">
          {/* Background Arc Segments: Red, Yellow, Green */}
          <path 
            d="M 25 100 A 75 75 0 0 1 48 35" 
            fill="none" 
            stroke="#EF4444" 
            strokeWidth={strokeWidth} 
            strokeLinecap="round" 
          />
          <path 
            d="M 52 32 A 75 75 0 0 1 148 32" 
            fill="none" 
            stroke="#F59E0B" 
            strokeWidth={strokeWidth} 
          />
          <path 
            d="M 152 35 A 75 75 0 0 1 175 100" 
            fill="none" 
            stroke="#10B981" 
            strokeWidth={strokeWidth} 
            strokeLinecap="round" 
          />

          {/* Ticks and Labels: 0, 25, 50, 75, 100 */}
          {[0, 25, 50, 75, 100].map((v) => {
            const a = 180 - (v / 100) * 180;
            const rad = a * (Math.PI / 180);
            const x = cx + (radius - 22) * Math.cos(rad);
            const y = cy - (radius - 22) * Math.sin(rad);
            return (
              <text 
                key={v} 
                x={x} 
                y={y} 
                textAnchor="middle" 
                className="text-[9px] fill-slate-400 font-semibold select-none"
              >
                {v}%
              </text>
            );
          })}

          {/* Needle Layer */}
          <g>
            <circle cx={cx} cy={cy} r="6" fill="#4F46E5" />
            <line
              x1={cx}
              y1={cy}
              x2={needleX}
              y2={needleY}
              stroke="#4F46E5"
              strokeWidth="3"
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <circle cx={cx} cy={cy} r="3" fill="#fff" />
          </g>
        </svg>
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
            Efficiency Rating
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {timeStr} Sync
          </p>
        </div>
        {onDetailsClick && (
          <div className="text-[9px] font-medium text-indigo-600 flex items-center gap-1">
            Click to view details
          </div>
        )}
      </div>
    </div>
  );
};
