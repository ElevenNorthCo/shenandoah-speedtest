import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const siteUrl = 'https://www.shenandoahspeedtest.com';
const errors = [];

function matches(html, pattern) {
  return [...html.matchAll(pattern)];
}

function routeFile(url) {
  const pathname = new URL(url).pathname;
  return pathname === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, pathname.slice(1) + '.html');
}

function contentOf(match) {
  return match ? match[1].trim() : '';
}

const sitemap = await readFile(path.join(distDir, 'sitemap.xml'), 'utf8');
const sitemapUrls = matches(sitemap, /<loc>([^<]+)<\/loc>/g).map((match) => match[1]);
const uniqueUrls = new Set(sitemapUrls);

if (sitemapUrls.length !== uniqueUrls.size) {
  errors.push('sitemap.xml contains duplicate URLs');
}
if (sitemapUrls.length < 100) {
  errors.push('sitemap.xml unexpectedly contains fewer than 100 public routes');
}

const seenTitles = new Map();
for (const url of sitemapUrls) {
  if (!url.startsWith(siteUrl + '/')) {
    errors.push('Non-canonical sitemap host: ' + url);
    continue;
  }

  const file = routeFile(url);
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch {
    errors.push('Missing static route file for ' + url);
    continue;
  }

  const titleTags = matches(html, /<title[^>]*>([\s\S]*?)<\/title>/gi);
  const descriptions = matches(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"[^>]*>/gi);
  const canonicals = matches(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"[^>]*>/gi);
  const robots = matches(html, /<meta[^>]+name="robots"[^>]+content="([^"]+)"[^>]*>/gi);
  const h1s = matches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi);

  if (titleTags.length !== 1) errors.push(url + ' has ' + titleTags.length + ' title tags');
  if (descriptions.length !== 1) errors.push(url + ' has ' + descriptions.length + ' meta descriptions');
  if (canonicals.length !== 1) errors.push(url + ' has ' + canonicals.length + ' canonical tags');
  if (robots.length !== 1) errors.push(url + ' has ' + robots.length + ' robots tags');
  if (h1s.length !== 1) errors.push(url + ' has ' + h1s.length + ' H1 elements in static HTML');
  if (canonicals[0] && canonicals[0][1] !== url) errors.push(url + ' canonical points to ' + canonicals[0][1]);
  if (robots[0] && /noindex/i.test(robots[0][1])) errors.push(url + ' is in the sitemap but marked noindex');
  if (!html.includes('<div id="root"><div class="seo-static-shell">')) errors.push(url + ' does not include pre-rendered body content');
  if (html.includes('https://shenandoahspeedtest.com')) errors.push(url + ' contains a non-www production URL');
  if (html.includes('"@type":"Dataset"')) errors.push(url + ' still emits Dataset structured data');

  const title = contentOf(titleTags[0]);
  if (title) {
    const duplicate = seenTitles.get(title);
    if (duplicate) errors.push('Duplicate title on ' + duplicate + ' and ' + url + ': ' + title);
    seenTitles.set(title, url);
  }

  for (const script of matches(html, /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(script[1]);
    } catch (error) {
      errors.push(url + ' has invalid JSON-LD: ' + error.message);
    }
  }
}

for (const privatePage of ['dashboard.html', '404.html']) {
  const file = path.join(distDir, privatePage);
  await access(file);
  const html = await readFile(file, 'utf8');
  if (!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html)) {
    errors.push(privatePage + ' is not marked noindex');
  }
}

const robotsTxt = await readFile(path.join(distDir, 'robots.txt'), 'utf8');
if (!robotsTxt.includes('Sitemap: ' + siteUrl + '/sitemap.xml')) {
  errors.push('robots.txt does not advertise the canonical sitemap URL');
}
if (/Disallow:\s*\/dashboard/i.test(robotsTxt)) {
  errors.push('robots.txt blocks /dashboard, preventing Google from reading its noindex tag');
}

const vercelConfig = JSON.parse(await readFile(path.join(projectRoot, 'vercel.json'), 'utf8'));
if (vercelConfig.cleanUrls !== true) errors.push('vercel.json must enable cleanUrls');
if (vercelConfig.trailingSlash !== false) errors.push('vercel.json must disable trailing slashes');
if (vercelConfig.rewrites) errors.push('vercel.json still contains a catch-all SPA rewrite');

const rootHtml = await readFile(path.join(distDir, 'index.html'), 'utf8');
if (!rootHtml.includes('"@type":"WebApplication"')) {
  errors.push('Home page is missing WebApplication structured data');
}
if (!rootHtml.includes('"@type":"FAQPage"')) {
  errors.push('Home page is missing visible FAQ structured data');
}

const townsHtml = await readFile(path.join(distDir, 'towns.html'), 'utf8');
const townLinkCount = matches(townsHtml, /href="\/towns\/[^"]+"/g).length;
if (townLinkCount < 100) {
  errors.push('Towns directory exposes too few crawlable town links: ' + townLinkCount);
}

if (errors.length) {
  console.error('SEO validation failed with ' + errors.length + ' issue(s):');
  for (const error of errors) console.error('- ' + error);
  process.exitCode = 1;
} else {
  console.log('SEO validation passed.');
  console.log('- ' + sitemapUrls.length + ' canonical, indexable URLs');
  console.log('- Unique title, description, canonical, robots, and H1 checks passed');
  console.log('- Static HTML, JSON-LD, sitemap, robots.txt, and 404 routing checks passed');
}
