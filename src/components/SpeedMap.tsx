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
  `;
  if (count > 1) {
    el.textContent = String(count);
  }
  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.3)';
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)';
  });
  return el;
}

function buildPopupHTML(cluster: TownCluster): string {
  const topResults = cluster.results
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

function clusterResults(results: SpeedResult[]): TownCluster[] {
  const byTown = new Map<string, SpeedResult[]>();

  for (const r of results) {
    if (!r.lat || !r.lng || !r.town) continue;
    const key = r.town;
    if (!byTown.has(key)) byTown.set(key, []);
    byTown.get(key)!.push(r);
  }

  const clusters: TownCluster[] = [];
  for (const [town, townResults] of byTown.entries()) {
    const avgLat = townResults.reduce((s, r) => s + (r.lat ?? 0), 0) / townResults.length;
    const avgLng = townResults.reduce((s, r) => s + (r.lng ?? 0), 0) / townResults.length;
    const avgDownload = townResults.reduce((s, r) => s + r.download_mbps, 0) / townResults.length;

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const resultsRef = useRef<SpeedResult[]>([]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const renderMarkers = useCallback((results: SpeedResult[], highlightId?: string) => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const clusters = clusterResults(results);

    for (const cluster of clusters) {
      const isNew = highlightId
        ? cluster.results.some(r => r.id === highlightId)
        : false;

      const color = getSignalColor(cluster.avgDownload);
      const el = createPinElement(color, cluster.count, isNew);

      const popup = new mapboxgl.Popup({ offset: 20, closeButton: true })
        .setHTML(buildPopupHTML(cluster));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([cluster.lng, cluster.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    }
  }, []);

  // Load initial data
  const loadResults = useCallback(async () => {
    const { data } = await supabase
      .from('speed_results')
      .select('*')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (data) {
      resultsRef.current = data;
      if (mapLoaded) {
        renderMarkers(data);
      }
    }
  }, [mapLoaded, renderMarkers]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Start zoomed out and flat — the fly-in will animate to the dramatic 3D view
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-78.85, 38.72],
      zoom: 7,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'imperial' }), 'bottom-left');

    map.on('load', () => {
      // Add DEM terrain source
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });

      // Enable 3D terrain with exaggeration
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 2.0 });

      // Atmospheric fog for depth
      map.setFog({
        color: 'rgb(8, 12, 16)',
        'high-color': 'rgb(15, 25, 35)',
        'horizon-blend': 0.4,
        'space-color': 'rgb(4, 8, 12)',
        'star-intensity': 0.6,
      });

      setMapLoaded(true);

      // Cinematic fly-in from the flat starting view to the dramatic pitched 3D view
      map.flyTo({
        center: [-78.85, 38.72],
        zoom: isMobile ? 8.5 : 9.5,
        pitch: isMobile ? 35 : 55,
        bearing: -20,
        duration: 3500,
        easing: (t) => t * (2 - t),
      });
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load results once map is ready
  useEffect(() => {
    if (mapLoaded) {
      void loadResults();
    }
  }, [mapLoaded, loadResults]);

  // Handle new result
  useEffect(() => {
    if (!newResultId || !mapLoaded) return;

    const refresh = async () => {
      const { data } = await supabase
        .from('speed_results')
        .select('*')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('created_at', { ascending: false })
        .limit(200);

      if (data) {
        resultsRef.current = data;
        renderMarkers(data, newResultId);

        // Fly to the new result
        const newResult = data.find(r => r.id === newResultId);
        if (newResult?.lat && newResult?.lng && mapRef.current) {
          mapRef.current.flyTo({
            center: [newResult.lng, newResult.lat],
            zoom: 11,
            pitch: 45,
            duration: 2000,
            easing: (t) => t * (2 - t),
          });
        }
      }
    };

    void refresh();
  }, [newResultId, mapLoaded, renderMarkers]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 400, borderRadius: '12px', overflow: 'hidden' }}>
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

      {/* Mobile hint */}
      {isMobile && !mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'var(--text-secondary)',
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.8rem',
          pointerEvents: 'none',
        }}>
          Loading map...
        </div>
      )}
    </div>
  );
}
