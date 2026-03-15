export function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'var(--text-primary)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          Shenandoah Valley Speed Test
        </h3>

        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 300,
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
        }}>
          A free community service for the Valley
        </p>

        <div style={{ width: '40px', height: '1px', background: 'var(--border-subtle)', margin: '4px auto' }} />

        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}>
          Built &amp; maintained by{' '}
          <a
            href="https://elevennorth.co"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--accent-signal)',
              textDecoration: 'none',
            }}
          >
            ELEVEN NORTH
          </a>
        </p>

        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 300,
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
        }}>
          Digital Studio · Shenandoah Valley, VA
        </p>

        <a
          href="https://elevennorth.co"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.85rem',
            color: 'var(--accent-signal)',
            textDecoration: 'none',
          }}
        >
          elevennorth.co →
        </a>

        <div style={{ width: '40px', height: '1px', background: 'var(--border-subtle)', margin: '4px auto' }} />

        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 300,
          fontSize: '0.75rem',
          color: 'var(--text-ghost)',
        }}>
          Data is community-submitted. Results may vary.
        </p>

        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 300,
          fontSize: '0.75rem',
          color: 'var(--text-ghost)',
        }}>
          © {new Date().getFullYear()} Eleven North. Free forever.
        </p>
      </div>
    </footer>
  );
}
