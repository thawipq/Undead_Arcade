import { isSupabaseConfigured, supabase } from './supabaseClient.js';

export async function saveRunScore({
  playerName,
  survivalMs,
  levelsCompleted,
  levelReached,
  kills,
  coins,
}) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
  }

  const { error } = await supabase.from('run_scores').insert({
    player_name: (playerName || '').trim() || 'Anonymous',
    survival_ms: Math.round(Math.max(0, survivalMs)),
    levels_completed: Math.round(Math.max(0, levelsCompleted)),
    level_reached: Math.max(1, Math.round(levelReached)),
    kills: Math.round(Math.max(0, kills)),
    coins: Math.round(Math.max(0, coins)),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchTopScores(limit = 10) {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('run_scores')
    .select('player_name, survival_ms, levels_completed, kills, coins, created_at')
    .order('survival_ms', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
