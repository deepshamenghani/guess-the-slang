import { startGame, setGameGeneration } from '@/lib/gameActions';
import { getShareUrl } from '@/lib/gameUtils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ALL_GENERATIONS = ['Gen Alpha', 'Gen Z', 'Millennial', 'Gen X', 'Boomer'];

const GENERATION_BUTTONS = [
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
  const rawGeneration: string = game.selected_generation ?? 'mixed';
  const isMixed = rawGeneration === 'mixed';
  const selectedGens = isMixed ? [] : rawGeneration.split(',').filter(Boolean);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  };

  const nonHostPlayers = players.filter((p: any) => p.id !== game.host_player_id);

  const handleStart = () => {
    if (nonHostPlayers.length >= 2) {
      startGame(game.id, rawGeneration);
    }
  };

  const handleToggle = (value: string) => {
    if (value === 'mixed') {
      setGameGeneration(game.id, 'mixed');
      return;
    }

    // If currently mixed, switch to just this one generation
    if (isMixed) {
      setGameGeneration(game.id, value);
      return;
    }

    let newGens: string[];
    if (selectedGens.includes(value)) {
      newGens = selectedGens.filter(g => g !== value);
      // If none left, go back to mixed
      if (newGens.length === 0) {
        setGameGeneration(game.id, 'mixed');
        return;
      }
    } else {
      newGens = [...selectedGens, value];
    }

    // If all individually selected, store as mixed
    if (ALL_GENERATIONS.every(g => newGens.includes(g))) {
      setGameGeneration(game.id, 'mixed');
    } else {
      setGameGeneration(game.id, newGens.join(','));
    }
  };

  const displayLabels = isMixed
    ? '🎲 Mixed (All Generations)'
    : selectedGens.map(g => GENERATION_BUTTONS.find(b => b.value === g)?.label ?? g).join(', ');

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
            Generation Packs
          </h3>
          {isHost ? (
            <div className="grid grid-cols-3 gap-2">
              {GENERATION_BUTTONS.map((opt) => {
                const isActive = opt.value === 'mixed' ? isMixed : selectedGens.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleToggle(opt.value)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-3">
              <span className="text-lg font-display font-semibold">{displayLabels}</span>
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
