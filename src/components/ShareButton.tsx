interface ShareButtonsProps {
  downloadMbps: number;
  carrier: string;
  town: string;
}

export function ShareButtons({ downloadMbps, carrier, town }: ShareButtonsProps) {
  const townDisplay = town || 'the Valley';
  const carrierDisplay = carrier || 'my ISP';

  const shareText = `Just tested my internet in ${townDisplay}, VA — ${downloadMbps.toFixed(0)} Mbps ↓ on ${carrierDisplay}.\nSee how your area stacks up 👇\nshenandoahspeedtest.com\n#ShenandoahValley #RuralInternet #ElevenNorth`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://shenandoahspeedtest.com')}&quote=${encodeURIComponent(shareText)}`;

  const buttonBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Sora', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    borderRadius: '8px',
    padding: '10px 20px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {/* X / Twitter */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...buttonBase,
          background: '#1DA1F215',
          border: '1px solid #1DA1F240',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = '#1DA1F225';
          (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1DA1F280';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = '#1DA1F215';
          (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1DA1F240';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DA1F2">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Share on X
      </a>

      {/* Facebook */}
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...buttonBase,
          background: '#1877F215',
          border: '1px solid #1877F240',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = '#1877F225';
          (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1877F280';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = '#1877F215';
          (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1877F240';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Share on Facebook
      </a>
    </div>
  );
}

// Keep backward-compatible export
export { ShareButtons as ShareButton };
