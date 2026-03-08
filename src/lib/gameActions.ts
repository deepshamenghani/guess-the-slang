import { supabase } from '@/integrations/supabase/client';
import { generateRoomCode, shuffleArray } from '@/lib/gameUtils';

export async function createGame(hostName: string): Promise<{ roomCode: string; gameId: string; playerId: string } | null> {
  const roomCode = generateRoomCode();

  const { data: game, error: gameError } = await supabase
    .from('games')
    .insert({ room_code: roomCode })
    .select()
    .single();

  if (gameError || !game) return null;

  const { data: player, error: playerError } = await supabase
    .from('game_players')
    .insert({ game_id: game.id, name: hostName })
    .select()
    .single();

  if (playerError || !player) return null;

  await supabase
    .from('games')
    .update({ host_player_id: player.id })
    .eq('id', game.id);

  sessionStorage.setItem(`player-${game.id}`, player.id);

  return { roomCode, gameId: game.id, playerId: player.id };
}

export async function joinGame(roomCode: string, playerName: string): Promise<{ gameId: string; playerId: string } | null> {
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('room_code', roomCode)
    .single();

  if (!game || game.status !== 'lobby') return null;

  const { data: player, error } = await supabase
    .from('game_players')
    .insert({ game_id: game.id, name: playerName })
    .select()
    .single();

  if (error || !player) return null;

  sessionStorage.setItem(`player-${game.id}`, player.id);
  return { gameId: game.id, playerId: player.id };
}

export async function startGame(gameId: string) {
  // Get players
  const { data: players } = await supabase
    .from('game_players')
    .select('id')
    .eq('game_id', gameId);

  if (!players || players.length < 2) return;

  // Get 30 random slang words
  const { data: allSlangs } = await supabase
    .from('slang_words')
    .select('id');

  if (!allSlangs || allSlangs.length === 0) return;

  // Get the game to find host_player_id
  const { data: gameData } = await supabase
    .from('games')
    .select('host_player_id')
    .eq('id', gameId)
    .single();

  const shuffledSlangs = shuffleArray(allSlangs).slice(0, 30);
  // Exclude host from turn order
  const nonHostPlayers = players.filter(p => p.id !== gameData?.host_player_id);
  const shuffledPlayers = shuffleArray(nonHostPlayers);

  await supabase
    .from('games')
    .update({
      status: 'playing',
      turn_order: shuffledPlayers.map(p => p.id),
      slang_ids: shuffledSlangs.map(s => s.id),
      current_slang_index: 0,
      current_player_index: 0,
      turn_state: 'waiting',
      pass_count: 0,
    })
    .eq('id', gameId);
}

export async function startTurn(gameId: string) {
  await supabase
    .from('games')
    .update({ turn_state: 'active' })
    .eq('id', gameId);
}

export async function endTimer(gameId: string) {
  await supabase
    .from('games')
    .update({ turn_state: 'decision' })
    .eq('id', gameId);
}

export async function markCorrect(gameId: string, playerId: string, totalPlayers: number, totalSlangs: number, currentSlangIndex: number, currentPlayerIndex: number) {
  // Increment player score
  const { data: player } = await supabase
    .from('game_players')
    .select('score')
    .eq('id', playerId)
    .single();

  if (player) {
    await supabase
      .from('game_players')
      .update({ score: player.score + 1 })
      .eq('id', playerId);
  }

  // Move to reveal state briefly, then next slang
  await supabase
    .from('games')
    .update({ turn_state: 'reveal' })
    .eq('id', gameId);

  // After brief delay, advance to next slang
  setTimeout(async () => {
    const nextSlangIndex = currentSlangIndex + 1;
    if (nextSlangIndex >= totalSlangs) {
      await supabase
        .from('games')
        .update({ status: 'finished', turn_state: 'waiting' })
        .eq('id', gameId);
    } else {
      const nextPlayerIndex = (currentPlayerIndex + 1) % totalPlayers;
      await supabase
        .from('games')
        .update({
          current_slang_index: nextSlangIndex,
          current_player_index: nextPlayerIndex,
          turn_state: 'waiting',
          pass_count: 0,
        })
        .eq('id', gameId);
    }
  }, 3000);
}

export async function passToNext(gameId: string, totalPlayers: number, totalSlangs: number, currentSlangIndex: number, currentPlayerIndex: number, currentPassCount: number) {
  const newPassCount = currentPassCount + 1;

  // If all players have passed on this slang
  if (newPassCount >= totalPlayers) {
    await supabase
      .from('games')
      .update({ turn_state: 'reveal', pass_count: newPassCount })
      .eq('id', gameId);

    // After delay, move to next slang
    setTimeout(async () => {
      const nextSlangIndex = currentSlangIndex + 1;
      if (nextSlangIndex >= totalSlangs) {
        await supabase
          .from('games')
          .update({ status: 'finished', turn_state: 'waiting' })
          .eq('id', gameId);
      } else {
        const nextPlayerIndex = (currentPlayerIndex + 1) % totalPlayers;
        await supabase
          .from('games')
          .update({
            current_slang_index: nextSlangIndex,
            current_player_index: nextPlayerIndex,
            turn_state: 'waiting',
            pass_count: 0,
          })
          .eq('id', gameId);
      }
    }, 3000);
  } else {
    // Move to next player
    const nextPlayerIndex = (currentPlayerIndex + 1) % totalPlayers;
    await supabase
      .from('games')
      .update({
        current_player_index: nextPlayerIndex,
        turn_state: 'waiting',
        pass_count: newPassCount,
      })
      .eq('id', gameId);
  }
}

export async function transferHost(gameId: string, newHostId: string) {
  await supabase
    .from('games')
    .update({ host_player_id: newHostId })
    .eq('id', gameId);
}

export async function endGameEarly(gameId: string) {
  await supabase
    .from('games')
    .update({ status: 'finished', turn_state: 'waiting' })
    .eq('id', gameId);
}

export async function startNewGame(gameId: string) {
  // Get current game's players and room code
  const { data: game } = await supabase
    .from('games')
    .select('room_code, host_player_id')
    .eq('id', gameId)
    .single();

  if (!game) return null;

  const { data: players } = await supabase
    .from('game_players')
    .select('name, id')
    .eq('game_id', gameId);

  if (!players) return null;

  // Create new game with same room code suffix
  const newRoomCode = generateRoomCode();

  const { data: newGame } = await supabase
    .from('games')
    .insert({ room_code: newRoomCode })
    .select()
    .single();

  if (!newGame) return null;

  // Add all players to new game
  const playerInserts = players.map(p => ({
    game_id: newGame.id,
    name: p.name,
  }));

  const { data: newPlayers } = await supabase
    .from('game_players')
    .insert(playerInserts)
    .select();

  if (!newPlayers) return null;

  // Find the host in new players (match by name)
  const oldHost = players.find(p => p.id === game.host_player_id);
  const newHost = oldHost ? newPlayers.find(p => p.name === oldHost.name) : newPlayers[0];

  await supabase
    .from('games')
    .update({ host_player_id: newHost?.id ?? newPlayers[0].id })
    .eq('id', newGame.id);

  // Store each player's new ID — we'll match by name for the current user
  const myOldId = sessionStorage.getItem(`player-${gameId}`);
  const myOldPlayer = players.find(p => p.id === myOldId);
  if (myOldPlayer) {
    const myNewPlayer = newPlayers.find(p => p.name === myOldPlayer.name);
    if (myNewPlayer) {
      sessionStorage.setItem(`player-${newGame.id}`, myNewPlayer.id);
    }
  }

  return newRoomCode;
}
