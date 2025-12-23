// app/api/cart/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLocaleValue } from "@/app/actions/Woo-Coommerce/getWooCommerce";

const WC_STORE_URL = `${process.env.WP_BASE_URL}/wp-json/wc/store/v1`;

// Helper to parse set-cookie headers
function parseSetCookieHeader(header) {
    if (!header) return [];

    return header
        .split(/\s*,\s*(?=\w+=)/)
        .map(cookieStr => {
            const [nameValue, ...options] = cookieStr.split("; ");
            const [name, ...valueParts] = nameValue.split("=");
            const value = valueParts.join("=");
            return {
                name: name?.trim(),
                value: value?.trim(),
                options: options || []
            };
        })
        .filter(cookie => cookie.name && cookie.value);
}

// Extract WooCommerce cookies from cookie header string
function extractWooCommerceCookies(cookieHeader) {
    if (!cookieHeader) return '';

    const cookies = cookieHeader.split(';').map(c => c.trim());
    const wooCookies = cookies.filter(cookie => {
        const name = cookie.split('=')[0];
        return name.includes('woocommerce') ||
            name.includes('wordpress') ||
            name.includes('wp_') ||
            name.includes('wc_') ||
            name === 'PHPSESSID';
    });

    return wooCookies.join('; ');
}

export async function GET(request) {
    const localeValue = await getLocaleValue();
    const WC_STORE_URL = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/v1`;
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        // Priority: Read cookies directly from the incoming request (browser)
        // This ensures we get the most up-to-date cookies from the browser
        const incomingCookieHeader = request.headers.get("cookie") || "";

        // Debug: Log cookie presence
        const hasWooCommerceCookies = incomingCookieHeader.includes('woocommerce') ||
            incomingCookieHeader.includes('wc_') ||
            incomingCookieHeader.includes('PHPSESSID');

        if (!hasWooCommerceCookies && !token) {
            console.warn('No WooCommerce cookies found in request - cart may be empty');
        }

        // Use the full incoming cookie header - the browser sends all cookies
        // WooCommerce will filter what it needs from the Cookie header
        const allCookies = incomingCookieHeader;

        // Build headers for WooCommerce request
        const headers = {
            "Accept": "application/json",
        };

        // If user is logged in, include authentication token
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Always include cookies for session management
        if (allCookies) {
            headers["Cookie"] = allCookies;
        }

        // Make request to WooCommerce
        const response = await fetch(`${WC_STORE_URL}/cart`, {
            method: "GET",
            headers,
            cache: "no-store",
        });

        // Parse and set any new cookies from WooCommerce response
        // This is CRITICAL for cart persistence - cookies must be synced
        const responseHeaders = new Headers();

        // Get all Set-Cookie headers from WooCommerce response
        // Modern fetch API supports getSetCookie() method
        let setCookieHeaders = [];
        if (typeof response.headers.getSetCookie === 'function') {
            setCookieHeaders = response.headers.getSetCookie();
        } else {
            // Fallback for older implementations
            const setCookieHeader = response.headers.get("set-cookie");
            if (setCookieHeader) {
                setCookieHeaders = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
            }
        }

        // Forward Set-Cookie headers to the client response
        // This ensures cookies are sent to the browser
        if (setCookieHeaders.length > 0) {
            setCookieHeaders.forEach(header => {
                responseHeaders.append("Set-Cookie", header);
            });
        }

        // Also parse and set cookies in Next.js cookie store for server-side access
        if (setCookieHeaders.length > 0) {
            const setCookieHeader = setCookieHeaders.join(', ');

            // Also set cookies in Next.js cookie store for server-side access
            const parsedCookies = parseSetCookieHeader(setCookieHeader);
            const cookieStore = await cookies();

            for (const c of parsedCookies) {
                const cookieOpts = {
                    path: "/",
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production",
                    httpOnly: false,
                };

                let hasMaxAge = false;
                let hasExpires = false;

                // Parse cookie options from WooCommerce
                c.options.forEach(option => {
                    const [optName, optValue] = option.split("=");
                    const nameLower = optName?.toLowerCase();

                    switch (nameLower) {
                        case "httponly":
                            cookieOpts.httpOnly = true;
                            break;
                        case "secure":
                            cookieOpts.secure = true;
                            break;
                        case "samesite":
                            cookieOpts.sameSite = (optValue || "lax").toLowerCase();
                            break;
                        case "path":
                            cookieOpts.path = optValue || "/";
                            break;
                        case "max-age":
                            const maxAge = parseInt(optValue || "", 10);
                            if (!isNaN(maxAge) && maxAge > 0) {
                                cookieOpts.maxAge = maxAge;
                                hasMaxAge = true;
                            }
                            break;
                        case "expires":
                            const expiresDate = new Date(optValue || "");
                            if (!isNaN(expiresDate.getTime())) {
                                cookieOpts.expires = expiresDate;
                                hasExpires = true;
                            }
                            break;
                        case "domain":
                            // Note: domain can't be set via Next.js cookies() API
                            break;
                    }
                });

                // If no expiration is set, set a default maxAge to ensure cookies persist
                // WooCommerce session cookies should persist for at least 48 hours
                if (!hasMaxAge && !hasExpires) {
                    cookieOpts.maxAge = 60 * 60 * 48; // 48 hours in seconds
                }

                // Remove undefined values
                Object.keys(cookieOpts).forEach(key => {
                    if (cookieOpts[key] === undefined) {
                        delete cookieOpts[key];
                    }
                });

                // Set the cookie in Next.js cookie store (for server-side access)
                try {
                    cookieStore.set({
                        name: c.name,
                        value: c.value,
                        ...cookieOpts,
                    });
                } catch (cookieError) {
                    console.error(`Error setting cookie ${c.name}:`, cookieError);
                }
            }
        }

        if (!response.ok) {
            throw new Error(`Failed to get cart: ${response.status}`);
        }

        const cartData = await response.json();

        // Return response with Set-Cookie headers to ensure cookies are sent to browser
        return NextResponse.json(cartData, {
            headers: responseHeaders
        })

    } catch (error) {
        console.error("Get cart error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}



