import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  created_at: string;
}

export interface EmailSignup {
  id: string;
  email: string;
  username: string | null;
  created_at: string;
}

export type SpeedResultInsert = Omit<SpeedResult, 'id' | 'created_at'>;
