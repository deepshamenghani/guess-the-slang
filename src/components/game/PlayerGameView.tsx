import { SlangCard } from './SlangCard';
import { TimerBar } from './TimerBar';
import { Scoreboard } from './Scoreboard';
import { endTimer } from '@/lib/gameActions';

interface PlayerGameViewProps {
  gameState: any;
}

export function PlayerGameView({ gameState }: PlayerGameViewProps) {
  const { game, currentSlang, currentPlayer, isMyTurn, players, connectedNonHostPlayers } = gameState;

  if (!currentSlang || !game) return null;

  const showReveal = game.turn_state === 'reveal';
  const isActive = game.turn_state === 'active';
  const isWaiting = game.turn_state === 'waiting';
  const passCount = game.pass_count ?? 0;
  const allPassed = showReveal && passCount >= connectedNonHostPlayers.length;
  // Only blur on a fresh word (pass_count === 0 and waiting). Once revealed, never re-blur.
  const shouldBlur = isWaiting && passCount === 0;

  return (
    <div className="min-h-screen flex flex-col p-4 pb-6">
      {/* Turn indicator */}
      <div className="text-center mb-4 animate-fade-in">
        <p className="text-sm text-muted-foreground mb-1">
          Slang {(game.current_slang_index ?? 0) + 1} of {game.slang_ids?.length ?? 30}
        </p>
        {isMyTurn ? (
          <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-3 rounded-full font-display font-bold text-2xl md:text-3xl">
            ✨ It's your turn!
          </div>
        ) : currentPlayer ? (
          <p className="font-display font-bold text-2xl md:text-3xl">
            <span className="text-primary">{currentPlayer.name}</span>'s turn
          </p>
        ) : null}
      </div>

      {/* Timer — visible to all players during active turn */}
      {isActive && (
        <div className="mb-4">
          <TimerBar
            duration={15}
            running={true}
            onComplete={isMyTurn ? () => endTimer(game.id) : () => {}}
          />
        </div>
      )}

      {/* Slang card - hero sized, blurred when waiting */}
      <div className="flex-1 flex items-center justify-center">
        {showReveal ? (
          <div className="animate-bounce-in text-center">
            {allPassed && (
              <p className="font-display font-semibold text-lg text-muted-foreground mb-4">
                😅 Nobody got this one!
              </p>
            )}
            <SlangCard slang={currentSlang} showMeaning={true} heroSize />
          </div>
        ) : (
          <SlangCard
            slang={currentSlang}
            showMeaning={false}
            heroSize
            blurred={shouldBlur}
          />
        )}
      </div>

      {/* Scoreboard */}
      <div className="mt-4">
        <Scoreboard
          players={connectedNonHostPlayers}
          currentPlayerId={game.turn_order?.[game.current_player_index ?? 0] ?? null}
          hostPlayerId={game.host_player_id}
        />
      </div>
    </div>
  );
}
