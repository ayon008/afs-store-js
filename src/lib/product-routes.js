/**
 * Utility functions for product routes with multilingual support
 */

/**
 * Get the product route prefix based on locale
 * @param {string} locale - The locale ('en' or 'fr')
 * @returns {string} The route prefix ('/product/' or '/fr/produit/')
 */
export function getProductRoutePrefix(locale) {
    return locale === 'fr' ? '/fr/produit/' : '/product/';
}

/**
 * Get the full product route URL
 * @param {string} locale - The locale ('en' or 'fr')
 * @param {string} slug - The product slug
 * @returns {string} The full product route URL
 */
export function getProductRoute(locale, slug) {
    if (!slug) return '/';
    const prefix = getProductRoutePrefix(locale);
    return `${prefix}${slug}`;
}

import { getCachedTranslation, setCachedTranslation } from './product-slug-cache';

/**
 * Get translated product slug from WordPress API with caching
 * @param {string|number} identifier - Product slug or product ID
 * @param {string} targetLocale - Target locale ('en' or 'fr')
 * @param {string} currentLocale - Current locale (optional, for optimization)
 * @returns {Promise<{slug: string|null, exists: boolean, product_id: number|null}>}
 */
export async function getTranslatedProductSlug(identifier, targetLocale, currentLocale = null) {
    // Check cache first
    const cached = getCachedTranslation(identifier, targetLocale);
    if (cached) {
        return cached;
    }

    try {
        const WP_BASE_URL = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WP_BASE_URL;
        if (!WP_BASE_URL) {
            console.error('WP_BASE_URL not configured');
            return { slug: null, exists: false, product_id: null };
        }

        // Build query parameters
        const params = new URLSearchParams({
            target_lang: targetLocale,
        });

        // Add either slug or product_id
        if (typeof identifier === 'string') {
            params.append('slug', identifier);
        } else if (typeof identifier === 'number') {
            params.append('product_id', identifier.toString());
        } else {
            return { slug: null, exists: false, product_id: null };
        }

        const url = `${WP_BASE_URL}/wp-json/afs-wcml/v1/products/translate-slug?${params.toString()}`;
        
        // Use cache with revalidation for better performance
        const response = await fetch(url, {
            next: { revalidate: 3600 }, // Cache for 1 hour
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch translated slug: ${response.status}`);
            return { slug: null, exists: false, product_id: null };
        }

        const data = await response.json();
        
        const result = {
            slug: data.slug || null,
            exists: data.exists || false,
            product_id: data.product_id || null,
        };

        // Cache the result
        setCachedTranslation(identifier, targetLocale, result);
        
        return result;
    } catch (error) {
        console.error('Error fetching translated product slug:', error);
        return { slug: null, exists: false, product_id: null };
    }
}

/**
 * Get translated product route (full URL)
 * @param {string|number} identifier - Product slug or product ID
 * @param {string} targetLocale - Target locale ('en' or 'fr')
 * @param {string} currentLocale - Current locale (optional)
 * @returns {Promise<string>} The translated product route URL, or home page if translation doesn't exist
 */
export async function getTranslatedProductRoute(identifier, targetLocale, currentLocale = null) {
    const translation = await getTranslatedProductSlug(identifier, targetLocale, currentLocale);
    
    if (translation.exists && translation.slug) {
        return getProductRoute(targetLocale, translation.slug);
    }
    
    // Return home page for target locale if translation doesn't exist
    return targetLocale === 'fr' ? '/fr' : '/';
}

