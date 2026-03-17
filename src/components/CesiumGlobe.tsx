import { useEffect, useRef, useState, useCallback } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { supabase, type SpeedResult } from '../lib/supabase';

// Use CesiumJS built-in default Ion token for Bing Maps aerial imagery
// No separate API key needed — this is included with the open-source library

// ── Types ───────────────────────────────────────────────────────────────────────

interface TownCluster {
  town: string;
  lat: number;
  lng: number;
  results: SpeedResult[];
  avgDownload: number;
  count: number;
}

interface PopupState {
  cluster: TownCluster;
  x: number;
  y: number;
}

interface CesiumGlobeProps {
  newResultId?: string;
}

// ── Pure helpers (ported from SpeedMap) ──────────────────────────────────────────

function getSignalColor(downloadMbps: number): string {
  if (downloadMbps >= 100) return '#00FFB2';
  if (downloadMbps >= 25) return '#FFB800';
  return '#FF4444';
}

function toNum(v: number | string | null | undefined): number {
  return Number(v);
}

function isValidCoord(lat: number, lng: number): boolean {
  return lat >= 37.5 && lat <= 40.0 && lng >= -80.5 && lng <= -77.0;
}

function clusterResults(results: SpeedResult[]): TownCluster[] {
  const byTown = new Map<string, SpeedResult[]>();

  for (const r of results) {
    const lat = toNum(r.lat);
    const lng = toNum(r.lng);
    if (!isFinite(lat) || !isFinite(lng) || lat === 0 || lng === 0) continue;
    if (!isValidCoord(lat, lng)) continue;
    const key = r.town ?? 'Shenandoah Valley';
    if (!byTown.has(key)) byTown.set(key, []);
    byTown.get(key)!.push(r);
  }

  const clusters: TownCluster[] = [];
  for (const [town, townResults] of byTown.entries()) {
    const avgLat = townResults.reduce((s, r) => s + toNum(r.lat), 0) / townResults.length;
    const avgLng = townResults.reduce((s, r) => s + toNum(r.lng), 0) / townResults.length;
    const avgDownload = townResults.reduce((s, r) => s + toNum(r.download_mbps), 0) / townResults.length;
    clusters.push({ town, lat: avgLat, lng: avgLng, results: townResults, avgDownload, count: townResults.length });
  }
  return clusters;
}

// ── Canvas pin billboard ────────────────────────────────────────────────────────

function createPinCanvas(color: string, count: number, isNew = false): HTMLCanvasElement {
  const baseSize = count > 1 ? Math.min(14 + count * 2, 28) : 14;
  const scale = 2; // retina
  const size = baseSize * scale;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;

  // Outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 12 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Solid core (re-draw without shadow for crispness)
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2 * scale;
  ctx.stroke();

  // Count label
  if (count > 1) {
    ctx.font = `bold ${size * 0.3}px 'Space Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillText(String(count), cx, cy);
  }

  // New pin gets a brighter highlight ring
  if (isNew) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4 * scale, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * scale;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  return canvas;
}

// ── Popup HTML builder ──────────────────────────────────────────────────────────

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

// ── Component ───────────────────────────────────────────────────────────────────

export function CesiumGlobe({ newResultId }: CesiumGlobeProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const resultsRef = useRef<SpeedResult[]>([]);
  const viewerReadyRef = useRef(false);
  const pendingHighlightRef = useRef<string | undefined>(undefined);
  const flyInFiredRef = useRef(false);
  const isMobileRef = useRef(window.innerWidth < 768);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const preRenderRef = useRef<Cesium.Event.RemoveCallback | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [popup, setPopup] = useState<PopupState | null>(null);

  // Track resize for mobile detection
  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768;
      isMobileRef.current = mobile;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // ── Render entity markers ─────────────────────────────────────────────────
  const renderMarkers = useCallback((results: SpeedResult[], highlightId?: string) => {
    const viewer = viewerRef.current;
    if (!viewer || !viewerReadyRef.current) return;

    viewer.entities.removeAll();
    setPopup(null);

    const clusters = clusterResults(results);

    for (const cluster of clusters) {
      const isNew = highlightId
        ? cluster.results.some(r => r.id === highlightId)
        : false;

      const color = getSignalColor(cluster.avgDownload);
      const canvas = createPinCanvas(color, cluster.count, isNew);

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(cluster.lng, cluster.lat, 0),
        billboard: {
          image: canvas as unknown as string, // Cesium accepts canvas elements
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          scale: 0.5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        properties: {
          townCluster: cluster,
        },
      });

      // Celebration scale animation for new pins
      if (isNew && entity.billboard) {
        let elapsed = 0;
        const duration = 800;
        const startScale = 0.1;
        const peakScale = 0.7;
        const endScale = 0.5;
        const animate = (dt: number) => {
          elapsed += dt;
          const t = Math.min(elapsed / duration, 1);
          // Ease out back for bounce effect
          const overshoot = 1.3;
          const s = 1 - Math.pow(1 - t, 2) * (1 + overshoot * (1 - t));
          const scale = t < 0.6
            ? startScale + (peakScale - startScale) * (t / 0.6)
            : peakScale + (endScale - peakScale) * ((t - 0.6) / 0.4);
          entity.billboard!.scale = new Cesium.ConstantProperty(scale * (1 + 0.3 * (1 - s) * Math.sin(t * Math.PI * 2)));
          if (t >= 1) {
            entity.billboard!.scale = new Cesium.ConstantProperty(endScale);
          }
        };
        let lastTime = performance.now();
        const frame = () => {
          const now = performance.now();
          animate(now - lastTime);
          lastTime = now;
          if (elapsed < duration) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }
    }
  }, []);

  // ── Fetch results from Supabase ───────────────────────────────────────────
  const loadResults = useCallback(async () => {
    const { data, error } = await supabase
      .from('speed_results')
      .select('*')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('[CesiumGlobe] Supabase fetch error:', error);
      return;
    }

    if (data) {
      resultsRef.current = data;
      renderMarkers(data);
    }
  }, [renderMarkers]);

  // ── Cinematic fly-in ──────────────────────────────────────────────────────
  const triggerFlyIn = useCallback(() => {
    if (flyInFiredRef.current || !viewerRef.current) return;
    flyInFiredRef.current = true;
    const mobile = isMobileRef.current;
    // Shenandoah Valley — Winchester (north) to Roanoke (south), ~200km span
    // Altitude ~120km with steep pitch gives a nice overhead satellite view
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        -79.1, 38.2,
        mobile ? 140000 : 110000
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(mobile ? -70 : -75),
        roll: 0,
      },
      duration: 3.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
    });
  }, []);

  // ── Initialize Cesium Viewer ──────────────────────────────────────────────
  useEffect(() => {
    if (!cesiumContainerRef.current || viewerRef.current) return;

    const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
      // Use default Bing Maps aerial imagery (no API key needed — bundled with CesiumJS)
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      infoBox: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      skyBox: false as unknown as Cesium.SkyBox,
    });

    // Dark background outside the globe to match theme
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#080C10');
    viewer.scene.globe.enableLighting = false;

    // Disable depth test for labels/billboards so they don't clip into terrain
    viewer.scene.globe.depthTestAgainstTerrain = false;

    // Start zoomed out to see the full globe (fly-in will animate to valley)
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-78.85, 38.72, 8000000),
    });

    viewerRef.current = viewer;
    viewerReadyRef.current = true;

    // Render any pre-fetched results
    if (resultsRef.current.length > 0) {
      renderMarkers(resultsRef.current, pendingHighlightRef.current);
      pendingHighlightRef.current = undefined;
    }

    // ── Click handler for popups ──────────────────────────────────────────
    const eventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = eventHandler;

    eventHandler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id instanceof Cesium.Entity && picked.id.properties) {
        const clusterProp = picked.id.properties.townCluster;
        if (clusterProp) {
          const cluster = clusterProp.getValue(viewer.clock.currentTime) as TownCluster;
          const position = picked.id.position?.getValue(viewer.clock.currentTime);
          if (position) {
            const screenPos = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, position);
            if (screenPos) {
              setPopup({ cluster, x: screenPos.x, y: screenPos.y });
            }
          }
        }
      } else {
        setPopup(null);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Update popup position on camera move
    const removePreRender = viewer.scene.preRender.addEventListener(() => {
      setPopup(prev => {
        if (!prev) return null;
        const clusters = clusterResults(resultsRef.current);
        const cluster = clusters.find(c => c.town === prev.cluster.town);
        if (!cluster) return null;
        const pos = Cesium.Cartesian3.fromDegrees(cluster.lng, cluster.lat, 0);
        const screenPos = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, pos);
        if (!screenPos) return null;
        return { cluster: prev.cluster, x: screenPos.x, y: screenPos.y };
      });
    });
    preRenderRef.current = removePreRender;

    return () => {
      eventHandler.destroy();
      handlerRef.current = null;
      if (preRenderRef.current) preRenderRef.current();
      preRenderRef.current = null;
      viewer.destroy();
      viewerRef.current = null;
      viewerReadyRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch results on mount ────────────────────────────────────────────────
  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  // ── IntersectionObserver — trigger fly-in when globe scrolls into view ────
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            triggerFlyIn();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerFlyIn]);

  // ── Handle new result submitted ───────────────────────────────────────────
  useEffect(() => {
    if (!newResultId) return;

    if (!viewerReadyRef.current) {
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
        console.error('[CesiumGlobe] Refresh fetch error:', error);
        return;
      }

      if (data) {
        resultsRef.current = data;
        renderMarkers(data, newResultId);

        // Fly to the new result
        const newResult = data.find(r => r.id === newResultId);
        const newLat = toNum(newResult?.lat);
        const newLng = toNum(newResult?.lng);
        if (isFinite(newLat) && isFinite(newLng) && newLat !== 0 && viewerRef.current) {
          viewerRef.current.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(newLng, newLat, 15000),
            orientation: {
              heading: 0,
              pitch: Cesium.Math.toRadians(-45),
              roll: 0,
            },
            duration: 2.5,
            easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
          });
        }
      }
    };

    void refresh();
  }, [newResultId, renderMarkers]);

  return (
    <div
      ref={outerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 400,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div
        ref={cesiumContainerRef}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Custom popup overlay */}
      {popup && (
        <div
          className="cesium-popup"
          style={{
            position: 'absolute',
            left: popup.x,
            top: popup.y,
            transform: 'translate(-50%, -100%) translateY(-16px)',
            zIndex: 20,
          }}
        >
          <button
            onClick={() => setPopup(null)}
            style={{
              position: 'absolute',
              top: '4px',
              right: '8px',
              background: 'none',
              border: 'none',
              color: '#7A9BB5',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#E8F0F7'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#7A9BB5'; }}
          >
            ×
          </button>
          <div dangerouslySetInnerHTML={{ __html: buildPopupHTML(popup.cluster) }} />
          {/* Popup arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #0F1923',
          }} />
        </div>
      )}

      {/* Eleven North attribution badge */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
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
      {isMobile && (
        <div
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
          Drag to rotate · Pinch to zoom
        </div>
      )}
    </div>
  );
}
