'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

type Sparkle = {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  opacity: number;
};

type TravelingSparkle = {
  id: number;
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
};

type MouseSparkle = {
  id: number;
  x: number;
  y: number;
  size: number;
  life: number;
  settled: boolean; // true when sparkle has faded to persistent state
};

export function SparkleBackground() {
  const [mouseSparkles, setMouseSparkles] = useState<MouseSparkle[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const sparkleIdRef = useRef(0);

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate static breathing sparkles
  const breathingSparkles = useMemo<Sparkle[]>(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8000,
      opacity: 0.1 + Math.random() * 0.15,
    }));
  }, []);

  // Generate traveling sparkles for mobile
  const travelingSparkles = useMemo<TravelingSparkle[]>(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 2,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      endX: Math.random() * 100,
      endY: Math.random() * 100,
      duration: 15000 + Math.random() * 10000, // 15-25 seconds
      delay: i * 2000, // Stagger starts
    }));
  }, []);

  // Handle mouse movement on desktop - spawn sparkles near cursor
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only spawn sparkles if mouse moved enough
    if (distance > 30) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      // Spawn 1-2 sparkles near cursor
      const newSparkles: MouseSparkle[] = Array.from(
        { length: Math.floor(Math.random() * 2) + 1 },
        () => ({
          id: sparkleIdRef.current++,
          x: e.clientX + (Math.random() - 0.5) * 60,
          y: e.clientY + (Math.random() - 0.5) * 60,
          size: Math.random() * 4 + 2,
          life: 1,
          settled: false,
        })
      );

      // Keep up to 50 sparkles (settled ones persist)
      setMouseSparkles(prev => [...prev, ...newSparkles].slice(-50));
    }
  }, []);

  // Fade mouse sparkles to settled state (don't remove them)
  useEffect(() => {
    if (isMobile || mouseSparkles.length === 0) return;

    const interval = setInterval(() => {
      setMouseSparkles(prev =>
        prev.map(s => {
          if (s.settled) return s; // Already settled, don't change
          const newLife = s.life - 0.03;
          if (newLife <= 0.22) {
            // Sparkle has settled - mark it and stop fading
            return { ...s, life: 0.22, settled: true };
          }
          return { ...s, life: newLife };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isMobile, mouseSparkles.length]);

  // Add mouse listener on desktop
  useEffect(() => {
    if (isMobile) return;

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, handleMouseMove]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static breathing sparkles */}
      {breathingSparkles.map((sparkle) => (
        <div
          key={`breath-${sparkle.id}`}
          className="absolute rounded-full bg-white animate-sparkle"
          style={{
            width: sparkle.size,
            height: sparkle.size,
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${sparkle.delay}ms`,
            opacity: sparkle.opacity,
            boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.size / 2}px rgba(139, 92, 246, 0.4)`,
          }}
        />
      ))}

      {/* Traveling sparkles for mobile */}
      {isMobile && travelingSparkles.map((sparkle) => (
        <div
          key={`travel-${sparkle.id}`}
          className="absolute rounded-full bg-white animate-sparkle-travel"
          style={{
            width: sparkle.size,
            height: sparkle.size,
            '--start-x': `${sparkle.startX}vw`,
            '--start-y': `${sparkle.startY}vh`,
            '--end-x': `${sparkle.endX}vw`,
            '--end-y': `${sparkle.endY}vh`,
            animationDuration: `${sparkle.duration}ms`,
            animationDelay: `${sparkle.delay}ms`,
            boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.size / 2}px rgba(139, 92, 246, 0.5)`,
          } as React.CSSProperties}
        />
      ))}

      {/* Mouse-following sparkles for desktop */}
      {!isMobile && mouseSparkles.map((sparkle) => (
        <div
          key={`mouse-${sparkle.id}`}
          className={`absolute rounded-full bg-white pointer-events-none ${sparkle.settled ? 'animate-sparkle-settle' : ''}`}
          style={{
            width: sparkle.size,
            height: sparkle.size,
            left: sparkle.x,
            top: sparkle.y,
            opacity: sparkle.settled ? undefined : sparkle.life * 0.6,
            transform: `translate(-50%, -50%) scale(${sparkle.settled ? 1 : sparkle.life})`,
            transition: sparkle.settled ? 'none' : 'opacity 0.1s, transform 0.1s',
            boxShadow: `0 0 ${sparkle.size * 3}px ${sparkle.size}px rgba(139, 92, 246, ${sparkle.settled ? 0.3 : sparkle.life * 0.5})`,
          }}
        />
      ))}

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-gray-900/50" />
    </div>
  );
}
