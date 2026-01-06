/**
 * Cache for product slug translations
 * Uses in-memory cache with TTL
 */

const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Generate cache key
 */
function getCacheKey(identifier, targetLocale) {
    const id = typeof identifier === 'number' ? identifier : identifier;
    return `slug_translation_${id}_${targetLocale}`;
}

/**
 * Get cached translation
 */
export function getCachedTranslation(identifier, targetLocale) {
    const key = getCacheKey(identifier, targetLocale);
    const cached = cache.get(key);
    
    if (cached && Date.now() < cached.expires) {
        return cached.data;
    }
    
    // Remove expired entry
    if (cached) {
        cache.delete(key);
    }
    
    return null;
}

/**
 * Set cached translation
 */
export function setCachedTranslation(identifier, targetLocale, data) {
    const key = getCacheKey(identifier, targetLocale);
    cache.set(key, {
        data,
        expires: Date.now() + CACHE_TTL,
    });
}

/**
 * Clear cache for a specific product
 */
export function clearCacheForProduct(identifier) {
    const keysToDelete = [];
    for (const key of cache.keys()) {
        if (key.includes(`_${identifier}_`) || key.includes(`_${identifier}`)) {
            keysToDelete.push(key);
        }
    }
    keysToDelete.forEach(key => cache.delete(key));
}

/**
 * Clear all cache
 */
export function clearAllCache() {
    cache.clear();
}


