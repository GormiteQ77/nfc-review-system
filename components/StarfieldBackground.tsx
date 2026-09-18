'use client';

import { useMemo } from 'react';

interface StarfieldBackgroundProps {
  accent?: string;
  starCount?: number;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

function seededStars(count: number): Star[] {
  // Deterministic "random" layout so server and client render match (no hydration mismatch).
  let seed = 42;
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: count }, () => ({
    x: next() * 100,
    y: next() * 100,
    size: 2 + Math.round(next()),
    duration: 3.2 + next() * 1.8,
    delay: next() * 3,
  }));
}

export default function StarfieldBackground({
  accent = '#D4A15E',
  starCount = 20,
  className = '',
}: StarfieldBackgroundProps) {
  const stars = useMemo(() => seededStars(starCount), [starCount]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div
        className="absolute -top-40 -left-24 h-[560px] w-[560px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)`,
          animation: 'glow-drift-a 16s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-40 -right-24 h-[520px] w-[520px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(122,166,194,0.22) 0%, transparent 70%)',
          animation: 'glow-drift-b 20s ease-in-out infinite',
        }}
      />
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${s.y}%`,
            left: `${s.x}%`,
            width: s.size,
            height: s.size,
            background: accent,
            boxShadow: `0 0 6px 1px ${accent}`,
            animation: `twinkle ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
