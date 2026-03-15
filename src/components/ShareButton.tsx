interface ShareButtonProps {
  downloadMbps: number;
  carrier: string;
  town: string;
}

export function ShareButton({ downloadMbps, carrier, town }: ShareButtonProps) {
  const townDisplay = town || 'the Valley';
  const carrierDisplay = carrier || 'my ISP';

  const tweetText = encodeURIComponent(
    `Just tested my internet in ${townDisplay}, VA — ${downloadMbps.toFixed(0)} Mbps ↓ on ${carrierDisplay}.\nSee how your area stacks up 👇\nshenandoahspeedtest.com\n#ShenandoahValley #RuralInternet #ElevenNorth`
  );

  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return (
    <a
      href={twitterUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: "'Sora', sans-serif",
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        background: '#1DA1F215',
        border: '1px solid #1DA1F240',
        borderRadius: '8px',
        padding: '10px 20px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
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
      Share My Result
    </a>
  );
}
