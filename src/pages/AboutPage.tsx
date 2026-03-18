import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { generateCanonicalUrl } from '../lib/seo';

export function AboutPage() {
  return (
    <div style={{ background: 'var(--bg-void)' }}>
      <SEOHead
        title="About | Shenandoah Valley Speed Test"
        description="Why we built a free internet speed test for the Shenandoah Valley — and why real local data matters more than ISP coverage maps."
        canonical={generateCanonicalUrl('/about')}
      />

      {/* Hero */}
      <section style={{
        padding: '80px 24px 60px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-void) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          color: 'var(--text-primary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '16px',
          lineHeight: 1.1,
        }}>
          Why We <span style={{ color: 'var(--accent-signal)' }}>Built</span> This
        </h1>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '1.1rem',
          fontWeight: 300,
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Because ISP coverage maps are fiction — and the Valley deserves the truth.
        </p>
      </section>

      {/* The Story */}
      <section style={{
        padding: '64px 24px',
        maxWidth: '760px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: '1.5rem',
          color: 'var(--accent-signal)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '24px',
        }}>
          The Story
        </h2>
        <div style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.95rem',
          fontWeight: 300,
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          <p>
            The founder of Eleven North moved to the Shenandoah Valley with a simple expectation:
            working internet. Every ISP website said service was available. The coverage maps were
            green. The marketing materials were promising.
          </p>
          <p style={{ color: 'var(--text-primary)', fontWeight: 400 }}>
            It was all a lie.
          </p>
          <p>
            After moving, not a single provider could actually deliver internet to the address.
            Not Comcast. Not Shentel. Not even DSL. For <strong style={{ color: 'var(--text-primary)' }}>four years</strong>, they
            ran a digital business from a location with no home internet — tethering to a phone,
            driving to coffee shops, and watching ISPs continue to claim service was &ldquo;available.&rdquo;
          </p>
          <p>
            ISP coverage maps are marketing tools, not technical documentation. They report to the FCC
            that an entire census block is served if even one address can receive service.
            For rural areas, that means entire communities are &ldquo;covered&rdquo; on paper
            while having zero actual access.
          </p>
          <p>
            This tool exists because the only honest source of internet data is the people
            actually using it. Your neighbors. Your community. Real results from real connections.
          </p>
        </div>
      </section>

      {/* What This Tool Does — 3 cards */}
      <section style={{
        padding: '64px 24px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: '40px',
          }}>
            What This Tool Does
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                icon: '🏠',
                title: 'For Home Buyers',
                text: 'Check real internet speeds before you commit to a property. See what your potential neighbors are actually getting — not what ISPs claim.',
              },
              {
                icon: '📶',
                title: 'For Current Residents',
                text: "See if your neighbors are getting better speeds on a different provider. Maybe it's time to switch — or to complain loudly.",
              },
              {
                icon: '🏔️',
                title: 'For the Community',
                text: 'Build a real data case for better rural broadband infrastructure. Enough tests from enough people make it impossible for ISPs and legislators to ignore.',
              },
            ].map((card) => (
              <div key={card.title} style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '28px 24px',
                transition: 'border-color 0.2s ease',
              }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>{card.icon}</span>
                <h3 style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: 'var(--accent-signal)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '0.85rem',
                  fontWeight: 300,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}>
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '64px 24px',
        maxWidth: '760px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: '1.5rem',
          color: 'var(--text-primary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '24px',
        }}>
          How It Works
        </h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}>
          {[
            { label: 'Ping', desc: 'We send tiny packets to a nearby server and measure round-trip time. Lower is better — good connections are under 30ms.' },
            { label: 'Download', desc: 'We pull test files from Cloudflare\'s edge network and measure throughput. This is the speed you experience when streaming, browsing, or downloading.' },
            { label: 'Upload', desc: 'We push data to the server and measure the reverse throughput. Important for video calls, uploading files, and working from home.' },
          ].map((step, i) => (
            <div key={step.label} style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
            }}>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.7rem',
                color: 'var(--accent-signal)',
                background: '#00FFB215',
                border: '1px solid #00FFB230',
                borderRadius: '6px',
                padding: '4px 10px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {i + 1}. {step.label}
              </span>
              <p style={{ fontWeight: 300 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Data */}
      <section style={{
        padding: '64px 24px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}>
            Your Privacy &amp; The Data
          </h2>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.9rem',
            fontWeight: 300,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <p><strong style={{ color: 'var(--text-primary)' }}>What we store:</strong> Speed
              test results (download, upload, ping), your chosen username, carrier selection,
              approximate location (nearest community), and optionally your email.</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>What we don&apos;t store:</strong> Your
              IP address, exact GPS coordinates, browsing history, or any personal identifiers
              beyond what you voluntarily provide.</p>
            <p>All data is community-submitted and publicly visible on the leaderboard and map.
              If you provide an email, it&apos;s only used for your personal speed dashboard and
              is never shared or sold.</p>
          </div>
        </div>
      </section>

      {/* Built By */}
      <section style={{
        padding: '48px 24px',
        maxWidth: '760px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.9rem',
          fontWeight: 300,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}>
          Built and maintained by{' '}
          <a
            href="https://elevennorth.co"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-signal)', textDecoration: 'none' }}
          >
            Eleven North
          </a>
          , a digital studio based in the Shenandoah Valley. We build websites, apps,
          and tools for Valley businesses — and sometimes we build things just because
          the community needs them.
        </p>
      </section>

      {/* CTA */}
      <section style={{
        padding: '48px 24px 80px',
        textAlign: 'center',
      }}>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '1.1rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '16px 48px',
            color: '#080C10',
            background: 'var(--accent-signal)',
            textDecoration: 'none',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            boxShadow: '0 0 30px #00FFB230',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 0 50px #00FFB250';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 0 30px #00FFB230';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Run Your Speed Test →
        </Link>
      </section>
    </div>
  );
}
