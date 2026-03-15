import { useState, useEffect, useCallback } from 'react';
import { supabase, type SpeedResult } from '../lib/supabase';

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
      let query = supabase.from('speed_results').select('*').limit(50);

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

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('speed_results_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'speed_results' },
        (payload) => {
          const newRow = payload.new as SpeedResult;
          setState(prev => {
            let updated = [newRow, ...prev.results];

            if (tab === 'download') {
              updated = updated.sort((a, b) => b.download_mbps - a.download_mbps);
            } else if (tab === 'upload') {
              updated = updated.sort((a, b) => b.upload_mbps - a.upload_mbps);
            }

            return {
              ...prev,
              results: updated.slice(0, 50),
              newRowId: newRow.id,
            };
          });

          // Clear the flash after 1.5s
          setTimeout(() => {
            setState(prev => ({ ...prev, newRowId: null }));
          }, 1500);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tab]);

  return { ...state, refetch: fetchResults };
}
