/**
 * Main Sitemap Generator
 * 
 * Generates the first page of the sitemap (up to 10,000 URLs)
 * Additional pages are handled by /sitemap-[page]/route.js
 */

import { generateAllUrls } from '@/lib/sitemap-generator';

// Generate sitemap at build time only
export const dynamic = 'force-static';

// Maximum URLs per sitemap (10,000 is safe, Google allows up to 50,000)
const MAX_URLS_PER_SITEMAP = 10000;

/**
 * Main sitemap generator
 * Returns the first page of URLs (up to MAX_URLS_PER_SITEMAP)
 */
export default async function sitemap() {
  try {
    // Generate all URLs
    const allUrls = await generateAllUrls();
    
    // Return only the first page
    return allUrls.slice(0, MAX_URLS_PER_SITEMAP);
  } catch (error) {
    console.error('[Sitemap] Error generating sitemap:', error);
    return [];
  }
}
