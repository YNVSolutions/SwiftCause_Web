import { useState, useRef, MouseEvent, ReactNode } from 'react';
import { Button } from '../../../shared/ui/button';

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  loading?: boolean;
}

export function MagneticButton({ 
  children, 
  onClick, 
  disabled, 
  type = 'button',
  className = '',
  loading = false
}: MagneticButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Magnetic effect - pull button towards cursor
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 50;
    const strength = Math.min(distance / maxDistance, 1);
    
    setPosition({
      x: x * strength * 0.3,
      y: y * strength * 0.3,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Create ripple effect
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { x, y, id }]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    }

    onClick?.();
  };

  return (
    <Button
      ref={buttonRef}
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={`
        relative overflow-hidden
        bg-gradient-to-r from-green-600 via-emerald-600 to-green-600
        hover:from-green-700 hover:via-emerald-700 hover:to-green-700
        text-white shadow-lg hover:shadow-2xl
        transition-all duration-300
        bg-[length:200%_100%]
        ${isHovered ? 'bg-right scale-105' : 'bg-left'}
        ${className}
      `}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) ${isHovered ? 'scale(1.05)' : 'scale(1)'}`,
      }}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing...
          </>
        ) : (
          children
        )}
      </span>

      {/* Shine effect on hover */}
      {isHovered && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
      )}
    </Button>
  );
}
