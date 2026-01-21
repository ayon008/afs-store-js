/**
 * SEO Helper for Static Pages
 * 
 * Generates metadata for static pages (support, CGV, privacy, etc.)
 * with Rank Math integration.
 */

import { getRankMathHead } from './rankmath-head';
import { generateHreflangAlternates, mergeRankMathMetadata } from './seo-utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://afs-foiling.com';

/**
 * Generate metadata for a static page with Rank Math integration
 * 
 * @param {Object} options
 * @param {string} options.locale - Current locale ('en' or 'fr')
 * @param {string} options.pathname - Page path without locale prefix (e.g., '/support', '/privacy-policy')
 * @param {Object|string} options.title - Title string or { en: '...', fr: '...' }
 * @param {Object|string} options.description - Description string or { en: '...', fr: '...' }
 * @param {string} [options.wpPath] - WordPress path (defaults to pathname)
 * @param {string} [options.image] - OpenGraph image URL
 * @param {string} [options.imageAlt] - OpenGraph image alt text
 * @returns {Promise<Object>} Next.js metadata object
 */
export async function generateStaticPageMetadata({
  locale,
  pathname,
  title,
  description,
  wpPath = null,
  image = null,
  imageAlt = null,
}) {
  const isEnglish = locale === 'en';
  const resolvedTitle = typeof title === 'string' ? title : (isEnglish ? title.en : title.fr);
  const resolvedDescription = typeof description === 'string'
    ? description
    : (isEnglish ? description.en : description.fr);

  // Normalize pathname
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const currentUrl = isEnglish
    ? `${BASE_URL}${normalizedPath}`
    : `${BASE_URL}/fr${normalizedPath}`;

  // Default image
  const defaultImage = image || `${process.env.NEXT_PUBLIC_BASE_URL}/wp-content/uploads/2024/02/Fly2023-7-1-1.png`;
  const defaultImageAlt = imageAlt || resolvedTitle;

  // Base metadata (fallback if Rank Math is unavailable)
  const baseMetadata = {
    title: `${resolvedTitle} - AFS`,
    description: resolvedDescription,
    alternates: {
      canonical: currentUrl,
      languages: generateHreflangAlternates(normalizedPath),
    },
    openGraph: {
      type: 'website',
      title: `${resolvedTitle} - AFS`,
      description: resolvedDescription,
      url: currentUrl,
      siteName: 'AFS',
      locale: isEnglish ? 'en_US' : 'fr_FR',
      alternateLocale: isEnglish ? 'fr_FR' : 'en_US',
      images: [
        {
          url: defaultImage,
          alt: defaultImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${resolvedTitle} - AFS`,
      description: resolvedDescription,
      images: [defaultImage],
    },
  };

  // Fetch Rank Math metadata
  let rankMathData = null;
  try {
    const wpPagePath = wpPath || (locale === 'fr' ? `/fr${normalizedPath}/` : `${normalizedPath}/`);
    rankMathData = await getRankMathHead(wpPagePath, locale);
  } catch (error) {
    console.error(`[Static Page SEO] Error fetching Rank Math data for ${pathname}:`, error);
  }

  // Merge Rank Math metadata with base metadata
  if (rankMathData) {
    return mergeRankMathMetadata(baseMetadata, rankMathData, {
      languages: generateHreflangAlternates(normalizedPath),
    });
  }

  return baseMetadata;
}

/**
 * Get Rank Math data for a static page (for JSON-LD injection)
 * 
 * @param {string} pathname - Page path without locale prefix
 * @param {string} locale - Current locale
 * @param {string} [wpPath] - WordPress path (defaults to pathname)
 * @returns {Promise<Object|null>} Rank Math data or null
 */
export async function getStaticPageRankMathData(pathname, locale, wpPath = null) {
  try {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const wpPagePath = wpPath || (locale === 'fr' ? `/fr${normalizedPath}/` : `${normalizedPath}/`);
    return await getRankMathHead(wpPagePath, locale);
  } catch (error) {
    console.error(`[Static Page SEO] Error fetching Rank Math data for JSON-LD ${pathname}:`, error);
    return null;
  }
}
