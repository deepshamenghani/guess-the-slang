import { useState } from 'react';
import { joinGame } from '@/lib/gameActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface JoinViewProps {
  roomCode: string;
  gameState: any;
}

export function JoinView({ roomCode, gameState }: JoinViewProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!name.trim()) { setError('Enter your name'); return; }
    setLoading(true);
    setError('');
    const result = await joinGame(roomCode, name.trim());
    if (result) {
      gameState.setMyPlayerId(result.playerId);
      gameState.fetchGame();
      gameState.fetchPlayers();
    } else {
      setError('Could not join this game');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-game w-full max-w-sm animate-scale-in space-y-4">
        <div className="text-center">
          <div className="text-3xl mb-2">🗣️</div>
          <h2 className="font-display font-bold text-2xl mb-1">Join Game</h2>
          <p className="text-muted-foreground text-sm">Room: <span className="font-mono font-bold">{roomCode}</span></p>
        </div>
        <Input
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="h-12 text-lg rounded-xl"
          maxLength={20}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
        />
        {error && <p className="text-destructive text-sm text-center">{error}</p>}
        <Button
          onClick={handleJoin}
          disabled={loading}
          className="w-full h-12 text-base font-display font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? 'Joining...' : 'Join'}
        </Button>
      </div>
    </div>
  );
}
