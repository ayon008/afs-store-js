/**
 * Sitemap Helpers
 * 
 * Functions to fetch all products, categories, and blog posts
 * for sitemap generation.
 */

const WP_BASE_URL = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.afs-foiling.com';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

const authHeader = WC_CONSUMER_KEY && WC_CONSUMER_SECRET
  ? Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64')
  : null;

/**
 * Fetch all products from WooCommerce API with pagination
 * 
 * @param {string} locale - Locale ('en' or 'fr')
 * @returns {Promise<Array>} Array of products with { id, slug, date_modified, ... }
 */
export async function getAllProducts(locale = 'en') {
  try {
    const allProducts = [];
    let page = 1;
    const perPage = 100; // WooCommerce max per page
    let hasMore = true;

    while (hasMore) {
      const url = `${WP_BASE_URL}/wp-json/wc/v3/products?per_page=${perPage}&page=${page}&lang=${locale}&status=publish&orderby=date&order=desc`;
      
      const headers = {};
      if (authHeader) {
        headers.Authorization = `Basic ${authHeader}`;
      }

      const response = await fetch(url, {
        headers,
        // No cache during build to avoid timeout issues
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(`[Sitemap] Failed to fetch products page ${page}: ${response.status}`);
        break;
      }

      const products = await response.json();
      
      if (!products || products.length === 0) {
        hasMore = false;
      } else {
        allProducts.push(...products);
        page++;
        
        // Stop if we got fewer products than perPage (last page)
        if (products.length < perPage) {
          hasMore = false;
        }
      }
    }

    return allProducts.map(product => ({
      id: product.id,
      slug: product.slug,
      date_modified: product.date_modified || product.date_created,
      permalink: product.permalink,
    }));
  } catch (error) {
    console.error('[Sitemap] Error fetching all products:', error);
    return [];
  }
}

/**
 * Fetch all product categories from WooCommerce API with pagination
 * 
 * @param {string} locale - Locale ('en' or 'fr')
 * @returns {Promise<Array>} Array of categories with { id, slug, date_modified, parent, ... }
 */
export async function getAllCategories(locale = 'en') {
  try {
    const allCategories = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      const url = `${WP_BASE_URL}/wp-json/wc/v3/products/categories?per_page=${perPage}&page=${page}&lang=${locale}&orderby=id&order=asc`;
      
      const headers = {};
      if (authHeader) {
        headers.Authorization = `Basic ${authHeader}`;
      }

      const response = await fetch(url, {
        headers,
        // No cache during build to avoid timeout issues
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(`[Sitemap] Failed to fetch categories page ${page}: ${response.status}`);
        break;
      }

      const categories = await response.json();
      
      if (!categories || categories.length === 0) {
        hasMore = false;
      } else {
        allCategories.push(...categories);
        page++;
        
        if (categories.length < perPage) {
          hasMore = false;
        }
      }
    }

    return allCategories.map(category => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      parent: category.parent || 0,
      date_modified: category.date_modified || category.date_created,
      permalink: category.permalink,
    }));
  } catch (error) {
    console.error('[Sitemap] Error fetching all categories:', error);
    return [];
  }
}

/**
 * Fetch all blog posts from WordPress API
 * 
 * @param {string} locale - Locale ('en' or 'fr')
 * @returns {Promise<Array>} Array of posts with { id, slug, modified, date, ... }
 */
export async function getAllBlogPosts(locale = 'en') {
  try {
    const allPosts = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      const url = `${WP_BASE_URL}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&lang=${locale}&status=publish&orderby=date&order=desc`;
      
      const response = await fetch(url, {
        // No cache during build to avoid timeout issues
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(`[Sitemap] Failed to fetch blog posts page ${page}: ${response.status}`);
        break;
      }

      const posts = await response.json();
      
      if (!posts || posts.length === 0) {
        hasMore = false;
      } else {
        allPosts.push(...posts);
        page++;
        
        if (posts.length < perPage) {
          hasMore = false;
        }
      }
    }

    return allPosts.map(post => ({
      id: post.id,
      slug: post.slug,
      modified: post.modified || post.date,
      date: post.date,
      link: post.link,
    }));
  } catch (error) {
    console.error('[Sitemap] Error fetching all blog posts:', error);
    return [];
  }
}

/**
 * Get product URL for a given locale
 * 
 * @param {string} slug - Product slug
 * @param {string} locale - Locale ('en' or 'fr')
 * @returns {string} Product URL path
 */
export function getProductUrl(slug, locale) {
  if (!slug) return null;
  const prefix = locale === 'fr' ? '/produit/' : '/product/';
  return locale === 'fr' ? `/fr${prefix}${slug}` : `${prefix}${slug}`;
}

/**
 * Get category URL for a given locale
 * 
 * @param {string} slug - Category slug
 * @param {string} locale - Locale ('en' or 'fr')
 * @returns {string} Category URL path
 */
export function getCategoryUrl(slug, locale) {
  if (!slug) return null;
  const prefix = locale === 'fr' ? '/categorie-produit/' : '/product-category/';
  return locale === 'fr' ? `/fr${prefix}${slug}` : `${prefix}${slug}`;
}

/**
 * Get blog post URL for a given locale
 * 
 * @param {string} slug - Post slug
 * @param {string} locale - Locale ('en' or 'fr')
 * @returns {string} Blog post URL path
 */
export function getBlogPostUrl(slug, locale) {
  if (!slug) return null;
  const path = `/blog/${slug}`;
  return locale === 'fr' ? `/fr${path}` : path;
}
