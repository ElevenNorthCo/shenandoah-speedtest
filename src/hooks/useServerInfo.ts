import { useEffect, useState } from 'react';

export interface ServerInfo {
  ip: string;
  serverCity: string;
  rttMs: number | null;
}

// Cloudflare colo codes → city names (the edges Valley users realistically hit)
const COLO_CITIES: Record<string, string> = {
  IAD: 'Ashburn, VA',
  RIC: 'Richmond, VA',
  PHL: 'Philadelphia, PA',
  PIT: 'Pittsburgh, PA',
  CLT: 'Charlotte, NC',
  BNA: 'Nashville, TN',
  ATL: 'Atlanta, GA',
  EWR: 'Newark, NJ',
  BOS: 'Boston, MA',
  ORD: 'Chicago, IL',
  CMH: 'Columbus, OH',
  DTW: 'Detroit, MI',
  MCI: 'Kansas City, MO',
  MIA: 'Miami, FL',
  DFW: 'Dallas, TX',
  IAH: 'Houston, TX',
  DEN: 'Denver, CO',
  PHX: 'Phoenix, AZ',
  SLC: 'Salt Lake City, UT',
  SEA: 'Seattle, WA',
  SJC: 'San Jose, CA',
  LAX: 'Los Angeles, CA',
};

// Identify the Cloudflare edge (the speed test target) and the user's IP.
// The trace endpoint is free, tokenless, and returns key=value lines.
export function useServerInfo(): ServerInfo | null {
  const [info, setInfo] = useState<ServerInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      try {
        const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return;
        const text = await res.text();
        const fields = Object.fromEntries(
          text.trim().split('\n').map(line => line.split('=') as [string, string])
        );

        // Rough RTT estimate over the now-warm connection
        let rttMs: number | null = null;
        try {
          const start = performance.now();
          await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
            method: 'HEAD',
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
          });
          rttMs = Math.round(performance.now() - start);
        } catch {
          // leave null
        }

        if (cancelled) return;
        const colo = fields.colo ?? '';
        setInfo({
          ip: fields.ip ?? '',
          serverCity: COLO_CITIES[colo] ?? (colo ? `${colo} Edge` : 'Cloudflare Edge'),
          rttMs,
        });
      } catch {
        // detection failed — header just omits the server line
      }
    };

    void detect();
    return () => { cancelled = true; };
  }, []);

  return info;
}
