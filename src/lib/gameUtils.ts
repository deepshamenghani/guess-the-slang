export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getGenerationColor(gen: string): string {
  switch (gen) {
    case 'Gen Alpha': return 'bg-lavender text-lavender-foreground';
    case 'Gen Z': return 'bg-coral/20 text-foreground';
    case 'Millennial': return 'bg-mint/20 text-foreground';
    case 'Gen X': return 'bg-butter/20 text-foreground';
    case 'Boomer': return 'bg-peach/20 text-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function getShareUrl(roomCode: string): string {
  return `${window.location.origin}/game/${roomCode}`;
}
