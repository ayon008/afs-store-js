/**
 * Sitemap Index Generator
 * 
 * Generates a sitemap index (sitemapindex.xml) that references paginated sitemaps
 * This is the main entry point for search engines
 */

import { generateAllUrls, BASE_URL } from '@/lib/sitemap-generator';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const MAX_URLS_PER_SITEMAP = 10000;

/**
 * Generate sitemap index XML
 */
function generateSitemapIndex(sitemapUrls) {
  const sitemapEntries = sitemapUrls.map(url => 
    `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
  ).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

export async function GET() {
  try {
    // Generate all URLs to calculate pagination
    const allUrls = await generateAllUrls();
    const totalPages = Math.ceil(allUrls.length / MAX_URLS_PER_SITEMAP);
    
    // Build list of sitemap URLs
    const sitemapUrls = [];
    
    // Main sitemap (page 1)
    sitemapUrls.push(`${BASE_URL}/sitemap.xml`);
    
    // Paginated sitemaps (pages 2+)
    for (let i = 2; i <= totalPages; i++) {
      sitemapUrls.push(`${BASE_URL}/sitemap-${i}.xml`);
    }
    
    // Generate sitemap index XML
    const xml = generateSitemapIndex(sitemapUrls);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('[Sitemap Index] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
