import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { DEFAULT_OG_IMAGE, generateCanonicalUrl, SITE_URL } from '../lib/seo';
import { findPostBySlug, type BlogSection } from '../lib/blog';

function renderSection(section: BlogSection, i: number) {
  const bodyFont: React.CSSProperties = {
    fontFamily: "'Sora', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 300,
    color: 'var(--text-secondary)',
    lineHeight: 1.85,
  };

  switch (section.type) {
    case 'h2':
      return (
        <h2 key={i} style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          color: 'var(--text-primary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginTop: '48px',
          marginBottom: '16px',
        }}>
          {section.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={i} style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'var(--accent-signal)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginTop: '32px',
          marginBottom: '10px',
        }}>
          {section.text}
        </h3>
      );
    case 'p':
      return <p key={i} style={{ ...bodyFont, marginBottom: '20px' }}>{section.text}</p>;
    case 'ul':
      return (
        <ul key={i} style={{ ...bodyFont, paddingLeft: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {section.items?.map((item, j) => (
            <li key={j} style={{ paddingLeft: '4px' }}>{item}</li>
          ))}
        </ul>
      );
    case 'callout':
      return (
        <div key={i} style={{
          background: '#00FFB208',
          border: '1px solid #00FFB230',
          borderLeft: '3px solid var(--accent-signal)',
          borderRadius: '8px',
          padding: '20px 24px',
          margin: '32px 0',
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          lineHeight: 1.7,
        }}>
          {section.text}
        </div>
      );
    default:
      return null;
  }
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? findPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--bg-void)', minHeight: '60vh' }}>
        <SEOHead
          title="Article Not Found | Shenandoah Valley Speed Test"
          description="This broadband article could not be found. Browse all Shenandoah Valley internet guides."
          canonical={generateCanonicalUrl('/blog')}
          noIndex={true}
        />
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: '2rem',
          color: 'var(--text-primary)',
          marginBottom: '16px',
        }}>
          Post Not Found
        </h1>
        <Link to="/blog" style={{ fontFamily: "'Sora', sans-serif", color: 'var(--accent-signal)', textDecoration: 'none' }}>
          ← Back to Blog
        </Link>
      </div>
    );
  }

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        '@type': 'Organization',
        '@id': 'https://elevennorth.co/#organization',
        name: 'Eleven North',
        url: 'https://elevennorth.co/',
      },
      publisher: {
        '@type': 'Organization',
        '@id': 'https://elevennorth.co/#organization',
        name: 'Eleven North',
        url: 'https://elevennorth.co/',
      },
      image: DEFAULT_OG_IMAGE,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${post.slug}`,
      },
      url: `${SITE_URL}/blog/${post.slug}`,
      inLanguage: 'en-US',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
      ],
    },
  ];

  return (
    <div style={{ background: 'var(--bg-void)', minHeight: '60vh' }}>
      <SEOHead
        title={post.title}
        description={post.description}
        canonical={generateCanonicalUrl(`/blog/${post.slug}`)}
        ogType="article"
        publishedTime={post.date}
        structuredData={structuredData}
      />

      <article style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Back link */}
        <Link
          to="/blog"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.8rem',
            color: 'var(--text-ghost)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '32px',
          }}
        >
          ← All Articles
        </Link>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
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
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: 'var(--text-ghost)' }}>
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: 'var(--text-ghost)' }}>
            · {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          color: 'var(--text-primary)',
          letterSpacing: '0.03em',
          lineHeight: 1.2,
          marginBottom: '16px',
        }}>
          {post.title}
        </h1>

        {/* Description lede */}
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '1.05rem',
          fontWeight: 300,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          marginBottom: '40px',
          paddingBottom: '32px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          {post.description}
        </p>

        {/* Content */}
        <div>
          {post.content.map((section, i) => renderSection(section, i))}
        </div>

        {/* Footer CTA */}
        <div style={{
          marginTop: '56px',
          paddingTop: '32px',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
          }}>
            See what your neighbors are getting — run a free community speed test.
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
        </div>
      </article>
    </div>
  );
}
