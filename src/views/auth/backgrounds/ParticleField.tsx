import { useEffect, useState, useCallback, useRef } from 'react';
import { Heart, DollarSign, Star, Sparkles } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'heart' | 'coin' | 'star' | 'sparkle';
  drift: number;
}

export function ParticleField() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const particleCounter = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const generateParticle = useCallback(() => {
    const types: Particle['type'][] = ['heart', 'coin', 'star', 'sparkle'];
    const id = Date.now() + particleCounter.current;
    particleCounter.current += 1;
    
    return {
      id,
      x: Math.random() * 100,
      y: 100,
      size: Math.random() * 20 + 15,
      duration: Math.random() * 5 + 8,
      delay: 0,
      type: types[Math.floor(Math.random() * types.length)],
      drift: (Math.random() - 0.5) * 40,
    };
  }, []);

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return;

    // Initial particles
    const initial = Array.from({ length: 8 }, generateParticle);
    setParticles(initial);

    // Generate new particles
    intervalRef.current = setInterval(() => {
      const newParticle = generateParticle();
      setParticles(prev => [...prev, newParticle]);

      // Schedule particle removal
      const timeout = setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
        timeoutsRef.current.delete(timeout);
      }, newParticle.duration * 1000);
      
      timeoutsRef.current.add(timeout);
    }, 1500);

    return () => {
      // Cleanup interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Cleanup all timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, [generateParticle]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const getIcon = (type: Particle['type']) => {
    switch (type) {
      case 'heart': return Heart;
      case 'coin': return DollarSign;
      case 'star': return Star;
      case 'sparkle': return Sparkles;
    }
  };

  const getColor = (type: Particle['type']) => {
    switch (type) {
      case 'heart': return 'text-green-400 fill-green-400';
      case 'coin': return 'text-yellow-400 fill-yellow-400';
      case 'star': return 'text-emerald-400 fill-emerald-400';
      case 'sparkle': return 'text-teal-400 fill-teal-400';
    }
  };

  // SSR safety check
  if (typeof window === 'undefined') {
    return <div className="absolute inset-0 pointer-events-none overflow-hidden" />;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => {
        const Icon = getIcon(particle.type);
        
        // Calculate repulsion from mouse with division by zero protection
        const dx = (particle.x / 100) * window.innerWidth - mousePos.x;
        const dy = window.innerHeight - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const repulsion = distance < 150 ? (150 - distance) / 150 : 0;
        // Prevent division by zero
        const repelX = distance > 0 ? repulsion * (dx / distance) * 50 : 0;

        return (
          <div
            key={particle.id}
            className="absolute animate-float-particle"
            style={{
              left: `${particle.x}%`,
              bottom: 0,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              transform: `translateX(${particle.drift + repelX}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <Icon
              className={`${getColor(particle.type)} opacity-60`}
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                filter: 'drop-shadow(0 0 8px currentColor)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
