import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export interface EmailSignup {
  id: string;
  email: string;
  username: string | null;
  verified: boolean;
  created_at: string;
}

export type SpeedResultInsert = Omit<SpeedResult, 'id' | 'created_at'>;

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
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
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
