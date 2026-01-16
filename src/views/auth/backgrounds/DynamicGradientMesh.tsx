import { useEffect, useState } from 'react';

export function DynamicGradientMesh() {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('afternoon');

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setTimeOfDay('morning');
      else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
      else if (hour >= 17 && hour < 21) setTimeOfDay('evening');
      else setTimeOfDay('night');
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const gradients = {
    morning: {
      primary: 'from-green-100 via-yellow-50 to-emerald-100',
      blob1: 'bg-green-200',
      blob2: 'bg-yellow-200',
      blob3: 'bg-emerald-200',
    },
    afternoon: {
      primary: 'from-green-50 via-emerald-50 to-teal-50',
      blob1: 'bg-green-300',
      blob2: 'bg-emerald-300',
      blob3: 'bg-teal-300',
    },
    evening: {
      primary: 'from-emerald-100 via-purple-50 to-green-100',
      blob1: 'bg-emerald-300',
      blob2: 'bg-purple-300',
      blob3: 'bg-green-300',
    },
    night: {
      primary: 'from-slate-100 via-gray-50 to-slate-100',
      blob1: 'bg-green-200',
      blob2: 'bg-emerald-200',
      blob3: 'bg-teal-200',
    },
  };

  const current = gradients[timeOfDay];

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${current.primary} transition-all duration-[3000ms]`}>
      {/* Morphing gradient blobs */}
      <div className={`absolute top-20 left-10 w-72 h-72 ${current.blob1} rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob`}></div>
      <div className={`absolute top-40 right-10 w-96 h-96 ${current.blob2} rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000`}></div>
      <div className={`absolute -bottom-32 left-1/2 w-96 h-96 ${current.blob3} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000`}></div>
      
      {/* Aurora effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-green-400/30 via-emerald-400/20 to-transparent animate-aurora"></div>
      </div>

      {timeOfDay === 'night' && (
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.3 + 0.1,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
