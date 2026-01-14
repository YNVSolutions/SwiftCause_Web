import { useEffect, useState, RefObject } from 'react';

interface UseScrollSpyOptions {
  containerRef: RefObject<HTMLElement | null>;
  sectionRefs: Record<string, RefObject<HTMLElement | null>>;
  enabled?: boolean;
}

export function useScrollSpy({ 
  containerRef, 
  sectionRefs, 
  enabled = true 
}: UseScrollSpyOptions) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    if (!enabled) return;

    const setupTimeoutId = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleScroll = () => {
        const containerRect = container.getBoundingClientRect();
        const containerTop = containerRect.top;
        
        let closestId: string | null = null;
        let minDistance = Infinity;

        Object.entries(sectionRefs).forEach(([id, ref]) => {
          if (!ref.current) return;

          const sectionRect = ref.current.getBoundingClientRect();
          const sectionTop = sectionRect.top;
          
          const distance = Math.abs(sectionTop - containerTop);

          if (distance < minDistance) {
            minDistance = distance;
            closestId = id;
          }
        });

        if (closestId) {
          setActiveSection(closestId);
        }
      };

      container.addEventListener('scroll', handleScroll, { passive: true });
      
      handleScroll();
      const delayedCheckId = setTimeout(handleScroll, 200);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        clearTimeout(delayedCheckId);
      };
    }, 100);

    return () => {
      clearTimeout(setupTimeoutId);
    };
  }, [enabled, containerRef, sectionRefs]);

  const scrollToSection = (sectionId: string, offset = 20) => {
    const container = containerRef.current;
    const sectionRef = sectionRefs[sectionId];
    
    if (!container || !sectionRef?.current) return;

    const containerTop = container.getBoundingClientRect().top;
    const sectionTop = sectionRef.current.getBoundingClientRect().top;
    
    const scrollPosition = container.scrollTop + (sectionTop - containerTop) - offset;

    container.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    });
  };

  return { activeSection, scrollToSection, setActiveSection };
}
