// middleware.js
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

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
    const protectedRoutes = ["/my-profile", "/checkout", "/orders"];

    const isAuthRoute = authRoutes.some(route => pathWithoutLocale.startsWith(route));
    const isProtectedRoute = protectedRoutes.some(route => pathWithoutLocale.startsWith(route));

    // Handle auth redirects
    if (isAuthRoute && validToken) {
        return NextResponse.redirect(new URL(`/${locale}/my-profile`, req.url));
    }

    if (isProtectedRoute && !validToken) {
        const loginUrl = new URL(`/${locale}/login`, req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Run i18n middleware
    return intlMiddleware(req);
}

export const config = {
    matcher: [
        '/((?!_next|_vercel|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
    ],
};