import { startGame } from '@/lib/gameActions';
import { getShareUrl } from '@/lib/gameUtils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LobbyViewProps {
  gameState: any;
}

export function LobbyView({ gameState }: LobbyViewProps) {
  const { game, players, isHost } = gameState;
  const shareUrl = getShareUrl(game.room_code);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  };

  const handleStart = () => {
    if (players.length >= 2) {
      startGame(game.id);
    }
  };

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
          {players.length < 2 && (
            <p className="text-center text-sm text-muted-foreground mt-4 animate-pulse-soft">
              Waiting for more players to join...
            </p>
          )}
        </div>

        {isHost && (
          <Button
            onClick={handleStart}
            disabled={players.length < 2}
            className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
          >
            {players.length < 2 ? 'Need at least 2 players' : '🚀 Start Game'}
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
