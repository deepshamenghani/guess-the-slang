import { useState, useCallback } from 'react';
import { SlangCard } from './SlangCard';
import { TimerBar } from './TimerBar';
import { Scoreboard } from './Scoreboard';
import { Confetti } from './Confetti';
import {
  startTurn,
  endTimer,
  markCorrect,
  passToNext,
  transferHost,
  endGameEarly,
  skipWord,
  handleDisconnectedTurn,
} from '@/lib/gameActions';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HostGameViewProps {
  gameState: any;
}

export function HostGameView({ gameState }: HostGameViewProps) {
  const { game, currentSlang, currentPlayer, players, connectedNonHostPlayers } = gameState;
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const nonHostPlayers = connectedNonHostPlayers;

  const currentPlayerId = game?.turn_order?.[game?.current_player_index ?? 0] ?? null;
  const totalPlayers = nonHostPlayers.length;
  const totalSlangs = game?.slang_ids?.length ?? 30;
  const isWaiting = game?.turn_state === 'waiting';
  const isActive = game?.turn_state === 'active';
  const isDecision = game?.turn_state === 'decision';
  const isReveal = game?.turn_state === 'reveal';
  const allPassed = isReveal && (game?.pass_count ?? 0) >= totalPlayers;

  const handleTimerComplete = useCallback(() => {
    if (game) endTimer(game.id);
  }, [game?.id]);

  const handleCorrect = () => {
    if (!game || !currentPlayerId) return;
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
    markCorrect(game.id, currentPlayerId, totalPlayers, totalSlangs, game.current_slang_index, game.current_player_index);
  };

  const handlePass = () => {
    if (!game) return;
    passToNext(game.id, totalPlayers, totalSlangs, game.current_slang_index, game.current_player_index, game.pass_count ?? 0);
  };

  const handleTransfer = (playerId: string) => {
    if (game) {
      transferHost(game.id, playerId);
      setShowTransfer(false);
    }
  };

  const handleEndGame = () => {
    if (game) endGameEarly(game.id);
  };

  if (!currentSlang || !game) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-6 p-4 lg:p-8">
      {showConfetti && <Confetti />}

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Slang {(game.current_slang_index ?? 0) + 1} of {totalSlangs}
            </p>
            {currentPlayer && (
              <p className="font-display font-medium text-lg">
                <span className="text-primary">{currentPlayer.name}</span>'s turn
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-sm text-destructive hover:text-destructive/80 px-3 py-1.5 bg-destructive/10 rounded-lg transition-colors">
                  🛑 End Game
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End the game?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to end the game? All players will be taken to the final leaderboard with the current scores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndGame} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    End Game
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="relative">
              <button
                onClick={() => setShowTransfer(!showTransfer)}
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 bg-muted rounded-lg transition-colors"
              >
                ⚙️ Transfer Host
              </button>
              {showTransfer && (
                <div className="absolute right-0 top-full mt-1 bg-card rounded-xl shadow-soft border p-2 z-10 min-w-48">
                  {nonHostPlayers.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => handleTransfer(p.id)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors"
                    >
                      Transfer to {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timer */}
        {isActive && (
          <div className="mb-4">
            <TimerBar duration={15} running={true} onComplete={handleTimerComplete} />
          </div>
        )}

        {/* Slang card with meaning (host sees everything) */}
        <div className="flex-1 flex items-center justify-center">
          {isReveal ? (
            <div className="animate-bounce-in text-center">
              {allPassed && (
                <p className="font-display font-semibold text-lg text-muted-foreground mb-4">
                  😅 Nobody got this one!
                </p>
              )}
              <SlangCard slang={currentSlang} showMeaning={true} showDetails={true} showGeneration={true} />
            </div>
          ) : (
            <SlangCard slang={currentSlang} showMeaning={true} showDetails={true} showGeneration={true} />
          )}
        </div>

        {/* Host Controls */}
        <div className="mt-6 space-y-3">
          {isWaiting && (
            <div className="flex gap-3">
              <Button
                onClick={() => startTurn(game.id)}
                className="flex-1 h-14 text-lg font-display font-semibold rounded-2xl bg-mint text-mint-foreground hover:bg-mint/90"
              >
                ▶️ Start Turn
              </Button>
              <Button
                onClick={() => skipWord(game.id, game.slang_ids, game.current_slang_index, game.selected_generation)}
                variant="outline"
                className="h-14 px-5 text-lg font-display font-semibold rounded-2xl border-2 text-muted-foreground"
              >
                ⏭ Skip
              </Button>
            </div>
          )}

          {(isActive || isDecision) && (
            <div className="flex gap-3">
              <Button
                onClick={handleCorrect}
                className="flex-1 h-14 text-lg font-display font-semibold rounded-2xl bg-mint text-mint-foreground hover:bg-mint/90"
              >
                ✓ Correct
              </Button>
              <Button
                onClick={handlePass}
                variant="outline"
                className="flex-1 h-14 text-lg font-display font-semibold rounded-2xl border-2"
              >
                → Pass
              </Button>
            </div>
          )}

          {isReveal && (
            <p className="text-center text-muted-foreground text-sm animate-pulse-soft">
              Revealing answer... next slang loading
            </p>
          )}
        </div>
      </div>

      {/* Sidebar scoreboard (desktop) */}
      <div className="lg:w-72 lg:flex-shrink-0">
        <Scoreboard
          players={nonHostPlayers}
          currentPlayerId={currentPlayerId}
          hostPlayerId={game.host_player_id}
        />
      </div>
    </div>
  );
}
