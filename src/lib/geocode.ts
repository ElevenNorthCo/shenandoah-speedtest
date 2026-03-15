export interface TownInfo {
  town: string;
  region: string;
  lat: number;
  lng: number;
}

// Town centroids for the Shenandoah Valley region
// Used to snap user location to nearest named town
const VALLEY_TOWNS: TownInfo[] = [
  { town: 'Winchester', region: 'VA', lat: 39.1857, lng: -78.1637 },
  { town: 'Harrisonburg', region: 'VA', lat: 38.4496, lng: -78.8689 },
  { town: 'Staunton', region: 'VA', lat: 38.1496, lng: -79.0717 },
  { town: 'Waynesboro', region: 'VA', lat: 38.0685, lng: -78.8895 },
  { town: 'Front Royal', region: 'VA', lat: 38.9182, lng: -78.1947 },
  { town: 'Strasburg', region: 'VA', lat: 38.9957, lng: -78.3589 },
  { town: 'Woodstock', region: 'VA', lat: 38.8818, lng: -78.5078 },
  { town: 'Edinburg', region: 'VA', lat: 38.8243, lng: -78.5681 },
  { town: 'Mount Jackson', region: 'VA', lat: 38.7407, lng: -78.6400 },
  { town: 'New Market', region: 'VA', lat: 38.6454, lng: -78.6736 },
  { town: 'Luray', region: 'VA', lat: 38.6651, lng: -78.4567 },
  { town: 'Shenandoah', region: 'VA', lat: 38.4854, lng: -78.6286 },
  { town: 'Elkton', region: 'VA', lat: 38.4101, lng: -78.6153 },
  { town: 'Bridgewater', region: 'VA', lat: 38.3818, lng: -78.9728 },
  { town: 'Dayton', region: 'VA', lat: 38.4146, lng: -78.9403 },
  { town: 'Timberville', region: 'VA', lat: 38.6354, lng: -78.7736 },
  { town: 'Broadway', region: 'VA', lat: 38.6068, lng: -78.7981 },
  { town: 'Maurertown', region: 'VA', lat: 38.8893, lng: -78.5303 },
  { town: 'Quicksburg', region: 'VA', lat: 38.7290, lng: -78.6950 },
  { town: 'Bergton', region: 'VA', lat: 38.6543, lng: -79.0472 },
  { town: 'Mathias', region: 'WV', lat: 38.8740, lng: -78.8625 },
  { town: 'Moorefield', region: 'WV', lat: 39.0648, lng: -78.9739 },
  { town: 'Petersburg', region: 'WV', lat: 38.9935, lng: -79.1267 },
];

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function snapToNearestTown(lat: number, lng: number): TownInfo {
  let nearest = VALLEY_TOWNS[0];
  let minDist = Infinity;

  for (const town of VALLEY_TOWNS) {
    const dist = haversineDistance(lat, lng, town.lat, town.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = town;
    }
  }

  return nearest;
}

export async function reverseGeocode(lat: number, lng: number): Promise<TownInfo> {
  // First try Nominatim for more accurate result
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'ShenandoahSpeedTest/1.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json() as {
        address?: {
          city?: string;
          town?: string;
          village?: string;
          hamlet?: string;
          county?: string;
          state?: string;
        };
      };

      const addr = data.address;
      const placeName = addr?.city ?? addr?.town ?? addr?.village ?? addr?.hamlet;

      if (placeName) {
        // Try to find this in our valley towns list first
        const normalized = placeName.toLowerCase();
        const match = VALLEY_TOWNS.find(t => t.town.toLowerCase() === normalized);
        if (match) return match;

        // Return Nominatim result snapped to nearest centroid
        const snapped = snapToNearestTown(lat, lng);
        return snapped;
      }
    }
  } catch {
    // fall through to snap
  }

  // Fallback: snap to nearest town centroid
  return snapToNearestTown(lat, lng);
}

export { VALLEY_TOWNS };
