import { useState } from 'react';
import { Confetti } from './Confetti';
import { startNewGame } from '@/lib/gameActions';
import { Button } from '@/components/ui/button';
import type { NavigateFunction } from 'react-router-dom';

interface GameOverViewProps {
  gameState: any;
  navigate: NavigateFunction;
}

export function GameOverView({ gameState, navigate }: GameOverViewProps) {
  const { game, sortedPlayers, isHost, myPlayerId } = gameState;
  const [loading, setLoading] = useState(false);

  const handleNewGame = async () => {
    if (!game) return;
    setLoading(true);
    const newRoomCode = await startNewGame(game.id);
    if (newRoomCode) {
      navigate(`/game/${newRoomCode}`);
    }
    setLoading(false);
  };

  const winner = sortedPlayers[0];
  const isWinner = winner?.id === myPlayerId;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {isWinner && <Confetti />}
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 animate-bounce-in">🏆</div>
          <h1 className="font-display font-bold text-3xl mb-2">Game Over!</h1>
          {winner && (
            <p className="text-lg text-muted-foreground">
              <span className="font-semibold text-primary">{winner.name}</span> wins with{' '}
              <span className="font-bold">{winner.score}</span> points!
            </p>
          )}
        </div>

        <div className="card-game mb-6">
          <h3 className="font-display font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider text-center">
            Final Standings
          </h3>
          <div className="space-y-2">
            {sortedPlayers.map((player: any, i: number) => (
              <div
                key={player.id}
                className={`flex items-center justify-between py-3 px-4 rounded-xl animate-slide-up ${
                  i === 0
                    ? 'bg-butter/30 ring-2 ring-butter'
                    : i === 1
                      ? 'bg-muted/70'
                      : i === 2
                        ? 'bg-peach/20'
                        : 'bg-muted/30'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-lg w-6 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <span className="font-medium">{player.name}</span>
                  {player.id === myPlayerId && (
                    <span className="text-xs text-muted-foreground">(you)</span>
                  )}
                </div>
                <span className="font-display font-bold text-xl">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <Button
            onClick={handleNewGame}
            disabled={loading}
            className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? 'Setting up...' : '🔄 Play Again'}
          </Button>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full text-center mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
