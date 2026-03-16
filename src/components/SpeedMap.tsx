import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase, type SpeedResult } from '../lib/supabase';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface TownCluster {
  town: string;
  lat: number;
  lng: number;
  results: SpeedResult[];
  avgDownload: number;
  count: number;
}

function getSignalColor(downloadMbps: number): string {
  if (downloadMbps >= 100) return '#00FFB2';
  if (downloadMbps >= 25) return '#FFB800';
  return '#FF4444';
}

function createPinElement(color: string, count: number, isNew = false): HTMLDivElement {
  const el = document.createElement('div');
  const size = count > 1 ? Math.min(14 + count * 2, 28) : 14;
  el.className = `speed-pin${isNew ? ' new-pin' : ''}`;
  el.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${color};
    box-shadow: 0 0 12px ${color}, 0 0 24px ${color}60;
    border: 2px solid rgba(255,255,255,0.3);
    cursor: pointer;
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    font-weight: 700;
    color: rgba(0,0,0,0.8);
    position: relative;
  `;
  if (count > 1) {
    el.textContent = String(count);
  }
  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.3)'; });
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });
  return el;
}

function createCelebrationRing(color: string): HTMLDivElement {
  const ring = document.createElement('div');
  ring.style.cssText = `
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) scale(1);
    width: 14px; height: 14px;
    border-radius: 50%;
    border: 2px solid ${color};
    animation: celebrationRing 1.2s ease-out forwards;
    pointer-events: none;
  `;
  return ring;
}

function buildPopupHTML(cluster: TownCluster): string {
  const topResults = [...cluster.results]
    .sort((a, b) => b.download_mbps - a.download_mbps)
    .slice(0, 3);

  const medals = ['🥇', '🥈', '🥉'];

  const rowsHTML = topResults.map((r, i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:12px;">
      <span style="color:#7A9BB5;">${medals[i]} ${r.username}</span>
      <span style="font-family:'Space Mono',monospace;color:#00FFB2;">
        ${r.download_mbps.toFixed(0)}↓ ${r.upload_mbps.toFixed(0)}↑
      </span>
    </div>
  `).join('');

  return `
    <div style="font-family:'Sora',sans-serif;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
        <span style="font-size:14px;">📍</span>
        <span style="font-family:'Rajdhani',sans-serif;font-size:1.1rem;font-weight:700;color:#E8F0F7;letter-spacing:0.05em;">
          ${cluster.town.toUpperCase()}
        </span>
      </div>
      <div style="border-top:1px solid #1A2D40;padding-top:8px;margin-bottom:8px;">
        <div style="font-size:11px;color:#7A9BB5;letter-spacing:0.08em;margin-bottom:6px;font-family:'Space Mono',monospace;">
          🏆 TOP RESULTS
        </div>
        ${rowsHTML}
      </div>
      <div style="border-top:1px solid #1A2D40;padding-top:8px;display:flex;justify-content:space-between;font-size:11px;">
        <span style="color:#7A9BB5;">Avg Speed</span>
        <span style="font-family:'Space Mono',monospace;color:#FFB800;">${cluster.avgDownload.toFixed(0)} Mbps ↓</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:4px;">
        <span style="color:#7A9BB5;">Tests submitted</span>
        <span style="font-family:'Space Mono',monospace;color:#E8F0F7;">${cluster.count}</span>
      </div>
    </div>
  `;
}

// Supabase returns numeric(9,6) columns as strings in some client versions.
// Always coerce to Number() before any arithmetic to avoid NaN from string concat.
function toNum(v: number | string | null | undefined): number {
  return Number(v);
}

// Valid coordinate ranges for the Shenandoah Valley / surrounding region
function isValidCoord(lat: number, lng: number): boolean {
  return (
    lat >= 37.5 && lat <= 40.0 &&
    lng >= -80.5 && lng <= -77.0
  );
}

function clusterResults(results: SpeedResult[]): TownCluster[] {
  const byTown = new Map<string, SpeedResult[]>();

  for (const r of results) {
    const lat = toNum(r.lat);
    const lng = toNum(r.lng);

    if (!isFinite(lat) || !isFinite(lng) || lat === 0 || lng === 0) {
      console.warn(`[SpeedMap] Skipping result ${r.id} — invalid coords lat:${String(r.lat)} lng:${String(r.lng)}`);
      continue;
    }

    if (!isValidCoord(lat, lng)) {
      console.warn(`[SpeedMap] Skipping result ${r.id} — coords outside Virginia lat:${lat} lng:${lng}`);
      continue;
    }

    const key = r.town ?? 'Shenandoah Valley';
    if (!byTown.has(key)) byTown.set(key, []);
    byTown.get(key)!.push(r);
  }

  const clusters: TownCluster[] = [];
  for (const [town, townResults] of byTown.entries()) {
    // Use Number() explicitly — avoids NaN when Supabase returns numeric as string
    const avgLat = townResults.reduce((s, r) => s + toNum(r.lat), 0) / townResults.length;
    const avgLng = townResults.reduce((s, r) => s + toNum(r.lng), 0) / townResults.length;
    const avgDownload = townResults.reduce((s, r) => s + toNum(r.download_mbps), 0) / townResults.length;

    clusters.push({
      town,
      lat: avgLat,
      lng: avgLng,
      results: townResults,
      avgDownload,
      count: townResults.length,
    });
  }

  return clusters;
}

interface SpeedMapProps {
  newResultId?: string;
}

export function SpeedMap({ newResultId }: SpeedMapProps) {
  const outerRef = useRef<HTMLDivElement>(null);       // observed for intersection
  const mapContainer = useRef<HTMLDivElement>(null);   // actual Mapbox container
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const resultsRef = useRef<SpeedResult[]>([]);
  const mapReadyRef = useRef(false);          // true once style + terrain loaded
  const pendingHighlightRef = useRef<string | undefined>(undefined); // newResultId that arrived before map ready
  const flyInFiredRef = useRef(false);        // ensures fly-in only happens once
  const isMobileRef = useRef(window.innerWidth < 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768;
      isMobileRef.current = mobile;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // ── Render markers ──────────────────────────────────────────────────────────
  // Called whenever we have BOTH map ready AND results loaded.
  // Decoupled from React state to avoid stale closure issues.
  const renderMarkers = useCallback((results: SpeedResult[], highlightId?: string) => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) {
      console.log('[SpeedMap] renderMarkers skipped — map not ready yet');
      return;
    }

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const clusters = clusterResults(results);
    console.log(`[SpeedMap] ${results.length} results → ${clusters.length} valid clusters`);

    // Log first result raw from Supabase for coordinate debugging
    if (results.length > 0) {
      const sample = results[0];
      console.log(`[SpeedMap] Sample row — id:${sample.id} town:${sample.town ?? 'null'} lat(raw):${String(sample.lat)} lng(raw):${String(sample.lng)} lat(parsed):${toNum(sample.lat)} lng(parsed):${toNum(sample.lng)}`);
    }

    for (const cluster of clusters) {
      // Mapbox expects [longitude, latitude] — lng first, lat second
      console.log(`[SpeedMap] Pin → ${cluster.town} [lng:${cluster.lng}, lat:${cluster.lat}] count:${cluster.count}`);

      const isNew = highlightId
        ? cluster.results.some(r => r.id === highlightId)
        : false;

      const color = getSignalColor(cluster.avgDownload);
      const el = createPinElement(color, cluster.count, isNew);

      if (isNew) {
        const ring = createCelebrationRing(color);
        el.appendChild(ring);
        setTimeout(() => ring.remove(), 1400);
      }

      const popup = new mapboxgl.Popup({ offset: 20, closeButton: true })
        .setHTML(buildPopupHTML(cluster));

      // Mapbox order: [longitude, latitude]
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([Number(cluster.lng), Number(cluster.lat)])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    }
  }, []);

  // ── Fetch results from Supabase ──────────────────────────────────────────────
  const loadResults = useCallback(async () => {
    console.log('[SpeedMap] Fetching results from Supabase...');
    const { data, error } = await supabase
      .from('speed_results')
      .select('*')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('[SpeedMap] Supabase fetch error:', error);
      return;
    }

    console.log(`[SpeedMap] Fetched ${data?.length ?? 0} results with coordinates`);
    if (data) {
      resultsRef.current = data;
      // Render immediately if map is already ready, otherwise renderMarkers
      // will be called from the load handler once the map catches up.
      renderMarkers(data);
    }
  }, [renderMarkers]);

  // ── Cinematic fly-in (fires once when map scrolls into view) ────────────────
  const triggerFlyIn = useCallback(() => {
    if (flyInFiredRef.current || !mapRef.current) return;
    flyInFiredRef.current = true;
    const mobile = isMobileRef.current;
    mapRef.current.flyTo({
      center: [-78.85, 38.72],
      zoom: mobile ? 8.5 : 9.5,
      pitch: mobile ? 35 : 55,
      bearing: -20,
      duration: 3500,
      easing: (t) => t * (2 - t),
    });
  }, []);

  // ── Initialize map ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-78.85, 38.72],
      zoom: 7,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'imperial' }), 'bottom-left');

    // ── Style load handler — runs on initial load and after any style reloads ──
    // Using style.load (not load) ensures we re-add terrain/sky if the style
    // is ever reloaded internally (e.g. after setTerrain on satellite styles).
    const onStyleLoad = () => {
      // Guard against duplicate source errors on repeated style.load events
      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      }

      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Sky / atmosphere layer for the angled 3D perspective
      if (!map.getLayer('sky')) {
        map.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 90.0],
            'sky-atmosphere-sun-intensity': 15,
          },
        });
      }

      console.log('[SpeedMap] Map style loaded — setting mapReadyRef = true');
      mapReadyRef.current = true;

      // Render any results that arrived before the map was ready,
      // including any pending highlight from a newResultId that raced ahead
      if (resultsRef.current.length > 0) {
        console.log('[SpeedMap] Map loaded with pre-fetched results — rendering markers now');
        renderMarkers(resultsRef.current, pendingHighlightRef.current);
        pendingHighlightRef.current = undefined;
      }

      // Fly-in is handled by IntersectionObserver below, not here
    };

    map.on('style.load', onStyleLoad);

    return () => {
      map.off('style.load', onStyleLoad);
      markersRef.current.forEach(m => m.remove());
      map.remove();
      mapRef.current = null;
      mapReadyRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch results on mount (independent of map readiness) ───────────────────
  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  // ── IntersectionObserver — trigger fly-in when map scrolls into view ────────
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            triggerFlyIn();
            observer.disconnect(); // only ever fire once
          }
        }
      },
      { threshold: 0.3 } // 30% of the map must be visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerFlyIn]);

  // ── Handle new result submitted ──────────────────────────────────────────────
  useEffect(() => {
    if (!newResultId) return;

    // If map isn't ready yet, stash the highlight ID — onStyleLoad will use it
    // once the style finishes loading.
    if (!mapReadyRef.current) {
      pendingHighlightRef.current = newResultId;
    }

    const refresh = async () => {
      const { data, error } = await supabase
        .from('speed_results')
        .select('*')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('[SpeedMap] Refresh fetch error:', error);
        return;
      }

      if (data) {
        resultsRef.current = data;
        renderMarkers(data, newResultId);

        // Fly to the new result with celebration zoom
        const newResult = data.find(r => r.id === newResultId);
        const newLat = toNum(newResult?.lat);
        const newLng = toNum(newResult?.lng);
        if (isFinite(newLat) && isFinite(newLng) && newLat !== 0 && mapRef.current) {
          console.log(`[SpeedMap] Flying to new result — [lng:${newLng}, lat:${newLat}]`);
          mapRef.current.flyTo({
            center: [newLng, newLat],
            zoom: 12,
            pitch: 45,
            duration: 2500,
            easing: (t) => t * (2 - t),
          });
        }
      }
    };

    void refresh();
  }, [newResultId, renderMarkers]);

  return (
    <div
      ref={outerRef}
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: 400, borderRadius: '12px', overflow: 'hidden' }}
    >
      <div
        ref={mapContainer}
        className="map-container"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Eleven North attribution badge */}
      <div style={{
        position: 'absolute',
        bottom: '36px',
        right: '12px',
        background: 'rgba(8,12,16,0.75)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #1A2D40',
        borderRadius: '6px',
        padding: '4px 10px',
        zIndex: 10,
      }}>
        <a
          href="https://elevennorth.co"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '0.6rem',
            color: 'var(--accent-signal)',
            textDecoration: 'none',
            letterSpacing: '0.06em',
          }}
        >
          ELEVEN NORTH
        </a>
      </div>

      {/* Mobile loading hint */}
      {isMobile && (
        <div
          id="map-mobile-hint"
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(8,12,16,0.7)',
            color: 'var(--text-secondary)',
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.7rem',
            padding: '4px 12px',
            borderRadius: '999px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.5s ease 1s both, fadeIn 0.5s ease 4s reverse both',
          }}
        >
          Drag to explore
        </div>
      )}

      <style>{`
        @keyframes celebrationRing {
          0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
