import { useState } from 'react';
import type { SpeedTestResult } from '../lib/speedtest';
import type { IspInfo } from '../lib/ispDetect';
import type { TownInfo } from '../lib/geocode';
import { SubmitForm } from './SubmitForm';
import { ShareButton } from './ShareButton';

interface ResultCardProps {
  result: SpeedTestResult;
  ispInfo: IspInfo | null;
  townInfo: TownInfo | null;
  detectedCarrier: string;
  onRetry: () => void;
  onSubmitted?: (id: string) => void;
}

function getSpeedColor(mbps: number): string {
  if (mbps >= 100) return '#00FFB2';
  if (mbps >= 25) return '#FFB800';
  return '#FF4444';
}

function SpeedBlock({ label, value, unit }: { label: string; value: string; unit: string }) {
  const mbps = parseFloat(value);
  const color = unit === 'ms' ? '#38BDF8' : getSpeedColor(mbps);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      flex: 1,
    }}>
      <span style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 700,
        fontSize: '2.8rem',
        color,
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {value}
      </span>
      <span style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.65rem',
        color: 'var(--text-secondary)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
      }}>
        {unit}
      </span>
      <span style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        fontWeight: 300,
      }}>
        {label}
      </span>
    </div>
  );
}

export function ResultCard({ result, ispInfo, townInfo, detectedCarrier, onRetry, onSubmitted }: ResultCardProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitted = (id: string) => {
    setSubmitted(true);
    onSubmitted?.(id);
  };

  return (
    <div
      className="animate-slide-up"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '640px',
        margin: '0 auto',
        boxShadow: '0 0 60px #00FFB215',
        width: '100%',
      }}
    >
      {/* Speed stats row */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '24px',
      }}>
        <SpeedBlock
          label="Download"
          value={result.downloadMbps.toFixed(1)}
          unit="Mbps ↓"
        />
        <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
        <SpeedBlock
          label="Upload"
          value={result.uploadMbps.toFixed(1)}
          unit="Mbps ↑"
        />
        <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
        <SpeedBlock
          label="Ping"
          value={String(result.pingMs)}
          unit="ms"
        />
      </div>

      {/* ISP info */}
      {ispInfo?.isp && ispInfo.isp !== 'Unknown' && (
        <div style={{
          marginBottom: '20px',
          padding: '8px 12px',
          background: 'var(--bg-elevated)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '0.8rem' }}>🌐</span>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}>
            Detected ISP: <span style={{ color: 'var(--text-primary)' }}>{ispInfo.isp}</span>
          </span>
        </div>
      )}

      {!submitted ? (
        <SubmitForm
          result={result}
          ispInfo={ispInfo}
          townInfo={townInfo}
          detectedCarrier={detectedCarrier}
          onSubmitted={(id) => {
            handleSubmitted(id);
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 20px',
            background: '#00FFB215',
            border: '1px solid #00FFB240',
            borderRadius: '10px',
            width: '100%',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
            <span style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '0.9rem',
              color: 'var(--accent-signal)',
            }}>
              Result submitted! Check the map and leaderboard.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const, justifyContent: 'center' }}>
            <ShareButton
              downloadMbps={result.downloadMbps}
              carrier={detectedCarrier}
              town={townInfo?.town ?? ''}
            />
            <button
              onClick={onRetry}
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              Test Again
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
