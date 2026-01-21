/**
 * SEO Utilities for hreflang and metadata generation
 * 
 * Integrates with Rank Math WordPress plugin for SEO metadata.
 *
 * Usage in page.js:
 * import { generateHreflangAlternates, createPageMetadata } from '@/lib/seo-utils';
 * import { getRankMathHead, rankMathToNextMetadata } from '@/lib/rankmath-head';
 *
 * export async function generateMetadata({ params }) {
 *   const { locale } = await params;
 *   const rankMathData = await getRankMathHead(permalink, locale);
 *   const baseMetadata = createPageMetadata({
 *     locale,
 *     pathname: '/products',
 *     title: { en: 'Products', fr: 'Produits' },
 *     description: { en: '...', fr: '...' },
 *   });
 *   return rankMathToNextMetadata(rankMathData, baseMetadata);
 * }
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://afs-foiling.com';

/**
 * Generate hreflang alternates for SEO
 *
 * @param {string} pathname - The page path without locale prefix (e.g., '/products', '/cart')
 * @returns {Object} Hreflang alternates object for Next.js metadata
 */
export function generateHreflangAlternates(pathname = '') {
  // Normalize pathname
  const normalizedPath = pathname
    ? (pathname.startsWith('/') ? pathname : `/${pathname}`)
    : '';

  const enUrl = `${BASE_URL}${normalizedPath}`;
  const frUrl = `${BASE_URL}/fr${normalizedPath}`;

  return {
    // Primary language tags (most important for SEO)
    'en': enUrl,
    'fr': frUrl,

    // Key regional targeting for primary markets
    'en-US': enUrl,      // United States
    'en-GB': enUrl,      // United Kingdom
    'en-CA': enUrl,      // Canada (English)
    'en-AE': enUrl,      // UAE
    'en-AU': enUrl,      // Australia
    'fr-FR': frUrl,      // France
    'fr-BE': frUrl,      // Belgium (French)
    'fr-CH': frUrl,      // Switzerland (French)
    'fr-CA': frUrl,      // Canada (French)
    'fr-LU': frUrl,      // Luxembourg (French)

    // Spanish site (external)
    'es': 'https://afs-foiling.es',
    'es-ES': 'https://afs-foiling.es',

    // Default fallback (English)
    'x-default': enUrl,
  };
}

/**
 * Create page metadata with proper hreflang and canonical
 *
 * @param {Object} options
 * @param {string} options.locale - Current locale ('en' or 'fr')
 * @param {string} options.pathname - Page path without locale prefix
 * @param {Object|string} options.title - Title string or { en: '...', fr: '...' }
 * @param {Object|string} options.description - Description string or { en: '...', fr: '...' }
 * @param {string} [options.image] - OpenGraph image URL
 * @param {string} [options.imageAlt] - OpenGraph image alt text
 * @returns {Object} Next.js metadata object
 */
export function createPageMetadata({
  locale,
  pathname = '',
  title,
  description,
  image = `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/02/Fly2023-7-1-1.png`,
  imageAlt = 'AFS Foiling',
}) {
  const isEnglish = locale === 'en';

  // Handle localized strings
  const resolvedTitle = typeof title === 'string' ? title : (isEnglish ? title.en : title.fr);
  const resolvedDescription = typeof description === 'string'
    ? description
    : (isEnglish ? description.en : description.fr);

  // Canonical URL
  const canonicalUrl = isEnglish
    ? `${BASE_URL}${pathname}`
    : `${BASE_URL}/${locale}${pathname}`;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      type: 'website',
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonicalUrl,
      siteName: 'AFS',
      locale: isEnglish ? 'en_US' : 'fr_FR',
      alternateLocale: isEnglish ? 'fr_FR' : 'en_US',
      images: [
        {
          url: image,
          width: 1920,
          height: 1484,
          alt: imageAlt,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [image],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: generateHreflangAlternates(pathname),
    },
  };
}

/**
 * Generate product-specific metadata with hreflang
 *
 * @param {Object} options
 * @param {string} options.locale - Current locale
 * @param {string} options.slug - Product slug
 * @param {string} options.name - Product name
 * @param {string} options.description - Product description
 * @param {string} [options.image] - Product image URL
 * @returns {Object} Next.js metadata object
 */
export function createProductMetadata({
  locale,
  slug,
  name,
  description,
  image,
}) {
  return createPageMetadata({
    locale,
    pathname: `/product/${slug}`,
    title: `${name} - AFS`,
    description: description || `${name} - AFS Foiling`,
    image,
    imageAlt: name,
  });
}

/**
 * Generate category-specific metadata with hreflang
 *
 * @param {Object} options
 * @param {string} options.locale - Current locale
 * @param {string} options.slug - Category slug
 * @param {Object|string} options.name - Category name (localized or string)
 * @param {Object|string} [options.description] - Category description
 * @returns {Object} Next.js metadata object
 */
export function createCategoryMetadata({
  locale,
  slug,
  name,
  description,
}) {
  const isEnglish = locale === 'en';
  const resolvedName = typeof name === 'string' ? name : (isEnglish ? name.en : name.fr);

  const defaultDescription = {
    en: `Explore our ${resolvedName} collection. Premium foiling equipment Made In France.`,
    fr: `Découvrez notre collection ${resolvedName}. Équipement de foil premium Made In France.`,
  };

  return createPageMetadata({
    locale,
    pathname: `/product-category/${slug}`,
    title: `${resolvedName} - AFS`,
    description: description || defaultDescription,
  });
}

/**
 * Merge Rank Math metadata with base metadata
 * Rank Math values take precedence when available
 * 
 * @param {Object} baseMetadata - Base Next.js metadata
 * @param {Object} rankMathData - Rank Math parsed data
 * @param {Object} [overrides={}] - Additional overrides (e.g., hreflang)
 * @returns {Object} Merged Next.js metadata
 */
export function mergeRankMathMetadata(baseMetadata, rankMathData, overrides = {}) {
  if (!rankMathData) {
    return baseMetadata;
  }

  const merged = { ...baseMetadata };

  // Title: Rank Math takes precedence
  if (rankMathData.title) {
    merged.title = rankMathData.title;
  }

  // Description: Rank Math takes precedence
  if (rankMathData.description) {
    merged.description = rankMathData.description;
  }

  // Robots: Rank Math takes precedence
  if (rankMathData.robots) {
    const robotsParts = rankMathData.robots.toLowerCase().split(',').map(s => s.trim());
    merged.robots = {};
    if (robotsParts.includes('noindex')) merged.robots.index = false;
    else if (robotsParts.includes('index')) merged.robots.index = true;
    if (robotsParts.includes('nofollow')) merged.robots.follow = false;
    else if (robotsParts.includes('follow')) merged.robots.follow = true;
  }

  // Canonical: Rank Math takes precedence, but preserve hreflang
  if (rankMathData.canonical) {
    merged.alternates = {
      ...merged.alternates,
      canonical: rankMathData.canonical,
    };
  }

  // Open Graph: Merge Rank Math values
  if (rankMathData.openGraph && Object.keys(rankMathData.openGraph).length > 0) {
    merged.openGraph = {
      ...merged.openGraph,
      ...(rankMathData.openGraph.title && { title: rankMathData.openGraph.title }),
      ...(rankMathData.openGraph.description && { description: rankMathData.openGraph.description }),
      ...(rankMathData.openGraph.url && { url: rankMathData.openGraph.url }),
      ...(rankMathData.openGraph.type && { type: rankMathData.openGraph.type }),
      ...(rankMathData.openGraph.siteName && { siteName: rankMathData.openGraph.siteName }),
      ...(rankMathData.openGraph.images && { images: rankMathData.openGraph.images }),
      ...(rankMathData.openGraph.locale && { locale: rankMathData.openGraph.locale }),
    };
  }

  // Twitter: Merge Rank Math values
  if (rankMathData.twitter && Object.keys(rankMathData.twitter).length > 0) {
    merged.twitter = {
      ...merged.twitter,
      ...(rankMathData.twitter.card && { card: rankMathData.twitter.card }),
      ...(rankMathData.twitter.title && { title: rankMathData.twitter.title }),
      ...(rankMathData.twitter.description && { description: rankMathData.twitter.description }),
      ...(rankMathData.twitter.images && { images: rankMathData.twitter.images }),
    };
  }

  // Apply overrides (e.g., hreflang)
  if (overrides.languages) {
    merged.alternates = {
      ...merged.alternates,
      languages: overrides.languages,
    };
  }

  return merged;
}
