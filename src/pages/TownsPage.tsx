import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { generateCanonicalUrl } from '../lib/seo';
import { useTownStats } from '../hooks/useStats';
import { VALLEY_TOWNS, PARENT_AREAS, townToSlug } from '../lib/geocode';

function getSpeedColor(mbps: number): string {
  if (mbps >= 100) return '#00FFB2';
  if (mbps >= 25) return '#FFB800';
  return '#FF4444';
}

function formatCarrierShort(carrier: string): string {
  if (carrier.includes('Shenandoah Telecommunications')) return 'Shentel';
  if (carrier.includes('T-Mobile Home')) return 'T-Mobile';
  if (carrier.includes('All Points')) return 'All Points';
  if (carrier.includes('Comcast')) return 'Xfinity';
  return carrier;
}

export function TownsPage() {
  const { data: townStats, loading } = useTownStats();
  const [search, setSearch] = useState('');
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'speed' | 'tests'>('name');

  // Build lookup map for stats
  const statsMap = new Map(townStats.map(t => [t.town.toLowerCase(), t]));

  // Get all parent areas
  const parentAreaNames = Object.keys(PARENT_AREAS).sort();

  const toggleArea = (area: string) => {
    setExpandedAreas(prev => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  };

  const filterMatch = (townName: string) =>
    townName.toLowerCase().includes(search.toLowerCase());

  const sortTowns = (towns: string[]) => {
    return [...towns].sort((a, b) => {
      const sa = statsMap.get(a.toLowerCase());
      const sb = statsMap.get(b.toLowerCase());
      if (sortBy === 'speed') {
        return (sb?.avg_download ?? 0) - (sa?.avg_download ?? 0);
      }
      if (sortBy === 'tests') {
        return (sb?.test_count ?? 0) - (sa?.test_count ?? 0);
      }
      return a.localeCompare(b);
    });
  };

  return (
    <div style={{ background: 'var(--bg-void)', minHeight: '60vh' }}>
      <SEOHead
        title="Internet Speeds by Town | Shenandoah Valley Speed Test"
        description="Compare internet speeds across every town and community in the Shenandoah Valley. Find the best ISP for Broadway, Luray, Woodstock, Harrisonburg, and 100+ rural communities."
        canonical={generateCanonicalUrl('/towns')}
      />

      <section style={{ padding: '48px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          color: 'var(--text-primary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          Internet Speeds Across the Shenandoah Valley
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          fontWeight: 300,
          lineHeight: 1.7,
          marginBottom: '32px',
          maxWidth: '700px',
        }}>
          Browse real internet speed data from 150+ communities across the Valley.
          Click any town to see detailed stats, provider comparisons, and speed trends.
        </p>

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <input
            type="text"
            placeholder="Search towns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: '1 1 250px',
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
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'name' | 'speed' | 'tests')}
            style={{
              padding: '10px 16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontFamily: "'Sora', sans-serif",
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="name">Sort: Name</option>
            <option value="speed">Sort: Speed</option>
            <option value="tests">Sort: Tests</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-ghost)', letterSpacing: '0.1em' }}>LOADING COMMUNITY DATA...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {parentAreaNames.map(area => {
              const areaTowns = PARENT_AREAS[area] ?? [];
              const filtered = areaTowns.filter(filterMatch);
              if (search && filtered.length === 0) return null;
              const displayTowns = sortTowns(search ? filtered : areaTowns);
              const isExpanded = expandedAreas.has(area) || search.length > 0;

              return (
                <div key={area} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}>
                  {/* Area header */}
                  <button
                    onClick={() => toggleArea(area)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 20px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>
                      {area}
                    </span>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.7rem',
                      color: 'var(--text-ghost)',
                    }}>
                      {displayTowns.length} towns {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Towns list */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      {displayTowns.map(townName => {
                        const stat = statsMap.get(townName.toLowerCase());
                        const town = VALLEY_TOWNS.find(t => t.town === townName);
                        const slug = townToSlug(townName);

                        return (
                          <Link
                            key={townName}
                            to={`/towns/${slug}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 1fr 1fr 1.2fr 0.8fr',
                              gap: '8px',
                              alignItems: 'center',
                              padding: '10px 20px',
                              borderBottom: '1px solid var(--border-subtle)',
                              transition: 'background 0.15s ease',
                              cursor: 'pointer',
                            }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <span style={{
                                fontFamily: "'Sora', sans-serif",
                                fontSize: '0.85rem',
                                color: 'var(--text-primary)',
                              }}>
                                {townName}
                                {town && (
                                  <span style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-ghost)',
                                    marginLeft: '6px',
                                  }}>
                                    {town.region}
                                  </span>
                                )}
                              </span>

                              {stat ? (
                                <>
                                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: getSpeedColor(stat.avg_download) }}>
                                    {stat.avg_download} <span style={{ fontSize: '0.6rem', color: 'var(--text-ghost)' }}>Mbps</span>
                                  </span>
                                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {stat.top_carrier ? formatCarrierShort(stat.top_carrier) : '—'}
                                  </span>
                                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'var(--text-ghost)' }}>
                                    {stat.test_count} tests
                                  </span>
                                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.65rem', color: 'var(--text-ghost)' }}>
                                    {new Date(stat.last_tested).toLocaleDateString()}
                                  </span>
                                </>
                              ) : (
                                <span style={{
                                  gridColumn: '2 / -1',
                                  fontFamily: "'Sora', sans-serif",
                                  fontSize: '0.8rem',
                                  color: 'var(--text-ghost)',
                                  fontStyle: 'italic',
                                }}>
                                  No data yet — <span style={{ color: 'var(--accent-signal)' }}>be the first!</span>
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
