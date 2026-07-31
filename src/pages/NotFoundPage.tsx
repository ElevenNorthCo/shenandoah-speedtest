import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { generateCanonicalUrl } from '../lib/seo';

export function NotFoundPage() {
  return (
    <section style={{
      minHeight: '65vh',
      display: 'grid',
      placeItems: 'center',
      padding: '64px 24px',
      background: 'var(--bg-void)',
      textAlign: 'center',
    }}>
      <SEOHead
        title="Page Not Found | Shenandoah Valley Speed Test"
        description="The requested page could not be found. Run a free internet speed test or browse Shenandoah Valley community results."
        canonical={generateCanonicalUrl('/404')}
        noIndex={true}
      />

      <div style={{ maxWidth: '620px' }}>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.75rem',
          color: 'var(--accent-signal)',
          letterSpacing: '0.16em',
          marginBottom: '14px',
        }}>
          ERROR 404
        </p>
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          marginBottom: '18px',
        }}>
          This signal went off the map.
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          marginBottom: '30px',
        }}>
          The page may have moved, or the address may be incorrect. Head back to the speed test or browse community results.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/" style={{
            padding: '12px 24px',
            borderRadius: '6px',
            background: 'var(--accent-signal)',
            color: '#080C10',
            textDecoration: 'none',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
          }}>
            Run Speed Test
          </Link>
          <Link to="/towns" style={{
            padding: '12px 24px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
          }}>
            Browse Towns
          </Link>
        </div>
      </div>
    </section>
  );
}
