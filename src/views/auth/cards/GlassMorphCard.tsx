import { ReactNode, useState, useEffect } from 'react';

interface GlassMorphCardProps {
  children: ReactNode;
  formState: 'idle' | 'typing' | 'error' | 'success';
  className?: string;
}

export function GlassMorphCard({ children, formState, className = '' }: GlassMorphCardProps) {
  const [glowIntensity, setGlowIntensity] = useState(0);

  useEffect(() => {
    if (formState === 'typing') {
      const interval = setInterval(() => {
        setGlowIntensity(prev => (prev + 0.1) % 1);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [formState]);

  const getBorderStyle = () => {
    switch (formState) {
      case 'idle':
        return 'border-green-200/40 shadow-lg shadow-green-500/10';
      case 'typing':
        return `border-green-400/60 shadow-xl shadow-green-500/30 animate-pulse`;
      case 'error':
        return 'border-red-400/60 shadow-xl shadow-red-500/30 animate-shake';
      case 'success':
        return 'border-green-500/80 shadow-2xl shadow-green-500/50 animate-success-wave';
      default:
        return 'border-green-200/40';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Glow effect */}
      {formState === 'typing' && (
        <div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 blur-xl transition-opacity duration-300"
          style={{ opacity: 0.2 + glowIntensity * 0.3 }}
        />
      )}
      
      {/* Success wave effect */}
      {formState === 'success' && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/30 to-transparent animate-wave" />
        </div>
      )}

      {/* Main card */}
      <div
        className={`
          relative bg-white/80 backdrop-blur-xl rounded-2xl border-2
          transition-all duration-500 hover:scale-[1.01]
          ${getBorderStyle()}
        `}
      >
        {children}
      </div>
    </div>
  );
}
