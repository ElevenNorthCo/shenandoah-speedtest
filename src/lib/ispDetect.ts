export interface IspInfo {
  isp: string;
  city: string;
  region: string;
  country: string;
  lat: number | null;
  lng: number | null;
  ip: string;
}

// Extract token from the env variable (which is stored as a full URL)
function getIpInfoToken(): string {
  const raw = import.meta.env.VITE_IPINFO_TOKEN as string;
  if (!raw) return '';
  // If stored as a full URL like https://api.ipinfo.io/lite/8.8.8.8?token=XXXX
  // extract just the token value
  const match = raw.match(/[?&]token=([^&]+)/);
  if (match) return match[1];
  // If stored as just the token
  return raw;
}

export async function detectIsp(): Promise<IspInfo> {
  const token = getIpInfoToken();

  // Try ipinfo.io first
  if (token) {
    try {
      const url = `https://ipinfo.io/json?token=${token}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json() as {
          ip?: string;
          org?: string;
          city?: string;
          region?: string;
          country?: string;
          loc?: string;
        };

        const [lat, lng] = data.loc ? data.loc.split(',').map(Number) : [null, null];
        const orgRaw = data.org ?? '';
        // org is formatted like "AS7922 Comcast Cable Communications" — strip the AS number
        const isp = orgRaw.replace(/^AS\d+\s+/, '').trim() || 'Unknown';

        return {
          isp,
          city: data.city ?? '',
          region: data.region ?? '',
          country: data.country ?? '',
          lat: lat ?? null,
          lng: lng ?? null,
          ip: data.ip ?? '',
        };
      }
    } catch {
      // fall through to backup
    }
  }

  // Fallback: ipapi.co
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = await response.json() as {
        ip?: string;
        org?: string;
        city?: string;
        region?: string;
        country_name?: string;
        latitude?: number;
        longitude?: number;
      };

      return {
        isp: data.org?.replace(/^AS\d+\s+/, '').trim() ?? 'Unknown',
        city: data.city ?? '',
        region: data.region ?? '',
        country: data.country_name ?? '',
        lat: data.latitude ?? null,
        lng: data.longitude ?? null,
        ip: data.ip ?? '',
      };
    }
  } catch {
    // all detection failed
  }

  return {
    isp: 'Unknown',
    city: '',
    region: '',
    country: '',
    lat: null,
    lng: null,
    ip: '',
  };
}

// Map detected ISP name to our carrier dropdown options
export function matchCarrier(ispName: string): string {
  const name = ispName.toLowerCase();
  if (name.includes('comcast') || name.includes('xfinity')) return 'Comcast / Xfinity';
  if (name.includes('shenandoah') || name.includes('shentel')) return 'Shenandoah Telecommunications (Shentel)';
  if (name.includes('starlink') || name.includes('spacex')) return 'Starlink';
  if (name.includes('t-mobile') || name.includes('tmobile')) return 'T-Mobile Home Internet';
  if (name.includes('verizon')) return 'Verizon';
  if (name.includes('skyline') || name.includes('skybest')) return 'Skyline / Skybest';
  if (name.includes('all points') || name.includes('allpoints')) return 'All Points Broadband';
  if (name.includes('hughes')) return 'HughesNet';
  if (name.includes('viasat') || name.includes('exede')) return 'Viasat';
  return 'Other';
}
