import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const siteUrl = 'https://www.shenandoahspeedtest.com';
const defaultImage = siteUrl + '/og-image.png';

async function loadTypeScriptModule(relativePath) {
  const source = await readFile(path.join(projectRoot, relativePath), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: relativePath,
  });
  const dataUrl = 'data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64');
  return import(dataUrl);
}

function escapeHtml(value) {
  const chars = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(value).replace(/[&<>"']/g, (char) => chars[char]);
}

function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function canonicalFor(pathname) {
  return pathname === '/' ? siteUrl + '/' : siteUrl + pathname;
}

function stripRouteSeo(html) {
  return html
    .replace(/\s*<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/\s*<meta[^>]+(?:name|property)="(?:description|robots|googlebot|og:[^"]+|twitter:[^"]+|article:[^"]+|geo\.(?:region|placename))"[^>]*>/gi, '')
    .replace(/\s*<link[^>]+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<script[^>]+data-seo-generated="true"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/\s*<style[^>]+data-seo-generated="true"[^>]*>[\s\S]*?<\/style>/gi, '');
}

function buildHead(meta) {
  const robots = meta.noIndex
    ? 'noindex, nofollow, noarchive'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const canonical = canonicalFor(meta.pathname);
  const ogType = meta.ogType || 'website';
  const pieces = [
    '    <title>' + escapeHtml(meta.title) + '</title>',
    '    <meta data-rh="true" name="description" content="' + escapeHtml(meta.description) + '" />',
    '    <meta data-rh="true" name="robots" content="' + robots + '" />',
    '    <meta data-rh="true" name="googlebot" content="' + robots + '" />',
    '    <link data-rh="true" rel="canonical" href="' + canonical + '" />',
    '    <meta data-rh="true" property="og:title" content="' + escapeHtml(meta.title) + '" />',
    '    <meta data-rh="true" property="og:description" content="' + escapeHtml(meta.description) + '" />',
    '    <meta data-rh="true" property="og:url" content="' + canonical + '" />',
    '    <meta data-rh="true" property="og:image" content="' + defaultImage + '" />',
    '    <meta data-rh="true" property="og:image:type" content="image/png" />',
    '    <meta data-rh="true" property="og:image:width" content="1200" />',
    '    <meta data-rh="true" property="og:image:height" content="630" />',
    '    <meta data-rh="true" property="og:image:alt" content="Shenandoah Valley Speed Test preview" />',
    '    <meta data-rh="true" property="og:type" content="' + ogType + '" />',
    '    <meta data-rh="true" property="og:site_name" content="Shenandoah Valley Speed Test" />',
    '    <meta data-rh="true" property="og:locale" content="en_US" />',
    '    <meta data-rh="true" name="twitter:card" content="summary_large_image" />',
    '    <meta data-rh="true" name="twitter:title" content="' + escapeHtml(meta.title) + '" />',
    '    <meta data-rh="true" name="twitter:description" content="' + escapeHtml(meta.description) + '" />',
    '    <meta data-rh="true" name="twitter:image" content="' + defaultImage + '" />',
    '    <meta data-rh="true" name="twitter:image:alt" content="Shenandoah Valley Speed Test preview" />',
  ];

  if (meta.geoRegion) {
    pieces.push('    <meta data-rh="true" name="geo.region" content="' + escapeHtml(meta.geoRegion) + '" />');
  }
  if (ogType === 'article' && meta.publishedTime) {
    pieces.push('    <meta data-rh="true" property="article:published_time" content="' + escapeHtml(meta.publishedTime) + '" />');
  }
  for (const item of meta.structuredData || []) {
    pieces.push('    <script data-rh="true" data-seo-generated="true" type="application/ld+json">' + jsonLd(item) + '</script>');
  }
  pieces.push(
    '    <style data-seo-generated="true">' +
      '.seo-static-shell{min-height:100vh;background:#080c10;color:#e8f0f7;font-family:system-ui,-apple-system,sans-serif}' +
      '.seo-static-shell header,.seo-static-shell main,.seo-static-shell footer{max-width:1040px;margin:0 auto;padding:24px}' +
      '.seo-static-shell header{display:flex;justify-content:space-between;gap:20px;align-items:center;border-bottom:1px solid #1a2d40}' +
      '.seo-static-shell nav{display:flex;gap:14px;flex-wrap:wrap}.seo-static-shell a{color:#00ffb2}' +
      '.seo-static-shell h1{font-size:clamp(2rem,6vw,3.6rem);line-height:1.1;margin:36px 0 18px}' +
      '.seo-static-shell h2{font-size:1.5rem;margin:34px 0 12px}.seo-static-shell h3{font-size:1.1rem;margin:24px 0 8px}' +
      '.seo-static-shell p,.seo-static-shell li{color:#a7bdd0;line-height:1.75}.seo-static-shell ul{padding-left:22px}' +
      '.seo-static-shell .link-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:18px 0}' +
      '.seo-static-shell .card{border:1px solid #1a2d40;border-radius:10px;padding:18px;background:#0f1923}' +
      '.seo-static-shell details{border:1px solid #1a2d40;border-radius:8px;padding:14px;margin:10px 0;background:#0f1923}' +
      '.seo-static-shell footer{border-top:1px solid #1a2d40;margin-top:42px;font-size:.85rem}' +
      '@media(max-width:700px){.seo-static-shell header{align-items:flex-start;flex-direction:column}}' +
    '</style>',
  );
  return pieces.join('\n');
}

function shell(body) {
  return [
    '<div class="seo-static-shell">',
    '<header>',
    '<a href="/" aria-label="Shenandoah Valley Speed Test home"><strong>Shenandoah Valley Speed Test</strong></a>',
    '<nav aria-label="Primary navigation">',
    '<a href="/">Speed Test</a>',
    '<a href="/towns">Towns</a>',
    '<a href="/blog">Broadband Guides</a>',
    '<a href="/about">About</a>',
    '</nav>',
    '</header>',
    '<main>',
    body,
    '</main>',
    '<footer><p>Free community internet speed testing for the Shenandoah Valley. Built by <a href="https://elevennorth.co/">Eleven North</a>.</p></footer>',
    '</div>',
  ].join('');
}

function renderPage(template, meta, body) {
  const withoutSeo = stripRouteSeo(template);
  const withHead = withoutSeo.replace('</head>', buildHead(meta) + '\n  </head>');
  return withHead.replace('<div id="root"></div>', '<div id="root">' + shell(body) + '</div>');
}

function routeTarget(pathname) {
  if (pathname === '/') return path.join(distDir, 'index.html');
  return path.join(distDir, pathname.slice(1) + '.html');
}

async function writeRoute(template, route) {
  const target = routeTarget(route.pathname);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, renderPage(template, route, route.body), 'utf8');
}

function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalFor(item.pathname),
    })),
  };
}

function townFaqs(town, nearby) {
  return [
    {
      question: 'How can I compare internet providers in ' + town.town + '?',
      answer: 'Use the community-submitted results on this page to compare download speed, upload speed, ping, and provider performance in ' + town.town + '. Availability can vary by individual address.',
    },
    {
      question: 'How often do internet speed results for ' + town.town + ' update?',
      answer: 'Results update as residents submit new tests. Run tests at different times of day to help build a more representative picture of internet performance in ' + town.town + '.',
    },
    {
      question: 'Can I add my own speed test result for ' + town.town + '?',
      answer: 'Yes. Run the free speed test from the home page and submit the result to help neighbors compare real-world internet service in ' + town.town + '.',
    },
    {
      question: 'How does ' + town.town + ' compare with nearby communities?',
      answer: nearby.length
        ? town.town + ' is grouped with nearby communities including ' + nearby.slice(0, 3).join(', ') + '. Open each community page to compare submitted results.'
        : 'Use the towns directory to compare ' + town.town + ' with other Shenandoah Valley communities.',
    },
  ];
}

function townStructuredData(town, slug, nearby) {
  const pathname = '/towns/' + slug;
  const faqs = townFaqs(town, nearby);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': canonicalFor(pathname) + '#webpage',
      url: canonicalFor(pathname),
      name: town.town + ' Internet Speed Test',
      description: 'Test internet speed in ' + town.town + ', ' + town.region + ', compare community-submitted results, and explore local provider performance.',
      inLanguage: 'en-US',
      about: {
        '@type': 'Place',
        name: town.town + ', ' + town.region,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: town.lat,
          longitude: town.lng,
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    breadcrumbs([
      { name: 'Home', pathname: '/' },
      { name: 'Towns', pathname: '/towns' },
      { name: town.town, pathname },
    ]),
  ];
}

function articleStructuredData(post) {
  const pathname = '/blog/' + post.slug;
  return [
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
      image: defaultImage,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalFor(pathname),
      },
      url: canonicalFor(pathname),
      inLanguage: 'en-US',
    },
    breadcrumbs([
      { name: 'Home', pathname: '/' },
      { name: 'Blog', pathname: '/blog' },
      { name: post.title, pathname },
    ]),
  ];
}

function renderBlogSections(sections) {
  return sections.map((section) => {
    if (section.type === 'h2') return '<h2>' + escapeHtml(section.text || '') + '</h2>';
    if (section.type === 'h3') return '<h3>' + escapeHtml(section.text || '') + '</h3>';
    if (section.type === 'p') return '<p>' + escapeHtml(section.text || '') + '</p>';
    if (section.type === 'callout') return '<aside class="card"><p>' + escapeHtml(section.text || '') + '</p></aside>';
    if (section.type === 'ul') {
      return '<ul>' + (section.items || []).map((item) => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>';
    }
    return '';
  }).join('');
}

const [geocodeModule, blogModule, seoModule] = await Promise.all([
  loadTypeScriptModule('src/lib/geocode.ts'),
  loadTypeScriptModule('src/lib/blog.ts'),
  loadTypeScriptModule('src/lib/seo.ts'),
]);

const towns = geocodeModule.VALLEY_TOWNS;
const townToSlug = geocodeModule.townToSlug;
const parentAreas = geocodeModule.PARENT_AREAS;
const posts = blogModule.BLOG_POSTS;
const homeFaqs = seoModule.HOME_FAQS;
const template = await readFile(path.join(distDir, 'index.html'), 'utf8');

const popularTowns = ['Harrisonburg', 'Winchester', 'Front Royal', 'Luray', 'Woodstock', 'Broadway', 'Staunton', 'Waynesboro'];
const popularTownLinks = popularTowns
  .map((name) => towns.find((town) => town.town === name))
  .filter(Boolean)
  .map((town) => '<a class="card" href="/towns/' + townToSlug(town.town, town.region) + '">' + escapeHtml(town.town) + ' internet speeds</a>')
  .join('');
const homeFaqMarkup = homeFaqs.map((faq) => (
  '<details><summary><strong>' + escapeHtml(faq.question) + '</strong></summary><p>' + escapeHtml(faq.answer) + '</p></details>'
)).join('');

const routes = [
  {
    pathname: '/',
    title: 'Shenandoah Valley Internet Speed Test | Free Community Tool',
    description: 'Test your internet speed in the Shenandoah Valley, VA. Compare real community results and local providers including Shentel, Starlink, and T-Mobile.',
    geoRegion: 'US-VA',
    structuredData: seoModule.generateHomeStructuredData(),
    body: [
      '<h1>Shenandoah Valley Internet Speed Test</h1>',
      '<p>Run a free download, upload, and ping test, then compare your connection with community-submitted results from across the Shenandoah Valley.</p>',
      '<p><a class="card" href="/">Run the free speed test</a></p>',
      '<h2>Compare internet speeds by community</h2>',
      '<div class="link-grid">', popularTownLinks, '</div>',
      '<p><a href="/towns">Browse all Shenandoah Valley communities</a></p>',
      '<h2>Broadband guides</h2>',
      '<div class="link-grid">',
      posts.map((post) => '<a class="card" href="/blog/' + post.slug + '">' + escapeHtml(post.title) + '</a>').join(''),
      '</div>',
      '<h2>Frequently asked questions</h2>',
      homeFaqMarkup,
    ].join(''),
  },
  {
    pathname: '/about',
    title: 'About | Shenandoah Valley Speed Test',
    description: 'Why we built a free internet speed test for the Shenandoah Valley and why real local broadband data matters for residents and home buyers.',
    geoRegion: 'US-VA',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        '@id': canonicalFor('/about') + '#webpage',
        url: canonicalFor('/about'),
        name: 'About Shenandoah Valley Speed Test',
        description: 'The story, methodology, privacy approach, and community purpose behind the Shenandoah Valley Speed Test.',
        inLanguage: 'en-US',
      },
      breadcrumbs([
        { name: 'Home', pathname: '/' },
        { name: 'About', pathname: '/about' },
      ]),
    ],
    body: [
      '<h1>Why We Built the Shenandoah Valley Speed Test</h1>',
      '<p>ISP availability claims do not always match what residents can actually order or use at a rural address. This free tool helps the Valley compare real results from real connections.</p>',
      '<h2>What the tool measures</h2>',
      '<p>Each test measures ping, download speed, and upload speed. Community submissions help residents compare providers, research a home before buying, and document local broadband gaps.</p>',
      '<h2>Privacy and community data</h2>',
      '<p>The public experience focuses on a chosen username, provider, approximate community, and speed result. Exact street addresses are not published.</p>',
      '<p><a href="/">Run a speed test</a> or <a href="/towns">browse community results</a>.</p>',
    ].join(''),
  },
  {
    pathname: '/towns',
    title: 'Internet Speeds by Town | Shenandoah Valley Speed Test',
    description: 'Compare community-submitted internet speeds across Harrisonburg, Winchester, Luray, Broadway, Woodstock, and 150+ Shenandoah Valley communities.',
    geoRegion: 'US-VA',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': canonicalFor('/towns') + '#webpage',
        url: canonicalFor('/towns'),
        name: 'Shenandoah Valley Internet Speeds by Town',
        description: 'A directory of community internet speed test pages across Virginia and West Virginia communities in the Shenandoah Valley region.',
        inLanguage: 'en-US',
      },
      breadcrumbs([
        { name: 'Home', pathname: '/' },
        { name: 'Towns', pathname: '/towns' },
      ]),
    ],
    body: [
      '<h1>Internet Speeds Across the Shenandoah Valley</h1>',
      '<p>Browse community pages to compare real-world download speed, upload speed, ping, and internet provider performance.</p>',
      Object.keys(parentAreas).sort().map((area) => (
        '<section><h2>' + escapeHtml(area) + '</h2><div class="link-grid">' +
        parentAreas[area].map((name) => {
          const town = towns.find((candidate) => candidate.town === name && candidate.parentArea === area);
          return '<a class="card" href="/towns/' + townToSlug(name, town?.region) + '">' + escapeHtml(name) + ' internet speed test</a>';
        }).join('') +
        '</div></section>'
      )).join(''),
    ].join(''),
  },
  {
    pathname: '/blog',
    title: 'Broadband Blog | Shenandoah Valley Speed Test',
    description: 'Shenandoah Valley broadband guides covering rural internet, ISP comparisons, community speed data, and connectivity checks for home buyers.',
    geoRegion: 'US-VA',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': canonicalFor('/blog') + '#webpage',
        url: canonicalFor('/blog'),
        name: 'Shenandoah Valley Broadband Guides',
        description: 'Guides and community reporting about internet providers and rural broadband in the Shenandoah Valley.',
        inLanguage: 'en-US',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: canonicalFor('/blog/' + post.slug),
            name: post.title,
          })),
        },
      },
      breadcrumbs([
        { name: 'Home', pathname: '/' },
        { name: 'Blog', pathname: '/blog' },
      ]),
    ],
    body: [
      '<h1>Shenandoah Valley Broadband Guides</h1>',
      '<p>Real data and practical guidance about internet access, providers, and home connectivity across the Valley.</p>',
      '<div class="link-grid">',
      posts.map((post) => (
        '<article class="card"><h2><a href="/blog/' + post.slug + '">' + escapeHtml(post.title) + '</a></h2><p>' +
        escapeHtml(post.description) + '</p></article>'
      )).join(''),
      '</div>',
    ].join(''),
  },
];

for (const post of posts) {
  const pathname = '/blog/' + post.slug;
  routes.push({
    pathname,
    title: post.title,
    description: post.description,
    ogType: 'article',
    publishedTime: post.date,
    geoRegion: 'US-VA',
    structuredData: articleStructuredData(post),
    body: [
      '<article>',
      '<p><a href="/blog">Back to all broadband guides</a></p>',
      '<h1>', escapeHtml(post.title), '</h1>',
      '<p><strong>', escapeHtml(post.category), '</strong> · ', escapeHtml(post.date), ' · ', escapeHtml(post.readTime), '</p>',
      '<p>', escapeHtml(post.description), '</p>',
      renderBlogSections(post.content),
      '</article>',
    ].join(''),
  });
}

for (const town of towns) {
  const slug = townToSlug(town.town, town.region);
  const pathname = '/towns/' + slug;
  const nearby = town.parentArea
    ? (parentAreas[town.parentArea] || []).filter((name) => name !== town.town)
    : [];
  const faqs = townFaqs(town, nearby);
  routes.push({
    pathname,
    title: town.town + ', ' + town.region + ' Internet Speed Test',
    description: 'Test your internet speed in ' + town.town + ', ' + town.region + '. View community results, compare local providers, and explore nearby Shenandoah Valley communities.',
    geoRegion: town.region === 'WV' ? 'US-WV' : 'US-VA',
    structuredData: townStructuredData(town, slug, nearby),
    body: [
      '<article>',
      '<p><a href="/towns">Back to all communities</a></p>',
      '<h1>Internet Speeds in ', escapeHtml(town.town), ', ', escapeHtml(town.region), '</h1>',
      '<p>Run a free internet speed test for ', escapeHtml(town.town), ' and compare community-submitted download speed, upload speed, ping, and provider results.</p>',
      town.parentArea ? '<p>' + escapeHtml(town.town) + ' is listed in the ' + escapeHtml(town.parentArea) + ' community group.</p>' : '',
      '<h2>Compare nearby community speeds</h2>',
      '<div class="link-grid">',
      nearby.slice(0, 8).map((name) => {
        const nearbyTown = towns.find((candidate) => candidate.town === name && candidate.parentArea === town.parentArea);
        return '<a class="card" href="/towns/' + townToSlug(name, nearbyTown?.region) + '">' + escapeHtml(name) + ' internet speeds</a>';
      }).join(''),
      '</div>',
      '<p><a href="/">Run your speed test and contribute a result for ', escapeHtml(town.town), '</a>.</p>',
      '<h2>', escapeHtml(town.town), ' internet speed FAQ</h2>',
      faqs.map((faq) => (
        '<details><summary><strong>' + escapeHtml(faq.question) + '</strong></summary><p>' + escapeHtml(faq.answer) + '</p></details>'
      )).join(''),
      '</article>',
    ].join(''),
  });
}

const privateRoutes = [
  {
    pathname: '/dashboard',
    title: 'My Speed Dashboard | Shenandoah Valley Speed Test',
    description: 'Sign in to review your personal internet speed history and trends.',
    noIndex: true,
    structuredData: [],
    body: '<h1>My Internet Speed Dashboard</h1><p>Sign in to review your private speed test history, trends, and community comparisons.</p><p><a href="/">Return to the speed test</a>.</p>',
  },
  {
    pathname: '/404',
    title: 'Page Not Found | Shenandoah Valley Speed Test',
    description: 'The requested page could not be found. Run a free internet speed test or browse Shenandoah Valley community results.',
    noIndex: true,
    structuredData: [],
    body: '<p>ERROR 404</p><h1>This signal went off the map.</h1><p>The requested page could not be found.</p><p><a href="/">Run a speed test</a> or <a href="/towns">browse towns</a>.</p>',
  },
];

const routePaths = new Set();
for (const route of routes.concat(privateRoutes)) {
  if (routePaths.has(route.pathname)) {
    throw new Error('Duplicate generated route: ' + route.pathname);
  }
  routePaths.add(route.pathname);
  await writeRoute(template, route);
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  routes.map((route) => '  <url><loc>' + canonicalFor(route.pathname) + '</loc></url>').join('\n'),
  '</urlset>',
  '',
].join('\n');
await writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');

console.log('SEO generation complete: ' + routes.length + ' indexable pages, ' + privateRoutes.length + ' noindex pages, and sitemap.xml.');
