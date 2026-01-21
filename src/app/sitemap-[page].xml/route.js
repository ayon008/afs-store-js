/**
 * Paginated Sitemap Route
 * 
 * Generates paginated sitemaps (sitemap-2.xml, sitemap-3.xml, etc.)
 * Each sitemap contains up to 10,000 URLs
 */

import { generateAllUrls, BASE_URL } from '@/lib/sitemap-generator';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const MAX_URLS_PER_SITEMAP = 10000;

/**
 * Generate XML sitemap from URL array
 */
function generateSitemapXML(urls) {
  const xmlUrls = urls.map(item => {
    const lastmod = item.lastModified 
      ? new Date(item.lastModified).toISOString() 
      : new Date().toISOString();
    
    let xml = `  <url>
    <loc>${item.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${item.changeFrequency || 'weekly'}</changefreq>
    <priority>${item.priority || 0.8}</priority>`;
    
    // Add hreflang alternates if available
    if (item.alternates?.languages) {
      const { en, fr } = item.alternates.languages;
      if (en) {
        xml += `\n    <xhtml:link rel="alternate" hreflang="en" href="${en}" />`;
      }
      if (fr) {
        xml += `\n    <xhtml:link rel="alternate" hreflang="fr" href="${fr}" />`;
      }
    }
    
    xml += `\n  </url>`;
    return xml;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlUrls}
</urlset>`;
}

/**
 * Generate static params for paginated sitemaps
 */
export async function generateStaticParams() {
  try {
    const allUrls = await generateAllUrls();
    const totalPages = Math.ceil(allUrls.length / MAX_URLS_PER_SITEMAP);
    
    // Generate params for pages 2, 3, 4, etc. (page 1 is sitemap.xml)
    const params = [];
    for (let i = 2; i <= totalPages; i++) {
      params.push({ page: i.toString() });
    }
    
    return params;
  } catch (error) {
    console.error('[Sitemap Pagination] Error generating static params:', error);
    return [];
  }
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const page = resolvedParams?.page;
    const pageNumber = parseInt(page, 10);
    
    if (!page || isNaN(pageNumber) || pageNumber < 2) {
      return new NextResponse('Invalid page number', { status: 400 });
    }
    
    // Generate all URLs
    const allUrls = await generateAllUrls();
    
    // Calculate pagination (page 1 is in sitemap.xml, so page 2 starts at index MAX_URLS_PER_SITEMAP)
    const start = (pageNumber - 1) * MAX_URLS_PER_SITEMAP;
    const end = Math.min(start + MAX_URLS_PER_SITEMAP, allUrls.length);
    
    if (start >= allUrls.length) {
      return new NextResponse('Page not found', { status: 404 });
    }
    
    const pageUrls = allUrls.slice(start, end);
    
    // Generate XML
    const xml = generateSitemapXML(pageUrls);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error(`[Sitemap ${page}] Error:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
