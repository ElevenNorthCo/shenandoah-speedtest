const SITE_NAME = 'Shenandoah Valley Speed Test';
const SITE_URL = 'https://shenandoahspeedtest.com';

export function generatePageTitle(page: string): string {
  if (!page || page === 'Home') {
    return `${SITE_NAME} | Free Community Internet Speed Test`;
  }
  return `${page} | ${SITE_NAME}`;
}

export function generateMetaDescription(page: string, data?: Record<string, string | number>): string {
  switch (page) {
    case 'Home':
      return 'Test your internet speed in the Shenandoah Valley, VA. See real speeds from your neighbors, compare ISPs like Shentel, Starlink, and T-Mobile, and find the best provider for your area. Free forever.';
    case 'About':
      return 'Why we built a free internet speed test for the Shenandoah Valley — and why real local data matters more than ISP coverage maps.';
    case 'Towns':
      return 'Compare internet speeds across every town and community in the Shenandoah Valley. Find the best ISP for Broadway, Luray, Woodstock, Harrisonburg, and 100+ rural communities.';
    case 'TownDetail':
      if (data) {
        const town = data.town || 'this town';
        const region = data.region || 'VA';
        const avgDownload = data.avgDownload || '';
        const carrier = data.carrier || '';
        const tests = data.tests || 0;
        const parts = [`Real internet speeds in ${town}, ${region}.`];
        if (avgDownload) parts.push(`Average ${avgDownload} Mbps download.`);
        if (carrier) parts.push(`Best provider: ${carrier}.`);
        if (tests) parts.push(`${tests} community tests.`);
        return parts.join(' ');
      }
      return 'Real internet speed data for this Shenandoah Valley community.';
    case 'Dashboard':
      return 'Track your internet speed performance over time. See trends, compare with neighbors, and get recommendations.';
    default:
      return `${page} — ${SITE_NAME}`;
  }
}

export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function generateStructuredData(type: string, data: Record<string, unknown>): object {
  switch (type) {
    case 'FAQPage':
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.questions,
      };
    case 'Dataset':
      return {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: data.name || 'Shenandoah Valley Internet Speed Data',
        description: data.description || 'Community-submitted internet speed test results from the Shenandoah Valley region.',
        url: data.url || SITE_URL,
        creator: {
          '@type': 'Organization',
          name: 'Eleven North',
          url: 'https://elevennorth.co',
        },
        temporalCoverage: data.temporalCoverage || '2024/..',
        spatialCoverage: {
          '@type': 'Place',
          name: 'Shenandoah Valley, Virginia',
        },
      };
    default:
      return { '@context': 'https://schema.org', '@type': type, ...data };
  }
}
