import { useState } from 'react';
import { useLeaderboard, type LeaderboardTab } from '../hooks/useLeaderboard';
import type { SpeedResult } from '../lib/supabase';

function formatCarrierForPopup(carrier: string | null): string {
  if (!carrier) return 'Unknown';
  if (carrier.includes('Shenandoah Telecommunications')) return 'Shentel';
  if (carrier.includes('T-Mobile Home')) return 'T-Mobile Home Internet';
  if (carrier.includes('All Points')) return 'All Points Broadband';
  if (carrier.includes('Comcast')) return 'Comcast/Xfinity';
  return carrier;
}

// Detail popup modal
function LeaderboardPopup({ result, rank, onClose }: { result: SpeedResult; rank: number; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '32px 28px',
          maxWidth: '420px',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'none', border: 'none', color: 'var(--text-ghost)',
            fontSize: '1.2rem', cursor: 'pointer', padding: '4px',
          }}
        >
          ✕
        </button>

        {/* User + rank */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
          </div>
          <h3 style={{
            fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1.4rem',
            color: 'var(--text-primary)', letterSpacing: '0.05em', margin: 0,
          }}>
            {result.username}
          </h3>
          <span style={{
            fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', color: 'var(--text-ghost)',
          }}>
            {result.town ?? 'Shenandoah Valley'}{result.region ? `, ${result.region}` : ''}
          </span>
        </div>

        {/* Speed stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '14px 8px' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color: getSpeedColor(result.download_mbps) }}>
              {result.download_mbps.toFixed(0)}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', color: 'var(--text-ghost)', marginTop: '2px' }}>MBPS DOWN</div>
          </div>
          <div style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '14px 8px' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {result.upload_mbps.toFixed(0)}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', color: 'var(--text-ghost)', marginTop: '2px' }}>MBPS UP</div>
          </div>
          <div style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '14px 8px' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color: '#38BDF8' }}>
              {result.ping_ms}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', color: 'var(--text-ghost)', marginTop: '2px' }}>MS PING</div>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: 'var(--text-ghost)' }}>Provider</span>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{formatCarrierForPopup(result.carrier)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: 'var(--text-ghost)' }}>Tested</span>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: 'var(--text-primary)' }}>{new Date(result.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          {result.isp_detected && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: 'var(--text-ghost)' }}>ISP Detected</span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{result.isp_detected}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getRankDisplay(rank: number, isRecent: boolean): React.ReactNode {
  if (!isRecent) {
    if (rank === 1) return <span style={{ fontSize: '1rem' }}>🥇</span>;
    if (rank === 2) return <span style={{ fontSize: '1rem' }}>🥈</span>;
    if (rank === 3) return <span style={{ fontSize: '1rem' }}>🥉</span>;
  }
  return <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: 'var(--text-ghost)' }}>{rank}</span>;
}

function getBorderColor(rank: number): string {
  if (rank === 1) return '#FFD700';
  if (rank === 2) return '#C0C0C0';
  if (rank === 3) return '#CD7F32';
  return 'transparent';
}

function getSpeedColor(mbps: number): string {
  if (mbps >= 100) return '#00FFB2';
  if (mbps >= 25) return '#FFB800';
  return '#FF4444';
}

function formatCarrier(carrier: string | null): string {
  if (!carrier) return '—';
  // Shorten long carrier names
  if (carrier.includes('Shenandoah Telecommunications')) return 'Shentel';
  if (carrier.includes('T-Mobile Home')) return 'T-Mobile';
  if (carrier.includes('All Points')) return 'All Points';
  if (carrier.includes('Comcast')) return 'Xfinity';
  return carrier;
}

interface LeaderboardRowProps {
  result: SpeedResult;
  rank: number;
  isNew: boolean;
  activeTab: LeaderboardTab;
}

function LeaderboardRow({ result, rank, isNew, activeTab, onClick }: LeaderboardRowProps & { onClick: () => void }) {
  const primaryMbps = activeTab === 'upload' ? result.upload_mbps : result.download_mbps;
  const isRecent = activeTab === 'recent';
  const borderColor = isRecent ? 'transparent' : getBorderColor(rank);

  return (
    <div
      className={isNew ? 'lb-new-row' : ''}
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 80px 70px 50px 80px',
        gap: '4px',
        alignItems: 'center',
        padding: '10px 12px',
        borderLeft: borderColor !== 'transparent' ? `3px solid ${borderColor}` : '3px solid transparent',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background 0.2s ease',
        borderRadius: (!isRecent && rank <= 3) ? '0 4px 4px 0' : 0,
        cursor: 'pointer',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
    >
      {/* Rank */}
      <div style={{ textAlign: 'center', minWidth: 0 }}>
        {getRankDisplay(rank, isRecent)}
      </div>

      {/* Username */}
      <div style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: '0.85rem',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {result.username}
      </div>

      {/* Download */}
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.8rem',
        color: getSpeedColor(result.download_mbps),
        textAlign: 'right',
      }}>
        {result.download_mbps.toFixed(0)}
        <span style={{ fontSize: '0.65rem', color: 'var(--text-ghost)' }}> Mbps</span>
      </div>

      {/* Upload */}
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        textAlign: 'right',
      }}>
        {result.upload_mbps.toFixed(0)}
        <span style={{ fontSize: '0.65rem', color: 'var(--text-ghost)' }}> Mbps</span>
      </div>

      {/* Ping */}
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.75rem',
        color: '#38BDF8',
        textAlign: 'right',
      }}>
        {result.ping_ms}
        <span style={{ fontSize: '0.65rem', color: 'var(--text-ghost)' }}>ms</span>
      </div>

      {/* Town */}
      <div style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
      }}>
        <span>{result.town ?? '—'}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-ghost)' }}>
          {formatCarrier(result.carrier)}
        </span>
      </div>

      {/* Active tab highlight bar */}
      {void primaryMbps}
    </div>
  );
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('download');
  const { results, loading, error, newRowId, refetch } = useLeaderboard(activeTab);
  const [popup, setPopup] = useState<{ result: SpeedResult; rank: number } | null>(null);

  const tabs: { id: LeaderboardTab; label: string }[] = [
    { id: 'download', label: 'Top Download' },
    { id: 'upload', label: 'Top Upload' },
    { id: 'recent', label: 'Most Recent' },
  ];

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 0',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            Leaderboard
          </h2>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            color: 'var(--text-ghost)',
            letterSpacing: '0.06em',
          }}>
            LIVE
            <span style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent-signal)',
              marginLeft: 6,
              boxShadow: '0 0 6px var(--accent-signal)',
              verticalAlign: 'middle',
            }} />
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '0.8rem',
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--accent-signal)' : 'var(--text-ghost)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-signal)' : '2px solid transparent',
                padding: '8px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 80px 70px 50px 80px',
        gap: '4px',
        padding: '8px 12px',
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {['#', 'User', '↓ Down', '↑ Up', 'Ping', 'Town'].map(col => (
          <span key={col} style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            color: 'var(--text-ghost)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: col === '#' ? 'center' : col === '↓ Down' || col === '↑ Up' || col === 'Ping' ? 'right' : 'left',
          }}>
            {col}
          </span>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-ghost)',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
          }}>
            LOADING...
          </div>
        )}

        {error && (
          <div style={{ padding: '20px 16px', textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-danger)', fontFamily: "'Sora',sans-serif", fontSize: '0.85rem', marginBottom: '12px' }}>
              Failed to load leaderboard
            </p>
            <button
              onClick={() => void refetch()}
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: '0.8rem',
                color: 'var(--accent-signal)',
                background: 'transparent',
                border: '1px solid var(--accent-signal)',
                borderRadius: '6px',
                padding: '6px 16px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-ghost)',
            fontFamily: "'Sora',sans-serif",
            fontSize: '0.85rem',
          }}>
            No results yet. Be the first!
          </div>
        )}

        {!loading && !error && results.map((result, i) => (
          <LeaderboardRow
            key={result.id}
            result={result}
            rank={i + 1}
            isNew={result.id === newRowId}
            activeTab={activeTab}
            onClick={() => setPopup({ result, rank: i + 1 })}
          />
        ))}
      </div>

      {/* Detail popup */}
      {popup && (
        <LeaderboardPopup
          result={popup.result}
          rank={popup.rank}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
