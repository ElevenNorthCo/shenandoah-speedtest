import { useState, useEffect, useCallback } from 'react';
import { publicSupabase, PUBLIC_SPEED_RESULT_COLUMNS, type SpeedResult } from '../lib/supabase';

export type LeaderboardTab = 'download' | 'upload' | 'recent';

export interface LeaderboardState {
  results: SpeedResult[];
  loading: boolean;
  error: string | null;
  newRowId: string | null;
}

export function useLeaderboard(tab: LeaderboardTab) {
  const [state, setState] = useState<LeaderboardState>({
    results: [],
    loading: true,
    error: null,
    newRowId: null,
  });

  const fetchResults = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let query = publicSupabase.from('speed_results').select(PUBLIC_SPEED_RESULT_COLUMNS).limit(50);

      if (tab === 'download') {
        query = query.order('download_mbps', { ascending: false });
      } else if (tab === 'upload') {
        query = query.order('upload_mbps', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      setState(prev => ({ ...prev, results: data ?? [], loading: false }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load leaderboard',
      }));
    }
  }, [tab]);

  useEffect(() => {
    void fetchResults();
  }, [fetchResults]);

  return { ...state, refetch: fetchResults };
}
