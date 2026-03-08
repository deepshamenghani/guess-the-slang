import { useEffect, useState } from 'react';

interface TimerBarProps {
  duration: number; // seconds
  running: boolean;
  onComplete: () => void;
}

export function TimerBar({ duration, running, onComplete }: TimerBarProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!running) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const pct = (remaining / (duration * 1000)) * 100;
      setProgress(pct);

      if (pct <= 0) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [running, duration, onComplete]);

  if (!running && progress === 100) return null;

  return (
    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-none"
        style={{
          width: `${progress}%`,
          background: progress > 30
            ? 'linear-gradient(90deg, hsl(var(--mint)), hsl(var(--accent)))'
            : progress > 10
              ? 'hsl(var(--butter))'
              : 'hsl(var(--destructive))',
        }}
      />
    </div>
  );
}
