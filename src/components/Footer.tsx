import { Link } from 'react-router-dom';

export function Footer() {
  const linkStyle: React.CSSProperties = {
    fontFamily: "'Sora', sans-serif",
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
  };

  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Top row: brand + nav columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '32px',
          marginBottom: '40px',
        }}>
          {/* Brand */}
          <div>
            <h3 style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-primary)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Shenandoah Valley Speed Test
            </h3>
            <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Free community internet tool for the Valley.
            </p>
          </div>

          {/* Tools */}
          <div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'var(--text-ghost)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Tools
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/" style={linkStyle}>Run Speed Test</Link>
              <Link to="/towns" style={linkStyle}>Browse Towns</Link>
              <Link to="/dashboard" style={linkStyle}>My Dashboard</Link>
            </div>
          </div>

          {/* Guides */}
          <div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'var(--text-ghost)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Guides
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/blog" style={linkStyle}>All Articles</Link>
              <Link to="/blog/best-internet-providers-shenandoah-valley-2025" style={linkStyle}>Best ISPs in the Valley</Link>
              <Link to="/blog/shentel-vs-starlink-real-speed-comparison" style={linkStyle}>Shentel vs Starlink</Link>
              <Link to="/blog/moving-to-shenandoah-valley-check-internet-speed-first" style={linkStyle}>Home Buyer Guide</Link>
            </div>
          </div>

          {/* About */}
          <div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'var(--text-ghost)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              About
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/about" style={linkStyle}>Why We Built This</Link>
              <a href="https://elevennorth.co" target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, color: 'var(--accent-signal)' }}>
                Eleven North →
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '20px' }} />

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300, fontSize: '0.75rem', color: 'var(--text-ghost)' }}>
            Data is community-submitted. Results may vary.
          </p>
          <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300, fontSize: '0.75rem', color: 'var(--text-ghost)' }}>
            © {new Date().getFullYear()} Eleven North. Free forever.
          </p>
        </div>
      </div>
    </footer>
  );
}
