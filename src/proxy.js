// middleware.js
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const WP_URL = process.env.WP_BASE_URL || 'https://staging.afs-foiling.com/fr';
const WC_STORE_URL = `${WP_URL}/wp-json/wc/store/v1`;

// Get WooCommerce cookies from request
function getWooCommerceCookiesFromRequest(req) {
    try {
        const allCookies = req.cookies.getAll();
        const wooCookies = allCookies
            .filter(cookie =>
                cookie.name.includes('woocommerce') ||
                cookie.name.includes('wordpress') ||
                cookie.name.includes('wp_') ||
                cookie.name.includes('wc_') ||
                cookie.name === 'PHPSESSID'
            )
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
        return wooCookies;
    } catch (error) {
        console.error('Error getting WooCommerce cookies:', error);
        return '';
    }
}

// Check if cart is empty by checking cookies first, then API if needed
async function isCartEmpty(req) {
    try {
        const allCookies = req.cookies.getAll();

        // Quick check: if no WooCommerce session cookies at all, cart is likely empty
        const hasWooCommerceCookies = allCookies.some(cookie =>
            cookie.name.includes('woocommerce') ||
            cookie.name.includes('wc_') ||
            cookie.name === 'PHPSESSID'
        );

        if (!hasWooCommerceCookies) {
            return true; // No session cookies, cart is empty
        }

        // If we have cookies, make a quick API call to verify cart items
        const cookieHeader = getWooCommerceCookiesFromRequest(req);

        if (!cookieHeader) {
            return true; // No cookies to send, cart is empty
        }

        const response = await fetch(`${WC_STORE_URL}/cart`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            // If we can't fetch cart, assume it's empty for safety
            return true;
        }

        const cartData = await response.json();
        const items = cartData?.items || [];
        const itemsCount = cartData?.items_count || 0;

        // Cart is empty if no items or items_count is 0
        return items.length === 0 || itemsCount === 0;
    } catch (error) {
        console.error('Error checking cart:', error);
        // On error, assume cart is empty for safety
        return true;
    }
}

function isExpired(token) {
    try {
        const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64").toString()
        );
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

function getPathWithoutLocale(pathname, locales) {
    const segments = pathname.split('/');
    const firstSegment = segments[1];

    if (locales.includes(firstSegment)) {
        return pathname.replace(`/${firstSegment}`, '') || '/';
    }
    return pathname;
}

function getLocaleFromPath(pathname, locales, defaultLocale) {
    const segments = pathname.split('/');
    const firstSegment = segments[1];
    return locales.includes(firstSegment) ? firstSegment : defaultLocale;
}

export default async function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const locales = routing.locales;
    const defaultLocale = routing.defaultLocale;

    const locale = getLocaleFromPath(pathname, locales, defaultLocale);
    const pathWithoutLocale = getPathWithoutLocale(pathname, locales);

    // Authentication logic
    const token = req.cookies.get("auth_token")?.value;
    const validToken = token && !isExpired(token);

    const authRoutes = ["/login", "/signup"];
    const protectedRoutes = ["/my-account", "/my-account/logout", "/my-account/orders", "/my-account/payment-methods", "/my-account/reset-password", "/demande-sav", "/orders"];
    // Add handling for translated routes
    const translatedRoutes = {
        '/connexion': '/login',
        '/inscription': '/signup',
        '/mon-compte': '/my-account',
        '/mon-compte/commandes': '/my-account/orders',
        '/mon-compte/moyens-de-paiement': '/my-account/payment-methods',
        '/mon-compte/reinitialiser-mot-de-passe': '/my-account/reset-password',
        '/demande-sav': '/demande-sav',
        '/commandes': '/orders',
    };

    let checkPath = pathWithoutLocale;
    if (locale === 'fr' && translatedRoutes[pathWithoutLocale]) {
        checkPath = translatedRoutes[pathWithoutLocale];
    }

    const isAuthRoute = authRoutes.some(route => checkPath.startsWith(route));
    const isProtectedRoute = protectedRoutes.some(route => checkPath.startsWith(route));

    // Handle auth redirects
    if (isAuthRoute && validToken) {
        return NextResponse.redirect(new URL(`/${locale}/my-account`, req.url));
    }

    if (isProtectedRoute && !validToken) {
        const loginUrl = new URL(`/${locale}/login`, req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check if checkout route and cart is empty (checkout is accessible without login)
    // Only redirect if we're not already coming from cart page (to prevent redirect loops)
    if (pathWithoutLocale === '/checkout') {
        const referer = req.headers.get('referer') || '';
        const isComingFromCart = referer.includes('/cart');

        // Don't redirect if coming from cart page (user just clicked checkout button)
        // This prevents redirect loops when cart is being synced
        if (!isComingFromCart) {
            const cartEmpty = await isCartEmpty(req);
            if (cartEmpty) {
                const cartUrl = new URL(`/${locale}/cart`, req.url);
                return NextResponse.redirect(cartUrl);
            }
        }
    }

    // Handle language switch FIRST (before i18n middleware)
    // Only process if ?lang= parameter is present (user-initiated language change)
    const langParam = req.nextUrl.searchParams.get('lang');
    if (langParam && (langParam === 'en' || langParam === 'fr') && langParam !== locale) {
        // Check if we're on a product page (handle both /product/ and /produit/ routes)
        // Try pathWithoutLocale first, then fallback to full pathname
        let productMatch = pathWithoutLocale.match(/^\/(?:product|produit)\/(.+)$/);
        if (!productMatch) {
            // Fallback: check full pathname (useful when locale is in path)
            productMatch = pathname.match(/\/(?:product|produit)\/([^\/\?]+)/);
        }

        if (productMatch && productMatch[1]) {
            const currentSlug = productMatch[1].split('?')[0].split('#')[0]; // Remove query params and hash if any

            // Debug: log the detected slug
            console.log(`[Language Switch] Detected product slug: ${currentSlug}, from locale: ${locale}, to locale: ${langParam}, pathname: ${pathname}, pathWithoutLocale: ${pathWithoutLocale}`);

            // Only make API call when language is being changed
            try {
                const WP_BASE_URL = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WP_BASE_URL;
                if (WP_BASE_URL) {
                    const translateUrl = `${WP_BASE_URL}/wp-json/afs-wcml/v1/products/translate-slug?slug=${encodeURIComponent(currentSlug)}&target_lang=${langParam}`;

                    console.log(`[Language Switch] Calling product API: ${translateUrl}`);

                    // Use AbortController for timeout to prevent blocking
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout (increased for reliability)

                    const translateResponse = await fetch(translateUrl, {
                        cache: 'no-store', // Don't cache in middleware
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        signal: controller.signal,
                    });

                    console.log(`[Language Switch] Product Translate Response:`, translateResponse);

                    clearTimeout(timeoutId);

                    if (translateResponse && translateResponse.ok) {
                        const translation = await translateResponse.json();
                        console.log(`[Language Switch] Product API Response:`, JSON.stringify(translation, null, 2));

                        // Check if translation exists and has a slug
                        if (translation && translation.exists === true && translation.slug && translation.slug.trim() !== '') {
                            // Redirect to translated product with correct route
                            const baseUrl = new URL(req.url);
                            let targetPath;
                            if (langParam === 'fr') {
                                targetPath = `/fr/produit/${translation.slug}`;
                            } else {
                                // English - no locale prefix (as-needed mode)
                                targetPath = `/product/${translation.slug}`;
                            }
                            console.log(`[Language Switch] Redirecting to: ${targetPath}`);
                            const redirectUrl = new URL(targetPath, baseUrl.origin);
                            redirectUrl.searchParams.delete('lang');
                            // Preserve other query params
                            req.nextUrl.searchParams.forEach((value, key) => {
                                if (key !== 'lang') {
                                    redirectUrl.searchParams.set(key, value);
                                }
                            });
                            return NextResponse.redirect(redirectUrl, 307);
                        } else {
                            // Translation doesn't exist - log for debugging
                            console.warn(`[Language Switch] Product translation not found or invalid for slug ${currentSlug} to ${langParam}:`, translation);
                            // Redirect to home page if translation doesn't exist
                            const baseUrl = new URL(req.url);
                            const homePath = langParam === 'fr' ? '/fr' : '/';
                            const redirectUrl = new URL(homePath, baseUrl.origin);
                            redirectUrl.searchParams.delete('lang');
                            return NextResponse.redirect(redirectUrl, 307);
                        }
                    } else {
                        // Log error for debugging
                        const status = translateResponse?.status || 'unknown';
                        const errorText = translateResponse ? await translateResponse.text().catch(() => '') : 'No response';
                        console.error(`[Language Switch] API error: ${status} for slug ${currentSlug} to ${langParam}. Response: ${errorText}`);
                        // Redirect to home page on API error
                        const baseUrl = new URL(req.url);
                        const homePath = langParam === 'fr' ? '/fr' : '/';
                        const redirectUrl = new URL(homePath, baseUrl.origin);
                        redirectUrl.searchParams.delete('lang');
                        return NextResponse.redirect(redirectUrl, 307);
                    }
                }
            } catch (error) {
                // On timeout or error, log but don't block
                if (error.name !== 'AbortError') {
                    console.error('Error translating product slug:', error, 'for slug:', currentSlug, 'to:', langParam);
                }
                // Fallback: redirect to home page
                const baseUrl = new URL(req.url);
                const homePath = langParam === 'fr' ? '/fr' : '/';
                const redirectUrl = new URL(homePath, baseUrl.origin);
                redirectUrl.searchParams.delete('lang');
                return NextResponse.redirect(redirectUrl, 307);
            }
        }

        // Check if we're on a category page
        let categoryMatch = pathWithoutLocale.match(/^\/product-category\/(.+)$/);
        if (!categoryMatch) {
            // Fallback: check full pathname (useful when locale is in path)
            categoryMatch = pathname.match(/\/product-category\/(.+)$/);
        }

        if (categoryMatch && categoryMatch[1]) {
            const currentCategoryPath = categoryMatch[1].split('?')[0].split('#')[0]; // Remove query params and hash if any

            // Debug: log the detected category path
            console.log(`[Language Switch] Detected category path: ${currentCategoryPath}, from locale: ${locale}, to locale: ${langParam}, pathname: ${pathname}, pathWithoutLocale: ${pathWithoutLocale}`);

            // Only make API call when language is being changed
            try {
                const WP_BASE_URL = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WP_BASE_URL;
                if (WP_BASE_URL) {
                    const translateUrl = `${WP_BASE_URL}/wp-json/afs-wcml/v1/categories/translate-slug?slug=${encodeURIComponent(currentCategoryPath)}&target_lang=${langParam}`;

                    console.log(`[Language Switch] Calling category API: ${translateUrl}`);

                    // Use AbortController for timeout to prevent blocking
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

                    const translateResponse = await fetch(translateUrl, {
                        cache: 'no-store', // Don't cache in middleware
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        signal: controller.signal,
                    });

                    console.log(`[Language Switch] Category Translate Response:`, translateResponse);

                    clearTimeout(timeoutId);

                    if (translateResponse && translateResponse.ok) {
                        const translation = await translateResponse.json();
                        console.log(`[Language Switch] Category API Response:`, JSON.stringify(translation, null, 2));

                        // Check if translation exists and has a slug
                        if (translation && translation.exists === true && translation.slug && translation.slug.trim() !== '') {
                            // Redirect to translated category with correct route
                            const baseUrl = new URL(req.url);
                            let targetPath;
                            if (langParam === 'fr') {
                                targetPath = `/fr/product-category/${translation.slug}`;
                            } else {
                                // English - no locale prefix (as-needed mode)
                                targetPath = `/product-category/${translation.slug}`;
                            }
                            console.log(`[Language Switch] Redirecting to category: ${targetPath}`);
                            const redirectUrl = new URL(targetPath, baseUrl.origin);
                            redirectUrl.searchParams.delete('lang');
                            // Preserve other query params
                            req.nextUrl.searchParams.forEach((value, key) => {
                                if (key !== 'lang') {
                                    redirectUrl.searchParams.set(key, value);
                                }
                            });
                            return NextResponse.redirect(redirectUrl, 307);
                        } else {
                            // Translation doesn't exist - log for debugging
                            console.warn(`[Language Switch] Category translation not found or invalid for path ${currentCategoryPath} to ${langParam}:`, translation);
                            // Redirect to home page if translation doesn't exist
                            const baseUrl = new URL(req.url);
                            const homePath = langParam === 'fr' ? '/fr' : '/';
                            const redirectUrl = new URL(homePath, baseUrl.origin);
                            redirectUrl.searchParams.delete('lang');
                            return NextResponse.redirect(redirectUrl, 307);
                        }
                    } else {
                        // Log error for debugging
                        const status = translateResponse?.status || 'unknown';
                        const errorText = translateResponse ? await translateResponse.text().catch(() => '') : 'No response';
                        console.error(`[Language Switch] Category API error: ${status} for path ${currentCategoryPath} to ${langParam}. Response: ${errorText}`);
                        // Redirect to home page on API error
                        const baseUrl = new URL(req.url);
                        const homePath = langParam === 'fr' ? '/fr' : '/';
                        const redirectUrl = new URL(homePath, baseUrl.origin);
                        redirectUrl.searchParams.delete('lang');
                        return NextResponse.redirect(redirectUrl, 307);
                    }
                }
            } catch (error) {
                // On timeout or error, log but don't block
                if (error.name !== 'AbortError') {
                    console.error('Error translating category path:', error, 'for path:', currentCategoryPath, 'to:', langParam);
                }
                // Fallback: redirect to home page
                const baseUrl = new URL(req.url);
                const homePath = langParam === 'fr' ? '/fr' : '/';
                const redirectUrl = new URL(homePath, baseUrl.origin);
                redirectUrl.searchParams.delete('lang');
                return NextResponse.redirect(redirectUrl, 307);
            }
        }

        // For other pages (non-product, non-category), redirect to same path with new locale
        // NO API CALL - just redirect with locale change
        const pathWithoutLocaleClean = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
            let newPathname;
            if (langParam === 'en') {
                // English is default, no prefix needed (as-needed mode)
                // pathWithoutLocale already has /fr/ removed if it was there
                newPathname = pathWithoutLocaleClean || '/';
            } else {
                // French needs /fr/ prefix
                newPathname = `/${langParam}${pathWithoutLocaleClean === '/' ? '' : pathWithoutLocaleClean}`;
            }

            // Create redirect URL with absolute path
            const baseUrl = new URL(req.url);
            const redirectUrl = new URL(newPathname, baseUrl.origin);
            redirectUrl.searchParams.delete('lang');
            // Preserve other query params
            req.nextUrl.searchParams.forEach((value, key) => {
                if (key !== 'lang') {
                    redirectUrl.searchParams.set(key, value);
                }
            });
            return NextResponse.redirect(redirectUrl, 307);
    }

    // Handle product route redirections based on locale
    // Redirect /fr/product/ to /fr/produit/ for French locale
    if (locale === 'fr' && pathWithoutLocale.startsWith('/product/') && !pathWithoutLocale.startsWith('/produit/')) {
        const slug = pathWithoutLocale.replace('/product/', '').replace(/\/$/, '');
        if (slug) {
            const redirectUrl = new URL(`/fr/produit/${slug}`, req.url);
            redirectUrl.search = req.nextUrl.search;
            redirectUrl.searchParams.delete('lang');
            return NextResponse.redirect(redirectUrl, 308);
        }
    }

    // Redirect /produit/ to /product/ for English locale (when no /fr/ prefix)
    if (locale === 'en' && pathWithoutLocale.startsWith('/produit/') && !pathname.startsWith('/fr/')) {
        const slug = pathWithoutLocale.replace('/produit/', '').replace(/\/$/, '');
        if (slug) {
            const redirectUrl = new URL(`/product/${slug}`, req.url);
            redirectUrl.search = req.nextUrl.search;
            redirectUrl.searchParams.delete('lang');
            return NextResponse.redirect(redirectUrl, 308);
        }
    }

    // Check if product slug matches the current locale, if not, translate it
    // This handles cases like /fr/produit/wing-pump (English slug in French URL)
    let productMatchForTranslation = pathWithoutLocale.match(/^\/(?:product|produit)\/(.+)$/);
    if (!productMatchForTranslation) {
        productMatchForTranslation = pathname.match(/\/(?:product|produit)\/([^\/\?]+)/);
    }

    if (productMatchForTranslation && productMatchForTranslation[1] && !req.nextUrl.searchParams.has('lang')) {
        // Only check if we're not already in a language switch (to avoid loops)
        const currentSlug = productMatchForTranslation[1].split('?')[0].split('#')[0];
        
        try {
            const WP_BASE_URL = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WP_BASE_URL;
            if (WP_BASE_URL) {
                // Get translation for current locale - if slug is different, redirect
                const translateUrl = `${WP_BASE_URL}/wp-json/afs-wcml/v1/products/translate-slug?slug=${encodeURIComponent(currentSlug)}&target_lang=${locale}`;
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1500); // Shorter timeout for this check
                
                const translateResponse = await fetch(translateUrl, {
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (translateResponse && translateResponse.ok) {
                    const translation = await translateResponse.json();
                    
                    // If translation exists and slug is different, redirect to correct slug
                    if (translation && translation.exists === true && translation.slug && translation.slug.trim() !== '' && translation.slug !== currentSlug) {
                        // Redirect to the correct translated slug
                        const baseUrl = new URL(req.url);
                        let targetPath;
                        if (locale === 'fr') {
                            targetPath = `/fr/produit/${translation.slug}`;
                        } else {
                            targetPath = `/product/${translation.slug}`;
                        }
                        const redirectUrl = new URL(targetPath, baseUrl.origin);
                        redirectUrl.search = req.nextUrl.search;
                        console.log(`[Slug Translation] Redirecting ${currentSlug} to ${translation.slug} for locale ${locale}`);
                        return NextResponse.redirect(redirectUrl, 308);
                    }
                }
            }
        } catch (error) {
            // Silently fail - don't block the request if translation check fails
            if (error.name !== 'AbortError') {
                console.error('Error checking product slug translation:', error);
            }
        }
    }

    // Run i18n middleware
    return intlMiddleware(req);
}

export const config = {
    matcher: [
        '/((?!_next|_vercel|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
    ],
};