import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { generateCanonicalUrl } from '../lib/seo';
import { useAuth } from '../hooks/useAuth';
import { supabase, type SpeedResult, type CarrierStats } from '../lib/supabase';

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

// Simple SVG chart
function HistoryChart({ results, metric }: { results: SpeedResult[]; metric: 'download' | 'upload' | 'ping' }) {
  if (results.length < 2) return null;
  const sorted = [...results].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const values = sorted.map(r => metric === 'download' ? r.download_mbps : metric === 'upload' ? r.upload_mbps : r.ping_ms);
  const maxVal = Math.max(...values, 1);
  const width = 700; const height = 200; const pad = 40;
  const chartW = width - pad * 2; const chartH = height - pad * 2;
  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * chartW;
    const y = pad + chartH - (v / maxVal) * chartH;
    return `${x},${y}`;
  }).join(' ');
  const color = metric === 'ping' ? '#38BDF8' : '#00FFB2';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = pad + chartH - f * chartH;
        return (
          <g key={f}>
            <line x1={pad} y1={y} x2={width - pad} y2={y} stroke="#1A2D40" strokeWidth="1" />
            <text x={pad - 6} y={y + 4} fill="#3A5570" fontSize="9" fontFamily="'Space Mono', monospace" textAnchor="end">
              {Math.round(maxVal * f)}
            </text>
          </g>
        );
      })}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => {
        const x = pad + (i / (values.length - 1)) * chartW;
        const y = pad + chartH - (v / maxVal) * chartH;
        return <circle key={i} cx={x} cy={y} r="3" fill={metric === 'ping' ? '#38BDF8' : getSpeedColor(v)} />;
      })}
    </svg>
  );
}

function TimeOfDayChart({ results }: { results: SpeedResult[] }) {
  const buckets: number[][] = Array.from({ length: 24 }, () => []);
  for (const r of results) {
    const hour = new Date(r.created_at).getHours();
    buckets[hour].push(r.download_mbps);
  }
  const avgs = buckets.map(b => b.length > 0 ? b.reduce((s, v) => s + v, 0) / b.length : 0);
  const maxAvg = Math.max(...avgs, 1);
  const bestHour = avgs.indexOf(Math.max(...avgs));

  const width = 700; const height = 180; const pad = 40;
  const chartW = width - pad * 2; const barW = chartW / 24 - 2;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        {avgs.map((avg, i) => {
          const x = pad + (i / 24) * chartW + 1;
          const barH = (avg / maxAvg) * (height - pad * 2);
          const y = height - pad - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={2} fill={getSpeedColor(avg)} opacity={avg > 0 ? 0.7 : 0.1} />
              {i % 4 === 0 && (
                <text x={x + barW / 2} y={height - pad + 14} fill="#3A5570" fontSize="8" fontFamily="'Space Mono', monospace" textAnchor="middle">
                  {i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i - 12}p`}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {avgs[bestHour] > 0 && (
        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          🎯 Your best speeds are typically around <strong style={{ color: 'var(--accent-signal)' }}>
            {bestHour === 0 ? '12 AM' : bestHour < 12 ? `${bestHour} AM` : bestHour === 12 ? '12 PM' : `${bestHour - 12} PM`}
          </strong>
        </p>
      )}
    </div>
  );
}

// Sign-in screen
function SignInView({ onSignIn }: { onSignIn: (email: string) => Promise<{ error: unknown }> }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: err } = await onSignIn(email);
    setLoading(false);
    if (err) setError(String(err));
    else setSent(true);
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✉️</div>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Check Your Email
        </h2>
        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
          We sent a magic link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Click it to access your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '2rem', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Your Speed Dashboard
      </h1>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px', fontWeight: 300 }}>
        Track your internet performance over time
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            padding: '14px 16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.95rem',
            outline: 'none',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-signal)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px',
            background: 'var(--accent-signal)',
            color: '#080C10',
            border: 'none',
            borderRadius: '8px',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'SENDING...' : 'Send Magic Link'}
        </button>
        {error && <p style={{ color: 'var(--accent-danger)', fontFamily: "'Sora', sans-serif", fontSize: '0.8rem' }}>{error}</p>}
      </form>

      <ul style={{
        listStyle: 'none',
        padding: 0,
        textAlign: 'left',
        fontFamily: "'Sora', sans-serif",
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {[
          'Speed history with trend charts',
          'Best and worst times of day for your connection',
          'How your speeds compare to neighbors in your area',
          { text: 'Alerts when your speeds drop significantly', soon: true },
          'ISP performance report for your specific location',
        ].map((item, i) => {
          const isObj = typeof item === 'object';
          return (
            <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent-signal)', flexShrink: 0 }}>✓</span>
              <span>
                {isObj ? item.text : item}
                {isObj && item.soon && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-warn)', marginLeft: '6px', fontWeight: 600 }}>COMING SOON</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Full dashboard view
function DashboardView({ userEmail, onSignOut }: { userEmail: string; onSignOut: () => void }) {
  const [results, setResults] = useState<SpeedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState<'download' | 'upload' | 'ping'>('download');
  const [carrierStats, setCarrierStats] = useState<CarrierStats[]>([]);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('speed_results')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      setResults(data ?? []);

      const { data: cs } = await supabase
        .from('carrier_stats')
        .select('*')
        .order('avg_download', { ascending: false });
      setCarrierStats(cs ?? []);

      setLoading(false);
    };
    void fetch();
  }, [userEmail]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-ghost)', letterSpacing: '0.1em' }}>LOADING YOUR DATA...</span>
      </div>
    );
  }

  const totalTests = results.length;
  const bestDownload = totalTests > 0 ? Math.max(...results.map(r => r.download_mbps)) : 0;
  const thisMonth = results.filter(r => {
    const d = new Date(r.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthAvg = thisMonth.length > 0 ? thisMonth.reduce((s, r) => s + r.download_mbps, 0) / thisMonth.length : 0;
  const lastMonth = results.filter(r => {
    const d = new Date(r.created_at);
    const now = new Date();
    const lm = new Date(now.getFullYear(), now.getMonth() - 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const lastMonthAvg = lastMonth.length > 0 ? lastMonth.reduce((s, r) => s + r.download_mbps, 0) / lastMonth.length : 0;
  const trend = monthAvg > 0 && lastMonthAvg > 0 ? monthAvg - lastMonthAvg : 0;

  // User's primary town and carrier
  const userTown = results[0]?.town ?? null;
  const userCarrier = results[0]?.carrier ?? null;
  const userAvg = totalTests > 0 ? results.reduce((s, r) => s + r.download_mbps, 0) / totalTests : 0;

  // Town average
  const townResults = results.filter(r => r.town === userTown && userTown);
  const townAvg = townResults.length > 0 ? townResults.reduce((s, r) => s + r.download_mbps, 0) / townResults.length : 0;

  // Carrier average (from carrier_stats)
  const carrierStat = carrierStats.find(c => c.carrier === userCarrier);
  const carrierAvg = carrierStat?.avg_download ?? 0;

  // Recommendations
  const recommendations: string[] = [];
  if (userAvg > 0) {
    if (userAvg < 25) {
      const starlink = carrierStats.find(c => c.carrier === 'Starlink');
      if (starlink) recommendations.push(`Your speeds are consistently below 25 Mbps. You may be a good candidate for Starlink — Valley users on it are averaging ${starlink.avg_download} Mbps.`);
      else recommendations.push('Your speeds are below 25 Mbps. Consider checking Starlink availability at your location for potentially faster speeds.');
    }
    if (trend < -10) recommendations.push('Your speeds have dropped noticeably this month. This could indicate network congestion or throttling from your ISP.');
    if (userAvg >= 100 && userTown) recommendations.push(`Your connection is excellent! You're one of the fastest in ${userTown}.`);
  }

  const displayResults = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(results.length / PAGE_SIZE);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1.8rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
          Your Dashboard
        </h1>
        <button
          onClick={onSignOut}
          style={{
            fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: 'var(--text-ghost)',
            background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px',
            padding: '6px 14px', cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>

      {totalTests === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            No tests linked to your account yet. Run a speed test and enter your email to start tracking.
          </p>
          <Link to="/" style={{ fontFamily: "'Sora', sans-serif", color: 'var(--accent-signal)', textDecoration: 'none' }}>
            Run a test →
          </Link>
        </div>
      ) : (
        <>
          {/* Section 1: Overview */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
            {[
              { label: 'Total Tests', value: String(totalTests), color: 'var(--text-primary)' },
              { label: 'Best Download', value: `${bestDownload.toFixed(0)}`, color: getSpeedColor(bestDownload) },
              { label: 'This Month Avg', value: monthAvg > 0 ? `${monthAvg.toFixed(0)}` : '—', color: monthAvg > 0 ? getSpeedColor(monthAvg) : 'var(--text-ghost)' },
              { label: 'Trend', value: trend > 0 ? `↑ +${trend.toFixed(0)}` : trend < 0 ? `↓ ${trend.toFixed(0)}` : '—', color: trend > 0 ? '#00FFB2' : trend < 0 ? '#FF4444' : 'var(--text-ghost)' },
            ].map(s => (
              <div key={s.label} style={{
                flex: '1 1 140px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: '10px', padding: '20px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.6rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Section 2: Speed History */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Speed History
              </h2>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['download', 'upload', 'ping'] as const).map(m => (
                  <button key={m} onClick={() => setChartMetric(m)} style={{
                    fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', fontWeight: chartMetric === m ? 600 : 400,
                    color: chartMetric === m ? 'var(--accent-signal)' : 'var(--text-ghost)',
                    background: 'transparent', border: 'none', padding: '4px 10px', cursor: 'pointer',
                    borderBottom: chartMetric === m ? '2px solid var(--accent-signal)' : '2px solid transparent',
                  }}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
              <HistoryChart results={results} metric={chartMetric} />
            </div>
          </div>

          {/* Section 3: Time of Day */}
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Time of Day Analysis
            </h2>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
              <TimeOfDayChart results={results} />
            </div>
          </div>

          {/* Section 4: Neighborhood Comparison */}
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
              How You Compare
            </h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Your Average', value: userAvg, maxVal: Math.max(userAvg, townAvg, carrierAvg, 1) },
                { label: userTown ? `${userTown} Avg` : 'Town Avg', value: townAvg, maxVal: Math.max(userAvg, townAvg, carrierAvg, 1) },
                { label: userCarrier ? `${formatCarrierShort(userCarrier)} Valley Avg` : 'Carrier Avg', value: carrierAvg, maxVal: Math.max(userAvg, townAvg, carrierAvg, 1) },
              ].map(bar => (
                <div key={bar.label} style={{
                  flex: '1 1 180px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: '10px', padding: '16px',
                }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{bar.label}</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.4rem', fontWeight: 700, color: getSpeedColor(bar.value), marginBottom: '8px' }}>
                    {bar.value > 0 ? `${bar.value.toFixed(0)} Mbps` : '—'}
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: bar.value > 0 ? `${(bar.value / bar.maxVal) * 100}%` : '0%', background: getSpeedColor(bar.value), borderRadius: '3px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Test History */}
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Test History
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr 1fr 0.8fr', gap: '4px', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '8px 8px 0 0', minWidth: '500px' }}>
                {['Date', '↓ Down', '↑ Up', 'Ping', 'Carrier', 'Town'].map(h => (
                  <span key={h} style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'var(--text-ghost)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>
              {displayResults.map(r => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr 1fr 0.8fr', gap: '4px', padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', minWidth: '500px' }}>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: getSpeedColor(r.download_mbps) }}>{r.download_mbps.toFixed(0)}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.upload_mbps.toFixed(0)}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: 'var(--accent-sky)' }}>{r.ping_ms}</span>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.carrier ? formatCarrierShort(r.carrier) : '—'}</span>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', color: 'var(--text-ghost)' }}>{r.town ?? '—'}</span>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '4px 12px', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.3 : 1 }}>Prev</button>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-ghost)', padding: '4px 8px' }}>{page + 1}/{totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '4px 12px', cursor: page >= totalPages - 1 ? 'default' : 'pointer', opacity: page >= totalPages - 1 ? 0.3 : 1 }}>Next</button>
              </div>
            )}
          </div>

          {/* Section 6: Recommendations */}
          {recommendations.length > 0 && (
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Recommendations
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recommendations.map((rec, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px 20px',
                    fontFamily: "'Sora', sans-serif", fontSize: '0.85rem', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.6,
                  }}>
                    💡 {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { user, loading, signIn, signOut } = useAuth();

  return (
    <div style={{ background: 'var(--bg-void)', minHeight: '60vh' }}>
      <SEOHead
        title="My Speed Dashboard | Shenandoah Valley Speed Test"
        description="Track your internet speed performance over time. See trends, compare with neighbors, and get recommendations."
        canonical={generateCanonicalUrl('/dashboard')}
        noIndex={true}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: 'var(--text-ghost)', letterSpacing: '0.1em' }}>LOADING...</span>
        </div>
      ) : user ? (
        <DashboardView userEmail={user.email ?? ''} onSignOut={signOut} />
      ) : (
        <SignInView onSignIn={signIn} />
      )}
    </div>
  );
}
