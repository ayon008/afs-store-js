/**
 * Convertit une URL WordPress complète en route Next.js avec préfixe de locale
 * @param {string} wpUrl - URL WordPress complète (ex: https://staging.afs-foiling.com/fr/page-name)
 * @param {string} currentLocale - Locale actuelle ('fr' ou 'en')
 * @returns {string} - Route Next.js formatée (ex: /fr/page-name)
 */
export function convertWpUrlToNextUrl(wpUrl, currentLocale = 'fr') {
    // S'assurer que currentLocale est 'fr' ou 'en' uniquement
    const locale = (currentLocale === 'fr' || currentLocale === 'en') ? currentLocale : 'fr';
    // Si l'URL est vide, null, undefined ou commence par #, la retourner telle quelle
    if (!wpUrl || typeof wpUrl !== 'string' || wpUrl.trim() === '' || wpUrl.startsWith('#')) {
        return wpUrl || '#';
    }

    try {
        // Créer un objet URL pour parser l'URL complète
        let url;
        try {
            url = new URL(wpUrl);
        } catch (e) {
            // Si ce n'est pas une URL complète, traiter comme un chemin relatif
            const path = wpUrl.startsWith('/') ? wpUrl : `/${wpUrl}`;
            return convertPathToNextRoute(path, locale);
        }

        // Extraire le chemin et les query params
        const pathname = url.pathname;
        const search = url.search;
        const hash = url.hash;

        // Vérifier si c'est une URL externe (pas du domaine WordPress)
        const wpBaseUrl = process.env.WP_BASE_URL;
        if (wpBaseUrl) {
            try {
                const wpUrlObj = new URL(wpBaseUrl);
                // Si le domaine ne correspond pas, c'est une URL externe
                if (url.hostname !== wpUrlObj.hostname && url.hostname !== wpUrlObj.hostname.replace('www.', '')) {
                    // Retourner l'URL complète pour les liens externes
                    return wpUrl;
                }
            } catch (e) {
                // Ignorer les erreurs de parsing du WP_BASE_URL
            }
        }

        // Convertir le chemin en route Next.js
        const nextPath = convertPathToNextRoute(pathname, locale);

        // Reconstruire l'URL avec query params et hash
        return nextPath + search + hash;
    } catch (error) {
        console.warn('Error converting WordPress URL:', wpUrl, error);
        // En cas d'erreur, retourner l'URL originale ou un fallback
        return wpUrl || '#';
    }
}

/**
 * Convertit un chemin WordPress en route Next.js
 * @param {string} path - Chemin WordPress (ex: /fr/product-name ou /en/blog/post-slug)
 * @param {string} currentLocale - Locale actuelle ('fr' ou 'en')
 * @returns {string} - Route Next.js formatée
 */
function convertPathToNextRoute(path, currentLocale) {
    // Toujours utiliser la locale passée en paramètre, pas celle détectée dans l'URL WordPress
    const locale = (currentLocale === 'fr' || currentLocale === 'en') ? currentLocale : 'fr';
    
    // Pour l'anglais (locale par défaut), pas de préfixe /en/
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    
    if (!path || path === '/') {
        // Pour la racine, retourner selon la locale
        return locale === 'en' ? '/' : `/${locale}`;
    }

    // Normaliser le chemin (enlever les slashes multiples)
    let normalizedPath = path.replace(/\/+/g, '/');
    if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
    }

    let pathWithoutLocale = normalizedPath;

    // Enlever la locale du chemin WordPress si présente (pour extraire le chemin réel)
    // Mais on utilisera toujours la locale passée en paramètre pour construire l'URL Next.js
    const localeMatch = normalizedPath.match(/^\/(fr|en)(\/|$)/);
    if (localeMatch) {
        // Enlever la locale du chemin pour obtenir le chemin réel
        pathWithoutLocale = normalizedPath.replace(/^\/(fr|en)(\/|$)/, '/');
        if (pathWithoutLocale === '') {
            pathWithoutLocale = '/';
        }
    }

    // Si le chemin est juste la racine, retourner selon la locale
    if (pathWithoutLocale === '/') {
        return locale === 'en' ? '/' : `/${locale}`;
    }

    // Mapper les routes WordPress vers Next.js (ordre important - plus spécifique en premier)
    const routeMapping = [
        // Routes de produits WooCommerce (plus spécifiques en premier)
        { pattern: '/product-category/', next: '/product-category/' },
        { pattern: '/categorie-produit/', next: '/product-category/' },
        { pattern: '/product/', next: '/product/' },
        { pattern: '/produit/', next: '/product/' },
        
        // Routes de blog
        { pattern: '/blog/category/', next: '/blog/categories/' },
        { pattern: '/blog/categorie/', next: '/blog/categories/' },
        { pattern: '/blog/', next: '/blog/' },
        
        // Routes spéciales qui existent déjà dans Next.js
        { pattern: '/afs-team', next: '/afs-team' },
        { pattern: '/afs-events', next: '/afs-events' },
        { pattern: '/ambassadors', next: '/ambassadors' },
        { pattern: '/map', next: '/map' },
        { pattern: '/cart', next: '/cart' },
        { pattern: '/checkout', next: '/checkout' },
        { pattern: '/login', next: '/login' },
        { pattern: '/signup', next: '/signup' },
        { pattern: '/blog', next: '/blog' },
    ];

    // Chercher un mapping correspondant
    for (const { pattern, next } of routeMapping) {
        if (pathWithoutLocale.startsWith(pattern)) {
            const remainingPath = pathWithoutLocale.replace(pattern, '');
            // Nettoyer le remainingPath pour éviter les doubles slashes
            const cleanRemaining = remainingPath.startsWith('/') 
                ? remainingPath.substring(1) 
                : remainingPath;
            
            if (cleanRemaining) {
                return `${localePrefix}${next}${cleanRemaining}`;
            } else {
                return `${localePrefix}${next}`;
            }
        }
    }
    
    // Gérer les catégories génériques (après avoir vérifié les patterns spécifiques)
    // Si le chemin contient "category" ou "categorie" et n'a pas été matché, 
    // on assume que c'est une catégorie de blog
    if (pathWithoutLocale.includes('/category/') || pathWithoutLocale.includes('/categorie/')) {
        const categoryMatch = pathWithoutLocale.match(/\/(?:category|categorie)\/(.+)/);
        if (categoryMatch) {
            return `${localePrefix}/blog/categories/${categoryMatch[1]}`;
        }
    }

    // Pour les autres routes, préserver le chemin avec la locale
    // Enlever le slash initial si présent pour éviter les doubles slashes
    const cleanPath = pathWithoutLocale.startsWith('/') 
        ? pathWithoutLocale.substring(1) 
        : pathWithoutLocale;
    
    return `${localePrefix}/${cleanPath}`;
}

