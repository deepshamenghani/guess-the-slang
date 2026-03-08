import { Tables } from '@/integrations/supabase/types';

type Player = Tables<'game_players'>;

interface ScoreboardProps {
  players: Player[];
  currentPlayerId: string | null;
  hostPlayerId: string | null;
}

export function Scoreboard({ players, currentPlayerId, hostPlayerId }: ScoreboardProps) {
  const sorted = [...players].filter(p => p.is_connected).sort((a, b) => b.score - a.score);

  return (
    <div className="card-game">
      <h3 className="font-display font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
        Scoreboard
      </h3>
      <div className="space-y-2">
        {sorted.map((player, i) => (
          <div
            key={player.id}
            className={`flex items-center justify-between py-2 px-3 rounded-xl transition-all ${
              player.id === currentPlayerId
                ? 'bg-primary/10 ring-2 ring-primary/30'
                : 'bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground w-5">
                {i + 1}
              </span>
              <span className="font-medium text-sm">
                {player.name}
                {player.id === hostPlayerId && (
                  <span className="ml-1 text-xs text-muted-foreground">👑</span>
                )}
              </span>
            </div>
            <span className="font-display font-bold text-lg">{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
