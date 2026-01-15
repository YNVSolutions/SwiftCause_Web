import { useEffect, useState } from 'react';

interface LiquidFillProgressProps {
  progress: number; // 0-100
}

export function LiquidFillProgress({ progress }: LiquidFillProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getColor = () => {
    if (progress === 0) return 'from-gray-200/20 to-gray-300/20';
    if (progress < 50) return 'from-green-200/30 to-green-300/30';
    if (progress < 100) return 'from-green-300/40 to-green-400/40';
    return 'from-green-400/50 to-emerald-500/50';
  };

  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getColor()} transition-all duration-700 ease-out`}
        style={{ height: `${displayProgress}%` }}
      >
        {/* Wave effect */}
        <div className="absolute top-0 left-0 right-0 h-8">
          <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path
              d="M0,50 Q300,0 600,50 T1200,50 L1200,100 L0,100 Z"
              fill="currentColor"
              className="text-green-400/30 animate-wave-slow"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
