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
    const protectedRoutes = ["/my-account/*", "/my-account", "/orders"];

    const isAuthRoute = authRoutes.some(route => pathWithoutLocale.startsWith(route));
    const isProtectedRoute = protectedRoutes.some(route => pathWithoutLocale.startsWith(route));

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
    if (pathWithoutLocale === '/checkout') {
        const cartEmpty = await isCartEmpty(req);
        if (cartEmpty) {
            const cartUrl = new URL(`/${locale}/cart`, req.url);
            return NextResponse.redirect(cartUrl);
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