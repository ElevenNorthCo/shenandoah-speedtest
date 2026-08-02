import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const productionSiteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim()
  || 'https://www.shenandoahspeedtest.com';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Public community data must never inherit a signed-in session. This keeps
// public leaderboard/map reads on the anon RLS path, while the primary client
// is reserved for the signed-in user's private dashboard data.
export const publicSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export const PUBLIC_SPEED_RESULT_COLUMNS = 'id,username,download_mbps,upload_mbps,ping_ms,carrier,isp_detected,town,region,lat,lng,created_at' as const;

// ── Core result types ───────────────────────────────────────────────────────

export interface SpeedResult {
  id: string;
  username: string;
  download_mbps: number;
  upload_mbps: number;
  ping_ms: number;
  carrier: string | null;
  isp_detected: string | null;
  town: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
  user_email?: string | null;
  created_at: string;
}

export type SpeedResultInsert = Omit<SpeedResult, 'id' | 'created_at'> & {
  user_email?: string | null;
};

// ── View types ──────────────────────────────────────────────────────────────

export interface TownStats {
  town: string;
  region: string;
  test_count: number;
  avg_download: number;
  avg_upload: number;
  avg_ping: number;
  max_download: number;
  top_carrier: string;
  last_tested: string;
}

export interface CarrierStats {
  carrier: string;
  test_count: number;
  avg_download: number;
  avg_upload: number;
  avg_ping: number;
  best_download: number;
}

// ── Auth helpers ────────────────────────────────────────────────────────────

export async function signInWithMagicLink(email: string) {
  // Use the browser origin during local development, but send production users
  // to the canonical domain even when the app is opened through a deployment
  // alias or a non-www redirect.
  const siteUrl = import.meta.env.DEV ? window.location.origin : productionSiteUrl;

  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: new URL('/dashboard', siteUrl).toString(),
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAuthChange(callback: (user: import('@supabase/supabase-js').User | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return data.subscription;
}
