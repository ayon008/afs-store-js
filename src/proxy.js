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

    // Check if checkout route and cart is empty
    if (pathWithoutLocale === '/checkout') {
        const referer = req.headers.get('referer') || '';
        const isComingFromCart = referer.includes('/cart');

        if (!isComingFromCart) {
            const cartEmpty = await isCartEmpty(req);
            if (cartEmpty) {
                const cartUrl = new URL(`/${locale}/cart`, req.url);
                return NextResponse.redirect(cartUrl);
            }
        }
    }

    // Handle language switch FIRST (before i18n middleware)
    const langParam = req.nextUrl.searchParams.get('lang');
    if (langParam && (langParam === 'en' || langParam === 'fr') && langParam !== locale) {
        
        // Check if we're on a product page
        let productMatch = pathWithoutLocale.match(/^\/(?:product|produit)\/(.+)$/);
        if (!productMatch) {
            productMatch = pathname.match(/\/(?:product|produit)\/([^\/\?]+)/);
        }

        if (productMatch && productMatch[1]) {
            const currentSlug = productMatch[1].split('?')[0].split('#')[0];
            console.log(`[Language Switch] Detected product slug: ${currentSlug}, from locale: ${locale}, to locale: ${langParam}`);

            try {
                const WP_BASE_URL = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WP_BASE_URL;
                if (WP_BASE_URL) {
                    const translateUrl = `${WP_BASE_URL}/wp-json/afs-wcml/v1/products/translate-slug?slug=${encodeURIComponent(currentSlug)}&target_lang=${langParam}`;
                    console.log(`[Language Switch] Calling product API: ${translateUrl}`);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000);

                    const translateResponse = await fetch(translateUrl, {
                        cache: 'no-store',
                        headers: { 'Content-Type': 'application/json' },
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (translateResponse && translateResponse.ok) {
                        const translation = await translateResponse.json();
                        console.log(`[Language Switch] Product API Response:`, JSON.stringify(translation, null, 2));

                        if (translation && translation.exists === true && translation.slug && translation.slug.trim() !== '') {
                            const baseUrl = new URL(req.url);
                            let targetPath;
                            if (langParam === 'fr') {
                                targetPath = `/fr/produit/${translation.slug}`;
                            } else {
                                targetPath = `/product/${translation.slug}`;
                            }
                            console.log(`[Language Switch] Redirecting to product: ${targetPath}`);
                            const redirectUrl = new URL(targetPath, baseUrl.origin);
                            redirectUrl.searchParams.delete('lang');
                            req.nextUrl.searchParams.forEach((value, key) => {
                                if (key !== 'lang') {
                                    redirectUrl.searchParams.set(key, value);
                                }
                            });
                            return NextResponse.redirect(redirectUrl, 307);
                        } else {
                            console.warn(`[Language Switch] Product translation not found for slug ${currentSlug} to ${langParam}`);
                            const baseUrl = new URL(req.url);
                            const homePath = langParam === 'fr' ? '/fr' : '/';
                            const redirectUrl = new URL(homePath, baseUrl.origin);
                            redirectUrl.searchParams.delete('lang');
                            return NextResponse.redirect(redirectUrl, 307);
                        }
                    } else {
                        const status = translateResponse?.status || 'unknown';
                        console.error(`[Language Switch] Product API error: ${status} for slug ${currentSlug} to ${langParam}`);
                        const baseUrl = new URL(req.url);
                        const homePath = langParam === 'fr' ? '/fr' : '/';
                        const redirectUrl = new URL(homePath, baseUrl.origin);
                        redirectUrl.searchParams.delete('lang');
                        return NextResponse.redirect(redirectUrl, 307);
                    }
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error translating product slug:', error);
                }
                const baseUrl = new URL(req.url);
                let targetPath;
                if (langParam === 'fr') {
                    targetPath = `/fr/produit/${currentSlug}`;
                } else {
                    targetPath = `/product/${currentSlug}`;
                }
                const redirectUrl = new URL(targetPath, baseUrl.origin);
                redirectUrl.searchParams.delete('lang');
                return NextResponse.redirect(redirectUrl, 307);
            }
        }

        // Check if we're on a product-category page
        let categoryMatch = pathWithoutLocale.match(/^\/(?:product-category|categorie-produit)\/(.+)$/);
        if (!categoryMatch) {
            categoryMatch = pathname.match(/\/(?:product-category|categorie-produit)\/([^\/\?]+(?:\/[^\/\?]+)*)/);
        }

        if (categoryMatch && categoryMatch[1]) {
            const currentCategorySlug = categoryMatch[1].split('?')[0].split('#')[0];
            console.log(`[Language Switch] Detected category slug: ${currentCategorySlug}, from locale: ${locale}, to locale: ${langParam}`);

            try {
                const WP_BASE_URL = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WP_BASE_URL;
                if (WP_BASE_URL) {
                    const translateUrl = `${WP_BASE_URL}/wp-json/afs-wcml/v1/categories/translate-slug?slug=${encodeURIComponent(currentCategorySlug)}&target_lang=${langParam}`;
                    console.log(`[Language Switch] Calling category API: ${translateUrl}`);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000);

                    const translateResponse = await fetch(translateUrl, {
                        cache: 'no-store',
                        headers: { 'Content-Type': 'application/json' },
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (translateResponse && translateResponse.ok) {
                        const translation = await translateResponse.json();
                        console.log(`[Language Switch] Category API Response:`, JSON.stringify(translation, null, 2));

                        if (translation && translation.exists === true && translation.slug && translation.slug.trim() !== '') {
                            const baseUrl = new URL(req.url);
                            let targetPath;
                            if (langParam === 'fr') {
                                targetPath = `/fr/categorie-produit/${translation.slug}`;
                            } else {
                                targetPath = `/product-category/${translation.slug}`;
                            }
                            console.log(`[Language Switch] Redirecting to category: ${targetPath}`);
                            const redirectUrl = new URL(targetPath, baseUrl.origin);
                            redirectUrl.searchParams.delete('lang');
                            req.nextUrl.searchParams.forEach((value, key) => {
                                if (key !== 'lang') {
                                    redirectUrl.searchParams.set(key, value);
                                }
                            });
                            return NextResponse.redirect(redirectUrl, 307);
                        } else {
                            console.warn(`[Language Switch] Category translation not found for slug ${currentCategorySlug} to ${langParam}, using same slug`);
                            const baseUrl = new URL(req.url);
                            let targetPath;
                            if (langParam === 'fr') {
                                targetPath = `/fr/categorie-produit/${currentCategorySlug}`;
                            } else {
                                targetPath = `/product-category/${currentCategorySlug}`;
                            }
                            const redirectUrl = new URL(targetPath, baseUrl.origin);
                            redirectUrl.searchParams.delete('lang');
                            req.nextUrl.searchParams.forEach((value, key) => {
                                if (key !== 'lang') {
                                    redirectUrl.searchParams.set(key, value);
                                }
                            });
                            return NextResponse.redirect(redirectUrl, 307);
                        }
                    } else {
                        const status = translateResponse?.status || 'unknown';
                        console.error(`[Language Switch] Category API error: ${status} for slug ${currentCategorySlug} to ${langParam}, using same slug`);
                        const baseUrl = new URL(req.url);
                        let targetPath;
                        if (langParam === 'fr') {
                            targetPath = `/fr/categorie-produit/${currentCategorySlug}`;
                        } else {
                            targetPath = `/product-category/${currentCategorySlug}`;
                        }
                        const redirectUrl = new URL(targetPath, baseUrl.origin);
                        redirectUrl.searchParams.delete('lang');
                        req.nextUrl.searchParams.forEach((value, key) => {
                            if (key !== 'lang') {
                                redirectUrl.searchParams.set(key, value);
                            }
                        });
                        return NextResponse.redirect(redirectUrl, 307);
                    }
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error translating category slug:', error);
                }
                const baseUrl = new URL(req.url);
                let targetPath;
                if (langParam === 'fr') {
                    targetPath = `/fr/categorie-produit/${currentCategorySlug}`;
                } else {
                    targetPath = `/product-category/${currentCategorySlug}`;
                }
                const redirectUrl = new URL(targetPath, baseUrl.origin);
                redirectUrl.searchParams.delete('lang');
                return NextResponse.redirect(redirectUrl, 307);
            }
        }

        // Check if we're on a blog page
        let blogMatch = pathWithoutLocale.match(/^\/blog\/(.+)$/);
        if (!blogMatch) {
            blogMatch = pathname.match(/\/blog\/([^\/\?]+)/);
        }

        if (blogMatch && blogMatch[1]) {
            const currentSlug = blogMatch[1].split('?')[0].split('#')[0];
            console.log(`[Language Switch] Detected blog slug: ${currentSlug}, from locale: ${locale}, to locale: ${langParam}`);

            try {
                const WP_BASE_URL = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WP_BASE_URL;
                if (WP_BASE_URL) {
                    const translateUrl = `${WP_BASE_URL}/wp-json/afs-wpml/v1/posts/translate-slug?slug=${encodeURIComponent(currentSlug)}&target_lang=${langParam}`;
                    console.log(`[Language Switch] Calling blog API: ${translateUrl}`);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000);

                    const translateResponse = await fetch(translateUrl, {
                        cache: 'no-store',
                        headers: { 'Content-Type': 'application/json' },
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (translateResponse && translateResponse.ok) {
                        const translation = await translateResponse.json();
                        console.log(`[Language Switch] Blog API Response:`, JSON.stringify(translation, null, 2));

                        if (translation && translation.exists === true && translation.slug && translation.slug.trim() !== '') {
                            const baseUrl = new URL(req.url);
                            let targetPath;
                            if (langParam === 'fr') {
                                targetPath = `/fr/blog/${translation.slug}`;
                            } else {
                                targetPath = `/blog/${translation.slug}`;
                            }
                            console.log(`[Language Switch] Redirecting to blog: ${targetPath}`);
                            const redirectUrl = new URL(targetPath, baseUrl.origin);
                            redirectUrl.searchParams.delete('lang');
                            req.nextUrl.searchParams.forEach((value, key) => {
                                if (key !== 'lang') {
                                    redirectUrl.searchParams.set(key, value);
                                }
                            });
                            return NextResponse.redirect(redirectUrl, 307);
                        } else {
                            console.warn(`[Language Switch] Blog translation not found for slug ${currentSlug} to ${langParam}, using same slug`);
                            const baseUrl = new URL(req.url);
                            let targetPath;
                            if (langParam === 'fr') {
                                targetPath = `/fr/blog/${currentSlug}`;
                            } else {
                                targetPath = `/blog/${currentSlug}`;
                            }
                            const redirectUrl = new URL(targetPath, baseUrl.origin);
                            redirectUrl.searchParams.delete('lang');
                            req.nextUrl.searchParams.forEach((value, key) => {
                                if (key !== 'lang') {
                                    redirectUrl.searchParams.set(key, value);
                                }
                            });
                            return NextResponse.redirect(redirectUrl, 307);
                        }
                    } else {
                        const status = translateResponse?.status || 'unknown';
                        console.error(`[Language Switch] Blog API error: ${status} for slug ${currentSlug} to ${langParam}, using same slug`);
                        const baseUrl = new URL(req.url);
                        let targetPath;
                        if (langParam === 'fr') {
                            targetPath = `/fr/blog/${currentSlug}`;
                        } else {
                            targetPath = `/blog/${currentSlug}`;
                        }
                        const redirectUrl = new URL(targetPath, baseUrl.origin);
                        redirectUrl.searchParams.delete('lang');
                        req.nextUrl.searchParams.forEach((value, key) => {
                            if (key !== 'lang') {
                                redirectUrl.searchParams.set(key, value);
                            }
                        });
                        return NextResponse.redirect(redirectUrl, 307);
                    }
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error translating blog slug:', error);
                }
                const baseUrl = new URL(req.url);
                let targetPath;
                if (langParam === 'fr') {
                    targetPath = `/fr/blog/${currentSlug}`;
                } else {
                    targetPath = `/blog/${currentSlug}`;
                }
                const redirectUrl = new URL(targetPath, baseUrl.origin);
                redirectUrl.searchParams.delete('lang');
                return NextResponse.redirect(redirectUrl, 307);
            }
        }

        // For non-product/category/blog pages, redirect to same path with new locale
        const pathWithoutLocaleClean = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
        let newPathname;
        if (langParam === 'en') {
            newPathname = pathWithoutLocaleClean || '/';
        } else {
            newPathname = `/${langParam}${pathWithoutLocaleClean === '/' ? '' : pathWithoutLocaleClean}`;
        }

        const baseUrl = new URL(req.url);
        const redirectUrl = new URL(newPathname, baseUrl.origin);
        redirectUrl.searchParams.delete('lang');
        req.nextUrl.searchParams.forEach((value, key) => {
            if (key !== 'lang') {
                redirectUrl.searchParams.set(key, value);
            }
        });
        return NextResponse.redirect(redirectUrl, 307);
    }

    // Handle product route redirections based on locale
    if (locale === 'fr' && pathWithoutLocale.startsWith('/product/') && !pathWithoutLocale.startsWith('/produit/')) {
        const slug = pathWithoutLocale.replace('/product/', '').replace(/\/$/, '');
        if (slug) {
            const redirectUrl = new URL(`/fr/produit/${slug}`, req.url);
            redirectUrl.search = req.nextUrl.search;
            redirectUrl.searchParams.delete('lang');
            return NextResponse.redirect(redirectUrl, 308);
        }
    }

    if (locale === 'en' && pathWithoutLocale.startsWith('/produit/') && !pathname.startsWith('/fr/')) {
        const slug = pathWithoutLocale.replace('/produit/', '').replace(/\/$/, '');
        if (slug) {
            const redirectUrl = new URL(`/product/${slug}`, req.url);
            redirectUrl.search = req.nextUrl.search;
            redirectUrl.searchParams.delete('lang');
            return NextResponse.redirect(redirectUrl, 308);
        }
    }

    // Handle product-category route redirections for English
    if (locale === 'en' && pathWithoutLocale.startsWith('/categorie-produit/') && !pathname.startsWith('/fr/')) {
        const slugPath = pathWithoutLocale.replace('/categorie-produit/', '');
        if (slugPath) {
            const redirectUrl = new URL(`/product-category/${slugPath}`, req.url);
            redirectUrl.search = req.nextUrl.search;
            redirectUrl.searchParams.delete('lang');
            return NextResponse.redirect(redirectUrl, 308);
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