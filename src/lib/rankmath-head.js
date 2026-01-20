/**
 * Rank Math SEO Head API Client
 * 
 * Fetches SEO metadata (title, meta tags, Open Graph, Twitter Cards, JSON-LD)
 * from Rank Math WordPress plugin via REST API.
 * 
 * @see https://rankmath.com/kb/rest-api/
 */

const WP_BASE_URL = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.afs-foiling.com';

/**
 * Get Rank Math head data for a given WordPress permalink
 * 
 * @param {string} permalink - WordPress permalink (relative path or full URL)
 * @param {string} [locale='en'] - Locale for WPML language context
 * @returns {Promise<Object|null>} Rank Math head data or null if unavailable
 */
export async function getRankMathHead(permalink, locale = 'en') {
  try {
    // Normalize permalink - remove protocol and domain if present
    let normalizedPermalink = permalink;
    if (permalink.startsWith('http://') || permalink.startsWith('https://')) {
      try {
        const url = new URL(permalink);
        normalizedPermalink = url.pathname + url.search;
      } catch (e) {
        // If URL parsing fails, try to extract path manually
        normalizedPermalink = permalink.replace(/^https?:\/\/[^/]+/, '');
      }
    }
    
    // Ensure permalink starts with /
    if (!normalizedPermalink.startsWith('/')) {
      normalizedPermalink = '/' + normalizedPermalink;
    }

    // Build Rank Math API endpoint
    // Rank Math REST API: /wp-json/rankmath/v1/getHead?url={permalink}
    const apiUrl = `${WP_BASE_URL}/wp-json/rankmath/v1/getHead`;
    const params = new URLSearchParams({
      url: normalizedPermalink,
      ...(locale && locale !== 'en' ? { lang: locale } : {}),
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes to reduce API calls
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      // If Rank Math API is not available, return null (graceful degradation)
      if (response.status === 404 || response.status === 500) {
        console.warn(`[Rank Math] API not available for ${normalizedPermalink}`);
        return null;
      }
      throw new Error(`Rank Math API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Rank Math returns an object with 'head' property containing HTML string
    // or structured data depending on the version
    if (!data || (!data.head && !data.html && !data.meta)) {
      return null;
    }

    return parseRankMathResponse(data);
  } catch (error) {
    console.error(`[Rank Math] Error fetching head for ${permalink}:`, error);
    return null;
  }
}

/**
 * Parse Rank Math API response into structured format
 * 
 * @param {Object} data - Raw Rank Math API response
 * @returns {Object} Parsed metadata structure
 */
function parseRankMathResponse(data) {
  const result = {
    title: null,
    description: null,
    canonical: null,
    robots: null,
    openGraph: {},
    twitter: {},
    jsonLd: [],
    other: {},
  };

  // Handle different response formats
  if (data.head) {
    // Parse HTML head string
    return parseHTMLHead(data.head);
  } else if (data.html) {
    // Alternative format with HTML
    return parseHTMLHead(data.html);
  } else if (data.meta) {
    // Structured metadata format
    return parseStructuredMeta(data.meta);
  }

  // Fallback: try to extract from any available fields
  if (data.title) result.title = data.title;
  if (data.description) result.description = data.description;
  if (data.canonical) result.canonical = data.canonical;
  if (data.robots) result.robots = data.robots;
  if (data.openGraph) result.openGraph = data.openGraph;
  if (data.twitter) result.twitter = data.twitter;
  if (data.jsonLd || data.schema) {
    result.jsonLd = Array.isArray(data.jsonLd || data.schema) 
      ? (data.jsonLd || data.schema) 
      : [data.jsonLd || data.schema];
  }

  return result;
}

/**
 * Parse HTML head string to extract metadata
 * 
 * @param {string} html - HTML head content
 * @returns {Object} Parsed metadata
 */
function parseHTMLHead(html) {
  const result = {
    title: null,
    description: null,
    canonical: null,
    robots: null,
    openGraph: {},
    twitter: {},
    jsonLd: [],
    other: {},
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  }

  // Extract meta description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (descMatch) {
    result.description = descMatch[1].trim();
  }

  // Extract canonical
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (canonicalMatch) {
    result.canonical = canonicalMatch[1].trim();
  }

  // Extract robots
  const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  if (robotsMatch) {
    result.robots = robotsMatch[1].trim();
  }

  // Extract Open Graph tags
  const ogMatches = html.matchAll(/<meta[^>]+property=["']og:([^"']+)["'][^>]+content=["']([^"']+)["']/gi);
  for (const match of ogMatches) {
    const property = match[1];
    const content = match[2].trim();
    if (property === 'image' || property === 'image:url') {
      result.openGraph.images = result.openGraph.images || [];
      result.openGraph.images.push({ url: content });
    } else {
      result.openGraph[property] = content;
    }
  }

  // Extract Twitter Card tags
  const twitterMatches = html.matchAll(/<meta[^>]+name=["']twitter:([^"']+)["'][^>]+content=["']([^"']+)["']/gi);
  for (const match of twitterMatches) {
    const property = match[1];
    const content = match[2].trim();
    if (property === 'image') {
      result.twitter.images = result.twitter.images || [];
      result.twitter.images.push(content);
    } else {
      result.twitter[property] = content;
    }
  }

  // Extract JSON-LD scripts
  const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    try {
      const jsonData = JSON.parse(match[1].trim());
      result.jsonLd.push(jsonData);
    } catch (e) {
      console.warn('[Rank Math] Failed to parse JSON-LD:', e);
    }
  }

  return result;
}

/**
 * Parse structured metadata object
 * 
 * @param {Object} meta - Structured metadata object
 * @returns {Object} Parsed metadata
 */
function parseStructuredMeta(meta) {
  return {
    title: meta.title || null,
    description: meta.description || null,
    canonical: meta.canonical || null,
    robots: meta.robots || null,
    openGraph: meta.openGraph || {},
    twitter: meta.twitter || {},
    jsonLd: meta.jsonLd || meta.schema || [],
    other: meta.other || {},
  };
}

/**
 * Convert Rank Math metadata to Next.js metadata format
 * 
 * @param {Object} rankMathData - Parsed Rank Math data
 * @param {Object} [overrides={}] - Override values (e.g., for hreflang)
 * @returns {Object} Next.js metadata object
 */
export function rankMathToNextMetadata(rankMathData, overrides = {}) {
  if (!rankMathData) {
    return null;
  }

  const metadata = {
    title: overrides.title || rankMathData.title || undefined,
    description: overrides.description || rankMathData.description || undefined,
    robots: rankMathData.robots ? parseRobots(rankMathData.robots) : undefined,
    alternates: {
      canonical: overrides.canonical || rankMathData.canonical || undefined,
      ...(overrides.languages ? { languages: overrides.languages } : {}),
    },
  };

  // Open Graph
  if (rankMathData.openGraph && Object.keys(rankMathData.openGraph).length > 0) {
    metadata.openGraph = {
      title: overrides.ogTitle || rankMathData.openGraph.title || rankMathData.title,
      description: overrides.ogDescription || rankMathData.openGraph.description || rankMathData.description,
      url: overrides.ogUrl || rankMathData.openGraph.url || rankMathData.canonical,
      siteName: rankMathData.openGraph.siteName || 'AFS',
      type: rankMathData.openGraph.type || 'website',
      ...(rankMathData.openGraph.images ? { images: rankMathData.openGraph.images } : {}),
      ...(rankMathData.openGraph.locale ? { locale: rankMathData.openGraph.locale } : {}),
    };
  }

  // Twitter Cards
  if (rankMathData.twitter && Object.keys(rankMathData.twitter).length > 0) {
    metadata.twitter = {
      card: rankMathData.twitter.card || 'summary_large_image',
      title: overrides.twitterTitle || rankMathData.twitter.title || rankMathData.title,
      description: overrides.twitterDescription || rankMathData.twitter.description || rankMathData.description,
      ...(rankMathData.twitter.images ? { images: rankMathData.twitter.images } : {}),
    };
  }

  // Remove undefined values
  Object.keys(metadata).forEach(key => {
    if (metadata[key] === undefined) {
      delete metadata[key];
    }
  });

  return metadata;
}

/**
 * Parse robots meta string to Next.js format
 * 
 * @param {string} robots - Robots meta string (e.g., "index, follow")
 * @returns {Object} Next.js robots object
 */
function parseRobots(robots) {
  const parts = robots.toLowerCase().split(',').map(s => s.trim());
  const result = {};
  
  if (parts.includes('noindex')) result.index = false;
  else if (parts.includes('index')) result.index = true;
  
  if (parts.includes('nofollow')) result.follow = false;
  else if (parts.includes('follow')) result.follow = true;
  
  if (parts.includes('noarchive')) result.archive = false;
  if (parts.includes('nosnippet')) result.snippet = false;
  
  return result;
}

/**
 * Get WordPress permalink for a product
 * 
 * @param {number|string} productId - WooCommerce product ID
 * @param {string} [locale='en'] - Locale
 * @returns {Promise<string|null>} WordPress permalink or null
 */
export async function getProductPermalink(productId, locale = 'en') {
  try {
    const langParam = locale === 'fr' ? '&lang=fr' : '';
    const response = await fetch(
      `${WP_BASE_URL}/wp-json/wc/v3/products/${productId}?${langParam}`,
      { next: { revalidate: 300 } }
    );
    
    if (!response.ok) return null;
    
    const product = await response.json();
    return product.permalink || null;
  } catch (error) {
    console.error(`[Rank Math] Error fetching product permalink:`, error);
    return null;
  }
}

/**
 * Get WordPress permalink for a category
 * 
 * @param {number|string} categoryId - Category term ID
 * @param {string} [locale='en'] - Locale
 * @returns {Promise<string|null>} WordPress permalink or null
 */
export async function getCategoryPermalink(categoryId, locale = 'en') {
  try {
    const langParam = locale === 'fr' ? '&lang=fr' : '';
    const response = await fetch(
      `${WP_BASE_URL}/wp-json/wc/v3/products/categories/${categoryId}?${langParam}`,
      { next: { revalidate: 300 } }
    );
    
    if (!response.ok) return null;
    
    const category = await response.json();
    return category.permalink || null;
  } catch (error) {
    console.error(`[Rank Math] Error fetching category permalink:`, error);
    return null;
  }
}

/**
 * Get WordPress permalink for a blog post
 * 
 * @param {string} slug - Post slug
 * @param {string} [locale='en'] - Locale
 * @returns {Promise<string|null>} WordPress permalink or null
 */
export async function getPostPermalink(slug, locale = 'en') {
  try {
    const langParam = locale === 'fr' ? '&lang=fr' : '';
    const response = await fetch(
      `${WP_BASE_URL}/wp-json/wp/v2/posts?slug=${slug}${langParam}`,
      { next: { revalidate: 300 } }
    );
    
    if (!response.ok) return null;
    
    const posts = await response.json();
    if (!posts || posts.length === 0) return null;
    
    return posts[0].link || null;
  } catch (error) {
    console.error(`[Rank Math] Error fetching post permalink:`, error);
    return null;
  }
}
