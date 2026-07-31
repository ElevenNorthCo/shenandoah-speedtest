import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { generateCanonicalUrl, generateStructuredData, SITE_URL } from '../lib/seo';
import { findTownBySlug, PARENT_AREAS, townToSlug, VALLEY_TOWNS } from '../lib/geocode';
import { supabase, type SpeedResult } from '../lib/supabase';

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

function StatBox({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '10px',
      padding: '20px',
      textAlign: 'center',
      flex: '1 1 120px',
    }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.8rem', fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'var(--text-ghost)', marginTop: '4px' }}>{unit}</div>
      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

// Simple SVG line chart for speed trends
function SpeedChart({ results }: { results: SpeedResult[] }) {
  if (results.length < 2) return null;

  const sorted = [...results].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const downloads = sorted.map(r => r.download_mbps);
  const maxMbps = Math.max(...downloads, 1);
  const width = 600;
  const height = 200;
  const padding = 40;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = downloads.map((d, i) => {
    const x = padding + (i / (downloads.length - 1)) * chartW;
    const y = padding + chartH - (d / maxMbps) * chartH;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ width: '100%', maxWidth: '650px', margin: '0 auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(frac => {
          const y = padding + chartH - frac * chartH;
          return (
            <g key={frac}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1A2D40" strokeWidth="1" />
              <text x={padding - 6} y={y + 4} fill="#3A5570" fontSize="9" fontFamily="'Space Mono', monospace" textAnchor="end">
                {Math.round(maxMbps * frac)}
              </text>
            </g>
          );
        })}
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#00FFB2"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dots */}
        {downloads.map((d, i) => {
          const x = padding + (i / (downloads.length - 1)) * chartW;
          const y = padding + chartH - (d / maxMbps) * chartH;
          return <circle key={i} cx={x} cy={y} r="3" fill={getSpeedColor(d)} />;
        })}
      </svg>
    </div>
  );
}

export function TownDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [results, setResults] = useState<SpeedResult[]>([]);
  const [loading, setLoading] = useState(true);

  const town = slug ? findTownBySlug(slug) : undefined;

  useEffect(() => {
    if (!town) return;

    const fetch = async () => {
      const { data } = await supabase
        .from('speed_results')
        .select('*')
        .eq('town', town.town)
        .eq('region', town.region)
        .order('created_at', { ascending: false })
        .limit(50);

      setResults(data ?? []);
      setLoading(false);
    };
    void fetch();
  }, [town]);

  // 404 — unknown town
  if (!town) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--bg-void)', minHeight: '60vh' }}>
        <SEOHead
          title="Community Not Found | Shenandoah Valley Speed Test"
          description="This community page could not be found. Browse all Shenandoah Valley internet speed test communities."
          canonical={generateCanonicalUrl('/towns')}
          noIndex={true}
        />
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: '2rem',
          color: 'var(--text-primary)',
          marginBottom: '16px',
        }}>
          Community Not Found
        </h1>
        <p style={{ fontFamily: "'Sora', sans-serif", color: 'var(--text-secondary)', marginBottom: '24px' }}>
          We couldn&apos;t find a community matching &ldquo;{slug?.replace(/-/g, ' ')}&rdquo;.
        </p>
        <Link to="/towns" style={{
          fontFamily: "'Sora', sans-serif",
          color: 'var(--accent-signal)',
          textDecoration: 'none',
        }}>
          ← Browse all communities
        </Link>
      </div>
    );
  }

  // Calculate stats
  const totalTests = results.length;
  const avgDownload = totalTests > 0 ? results.reduce((s, r) => s + r.download_mbps, 0) / totalTests : 0;
  const avgUpload = totalTests > 0 ? results.reduce((s, r) => s + r.upload_mbps, 0) / totalTests : 0;
  const avgPing = totalTests > 0 ? Math.round(results.reduce((s, r) => s + r.ping_ms, 0) / totalTests) : 0;

  // Best carrier
  const carrierCounts = new Map<string, { count: number; totalDown: number }>();
  for (const r of results) {
    if (!r.carrier || r.carrier === 'Other') continue;
    const c = carrierCounts.get(r.carrier) ?? { count: 0, totalDown: 0 };
    c.count++;
    c.totalDown += r.download_mbps;
    carrierCounts.set(r.carrier, c);
  }
  let bestCarrier = '';
  let bestCarrierAvg = 0;
  for (const [carrier, data] of carrierCounts) {
    const avg = data.totalDown / data.count;
    if (avg > bestCarrierAvg) {
      bestCarrierAvg = avg;
      bestCarrier = carrier;
    }
  }

  // Nearby communities
  const parentArea = town.parentArea;
  const nearbyCommunities = parentArea
    ? (PARENT_AREAS[parentArea] ?? []).filter(n => n !== town.town)
    : [];

  // FAQ data
  const faqQuestions = [
    {
      '@type': 'Question' as const,
      name: `How can I compare internet providers in ${town.town}?`,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: `Use the community-submitted results on this page to compare download speed, upload speed, ping, and provider performance in ${town.town}. Availability can vary by individual address.`,
      },
    },
    {
      '@type': 'Question' as const,
      name: `How often do internet speed results for ${town.town} update?`,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: `Results update as residents submit new tests. Run tests at different times of day to help build a more representative picture of internet performance in ${town.town}.`,
      },
    },
    {
      '@type': 'Question' as const,
      name: `Can I add my own speed test result for ${town.town}?`,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: `Yes. Run the free speed test from the home page and submit the result to help neighbors compare real-world internet service in ${town.town}.`,
      },
    },
    {
      '@type': 'Question' as const,
      name: `How does ${town.town}'s internet compare to nearby areas?`,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: nearbyCommunities.length > 0
          ? `${town.town} is grouped with nearby communities including ${nearbyCommunities.slice(0, 3).join(', ')}. Open each community page to compare submitted results.`
          : `Use the towns directory to compare ${town.town} with other Shenandoah Valley communities.`,
      },
    },
  ];

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_URL}/towns/${slug}#webpage`,
      url: `${SITE_URL}/towns/${slug}`,
      name: `${town.town} Internet Speed Test`,
      description: `Test internet speed in ${town.town}, ${town.region}, compare community-submitted results, and explore local provider performance.`,
      inLanguage: 'en-US',
      about: {
        '@type': 'Place',
        name: `${town.town}, ${town.region}`,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: town.lat,
          longitude: town.lng,
        },
      },
    },
    generateStructuredData('FAQPage', { questions: faqQuestions }),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Towns', item: `${SITE_URL}/towns` },
        { '@type': 'ListItem', position: 3, name: town.town, item: `${SITE_URL}/towns/${slug}` },
      ],
    },
  ];

  const recentResults = results.slice(0, 20);

  return (
    <div style={{ background: 'var(--bg-void)', minHeight: '60vh' }}>
      <SEOHead
        title={`${town.town}, ${town.region} Internet Speed Test`}
        description={`Test your internet speed in ${town.town}, ${town.region}. View community-submitted results, compare local providers, and explore nearby Shenandoah Valley communities.`}
        canonical={generateCanonicalUrl(`/towns/${slug}`)}
        structuredData={structuredData}
      />

      <section style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Back link */}
        <Link
          to="/towns"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.8rem',
            color: 'var(--text-ghost)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '16px',
          }}
        >
          ← All Communities
        </Link>

        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
          color: 'var(--text-primary)',
          letterSpacing: '0.05em',
          marginBottom: '8px',
        }}>
          Internet Speeds in {town.town}, {town.region}
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-ghost)', letterSpacing: '0.1em' }}>LOADING DATA...</span>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px', marginTop: '20px' }}>
              <StatBox label="Avg Download" value={avgDownload.toFixed(1)} unit="Mbps" color={getSpeedColor(avgDownload)} />
              <StatBox label="Avg Upload" value={avgUpload.toFixed(1)} unit="Mbps" color="var(--text-secondary)" />
              <StatBox label="Avg Ping" value={String(avgPing)} unit="ms" color="var(--accent-sky)" />
              <StatBox label="Total Tests" value={String(totalTests)} unit="" color="var(--text-primary)" />
            </div>

            {/* Best provider */}
            {bestCarrier && (
              <div style={{
                background: '#00FFB208',
                border: '1px solid #00FFB225',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{ fontSize: '1.2rem' }}>🏆</span>
                <div>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    Best Provider: <strong>{formatCarrierShort(bestCarrier)}</strong>
                  </span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: 'var(--accent-signal)', marginLeft: '8px' }}>
                    {bestCarrierAvg.toFixed(0)} Mbps avg
                  </span>
                </div>
              </div>
            )}

            {/* Speed trend chart */}
            {results.length >= 2 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}>
                  Speed Trend
                </h2>
                <SpeedChart results={results} />
              </div>
            )}

            {/* Recent results table */}
            {recentResults.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}>
                  Recent Tests
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 1.2fr 1.2fr',
                    gap: '4px',
                    padding: '8px 12px',
                    background: 'var(--bg-elevated)',
                    borderRadius: '8px 8px 0 0',
                    minWidth: '500px',
                  }}>
                    {['User', '↓ Down', '↑ Up', 'Ping', 'Carrier', 'Date'].map(h => (
                      <span key={h} style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '0.6rem',
                        color: 'var(--text-ghost)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}>{h}</span>
                    ))}
                  </div>
                  {recentResults.map(r => (
                    <div key={r.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 1.2fr 1.2fr',
                      gap: '4px',
                      padding: '8px 12px',
                      borderBottom: '1px solid var(--border-subtle)',
                      minWidth: '500px',
                    }}>
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.username}</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: getSpeedColor(r.download_mbps) }}>{r.download_mbps.toFixed(0)}</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.upload_mbps.toFixed(0)}</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: 'var(--accent-sky)' }}>{r.ping_ms}</span>
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.carrier ? formatCarrierShort(r.carrier) : '—'}
                      </span>
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.7rem', color: 'var(--text-ghost)' }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby communities */}
            {nearbyCommunities.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}>
                  Nearby Communities — {parentArea}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {nearbyCommunities.map(name => (
                    <Link
                      key={name}
                      to={`/towns/${townToSlug(
                        name,
                        VALLEY_TOWNS.find(t => t.town === name && t.parentArea === parentArea)?.region,
                      )}`}
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        padding: '6px 14px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        transition: 'border-color 0.2s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-signal)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'var(--text-primary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {faqQuestions.map(q => (
                  <div key={q.name} style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '16px 20px',
                  }}>
                    <h3 style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}>
                      {q.name}
                    </h3>
                    <p style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: '0.8rem',
                      fontWeight: 300,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}>
                      {q.acceptedAnswer.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
              <Link
                to="/"
                style={{
                  display: 'inline-block',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '14px 40px',
                  color: '#080C10',
                  background: 'var(--accent-signal)',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                Test your speed in {town.town} →
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
