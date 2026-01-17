import { useState } from 'react';
import { TrendingUp, MapPin, CheckCircle, Users, Sparkles } from 'lucide-react';

interface Highlight {
  id: number;
  value: string | number;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  accentColor: string;
}

export function PlatformHighlightsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const highlights: Highlight[] = [
    {
      id: 1,
      value: '42',
      label: 'Active Campaigns',
      description: 'Making impact across communities',
      icon: <TrendingUp className="w-10 h-10" strokeWidth={1.5} />,
      gradient: 'from-green-400/20 via-emerald-400/20 to-teal-400/20',
      accentColor: 'bg-green-500',
    },
    {
      id: 2,
      value: '28',
      label: 'Kiosks Online',
      description: 'Connected donation terminals',
      icon: <MapPin className="w-10 h-10" strokeWidth={1.5} />,
      gradient: 'from-emerald-400/20 via-teal-400/20 to-cyan-400/20',
      accentColor: 'bg-emerald-500',
    },
    {
      id: 3,
      value: '98.5%',
      label: 'Success Rate',
      description: 'Trusted by thousands',
      icon: <CheckCircle className="w-10 h-10" strokeWidth={1.5} />,
      gradient: 'from-teal-400/20 via-cyan-400/20 to-green-400/20',
      accentColor: 'bg-teal-500',
    },
    {
      id: 4,
      value: '16K+',
      label: 'Generous Donors',
      description: 'Growing community of givers',
      icon: <Users className="w-10 h-10" strokeWidth={1.5} />,
      gradient: 'from-cyan-400/20 via-green-400/20 to-emerald-400/20',
      accentColor: 'bg-cyan-500',
    },
  ];

  // Auto-rotate every 5 seconds (pauses on hover)
  useState(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setActiveIndex((prev) => (prev + 1) % highlights.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  });

  const currentHighlight = highlights[activeIndex];
  const nextHighlight = highlights[(activeIndex + 1) % highlights.length];

  return (
    <div 
      className="w-full max-w-lg mx-auto mb-8 animate-fade-in-delay-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Layered Cards Design - Inspired by natural stacking */}
      <div className="relative">
        {/* Background decorative layers */}
        <div className="absolute -inset-4 bg-gradient-to-br from-green-100/40 to-emerald-100/40 rounded-3xl blur-2xl" />
        <div className="absolute -inset-2 bg-gradient-to-tr from-teal-100/30 to-green-100/30 rounded-2xl blur-xl" />
        
        {/* Main Card Container */}
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-100/50 overflow-hidden">
          {/* Animated gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${currentHighlight.gradient} transition-all duration-1000`} />
          
          {/* Organic shape decoration - top right */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-green-300/20 to-emerald-300/20 rounded-full blur-3xl" />
          
          {/* Organic shape decoration - bottom left */}
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-teal-300/20 to-green-300/20 rounded-full blur-2xl" />

          {/* Content */}
          <div className="relative p-8">
            {/* Icon with floating animation */}
            <div className="flex justify-between items-start mb-6">
              <div className={`${currentHighlight.accentColor} text-white p-4 rounded-2xl shadow-lg transform transition-all duration-700 hover:scale-110 hover:rotate-6`}>
                {currentHighlight.icon}
              </div>
              
              {/* Sparkle indicator */}
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-600">Live</span>
              </div>
            </div>

            {/* Value with smooth transition */}
            <div 
              key={currentHighlight.id}
              className="space-y-3 animate-fade-in"
            >
              <h3 className="text-6xl font-bold text-gray-900 tracking-tight">
                {currentHighlight.value}
              </h3>
              <div className="space-y-1">
                <p className="text-xl font-semibold text-gray-800">
                  {currentHighlight.label}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {currentHighlight.description}
                </p>
              </div>
            </div>

            {/* Accent line */}
            <div className={`mt-6 h-1 w-20 ${currentHighlight.accentColor} rounded-full`} />
          </div>

          {/* Bottom navigation bar */}
          <div className="relative bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm px-8 py-4 border-t border-green-100/50">
            <div className="flex items-center justify-between">
              {/* Progress dots */}
              <div className="flex space-x-2">
                {highlights.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`transition-all duration-500 rounded-full ${
                      index === activeIndex
                        ? `w-8 h-2 ${currentHighlight.accentColor}`
                        : 'w-2 h-2 bg-gray-300 hover:bg-green-400'
                    }`}
                    aria-label={`Go to highlight ${index + 1}`}
                  />
                ))}
              </div>

              {/* Next preview */}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Next:</span>
                <span className="font-medium text-gray-700">{nextHighlight.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating navigation buttons */}
        <button
          onClick={() =>
            setActiveIndex(
              (prev) => (prev - 1 + highlights.length) % highlights.length
            )
          }
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-green-200 hover:border-green-400 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Previous"
        >
          <svg
            className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={() => setActiveIndex((prev) => (prev + 1) % highlights.length)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-green-200 hover:border-green-400 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Next"
        >
          <svg
            className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
