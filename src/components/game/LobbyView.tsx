import { startGame, setGameGeneration } from '@/lib/gameActions';
import { getShareUrl } from '@/lib/gameUtils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const GENERATION_OPTIONS = [
  { value: 'mixed', label: '🎲 Mixed' },
  { value: 'Gen Alpha', label: '🧒 Gen Alpha' },
  { value: 'Gen Z', label: '⚡ Gen Z' },
  { value: 'Millennial', label: '📱 Millennial' },
  { value: 'Gen X', label: '🎸 Gen X' },
  { value: 'Boomer', label: '📺 Boomer' },
];

interface LobbyViewProps {
  gameState: any;
}

export function LobbyView({ gameState }: LobbyViewProps) {
  const { game, players, isHost } = gameState;
  const shareUrl = getShareUrl(game.room_code);
  const selectedGeneration = game.selected_generation ?? 'mixed';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  };

  const nonHostPlayers = players.filter((p: any) => p.id !== game.host_player_id);

  const handleStart = () => {
    if (nonHostPlayers.length >= 2) {
      startGame(game.id, selectedGeneration);
    }
  };

  const handleGenerationChange = (gen: string) => {
    setGameGeneration(game.id, gen);
  };

  const selectedLabel = GENERATION_OPTIONS.find(o => o.value === selectedGeneration)?.label ?? '🎲 Mixed';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🎯</div>
          <h1 className="font-display font-bold text-3xl mb-1">Waiting Room</h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="font-mono font-bold text-2xl tracking-widest text-primary">
              {game.room_code}
            </span>
            <button
              onClick={copyLink}
              className="text-sm text-muted-foreground hover:text-foreground px-3 py-1 bg-muted rounded-lg transition-colors"
            >
              📋 Copy Link
            </button>
          </div>
        </div>

        {/* Generation Selector */}
        <div className="card-game mb-4">
          <h3 className="font-display font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
            Generation Pack
          </h3>
          {isHost ? (
            <div className="grid grid-cols-3 gap-2">
              {GENERATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleGenerationChange(opt.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedGeneration === opt.value
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-3">
              <span className="text-lg font-display font-semibold">{selectedLabel}</span>
              <p className="text-xs text-muted-foreground mt-1">Selected by host</p>
            </div>
          )}
        </div>

        <div className="card-game mb-4">
          <h3 className="font-display font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
            Players ({players.length})
          </h3>
          <div className="space-y-2">
            {players.map((p: any, i: number) => (
              <div
                key={p.id}
                className="flex items-center gap-3 py-2 px-3 bg-muted/50 rounded-xl animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {p.name[0].toUpperCase()}
                </div>
                <span className="font-medium">{p.name}</span>
                {p.id === game.host_player_id && (
                  <span className="ml-auto text-xs bg-butter/50 text-butter-foreground px-2 py-0.5 rounded-full">
                    👑 Host
                  </span>
                )}
              </div>
            ))}
          </div>
          {nonHostPlayers.length < 2 && (
            <p className="text-center text-sm text-muted-foreground mt-4 animate-pulse-soft">
              Waiting for more players to join...
            </p>
          )}
        </div>

        {isHost && (
          <Button
            onClick={handleStart}
            disabled={nonHostPlayers.length < 2}
            className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
          >
            {nonHostPlayers.length < 2 ? 'Need at least 2 players' : '🚀 Start Game'}
          </Button>
        )}

        {!isHost && (
          <div className="text-center text-sm text-muted-foreground animate-pulse-soft">
            Waiting for the host to start the game...
          </div>
        )}
      </div>
    </div>
  );
}
