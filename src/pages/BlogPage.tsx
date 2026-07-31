import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { generateCanonicalUrl } from '../lib/seo';
import { BLOG_POSTS } from '../lib/blog';

export function BlogPage() {
  return (
    <div style={{ background: 'var(--bg-void)', minHeight: '60vh' }}>
      <SEOHead
        title="Broadband Blog | Shenandoah Valley Speed Test"
        description="Shenandoah Valley broadband guides covering rural internet, ISP comparisons, community speed data, and connectivity checks for home buyers."
        canonical={generateCanonicalUrl('/blog')}
      />

      {/* Hero */}
      <section style={{
        padding: '64px 24px 48px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          color: 'var(--text-primary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          Broadband <span style={{ color: 'var(--accent-signal)' }}>Guides</span>
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '1rem',
          fontWeight: 300,
          color: 'var(--text-secondary)',
          maxWidth: '560px',
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Real data and honest advice about internet in the Shenandoah Valley.
        </p>
      </section>

      {/* Post list */}
      <section style={{ padding: '56px 24px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {BLOG_POSTS.map(post => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <article style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '32px',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-signal)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '0.7rem',
                    color: 'var(--accent-signal)',
                    background: '#00FFB210',
                    border: '1px solid #00FFB220',
                    borderRadius: '999px',
                    padding: '3px 12px',
                  }}>
                    {post.category}
                  </span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.65rem',
                    color: 'var(--text-ghost)',
                  }}>
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.65rem',
                    color: 'var(--text-ghost)',
                  }}>
                    · {post.readTime}
                  </span>
                </div>

                <h2 style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.03em',
                  marginBottom: '10px',
                  lineHeight: 1.3,
                }}>
                  {post.title}
                </h2>

                <p style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 300,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '16px',
                }}>
                  {post.description}
                </p>

                <span style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '0.8rem',
                  color: 'var(--accent-signal)',
                }}>
                  Read more →
                </span>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '40px 24px 72px', textAlign: 'center' }}>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
        }}>
          Want to see real speed data for your community?
        </p>
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
          }}
        >
          Run Your Speed Test →
        </Link>
      </section>
    </div>
  );
}
