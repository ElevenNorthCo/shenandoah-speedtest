import { useState, useEffect } from 'react';
import { supabase, type TownStats, type CarrierStats } from '../lib/supabase';

export function useTownStats() {
  const [data, setData] = useState<TownStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: result, error: err } = await supabase
          .from('town_stats')
          .select('*')
          .order('test_count', { ascending: false });

        if (err) throw err;
        setData(result ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load town stats');
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, []);

  return { data, loading, error };
}

export function useCarrierStats() {
  const [data, setData] = useState<CarrierStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: result, error: err } = await supabase
          .from('carrier_stats')
          .select('*')
          .order('avg_download', { ascending: false });

        if (err) throw err;
        setData(result ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load carrier stats');
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, []);

  return { data, loading, error };
}

export function useLiveStats() {
  const [stats, setStats] = useState({ totalTests: 0, communities: 0, carriers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Total tests
        const { count } = await supabase
          .from('speed_results')
          .select('*', { count: 'exact', head: true });

        // Distinct towns
        const { data: towns } = await supabase
          .from('speed_results')
          .select('town')
          .not('town', 'is', null);

        const uniqueTowns = new Set(towns?.map(t => t.town) ?? []);

        // Distinct carriers
        const { data: carriers } = await supabase
          .from('speed_results')
          .select('carrier')
          .not('carrier', 'is', null)
          .not('carrier', 'eq', 'Other');

        const uniqueCarriers = new Set(carriers?.map(c => c.carrier) ?? []);

        setStats({
          totalTests: count ?? 0,
          communities: uniqueTowns.size,
          carriers: uniqueCarriers.size,
        });
      } catch {
        // silent fail — stat chips will show 0
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, []);

  return { stats, loading };
}
