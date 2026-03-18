export interface TownInfo {
  town: string;
  region: string;
  lat: number;
  lng: number;
  parentArea?: string;
}

// ── Comprehensive Shenandoah Valley community list ──────────────────────────
// 150+ communities with accurate geographic center coordinates.
// parentArea groups nearby communities for the Towns directory.

const VALLEY_TOWNS: TownInfo[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // FREDERICK COUNTY VA / WINCHESTER
  // ═══════════════════════════════════════════════════════════════════════════
  { town: 'Winchester', region: 'VA', lat: 39.1857, lng: -78.1637, parentArea: 'Winchester Area' },
  { town: 'Stephens City', region: 'VA', lat: 39.0835, lng: -78.2183, parentArea: 'Winchester Area' },
  { town: 'Middletown', region: 'VA', lat: 39.0290, lng: -78.2783, parentArea: 'Winchester Area' },
  { town: 'Clearbrook', region: 'VA', lat: 39.2470, lng: -78.1000, parentArea: 'Winchester Area' },
  { town: 'Brucetown', region: 'VA', lat: 39.1340, lng: -78.2010, parentArea: 'Winchester Area' },
  { town: 'Gore', region: 'VA', lat: 39.2780, lng: -78.3350, parentArea: 'Winchester Area' },
  { town: 'Gainesboro', region: 'VA', lat: 39.2450, lng: -78.2820, parentArea: 'Winchester Area' },
  { town: 'Cross Junction', region: 'VA', lat: 39.3030, lng: -78.2870, parentArea: 'Winchester Area' },
  { town: 'Whitacre', region: 'VA', lat: 39.2160, lng: -78.2350, parentArea: 'Winchester Area' },
  { town: 'Star Tannery', region: 'VA', lat: 39.0710, lng: -78.4500, parentArea: 'Winchester Area' },
  { town: 'Armel', region: 'VA', lat: 39.2080, lng: -78.3580, parentArea: 'Winchester Area' },
  { town: 'Kernstown', region: 'VA', lat: 39.1480, lng: -78.1850, parentArea: 'Winchester Area' },

  // ═══════════════════════════════════════════════════════════════════════════
  // WARREN COUNTY VA / FRONT ROYAL
  // ═══════════════════════════════════════════════════════════════════════════
  { town: 'Front Royal', region: 'VA', lat: 38.9182, lng: -78.1947, parentArea: 'Front Royal Area' },
  { town: 'Bentonville', region: 'VA', lat: 38.8340, lng: -78.3330, parentArea: 'Front Royal Area' },
  { town: 'Browntown', region: 'VA', lat: 38.8700, lng: -78.2090, parentArea: 'Front Royal Area' },
  { town: 'Linden', region: 'VA', lat: 38.9080, lng: -78.0880, parentArea: 'Front Royal Area' },
  { town: 'Limeton', region: 'VA', lat: 38.8670, lng: -78.2790, parentArea: 'Front Royal Area' },
  { town: 'Cedarville', region: 'VA', lat: 38.9650, lng: -78.2450, parentArea: 'Front Royal Area' },
  { town: 'Chester Gap', region: 'VA', lat: 38.8740, lng: -78.1190, parentArea: 'Front Royal Area' },
  { town: 'Reliance', region: 'VA', lat: 38.9450, lng: -78.2870, parentArea: 'Front Royal Area' },
  { town: 'Overall', region: 'VA', lat: 38.7980, lng: -78.3100, parentArea: 'Front Royal Area' },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHENANDOAH COUNTY VA
  // ═══════════════════════════════════════════════════════════════════════════
  { town: 'Strasburg', region: 'VA', lat: 38.9957, lng: -78.3589, parentArea: 'Strasburg Area' },
  { town: 'Toms Brook', region: 'VA', lat: 38.9430, lng: -78.4370, parentArea: 'Strasburg Area' },
  { town: 'Fishers Hill', region: 'VA', lat: 38.9200, lng: -78.4580, parentArea: 'Strasburg Area' },
  { town: 'Signal Knob', region: 'VA', lat: 38.9600, lng: -78.3310, parentArea: 'Strasburg Area' },

  { town: 'Woodstock', region: 'VA', lat: 38.8818, lng: -78.5078, parentArea: 'Woodstock Area' },
  { town: 'Maurertown', region: 'VA', lat: 38.8893, lng: -78.5303, parentArea: 'Woodstock Area' },
  { town: 'Quicksburg', region: 'VA', lat: 38.7290, lng: -78.6950, parentArea: 'Woodstock Area' },
  { town: 'Conicville', region: 'VA', lat: 38.8200, lng: -78.6310, parentArea: 'Woodstock Area' },
  { town: 'Forestville', region: 'VA', lat: 38.8630, lng: -78.5120, parentArea: 'Woodstock Area' },

  { town: 'Edinburg', region: 'VA', lat: 38.8243, lng: -78.5681, parentArea: 'Edinburg Area' },
  { town: 'Lantz Mills', region: 'VA', lat: 38.7730, lng: -78.5870, parentArea: 'Edinburg Area' },
  { town: 'Larkinsville', region: 'VA', lat: 38.7900, lng: -78.5750, parentArea: 'Edinburg Area' },

  { town: 'Mount Jackson', region: 'VA', lat: 38.7407, lng: -78.6400, parentArea: 'Mount Jackson Area' },
  { town: 'Peterkin', region: 'VA', lat: 38.7550, lng: -78.6200, parentArea: 'Mount Jackson Area' },
  { town: 'Detrick', region: 'VA', lat: 38.7650, lng: -78.6480, parentArea: 'Mount Jackson Area' },

  { town: 'New Market', region: 'VA', lat: 38.6454, lng: -78.6736, parentArea: 'New Market Area' },
  { town: 'Enders', region: 'VA', lat: 38.6730, lng: -78.6400, parentArea: 'New Market Area' },
  { town: 'Hazel Run', region: 'VA', lat: 38.7100, lng: -78.6600, parentArea: 'New Market Area' },

  { town: 'Basye', region: 'VA', lat: 38.8050, lng: -78.7820, parentArea: 'Basye-Orkney Area' },
  { town: 'Orkney Springs', region: 'VA', lat: 38.7920, lng: -78.8280, parentArea: 'Basye-Orkney Area' },
  { town: 'Columbia Furnace', region: 'VA', lat: 38.8640, lng: -78.6900, parentArea: 'Basye-Orkney Area' },
  { town: 'Cootes Store', region: 'VA', lat: 38.7330, lng: -78.8600, parentArea: 'Basye-Orkney Area' },

  { town: 'Bowmans Crossing', region: 'VA', lat: 38.9100, lng: -78.4750, parentArea: 'Strasburg Area' },

  // ═══════════════════════════════════════════════════════════════════════════
  // ROCKINGHAM COUNTY VA / HARRISONBURG
  // ═══════════════════════════════════════════════════════════════════════════
  { town: 'Harrisonburg', region: 'VA', lat: 38.4496, lng: -78.8689, parentArea: 'Harrisonburg Area' },
  { town: 'Penn Laird', region: 'VA', lat: 38.4310, lng: -78.8130, parentArea: 'Harrisonburg Area' },
  { town: 'McGaheysville', region: 'VA', lat: 38.4220, lng: -78.7380, parentArea: 'Harrisonburg Area' },
  { town: 'Keezletown', region: 'VA', lat: 38.4550, lng: -78.7560, parentArea: 'Harrisonburg Area' },
  { town: 'Hinton', region: 'VA', lat: 38.4900, lng: -78.8200, parentArea: 'Harrisonburg Area' },
  { town: 'Massanutten', region: 'VA', lat: 38.4050, lng: -78.7350, parentArea: 'Harrisonburg Area' },

  { town: 'Broadway', region: 'VA', lat: 38.6068, lng: -78.7981, parentArea: 'Broadway Area' },
  { town: 'Mauzy', region: 'VA', lat: 38.5780, lng: -78.7800, parentArea: 'Broadway Area' },
  { town: 'Singers Glen', region: 'VA', lat: 38.5500, lng: -78.8650, parentArea: 'Broadway Area' },
  { town: 'Lacey Springs', region: 'VA', lat: 38.5410, lng: -78.8250, parentArea: 'Broadway Area' },
  { town: 'Timberville', region: 'VA', lat: 38.6354, lng: -78.7736, parentArea: 'Broadway Area' },
  { town: 'Ottobine', region: 'VA', lat: 38.4700, lng: -78.9350, parentArea: 'Broadway Area' },
  { town: 'Tenth Legion', region: 'VA', lat: 38.5920, lng: -78.7900, parentArea: 'Broadway Area' },
  { town: 'Linville', region: 'VA', lat: 38.5630, lng: -78.8250, parentArea: 'Broadway Area' },
  { town: 'Edom', region: 'VA', lat: 38.5270, lng: -78.8030, parentArea: 'Broadway Area' },

  { town: 'Bridgewater', region: 'VA', lat: 38.3818, lng: -78.9728, parentArea: 'Bridgewater Area' },
  { town: 'Dayton', region: 'VA', lat: 38.4146, lng: -78.9403, parentArea: 'Bridgewater Area' },
  { town: 'Rawley Springs', region: 'VA', lat: 38.5100, lng: -79.0130, parentArea: 'Bridgewater Area' },

  { town: 'Elkton', region: 'VA', lat: 38.4101, lng: -78.6153, parentArea: 'Elkton Area' },
  { town: 'Shenandoah', region: 'VA', lat: 38.4854, lng: -78.6286, parentArea: 'Elkton Area' },
  { town: 'Port Republic', region: 'VA', lat: 38.3110, lng: -78.8070, parentArea: 'Elkton Area' },

  { town: 'Bergton', region: 'VA', lat: 38.6543, lng: -79.0472, parentArea: 'Bergton Area' },
  { town: 'Fulks Run', region: 'VA', lat: 38.6500, lng: -78.9500, parentArea: 'Bergton Area' },
  { town: 'Brock Gap', region: 'VA', lat: 38.6800, lng: -79.0600, parentArea: 'Bergton Area' },

  { town: 'Grottoes', region: 'VA', lat: 38.2644, lng: -78.8250, parentArea: 'Grottoes Area' },
  { town: 'Crimora', region: 'VA', lat: 38.2330, lng: -78.8500, parentArea: 'Grottoes Area' },

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE COUNTY VA
  // ═══════════════════════════════════════════════════════════════════════════
  { town: 'Luray', region: 'VA', lat: 38.6651, lng: -78.4567, parentArea: 'Luray Area' },
  { town: 'Stanley', region: 'VA', lat: 38.5730, lng: -78.5040, parentArea: 'Luray Area' },
  { town: 'Alma', region: 'VA', lat: 38.5950, lng: -78.5090, parentArea: 'Luray Area' },
  { town: 'Rileyville', region: 'VA', lat: 38.7520, lng: -78.3740, parentArea: 'Luray Area' },
  { town: 'Compton', region: 'VA', lat: 38.7100, lng: -78.4050, parentArea: 'Luray Area' },
  { town: 'Leaksville', region: 'VA', lat: 38.6340, lng: -78.4750, parentArea: 'Luray Area' },
  { town: 'Ida', region: 'VA', lat: 38.5600, lng: -78.5400, parentArea: 'Luray Area' },
  { town: 'Marksville', region: 'VA', lat: 38.6100, lng: -78.4200, parentArea: 'Luray Area' },
  { town: 'Waterlick', region: 'VA', lat: 38.7870, lng: -78.3490, parentArea: 'Luray Area' },
  { town: 'Fletcher', region: 'VA', lat: 38.5400, lng: -78.5300, parentArea: 'Luray Area' },
  { town: 'Dooms', region: 'VA', lat: 38.1290, lng: -78.9050, parentArea: 'Waynesboro Area' },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUGUSTA COUNTY VA / STAUNTON / WAYNESBORO
  // ═══════════════════════════════════════════════════════════════════════════
  { town: 'Staunton', region: 'VA', lat: 38.1496, lng: -79.0717, parentArea: 'Staunton Area' },
  { town: 'Verona', region: 'VA', lat: 38.2000, lng: -79.0060, parentArea: 'Staunton Area' },
  { town: 'Fishersville', region: 'VA', lat: 38.0970, lng: -79.0380, parentArea: 'Staunton Area' },
  { town: 'Churchville', region: 'VA', lat: 38.2330, lng: -79.1600, parentArea: 'Staunton Area' },
  { town: 'Swoope', region: 'VA', lat: 38.2050, lng: -79.2170, parentArea: 'Staunton Area' },
  { town: 'Greenville', region: 'VA', lat: 37.9470, lng: -79.1840, parentArea: 'Staunton Area' },
  { town: 'Middlebrook', region: 'VA', lat: 38.0690, lng: -79.2630, parentArea: 'Staunton Area' },
  { town: 'Mint Spring', region: 'VA', lat: 38.0870, lng: -79.0900, parentArea: 'Staunton Area' },
  { town: 'Barren Ridge', region: 'VA', lat: 38.0700, lng: -79.1700, parentArea: 'Staunton Area' },

  { town: 'Waynesboro', region: 'VA', lat: 38.0685, lng: -78.8895, parentArea: 'Waynesboro Area' },
  { town: 'Stuarts Draft', region: 'VA', lat: 38.0300, lng: -79.0370, parentArea: 'Waynesboro Area' },
  { town: 'Lyndhurst', region: 'VA', lat: 38.0620, lng: -78.9500, parentArea: 'Waynesboro Area' },

  { town: 'Weyers Cave', region: 'VA', lat: 38.2910, lng: -78.9120, parentArea: 'Weyers Cave Area' },
  { town: 'Deerfield', region: 'VA', lat: 38.2430, lng: -79.3820, parentArea: 'Staunton Area' },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHENANDOAH VALLEY — WV SIDE
  // ═══════════════════════════════════════════════════════════════════════════
  { town: 'Moorefield', region: 'WV', lat: 39.0648, lng: -78.9739, parentArea: 'Moorefield Area' },
  { town: 'Petersburg', region: 'WV', lat: 38.9935, lng: -79.1267, parentArea: 'Petersburg Area' },
  { town: 'Franklin', region: 'WV', lat: 38.6432, lng: -79.3310, parentArea: 'Franklin Area' },
  { town: 'Mathias', region: 'WV', lat: 38.8740, lng: -78.8625, parentArea: 'Moorefield Area' },
  { town: 'Baker', region: 'WV', lat: 38.9190, lng: -78.8100, parentArea: 'Moorefield Area' },
  { town: 'Lost City', region: 'WV', lat: 39.0080, lng: -78.8020, parentArea: 'Moorefield Area' },
  { town: 'Riverton', region: 'WV', lat: 38.7440, lng: -79.4120, parentArea: 'Franklin Area' },
  { town: 'Cabins', region: 'WV', lat: 39.0050, lng: -79.0260, parentArea: 'Petersburg Area' },
  { town: 'Seneca Rocks', region: 'WV', lat: 38.8340, lng: -79.3760, parentArea: 'Franklin Area' },
  { town: 'Wardensville', region: 'WV', lat: 39.0680, lng: -78.5930, parentArea: 'Wardensville Area' },
  { town: 'Capon Bridge', region: 'WV', lat: 39.2960, lng: -78.4470, parentArea: 'Wardensville Area' },
  { town: 'Yellow Spring', region: 'WV', lat: 39.3900, lng: -78.4800, parentArea: 'Wardensville Area' },
  { town: 'Augusta', region: 'WV', lat: 39.3000, lng: -78.6100, parentArea: 'Wardensville Area' },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL COMMUNITIES — fill-in for rural coverage
  // ═══════════════════════════════════════════════════════════════════════════

  // Clarke County VA (eastern gateway to the Valley)
  { town: 'Berryville', region: 'VA', lat: 39.1518, lng: -77.9827, parentArea: 'Clarke County' },
  { town: 'Boyce', region: 'VA', lat: 39.0770, lng: -78.0600, parentArea: 'Clarke County' },
  { town: 'White Post', region: 'VA', lat: 39.0590, lng: -78.1020, parentArea: 'Clarke County' },
  { town: 'Millwood', region: 'VA', lat: 39.0790, lng: -78.0970, parentArea: 'Clarke County' },

  // Bath County VA (western mountains)
  { town: 'Warm Springs', region: 'VA', lat: 38.0470, lng: -79.7900, parentArea: 'Bath County' },
  { town: 'Hot Springs', region: 'VA', lat: 37.9970, lng: -79.8330, parentArea: 'Bath County' },

  // Highland County VA
  { town: 'Monterey', region: 'VA', lat: 38.4110, lng: -79.5810, parentArea: 'Highland County' },
  { town: 'McDowell', region: 'VA', lat: 38.3060, lng: -79.4870, parentArea: 'Highland County' },

  // Rockbridge County VA (southern Valley)
  { town: 'Lexington', region: 'VA', lat: 37.7838, lng: -79.4428, parentArea: 'Lexington Area' },
  { town: 'Buena Vista', region: 'VA', lat: 37.7343, lng: -79.3540, parentArea: 'Lexington Area' },
  { town: 'Natural Bridge', region: 'VA', lat: 37.6290, lng: -79.5430, parentArea: 'Lexington Area' },
  { town: 'Glasgow', region: 'VA', lat: 37.6330, lng: -79.4500, parentArea: 'Lexington Area' },
  { town: 'Fairfield', region: 'VA', lat: 37.8750, lng: -79.3390, parentArea: 'Lexington Area' },
  { town: 'Raphine', region: 'VA', lat: 37.9230, lng: -79.2270, parentArea: 'Lexington Area' },

  // More Augusta County fill-in
  { town: 'Craigsville', region: 'VA', lat: 38.0780, lng: -79.3650, parentArea: 'Staunton Area' },
  { town: 'Stagersville', region: 'VA', lat: 38.1500, lng: -78.9600, parentArea: 'Waynesboro Area' },
  { town: 'Fort Defiance', region: 'VA', lat: 38.2310, lng: -79.0020, parentArea: 'Staunton Area' },
  { town: 'Mount Sidney', region: 'VA', lat: 38.2480, lng: -78.9950, parentArea: 'Staunton Area' },
  { town: 'Spring Hill', region: 'VA', lat: 38.2100, lng: -78.9240, parentArea: 'Staunton Area' },
  { town: 'New Hope', region: 'VA', lat: 38.1700, lng: -79.1500, parentArea: 'Staunton Area' },

  // More Rockingham County fill-in
  { town: 'Timberville East', region: 'VA', lat: 38.6280, lng: -78.7450, parentArea: 'Broadway Area' },
  { town: 'Pleasant Valley', region: 'VA', lat: 38.4800, lng: -78.7400, parentArea: 'Harrisonburg Area' },
  { town: 'Rushville', region: 'VA', lat: 38.3850, lng: -78.9000, parentArea: 'Bridgewater Area' },
  { town: 'Mount Crawford', region: 'VA', lat: 38.3600, lng: -78.9400, parentArea: 'Bridgewater Area' },
  { town: 'Clover Hill', region: 'VA', lat: 38.5100, lng: -78.7650, parentArea: 'Broadway Area' },

  // Additional WV communities
  { town: 'Brandywine', region: 'WV', lat: 38.6310, lng: -79.2330, parentArea: 'Franklin Area' },
  { town: 'Sugar Grove', region: 'WV', lat: 38.5350, lng: -79.3270, parentArea: 'Franklin Area' },
  { town: 'Circleville', region: 'WV', lat: 38.7330, lng: -79.4900, parentArea: 'Franklin Area' },
  { town: 'Doe Hill', region: 'VA', lat: 38.4390, lng: -79.4650, parentArea: 'Highland County' },
  { town: 'Blue Grass', region: 'VA', lat: 38.4180, lng: -79.5500, parentArea: 'Highland County' },
  { town: 'Upper Tract', region: 'WV', lat: 38.8620, lng: -79.2290, parentArea: 'Petersburg Area' },

  // More Page County fill-in
  { town: 'Shenandoah Caverns', region: 'VA', lat: 38.7150, lng: -78.6050, parentArea: 'New Market Area' },
  { town: 'Hamburg', region: 'VA', lat: 38.6300, lng: -78.4600, parentArea: 'Luray Area' },
  { town: 'Grove Hill', region: 'VA', lat: 38.5880, lng: -78.4900, parentArea: 'Luray Area' },

  // More Frederick / Winchester fill
  { town: 'Hayfield', region: 'VA', lat: 39.2400, lng: -78.1700, parentArea: 'Winchester Area' },
  { town: 'Shawneeland', region: 'VA', lat: 39.1100, lng: -78.3900, parentArea: 'Winchester Area' },
  { town: 'Marlboro', region: 'VA', lat: 39.1530, lng: -78.2650, parentArea: 'Winchester Area' },

  // More Warren County fill
  { town: 'Riverton', region: 'VA', lat: 38.9110, lng: -78.2670, parentArea: 'Front Royal Area' },

  // Shenandoah County extras
  { town: 'Meems Bottom', region: 'VA', lat: 38.7200, lng: -78.6350, parentArea: 'Mount Jackson Area' },
  { town: 'Edinburg Gap', region: 'VA', lat: 38.8380, lng: -78.6200, parentArea: 'Edinburg Area' },
  { town: 'Wolf Gap', region: 'VA', lat: 38.9200, lng: -78.6900, parentArea: 'Woodstock Area' },
  { town: 'Zepp', region: 'VA', lat: 38.7500, lng: -78.7200, parentArea: 'Basye-Orkney Area' },

  // Hardy County WV extras
  { town: 'Old Fields', region: 'WV', lat: 39.0850, lng: -78.9400, parentArea: 'Moorefield Area' },
  { town: 'Rio', region: 'WV', lat: 39.0200, lng: -78.8800, parentArea: 'Moorefield Area' },
];

// ── Parent Areas Map ──────────────────────────────────────────────────────────
// Maps parent area names to arrays of community names in that area.

export const PARENT_AREAS: Record<string, string[]> = {};
for (const town of VALLEY_TOWNS) {
  if (town.parentArea) {
    if (!PARENT_AREAS[town.parentArea]) {
      PARENT_AREAS[town.parentArea] = [];
    }
    PARENT_AREAS[town.parentArea].push(town.town);
  }
}

// ── Distance calculations ─────────────────────────────────────────────────────

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Max snap distance in km (15 miles ≈ 24.14 km) */
const MAX_SNAP_DISTANCE_KM = 24.14;

/**
 * Snap a coordinate to the nearest known Valley community.
 * If the nearest town is more than 15 miles away, returns the raw
 * coordinates with a generic region label instead of mis-assigning
 * to a distant town.
 */
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

  // If the nearest town is too far, return a generic location
  if (minDist > MAX_SNAP_DISTANCE_KM) {
    return {
      town: 'Shenandoah Valley',
      region: 'VA',
      lat,
      lng,
    };
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

/**
 * Generate a URL slug from a town name.
 * e.g., "Singers Glen" → "singers-glen"
 */
export function townToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Find a town by its slug.
 */
export function findTownBySlug(slug: string): TownInfo | undefined {
  return VALLEY_TOWNS.find(t => townToSlug(t.town) === slug);
}

export { VALLEY_TOWNS };
