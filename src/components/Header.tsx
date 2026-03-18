import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinkStyle = (path: string): React.CSSProperties => ({
    fontFamily: "'Sora', sans-serif",
    fontSize: '0.85rem',
    fontWeight: isActive(path) ? 600 : 400,
    color: isActive(path) ? 'var(--accent-signal)' : 'var(--text-secondary)',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const,
  });

  const navLinks = (
    <>
      <Link
        to="/"
        style={navLinkStyle('/')}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = isActive('/') ? 'var(--accent-signal)' : 'var(--text-secondary)')}
        onClick={() => setMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        to="/towns"
        style={navLinkStyle('/towns')}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = isActive('/towns') ? 'var(--accent-signal)' : 'var(--text-secondary)')}
        onClick={() => setMenuOpen(false)}
      >
        Towns
      </Link>
      <Link
        to="/about"
        style={navLinkStyle('/about')}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = isActive('/about') ? 'var(--accent-signal)' : 'var(--text-secondary)')}
        onClick={() => setMenuOpen(false)}
      >
        About
      </Link>
      {user && (
        <Link
          to="/dashboard"
          style={navLinkStyle('/dashboard')}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = isActive('/dashboard') ? 'var(--accent-signal)' : 'var(--text-secondary)')}
          onClick={() => setMenuOpen(false)}
        >
          Dashboard
        </Link>
      )}
    </>
  );

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
        {/* Left: Brand */}
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
          }}
        >
          <span
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: '1.2rem',
              color: 'var(--accent-signal)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              lineHeight: 1.1,
            }}
          >
            Shenandoah Valley Speed Test
          </span>
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 300,
              fontSize: '0.6rem',
              color: 'var(--text-ghost)',
              letterSpacing: '0.03em',
            }}
          >
            by{' '}
            <a
              href="https://elevennorth.co"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-ghost)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-ghost)')}
              onClick={e => e.stopPropagation()}
            >
              Eleven North
            </a>
          </span>
        </Link>

        {/* Center: Nav Links (desktop) */}
        <nav
          className="header-nav-desktop"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {navLinks}
        </nav>

        {/* Right: subtle credits (desktop) */}
        <div className="header-credits-desktop" style={{ display: 'flex', alignItems: 'center' }}>
          <a
            href="https://elevennorth.co"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '0.7rem',
              fontWeight: 300,
              color: 'var(--text-ghost)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-ghost)')}
          >
            Built by Eleven North
          </a>
        </div>

        {/* Hamburger button (mobile) */}
        <button
          className="header-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--text-secondary)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav
          className="header-nav-mobile"
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: '4px',
            padding: '8px 24px 16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {navLinks}
        </nav>
      )}

      <style>{`
        @media (max-width: 768px) {
          .header-nav-desktop { display: none !important; }
          .header-credits-desktop { display: none !important; }
          .header-hamburger { display: block !important; }
          .header-nav-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
