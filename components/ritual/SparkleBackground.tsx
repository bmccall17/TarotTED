'use client';

import { useMemo } from 'react';

type Sparkle = {
  id: number;
  size: number;
  left: string;
  top: string;
  delay: number;
  duration: number;
};

export function SparkleBackground() {
  // Generate random sparkle positions
  const sparkles = useMemo<Sparkle[]>(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2-6px
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 2000,
      duration: 1111 + Math.random() * 1000, // 1111-2111ms
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute rounded-full bg-white animate-sparkle"
          style={{
            width: sparkle.size,
            height: sparkle.size,
            left: sparkle.left,
            top: sparkle.top,
            animationDelay: `${sparkle.delay}ms`,
            animationDuration: `${sparkle.duration}ms`,
            boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.size / 2}px rgba(139, 92, 246, 0.5)`,
          }}
        />
      ))}

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-gray-900/50" />
    </div>
  );
}
