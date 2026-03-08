import { useEffect, useState } from 'react';

const COLORS = [
  'hsl(350, 60%, 65%)', // coral
  'hsl(260, 45%, 75%)', // lavender
  'hsl(160, 40%, 70%)', // mint
  'hsl(45, 80%, 80%)',  // butter
  'hsl(20, 70%, 80%)',  // peach
];

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const p: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      size: Math.random() * 8 + 4,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
