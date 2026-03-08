import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/hooks/useGame';
import { LobbyView } from '@/components/game/LobbyView';
import { PlayerGameView } from '@/components/game/PlayerGameView';
import { HostGameView } from '@/components/game/HostGameView';
import { GameOverView } from '@/components/game/GameOverView';
import { JoinView } from '@/components/game/JoinView';

export default function GamePage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const gameState = useGame(roomCode);

  const { game, myPlayerId, loading, isHost } = gameState;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft font-display text-xl text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-game text-center max-w-sm">
          <p className="text-xl font-display font-semibold mb-2">Game not found</p>
          <p className="text-muted-foreground mb-4">This game doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/')} className="text-primary font-medium hover:underline">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Not yet joined
  if (!myPlayerId) {
    if (game.status !== 'lobby') {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card-game text-center max-w-sm animate-scale-in">
            <div className="text-4xl mb-3">🚫</div>
            <p className="text-xl font-display font-semibold mb-2">Game Already in Progress</p>
            <p className="text-muted-foreground mb-4">This game has already started. You can't join mid-game.</p>
            <button onClick={() => navigate('/')} className="text-primary font-medium hover:underline">
              ← Start Your Own Game
            </button>
          </div>
        </div>
      );
    }
    return <JoinView roomCode={roomCode!} gameState={gameState} />;
  }

  // Lobby
  if (game.status === 'lobby') {
    return <LobbyView gameState={gameState} />;
  }

  // Game finished
  if (game.status === 'finished') {
    return <GameOverView gameState={gameState} navigate={navigate} />;
  }

  // Playing
  if (isHost) {
    return <HostGameView gameState={gameState} />;
  }

  return <PlayerGameView gameState={gameState} />;
}
