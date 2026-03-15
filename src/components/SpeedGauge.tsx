import { useEffect, useRef, useState } from 'react';
import type { TestPhase } from '../lib/speedtest';

interface SpeedGaugeProps {
  phase: TestPhase;
  progress: number;
  currentMbps: number;
  statusMessage: string;
  finalResult?: number;
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

function getSpeedColor(mbps: number): string {
  if (mbps >= 100) return '#00FFB2';
  if (mbps >= 25) return '#FFB800';
  return '#FF4444';
}

function speedToAngle(mbps: number): number {
  // Map 0–500+ Mbps to 0–220 degrees
  const maxMbps = 500;
  const clamped = Math.min(mbps, maxMbps);
  return (clamped / maxMbps) * 220;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 110) * Math.PI) / 180; // -110 offset: start at 7 o'clock
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToXY(cx, cy, r, startAngle);
  const end = polarToXY(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

// Tick mark positions
const TICKS = [
  { mbps: 0, label: '0' },
  { mbps: 25, label: '25' },
  { mbps: 50, label: '50' },
  { mbps: 100, label: '100' },
  { mbps: 200, label: '200' },
  { mbps: 500, label: '500' },
];

export function SpeedGauge({ phase, progress, currentMbps, statusMessage, finalResult }: SpeedGaugeProps) {
  const [displayMbps, setDisplayMbps] = useState(0);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineKey, setTaglineKey] = useState(0);
  const animFrameRef = useRef<number>(0);
  const sweepRef = useRef(0);

  // Tagline rotation in idle state
  useEffect(() => {
    if (phase !== 'idle') return;
    const interval = setInterval(() => {
      setTaglineIndex(i => (i + 1) % TAGLINES.length);
      setTaglineKey(k => k + 1);
    }, 4200);
    return () => clearInterval(interval);
  }, [phase]);

  // Animate display number on complete
  useEffect(() => {
    if (phase === 'complete' && finalResult !== undefined) {
      const start = performance.now();
      const duration = 1200;
      const target = finalResult;

      function easeOutCubic(t: number) {
        return 1 - Math.pow(1 - t, 3);
      }

      function animate(now: number) {
        const t = Math.min((now - start) / duration, 1);
        setDisplayMbps(Math.round(easeOutCubic(t) * target * 10) / 10);
        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animFrameRef.current);
    } else if (phase === 'download' || phase === 'upload') {
      setDisplayMbps(Math.round(currentMbps * 10) / 10);
    } else if (phase === 'idle' || phase === 'ping') {
      setDisplayMbps(0);
    }
  }, [phase, finalResult, currentMbps]);

  // Sweep animation during test
  useEffect(() => {
    if (phase === 'download' || phase === 'upload' || phase === 'ping') {
      let dir = 1;
      let pos = sweepRef.current;

      function sweep() {
        pos += dir * 2.5;
        if (pos > 100 || pos < 0) dir *= -1;
        sweepRef.current = pos;
        animFrameRef.current = requestAnimationFrame(sweep);
      }

      animFrameRef.current = requestAnimationFrame(sweep);
      return () => cancelAnimationFrame(animFrameRef.current);
    }
  }, [phase]);

  const size = 380;
  const cx = size / 2;
  const cy = size / 2;
  const r = 155;
  const strokeWidth = 14;

  // Calculate needle angle
  let needleAngle: number;
  if (phase === 'complete' && finalResult !== undefined) {
    needleAngle = speedToAngle(finalResult);
  } else if (phase === 'download' || phase === 'upload') {
    needleAngle = speedToAngle(currentMbps);
  } else {
    needleAngle = 0;
  }

  // Arc fill angle (0–220 degrees)
  const arcFillAngle = phase === 'complete' && finalResult !== undefined
    ? speedToAngle(finalResult)
    : phase === 'ping'
    ? progress * 2.2
    : (progress / 100) * 220;

  const isIdle = phase === 'idle';
  const isComplete = phase === 'complete';
  const speedColor = isComplete && finalResult !== undefined
    ? getSpeedColor(finalResult)
    : currentMbps > 0
    ? getSpeedColor(currentMbps)
    : '#00FFB2';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        userSelect: 'none',
      }}
    >
      <div
        style={{ position: 'relative', width: size, height: size, maxWidth: '90vw' }}
        className={isIdle ? 'gauge-idle' : ''}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: 'visible', maxWidth: '100%' }}
        >
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4444" />
              <stop offset="40%" stopColor="#FFB800" />
              <stop offset="100%" stopColor="#00FFB2" />
            </linearGradient>
            <filter id="glowFilter">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background arc */}
          <path
            d={arcPath(cx, cy, r, 0, 220)}
            fill="none"
            stroke="#1A2D40"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active arc */}
          {arcFillAngle > 0 && (
            <path
              d={arcPath(cx, cy, r, 0, Math.min(arcFillAngle, 220))}
              fill="none"
              stroke="url(#arcGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter="url(#glowFilter)"
              style={{ transition: isComplete ? 'none' : 'all 0.1s linear' }}
            />
          )}

          {/* Tick marks */}
          {TICKS.map(({ mbps, label }) => {
            const angle = speedToAngle(mbps);
            const outerPt = polarToXY(cx, cy, r + 22, angle);
            const innerPt = polarToXY(cx, cy, r + 10, angle);
            const labelPt = polarToXY(cx, cy, r + 38, angle);
            return (
              <g key={mbps}>
                <line
                  x1={innerPt.x} y1={innerPt.y}
                  x2={outerPt.x} y2={outerPt.y}
                  stroke="#3A5570"
                  strokeWidth={mbps === 0 || mbps === 500 ? 2 : 1.5}
                />
                <text
                  x={labelPt.x} y={labelPt.y}
                  fill="#3A5570"
                  fontSize={10}
                  fontFamily="'Space Mono', monospace"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Needle */}
          {!isIdle && (() => {
            const needlePt = polarToXY(cx, cy, r - 20, needleAngle);
            const basePt = polarToXY(cx, cy, -20, needleAngle);
            return (
              <g filter="url(#glowFilter)">
                <line
                  x1={basePt.x} y1={basePt.y}
                  x2={needlePt.x} y2={needlePt.y}
                  stroke={speedColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                  style={{ transition: 'all 0.15s ease' }}
                />
                <circle cx={cx} cy={cy} r={6} fill={speedColor} opacity={0.9} />
              </g>
            );
          })()}

          {/* Outer ring glow */}
          <circle
            cx={cx} cy={cy} r={r + strokeWidth / 2 + 4}
            fill="none"
            stroke={speedColor}
            strokeWidth={1}
            opacity={isIdle ? 0.1 : 0.2}
            style={{ transition: 'opacity 0.5s ease' }}
          />

          {/* Center readout */}
          <text
            x={cx} y={cy - 12}
            fill={isIdle ? 'var(--text-ghost)' : speedColor}
            fontSize={isIdle ? 32 : 56}
            fontFamily="'Rajdhani', sans-serif"
            fontWeight={700}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ transition: 'fill 0.5s ease' }}
          >
            {isIdle ? '---' : displayMbps.toFixed(displayMbps < 10 ? 1 : 0)}
          </text>

          <text
            x={cx} y={cy + 32}
            fill="var(--text-secondary)"
            fontSize={11}
            fontFamily="'Space Mono', monospace"
            textAnchor="middle"
            letterSpacing={2}
          >
            {isIdle ? 'Mbps' : 'Mbps Download'}
          </text>
        </svg>
      </div>

      {/* Status / tagline */}
      <div style={{ minHeight: 28, textAlign: 'center' }}>
        {isIdle ? (
          <p
            key={taglineKey}
            className="tagline-animate"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 300,
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              maxWidth: 360,
              opacity: 0,
            }}
          >
            "{TAGLINES[taglineIndex]}"
          </p>
        ) : statusMessage ? (
          <p
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              color: isComplete ? 'var(--accent-signal)' : 'var(--text-secondary)',
              letterSpacing: '0.12em',
              transition: 'color 0.5s ease',
            }}
          >
            {statusMessage}
          </p>
        ) : null}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .gauge-svg { max-width: 280px; }
        }
      `}</style>
    </div>
  );
}
