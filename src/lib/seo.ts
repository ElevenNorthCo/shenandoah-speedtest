export const SITE_NAME = 'Shenandoah Valley Speed Test';
export const SITE_URL = 'https://www.shenandoahspeedtest.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const HOME_FAQS = [
  {
    question: 'What internet providers serve the Shenandoah Valley?',
    answer: 'Availability varies by address, but common providers include Shentel, Xfinity, Starlink, T-Mobile Home Internet, All Points Broadband, HughesNet, and Viasat. Use the community pages to compare real results near you.',
  },
  {
    question: 'Why should I run more than one internet speed test?',
    answer: 'Internet performance changes with Wi-Fi conditions, network congestion, and time of day. Run several tests at different times and, when possible, compare Wi-Fi with a wired Ethernet connection.',
  },
  {
    question: 'What do download speed, upload speed, and ping mean?',
    answer: 'Download speed measures how quickly data reaches you, upload speed measures how quickly you send data, and ping measures connection delay. Lower ping is better; higher download and upload speeds are better.',
  },
  {
    question: 'Are submitted speed test results public?',
    answer: 'Community results are shown in aggregate and on public leaderboards to help Valley residents compare real-world service. The tool does not publish your exact street address.',
  },
];

export function generatePageTitle(page: string): string {
  if (!page || page === 'Home') {
    return `${SITE_NAME} | Free Community Internet Speed Test`;
  }
  return `${page} | ${SITE_NAME}`;
}

export function generateMetaDescription(page: string, data?: Record<string, string | number>): string {
  switch (page) {
    case 'Home':
      return 'Test your internet speed in the Shenandoah Valley, VA. Compare real community results and local providers including Shentel, Starlink, and T-Mobile.';
    case 'About':
      return 'Why we built a free internet speed test for the Shenandoah Valley and why real local broadband data matters for residents and home buyers.';
    case 'Towns':
      return 'Compare community-submitted internet speeds across Harrisonburg, Winchester, Luray, Broadway, Woodstock, and 150+ Shenandoah Valley communities.';
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
      return 'Sign in to review your personal internet speed history and trends.';
    default:
      return `${page} — ${SITE_NAME}`;
  }
}

export function generateCanonicalUrl(path: string): string {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  const withoutQueryOrHash = withLeadingSlash.split(/[?#]/, 1)[0] || '/';
  const cleanPath = withoutQueryOrHash === '/'
    ? '/'
    : withoutQueryOrHash.replace(/\/+$/, '');
  return `${SITE_URL}${cleanPath}`;
}

export function generateHomeStructuredData(): object[] {
  const organization = {
    '@type': 'Organization',
    '@id': 'https://elevennorth.co/#organization',
    name: 'Eleven North',
    url: 'https://elevennorth.co/',
  };

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: 'A free community internet speed test and local broadband comparison tool for the Shenandoah Valley.',
      inLanguage: 'en-US',
      publisher: organization,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#application`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: 'Test download speed, upload speed, and ping, then compare real community results across the Shenandoah Valley.',
      applicationCategory: 'UtilitiesApplication',
      applicationSubCategory: 'Internet speed test',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript and a modern web browser.',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: organization,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: HOME_FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ];
}

export function generateStructuredData(type: string, data: Record<string, unknown>): object {
  switch (type) {
    case 'FAQPage':
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.questions,
      };
    default:
      return { '@context': 'https://schema.org', '@type': type, ...data };
  }
}
