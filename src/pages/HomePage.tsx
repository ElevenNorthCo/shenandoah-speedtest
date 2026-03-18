import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SpeedGauge } from '../components/SpeedGauge';
import { ResultCard } from '../components/ResultCard';
import { CesiumGlobe } from '../components/CesiumGlobe';
import { Leaderboard } from '../components/Leaderboard';
import { SEOHead } from '../components/SEOHead';
import { useSpeedTest } from '../hooks/useSpeedTest';
import { useLiveStats, useCarrierStats, useTownStats } from '../hooks/useStats';
import { generateCanonicalUrl } from '../lib/seo';
import { townToSlug } from '../lib/geocode';

function getSpeedColor(mbps: number): string {
  if (mbps >= 100) return '#00FFB2';
  if (mbps >= 25) return '#FFB800';
  return '#FF4444';
}

function getBestForTag(avgDownload: number): string {
  if (avgDownload >= 200) return 'Streaming, Gaming, WFH';
  if (avgDownload >= 100) return 'Streaming & Video Calls';
  if (avgDownload >= 50) return 'General Browsing & Streaming';
  if (avgDownload >= 25) return 'Basic Browsing';
  return 'Light Use Only';
}

function formatCarrierShort(carrier: string): string {
  if (carrier.includes('Shenandoah Telecommunications')) return 'Shentel';
  if (carrier.includes('T-Mobile Home')) return 'T-Mobile';
  if (carrier.includes('All Points')) return 'All Points';
  if (carrier.includes('Comcast')) return 'Xfinity';
  return carrier;
}

export function HomePage() {
  const { state, startTest, reset } = useSpeedTest();
  const [newResultId, setNewResultId] = useState<string | undefined>();
  const { stats, loading: statsLoading } = useLiveStats();
  const { data: carriers, loading: carriersLoading } = useCarrierStats();
  const { data: towns, loading: townsLoading } = useTownStats();
  const [townSearch, setTownSearch] = useState('');

  const isTesting = state.phase !== 'idle' && state.phase !== 'complete' && state.phase !== 'error';
  const showResult = state.phase === 'complete' && state.result !== null;

  const handleRunTest = () => {
    reset();
    setNewResultId(undefined);
    void startTest();
  };

  const handleRetry = () => { reset(); };

  const buttonLabel = isTesting
    ? `TESTING... ${Math.round(state.progress)}%`
    : state.phase === 'error'
    ? 'RETRY TEST'
    : 'RUN SPEED TEST';

  const filteredTowns = towns.filter(t =>
    t.town.toLowerCase().includes(townSearch.toLowerCase())
  );
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const displayTowns = filteredTowns.slice(0, isMobile ? 5 : 10);
  const topCarrier = carriers[0];

  return (
    <>
      <SEOHead
        title="Shenandoah Valley Internet Speed Test | Free Community Tool"
        description="Test your internet speed in the Shenandoah Valley, VA. See real speeds from your neighbors, compare ISPs like Shentel, Starlink, and T-Mobile, and find the best provider for your area. Free forever."
        canonical={generateCanonicalUrl('/')}
      />

      {/* Hero Section */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px 40px',
        gap: '24px',
      }}>
        <div className="opacity-0-init animate-fade-in-up animate-delay-200">
          <SpeedGauge
            phase={state.phase}
            progress={state.progress}
            currentMbps={state.currentMbps}
            statusMessage={state.statusMessage}
            finalResult={state.result?.downloadMbps}
          />
        </div>

        <div className="opacity-0-init animate-fade-in-up animate-delay-400">
          <button
            onClick={handleRunTest}
            disabled={isTesting}
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '16px 48px',
              background: isTesting
                ? `linear-gradient(90deg, #00FFB215 ${state.progress}%, transparent ${state.progress}%)`
                : 'transparent',
              color: 'var(--accent-signal)',
              border: '2px solid var(--accent-signal)',
              borderRadius: '4px',
              cursor: isTesting ? 'not-allowed' : 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: 'background 0.1s linear, box-shadow 0.3s ease',
              minWidth: '260px',
            }}
            onMouseEnter={(e) => {
              if (!isTesting) {
                (e.currentTarget as HTMLButtonElement).style.background = '#00FFB210';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px #00FFB240';
              }
            }}
            onMouseLeave={(e) => {
              if (!isTesting) {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }
            }}
            onMouseDown={(e) => {
              if (!isTesting) {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
              }
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            {buttonLabel}
          </button>
        </div>

        {state.phase === 'error' && state.error && (
          <div style={{
            background: '#FF444415',
            border: '1px solid #FF444430',
            borderRadius: '10px',
            padding: '14px 20px',
            maxWidth: '500px',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '0.85rem',
              color: 'var(--accent-danger)',
            }}>
              {state.error}
            </p>
          </div>
        )}

        {showResult && state.result && (
          <div style={{ width: '100%', maxWidth: '640px' }}>
            <ResultCard
              result={state.result}
              ispInfo={state.ispInfo}
              townInfo={state.townInfo}
              detectedCarrier={state.detectedCarrier}
              onRetry={handleRetry}
              onSubmitted={(id) => setNewResultId(id)}
            />
          </div>
        )}
      </section>

      {/* ═══ "Why This Matters" Banner ═══ */}
      <section style={{
        padding: '48px 24px',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '40px 32px',
        }}>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            ISP Maps <span style={{ color: 'var(--accent-danger)' }}>Lie</span>. Your Neighbors Don&apos;t.
          </h2>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.9rem',
            fontWeight: 300,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            textAlign: 'center',
            maxWidth: '650px',
            margin: '0 auto 28px',
          }}>
            Coverage maps are marketing tools, not ground truth. Every result on this map
            is from a real person, on a real connection, in a real location in the Valley.
            The more people test, the more accurate the picture becomes.
          </p>

          {/* Live stat chips */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            {[
              { value: stats.totalTests, label: 'Tests Submitted', color: 'var(--accent-signal)' },
              { value: stats.communities, label: 'Communities', color: 'var(--accent-sky)' },
              { value: stats.carriers, label: 'Carriers Tracked', color: 'var(--accent-warn)' },
            ].map(chip => (
              <div key={chip.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
              }}>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: chip.color,
                }}>
                  {statsLoading ? '—' : chip.value.toLocaleString()}
                </span>
                <span style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 300,
                }}>
                  {chip.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map + Leaderboard Section */}
      <section
        className="opacity-0-init animate-fade-in animate-delay-600 map-lb-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '60% 40%',
          gap: '0',
          height: '600px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="map-panel" style={{
          borderRight: '1px solid var(--border-subtle)',
          padding: '16px',
          height: '100%',
        }}>
          <CesiumGlobe newResultId={newResultId} />
        </div>
        <div
          className="opacity-0-init animate-fade-in animate-delay-800 lb-panel"
          style={{ padding: '16px', height: '100%', overflow: 'hidden' }}
        >
          <Leaderboard />
        </div>
      </section>

      {/* ═══ Provider Leaderboard Widget ═══ */}
      <section style={{
        padding: '56px 24px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: '8px',
          }}>
            Best Providers in the Valley
          </h2>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.8rem',
            color: 'var(--text-ghost)',
            textAlign: 'center',
            marginBottom: '32px',
            fontWeight: 300,
          }}>
            Based on real community tests — not marketing claims
          </p>

          {carriersLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-ghost)', letterSpacing: '0.1em' }}>LOADING...</span>
            </div>
          ) : carriers.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-ghost)', fontFamily: "'Sora', sans-serif", fontSize: '0.85rem' }}>
              No carrier data yet. Run a test to get started!
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}>
              {carriers.map((c) => {
                const maxDownload = topCarrier?.avg_download ?? 1;
                const barWidth = (c.avg_download / maxDownload) * 100;
                return (
                  <div key={c.carrier} style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '24px 20px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Performance bar */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: `${barWidth}%`,
                      height: '3px',
                      background: getSpeedColor(c.avg_download),
                      opacity: 0.5,
                      borderRadius: '0 3px 0 0',
                    }} />

                    <h3 style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: 'var(--text-primary)',
                      letterSpacing: '0.05em',
                      marginBottom: '12px',
                    }}>
                      {formatCarrierShort(c.carrier)}
                    </h3>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px',
                      marginBottom: '14px',
                    }}>
                      <div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.1rem', color: getSpeedColor(c.avg_download), fontWeight: 700 }}>
                          {c.avg_download}
                        </div>
                        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.65rem', color: 'var(--text-ghost)' }}>Avg Down</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                          {c.avg_upload}
                        </div>
                        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.65rem', color: 'var(--text-ghost)' }}>Avg Up</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.1rem', color: 'var(--accent-sky)', fontWeight: 700 }}>
                          {c.avg_ping}
                        </div>
                        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.65rem', color: 'var(--text-ghost)' }}>Ping (ms)</div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: '0.7rem',
                        color: 'var(--accent-signal)',
                        background: '#00FFB210',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        border: '1px solid #00FFB220',
                      }}>
                        {getBestForTag(c.avg_download)}
                      </span>
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '0.65rem',
                        color: 'var(--text-ghost)',
                      }}>
                        {c.test_count} tests
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══ Town Directory Widget ═══ */}
      <section style={{
        padding: '56px 24px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: '8px',
          }}>
            Speeds by Community
          </h2>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.8rem',
            color: 'var(--text-ghost)',
            textAlign: 'center',
            marginBottom: '24px',
            fontWeight: 300,
          }}>
            Click any town for details
          </p>

          {/* Search */}
          <div style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
            <input
              type="text"
              placeholder="Search towns..."
              value={townSearch}
              onChange={e => setTownSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontFamily: "'Sora', sans-serif",
                fontSize: '0.85rem',
                outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-signal)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            />
          </div>

          {townsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-ghost)', letterSpacing: '0.1em' }}>LOADING...</span>
            </div>
          ) : towns.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-ghost)', fontFamily: "'Sora', sans-serif", fontSize: '0.85rem' }}>
              No town data yet. Run a test to get started!
            </p>
          ) : (
            <>
              {/* Table header */}
              <div className="town-dir-grid" style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1.2fr 0.8fr 1.2fr',
                gap: '4px',
                padding: '8px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: '8px 8px 0 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                {['Town', '↓ Down', '↑ Up', 'Top Provider', 'Tests', 'Last Tested'].map(h => (
                  <span key={h} style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.65rem',
                    color: 'var(--text-ghost)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              {displayTowns.map(t => (
                <Link
                  key={t.town}
                  to={`/towns/${townToSlug(t.town)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="town-dir-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1.2fr 0.8fr 1.2fr',
                    gap: '4px',
                    padding: '10px 12px',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s ease',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {t.town}
                    </span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: getSpeedColor(t.avg_download) }}>
                      {t.avg_download}
                    </span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {t.avg_upload}
                    </span>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.top_carrier ? formatCarrierShort(t.top_carrier) : '—'}
                    </span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-ghost)' }}>
                      {t.test_count}
                    </span>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.7rem', color: 'var(--text-ghost)' }}>
                      {new Date(t.last_tested).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}

              {filteredTowns.length > displayTowns.length && (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <Link
                    to="/towns"
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '0.85rem',
                      color: 'var(--accent-signal)',
                      textDecoration: 'none',
                    }}
                  >
                    View all {filteredTowns.length} communities →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .map-lb-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .map-panel {
            height: 360px !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border-subtle);
          }
          .lb-panel {
            height: 500px !important;
          }
          .town-dir-grid {
            grid-template-columns: 1.5fr 1fr 1fr 0 0 0 !important;
          }
        }
      `}</style>
    </>
  );
}
