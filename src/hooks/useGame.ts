import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Game = Tables<'games'>;
type Player = Tables<'game_players'>;
type SlangWord = Tables<'slang_words'>;

export function useGame(roomCode: string | undefined) {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [slangWords, setSlangWords] = useState<SlangWord[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnectedNames, setDisconnectedNames] = useState<string[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const prevPlayerIdsRef = useRef<Set<string>>(new Set());
  const playersRef = useRef<Player[]>([]);
  const disconnectTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Fetch game by room code
  const fetchGame = useCallback(async () => {
    if (!roomCode) return;
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('room_code', roomCode)
      .single();
    if (data) setGame(data);
    setLoading(false);
  }, [roomCode]);

  // Fetch players
  const fetchPlayers = useCallback(async () => {
    if (!game) return;
    const { data } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', game.id)
      .order('created_at');
    if (data) setPlayers(data);
  }, [game?.id]);

  // Fetch slang words for the game
  const fetchSlangWords = useCallback(async () => {
    if (!game?.slang_ids?.length) return;
    const { data } = await supabase
      .from('slang_words')
      .select('*')
      .in('id', game.slang_ids);
    if (data) {
      // Sort by the order in slang_ids
      const ordered = game.slang_ids
        .map(id => data.find(s => s.id === id))
        .filter(Boolean) as SlangWord[];
      setSlangWords(ordered);
    }
  }, [game?.slang_ids]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!game?.id) return;

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`game-${game.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${game.id}`,
      }, (payload) => {
        if (payload.new) setGame(payload.new as Game);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_players',
        filter: `game_id=eq.${game.id}`,
      }, () => {
        fetchPlayers();
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game?.id, fetchPlayers]);

  // Presence tracking — detect disconnections via leave events only
  useEffect(() => {
    if (!game?.id || !myPlayerId) return;

    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
    }

    const presenceChannel = supabase
      .channel(`presence-${game.id}`, { config: { presence: { key: myPlayerId } } })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (!key || key === game.host_player_id) return;
        const leavingPlayer = players.find(p => p.id === key);
        if (leavingPlayer && leavingPlayer.is_connected) {
          // Mark as disconnected in DB
          supabase
            .from('game_players')
            .update({ is_connected: false })
            .eq('id', key)
            .then(() => {});
          setDisconnectedNames(prev => [...prev, leavingPlayer.name]);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ player_id: myPlayerId });
        }
      });

    presenceChannelRef.current = presenceChannel;

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [game?.id, myPlayerId, players.length]);

  useEffect(() => { fetchGame(); }, [fetchGame]);
  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);
  useEffect(() => { fetchSlangWords(); }, [fetchSlangWords]);

  // Detect new/reconnected players and show toast (host notification)
  useEffect(() => {
    if (!game || game.status === 'lobby') {
      // In lobby, just track IDs without toasting
      prevPlayerIdsRef.current = new Set(players.filter(p => p.is_connected).map(p => p.id));
      return;
    }
    const currentConnectedIds = new Set(players.filter(p => p.is_connected).map(p => p.id));
    const prev = prevPlayerIdsRef.current;
    if (prev.size > 0) {
      currentConnectedIds.forEach(id => {
        if (!prev.has(id) && id !== myPlayerId) {
          const p = players.find(pl => pl.id === id);
          if (p) toast.info(`${p.name} joined`);
        }
      });
    }
    prevPlayerIdsRef.current = currentConnectedIds;
  }, [players, game?.status, myPlayerId]);

  // Show disconnect toasts
  useEffect(() => {
    if (disconnectedNames.length === 0) return;
    const name = disconnectedNames[disconnectedNames.length - 1];
    toast.info(`${name} has left the game`);
  }, [disconnectedNames.length]);

  // Restore player ID from session storage
  useEffect(() => {
    if (game) {
      const stored = sessionStorage.getItem(`player-${game.id}`);
      if (stored) setMyPlayerId(stored);
    }
  }, [game?.id]);

  const isHost = game?.host_player_id === myPlayerId;

  // Connected players only (excluding host from player list)
  const connectedPlayers = players.filter(p => p.is_connected);
  const connectedNonHostPlayers = connectedPlayers.filter(p => p.id !== game?.host_player_id);

  const currentSlang = slangWords[game?.current_slang_index ?? 0] ?? null;

  const currentPlayerId = game?.turn_order?.[game?.current_player_index ?? 0] ?? null;
  const currentPlayer = players.find(p => p.id === currentPlayerId) ?? null;
  const isMyTurn = currentPlayerId === myPlayerId;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return {
    game,
    setGame,
    players,
    connectedPlayers,
    connectedNonHostPlayers,
    slangWords,
    myPlayerId,
    setMyPlayerId,
    loading,
    isHost,
    currentSlang,
    currentPlayer,
    isMyTurn,
    sortedPlayers,
    fetchGame,
    fetchPlayers,
  };
}
