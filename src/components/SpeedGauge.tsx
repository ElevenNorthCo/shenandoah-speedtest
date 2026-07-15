import { useEffect, useRef, useState } from 'react';
import type { TestPhase } from '../lib/speedtest';

interface SpeedGaugeProps {
  phase: TestPhase;
  progress?: number;
  currentMbps: number;
  statusMessage: string;
  finalResult?: number;
  livePing?: number | null;
  liveDownload?: number | null;
  liveUpload?: number | null;
  pingSamples?: number[];
  downloadSamples?: number[];
  uploadSamples?: number[];
  ipAddress?: string | null;
  ispLabel?: string | null;
}

const TAGLINES = [
  "How bad is it really?",
  "Warning: results may cause frustration.",
  "Blame your ISP. We'll prove it.",
  "Somewhere, someone has fiber. Not here. But somewhere.",
  "Test it. Post it. Shame your carrier.",
  "The Valley deserves better. Start here.",
  "Rural internet: it's a vibe. A bad vibe.",
];

// ── Gauge geometry ──────────────────────────────────────────────────────────
// 270° sweep starting at the lower-left (7:30) position. The Mbps scale is
// nonlinear: each stop below gets an equal 45° slice, like real speedo dials.
const SCALE_STOPS = [0, 10, 25, 50, 100, 200, 500];
const SWEEP = 270;
const START_DEG = 135; // screen angle of the 0-Mbps end
const W = 380;
const H = 336;
const CX = 190;
const CY = 168;
const R = 138;
const STROKE = 16;

function speedToAngle(mbps: number): number {
  const clamped = Math.max(0, Math.min(mbps, SCALE_STOPS[SCALE_STOPS.length - 1]));
  const segAngle = SWEEP / (SCALE_STOPS.length - 1);
  for (let i = 0; i < SCALE_STOPS.length - 1; i++) {
    if (clamped <= SCALE_STOPS[i + 1]) {
      const f = (clamped - SCALE_STOPS[i]) / (SCALE_STOPS[i + 1] - SCALE_STOPS[i]);
      return (i + f) * segAngle;
    }
  }
  return SWEEP;
}

function pt(theta: number, radius: number) {
  const rad = ((START_DEG + theta) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function segD(t0: number, t1: number, radius = R): string {
  const p0 = pt(t0, radius);
  const p1 = pt(t1, radius);
  const large = t1 - t0 > 180 ? 1 : 0;
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

// ── Rainbow arc color: red → orange → yellow → green → teal ────────────────
const ARC_ANCHORS: [number, [number, number, number]][] = [
  [0.0, [255, 68, 68]],
  [0.27, [255, 149, 0]],
  [0.5, [255, 217, 10]],
  [0.74, [62, 224, 126]],
  [1.0, [0, 232, 213]],
];

function arcColorAt(t: number): string {
  const x = Math.max(0, Math.min(1, t));
  for (let i = 0; i < ARC_ANCHORS.length - 1; i++) {
    const [t0, c0] = ARC_ANCHORS[i];
    const [t1, c1] = ARC_ANCHORS[i + 1];
    if (x <= t1) {
      const f = (x - t0) / (t1 - t0);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
      return `rgb(${r},${g},${b})`;
    }
  }
  return 'rgb(0,232,213)';
}

const N_SEGS = 60;
const SEG_ANGLE = SWEEP / N_SEGS;

// Pre-computed full-arc segments (angles + colors never change)
const ARC_SEGMENTS = Array.from({ length: N_SEGS }, (_, i) => {
  const t0 = i * SEG_ANGLE;
  const t1 = (i + 1) * SEG_ANGLE;
  return {
    t0,
    t1,
    // tiny overlap hides hairline gaps between segments
    d: segD(Math.max(0, t0 - 0.4), Math.min(SWEEP, t1 + 0.4)),
    color: arcColorAt((t0 + t1) / 2 / SWEEP),
  };
});

// ── Sparkline ───────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 110;
  const h = 24;
  if (data.length < 2) {
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <line x1={2} y1={h - 3} x2={w - 2} y2={h - 3} stroke={color} strokeOpacity={0.25} strokeWidth={1.5} strokeDasharray="3 4" />
      </svg>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 3 - ((v - min) / range) * (h - 8)).toFixed(1)}`)
    .join(' ');
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />
    </svg>
  );
}

// ── Stat column (Download / Upload / Ping) ──────────────────────────────────
function StatColumn({ label, unit, value, decimals, color, icon, samples, divider }: {
  label: string;
  unit: string;
  value: number | null;
  decimals: boolean;
  color: string;
  icon: 'down' | 'up' | 'clock';
  samples: number[];
  divider?: boolean;
}) {
  const display = value === null
    ? '---'
    : decimals && value < 100 ? value.toFixed(1) : value.toFixed(0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '4px 14px',
      borderLeft: divider ? '1px solid var(--border-subtle)' : 'none',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          color,
          flexShrink: 0,
        }}>
          {icon === 'clock' ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3.5 2" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {icon === 'down'
                ? <path d="M12 5v14m-6-6l6 6 6-6" />
                : <path d="M12 19V5m-6 6l6-6 6 6" />}
            </svg>
          )}
        </span>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.6rem',
          letterSpacing: '0.12em',
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 700,
        fontSize: 'clamp(1.15rem, 4.5vw, 1.5rem)',
        color: value === null ? 'var(--text-ghost)' : 'var(--text-primary)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
        {display}
        <span style={{ fontSize: '0.65rem', color: 'var(--text-ghost)', fontFamily: "'Sora', sans-serif", fontWeight: 400, marginLeft: 4 }}>
          {unit}
        </span>
      </div>
      <Sparkline data={samples} color={color} />
    </div>
  );
}

export function SpeedGauge({
  phase,
  currentMbps,
  statusMessage,
  finalResult,
  livePing = null,
  liveDownload = null,
  liveUpload = null,
  pingSamples = [],
  downloadSamples = [],
  uploadSamples = [],
  ipAddress = null,
  ispLabel = null,
}: SpeedGaugeProps) {
  const [animatedFinal, setAnimatedFinal] = useState(0);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineKey, setTaglineKey] = useState(0);
  const animFrameRef = useRef<number>(0);

  // Tagline rotation in idle state
  useEffect(() => {
    if (phase !== 'idle') return;
    const interval = setInterval(() => {
      setTaglineIndex(i => (i + 1) % TAGLINES.length);
      setTaglineKey(k => k + 1);
    }, 4200);
    return () => clearInterval(interval);
  }, [phase]);

  // Count-up animation when the test completes
  useEffect(() => {
    if (phase !== 'complete' || finalResult === undefined) return;
    const start = performance.now();
    const duration = 1200;
    const target = finalResult;

    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setAnimatedFinal(Math.round(easeOutCubic(t) * target * 10) / 10);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, finalResult]);

  const isIdle = phase === 'idle';
  const isComplete = phase === 'complete';
  const isTestingSpeed = phase === 'download' || phase === 'upload';

  const displayMbps = isComplete
    ? animatedFinal
    : isTestingSpeed
    ? Math.round(currentMbps * 10) / 10
    : 0;

  const needleAngle = isComplete
    ? speedToAngle(displayMbps)
    : isTestingSpeed
    ? speedToAngle(currentMbps)
    : 0;
  const litAngle = needleAngle;

  const metric = phase === 'upload' ? 'upload' : phase === 'ping' ? 'ping' : 'download';
  const metricColor = isIdle
    ? 'var(--text-ghost)'
    : metric === 'upload'
    ? '#A78BFA'
    : metric === 'ping'
    ? 'var(--accent-warn)'
    : 'var(--accent-signal)';
  const metricLabel = metric === 'upload' ? 'UPLOAD' : metric === 'ping' ? 'PING' : 'DOWNLOAD';

  const centerNumber = isIdle
    ? '—'
    : phase === 'ping'
    ? '···'
    : displayMbps >= 100 ? displayMbps.toFixed(0) : displayMbps.toFixed(1);

  const litEndCap = pt(litAngle, R);
  const dimStartCap = pt(0, R);
  const dimEndCap = pt(SWEEP, R);
  const needleTip = pt(0, R - 34);

  const latestPing = livePing ?? (pingSamples.length ? pingSamples[pingSamples.length - 1] : null);
  const statDownload = liveDownload ?? (phase === 'download' && currentMbps > 0 ? currentMbps : null);
  const statUpload = liveUpload ?? (phase === 'upload' && currentMbps > 0 ? currentMbps : null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
        userSelect: 'none',
        width: '100%',
      }}
    >
      {/* ── Gauge dial ── */}
      <div
        style={{ position: 'relative', width: 'min(420px, 92vw)' }}
        className={isIdle ? 'gauge-idle' : ''}
      >
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{ overflow: 'visible', display: 'block' }}
        >
          <defs>
            <filter id="gaugeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter id="needleGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dim full rainbow arc (always visible) */}
          <g opacity={isIdle ? 0.3 : 0.22}>
            {ARC_SEGMENTS.map(seg => (
              <path key={seg.t0} d={seg.d} fill="none" stroke={seg.color} strokeWidth={STROKE} />
            ))}
            <circle cx={dimStartCap.x} cy={dimStartCap.y} r={STROKE / 2} fill={arcColorAt(0)} />
            <circle cx={dimEndCap.x} cy={dimEndCap.y} r={STROKE / 2} fill={arcColorAt(1)} />
          </g>

          {/* Lit arc up to the needle — glow underlay + crisp overlay */}
          {litAngle > 0.5 && [0.55, 1].map(op => (
            <g key={op} filter={op < 1 ? 'url(#gaugeGlow)' : undefined} opacity={op}>
              {ARC_SEGMENTS.filter(seg => seg.t0 < litAngle).map(seg => (
                <path
                  key={seg.t0}
                  d={seg.t1 > litAngle ? segD(seg.t0, litAngle) : seg.d}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={STROKE}
                />
              ))}
              <circle cx={dimStartCap.x} cy={dimStartCap.y} r={STROKE / 2} fill={arcColorAt(0)} />
              <circle cx={litEndCap.x} cy={litEndCap.y} r={STROKE / 2} fill={arcColorAt(litAngle / SWEEP)} />
            </g>
          ))}

          {/* Minor ticks (inside the arc) */}
          {Array.from({ length: (SCALE_STOPS.length - 1) * 8 }, (_, i) => {
            const seg = Math.floor(i / 8);
            const k = (i % 8) + 1;
            const theta = seg * (SWEEP / (SCALE_STOPS.length - 1)) + k * 5;
            const p0 = pt(theta, R - 17);
            const p1 = pt(theta, R - 24);
            return (
              <line
                key={theta}
                x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y}
                stroke="#E8F0F7"
                strokeWidth={1.5}
                opacity={theta <= litAngle ? 0.85 : 0.28}
              />
            );
          })}

          {/* Major ticks + scale labels */}
          {SCALE_STOPS.map((mbps, i) => {
            const theta = i * (SWEEP / (SCALE_STOPS.length - 1));
            const p0 = pt(theta, R + 13);
            const p1 = pt(theta, R + 25);
            const lp = pt(theta, R + 42);
            return (
              <g key={mbps}>
                <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#8FA8C0" strokeWidth={2} />
                <text
                  x={lp.x} y={lp.y}
                  fill="#D7E4F0"
                  fontSize={15}
                  fontFamily="'Rajdhani', sans-serif"
                  fontWeight={600}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {mbps}
                </text>
              </g>
            );
          })}

          {/* Needle (drawn at 0, rotated via CSS transform) */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: `${CX}px ${CY}px`,
              transition: 'transform 0.25s ease-out',
            }}
            opacity={isIdle ? 0.45 : 1}
          >
            <line
              x1={CX} y1={CY} x2={needleTip.x} y2={needleTip.y}
              stroke="#9FE8FF" strokeWidth={7} strokeLinecap="round" opacity={0.25}
            />
            <line
              x1={CX} y1={CY} x2={needleTip.x} y2={needleTip.y}
              stroke="#C9F3FF" strokeWidth={2.5} strokeLinecap="round"
              filter="url(#needleGlow)"
            />
          </g>

          {/* Hub */}
          <circle cx={CX} cy={CY} r={9} fill="#0D1826" stroke="#2A3F55" strokeWidth={2} />
          <circle cx={CX} cy={CY} r={3.5} fill="#9FE8FF" opacity={isIdle ? 0.5 : 1} />

          {/* Center readout */}
          <text
            x={CX} y={CY + 62}
            fill={isIdle ? 'var(--text-ghost)' : '#F2F7FC'}
            fontSize={isIdle ? 44 : 56}
            fontFamily="'Rajdhani', sans-serif"
            fontWeight={700}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {centerNumber}
          </text>
          <text
            x={CX} y={CY + 94}
            fill="var(--accent-sky)"
            fontSize={15}
            fontFamily="'Sora', sans-serif"
            fontWeight={500}
            textAnchor="middle"
          >
            Mbps
          </text>
          <text
            x={CX} y={CY + 117}
            fill={metricColor}
            fontSize={11}
            fontFamily="'Space Mono', monospace"
            letterSpacing={5}
            textAnchor="middle"
          >
            {metricLabel}
          </text>

          {/* Metric icon circle at the bottom gap */}
          <g stroke={metricColor} fill="none" strokeWidth={1.5} opacity={isIdle ? 0.6 : 1}>
            <circle cx={CX} cy={CY + 144} r={13} />
            <g strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {metric === 'ping' ? (
                <>
                  <circle cx={CX} cy={CY + 144} r={5.5} />
                  <path d={`M ${CX} ${CY + 141} v 3.2 l 2.2 1.6`} />
                </>
              ) : metric === 'upload' ? (
                <path d={`M ${CX} ${CY + 149} v -10 m -4 4 l 4 -4 l 4 4`} />
              ) : (
                <path d={`M ${CX} ${CY + 139} v 10 m -4 -4 l 4 4 l 4 -4`} />
              )}
            </g>
          </g>
        </svg>
      </div>

      {/* ── Status pill ── */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '999px',
        padding: '10px 22px',
        minHeight: 40,
        maxWidth: '92vw',
      }}>
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none"
          stroke={isIdle ? 'var(--text-ghost)' : 'var(--accent-signal)'}
          strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <polyline points="1,6 4,6 6,1.5 9,10.5 12,3 14,6 19,6" />
        </svg>
        {isIdle ? (
          <span
            key={taglineKey}
            className="tagline-animate"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 300,
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              opacity: 0,
            }}
          >
            "{TAGLINES[taglineIndex]}"
          </span>
        ) : (
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.7rem',
            color: isComplete ? 'var(--accent-signal)' : 'var(--text-secondary)',
            letterSpacing: '0.16em',
            transition: 'color 0.5s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {statusMessage}
          </span>
        )}
      </div>

      {/* ── Live stats row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        width: 'min(620px, 94vw)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '16px 6px',
      }}>
        <StatColumn
          label="DOWNLOAD" unit="Mbps" decimals
          value={statDownload}
          color="var(--accent-signal)"
          icon="down"
          samples={downloadSamples}
        />
        <StatColumn
          label="UPLOAD" unit="Mbps" decimals
          value={statUpload}
          color="#A78BFA"
          icon="up"
          samples={uploadSamples}
          divider
        />
        <StatColumn
          label="PING" unit="ms" decimals={false}
          value={latestPing}
          color="var(--accent-warn)"
          icon="clock"
          samples={pingSamples}
          divider
        />
      </div>

      {/* ── IP / ISP footer ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: 'min(620px, 94vw)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '10px 16px',
        gap: '8px 0',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', flex: 1,
          justifyContent: 'center', minWidth: 180,
          fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', color: 'var(--text-secondary)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-sky)" strokeWidth="1.8" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
          </svg>
          Your IP:&nbsp;
          <span style={{ fontFamily: "'Space Mono', monospace", color: 'var(--text-primary)' }}>
            {ipAddress || '—'}
          </span>
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', flex: 1,
          justifyContent: 'center', minWidth: 180,
          borderLeft: '1px solid var(--border-subtle)',
          fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', color: 'var(--text-secondary)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-signal)" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <path d="M2.5 9.5a13.5 13.5 0 0 1 19 0" />
            <path d="M6 13a8.5 8.5 0 0 1 12 0" />
            <path d="M9.5 16.5a4 4 0 0 1 5 0" />
            <circle cx="12" cy="19.5" r="1" fill="var(--accent-signal)" />
          </svg>
          ISP:&nbsp;
          <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
            {ispLabel || '—'}
          </span>
        </span>
      </div>
    </div>
  );
}
