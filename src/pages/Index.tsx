import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, joinGame } from '@/lib/gameActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from '@/assets/logo.png';

const Index = () => {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) { setError('Enter your name'); return; }
    setLoading(true);
    setError('');
    const result = await createGame(name.trim());
    if (result) {
      navigate(`/game/${result.roomCode}`);
    } else {
      setError('Failed to create game');
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!name.trim()) { setError('Enter your name'); return; }
    if (!joinCode.trim()) { setError('Enter the game code'); return; }
    setLoading(true);
    setError('');
    const result = await joinGame(joinCode.trim().toUpperCase(), name.trim());
    if (result) {
      navigate(`/game/${joinCode.trim().toUpperCase()}`);
    } else {
      setError('Could not join — game may not exist or has already started');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <span className="text-3xl">🗣️</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">
            Guess the Slang
          </h1>
          <p className="text-muted-foreground">
            The office icebreaker party game
          </p>
        </div>

        {mode === 'menu' && (
          <div className="space-y-3 animate-slide-up">
            <Button
              onClick={() => setMode('create')}
              className="w-full h-14 text-lg font-display font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              🎯 Host a Game
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="outline"
              className="w-full h-14 text-lg font-display font-semibold rounded-2xl border-2"
            >
              🎮 Join a Game
            </Button>
          </div>
        )}

        {mode === 'create' && (
          <div className="card-game space-y-4 animate-scale-in">
            <h2 className="font-display font-semibold text-xl text-center">Host a New Game</h2>
            <Input
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-12 text-lg rounded-xl"
              maxLength={20}
            />
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="w-full h-12 text-base font-display font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? 'Creating...' : 'Create Game'}
            </Button>
            <button onClick={() => { setMode('menu'); setError(''); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="card-game space-y-4 animate-scale-in">
            <h2 className="font-display font-semibold text-xl text-center">Join a Game</h2>
            <Input
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-12 text-lg rounded-xl"
              maxLength={20}
            />
            <Input
              placeholder="Game code (e.g. ABC12)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              className="h-12 text-lg rounded-xl font-mono tracking-widest text-center"
              maxLength={5}
            />
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            <Button
              onClick={handleJoin}
              disabled={loading}
              className="w-full h-12 text-base font-display font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? 'Joining...' : 'Join Game'}
            </Button>
            <button onClick={() => { setMode('menu'); setError(''); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
