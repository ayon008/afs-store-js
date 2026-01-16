/**
 * Utility functions for URL handling
 * Provides a consistent way to get the WordPress base URL for images and media
 */

/**
 * Get the WordPress base URL for public assets (images, videos, etc.)
 * This should be used in client components and for constructing WordPress media URLs
 * 
 * @returns {string} The WordPress base URL
 */
export function getWordPressBaseUrl() {
  // Try NEXT_PUBLIC_BASE_URL first (for client-side usage)
  // Fallback to WP_BASE_URL if available (server-side only)
  // Final fallback to staging URL
  if (typeof window !== 'undefined') {
    // Client-side: only NEXT_PUBLIC_* vars are available
    return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_WP_BASE_URL || 'https://staging.afs-foiling.com';
  } else {
    // Server-side: can access both
    return process.env.NEXT_PUBLIC_BASE_URL || process.env.WP_BASE_URL || 'https://staging.afs-foiling.com';
  }
}

/**
 * Construct a full WordPress media URL from a relative path
 * @param {string} relativePath - Relative path like '/wp-content/uploads/...'
 * @returns {string} Full URL
 */
export function getWordPressMediaUrl(relativePath) {
  const baseUrl = getWordPressBaseUrl();
  // Remove trailing slash from base URL and leading slash from path if present
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Check if a URL is absolute or relative
 * @param {string} url - URL to check
 * @returns {boolean} True if absolute, false if relative
 */
export function isAbsoluteUrl(url) {
  return /^https?:\/\//i.test(url);
}

/**
 * Normalize a WordPress media URL (handles both absolute and relative URLs)
 * @param {string} url - URL from WordPress API (could be absolute or relative)
 * @returns {string} Always returns an absolute URL
 */
export function normalizeWordPressUrl(url) {
  if (!url) return '';
  
  // If already absolute, return as-is
  if (isAbsoluteUrl(url)) {
    return url;
  }
  
  // If relative, construct full URL
  return getWordPressMediaUrl(url);
}
