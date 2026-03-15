export function Header() {
  return (
    <header
      style={{
        background: 'rgba(8, 12, 16, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1A2D40',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Left: Eleven North branding */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <a
            href="https://elevennorth.co"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--accent-signal)',
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            ELEVEN NORTH
          </a>
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 300,
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.05em',
            }}
          >
            Digital Studio · Shenandoah Valley, VA
          </span>
        </div>

        {/* Center: App title (hidden on mobile) */}
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
          }}
          className="hidden-mobile"
        >
          Shenandoah Valley Speed Test
        </div>

        {/* Right: External link */}
        <a
          href="https://elevennorth.co"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--accent-signal)',
            border: '1px solid var(--accent-signal)',
            borderRadius: '999px',
            padding: '6px 16px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap' as const,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = '#00FFB215';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 20px #00FFB230';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
          }}
        >
          elevennorth.co →
        </a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
