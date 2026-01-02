// app/api/cart/remove-item/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLocaleValue, getCurrency, getBaseUrl } from "@/app/actions/Woo-Coommerce/getWooCommerce";

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

// Get WooCommerce cookies from the browser
async function getWooCommerceCookies() {
    try {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();

        // Filter WooCommerce/WP specific cookies
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

export async function POST(request) {
    const localeValue = await getLocaleValue();
    const baseUrl = await getBaseUrl();
    const WC_STORE_URL = localeValue 
        ? `${baseUrl}/${localeValue}/wp-json/wc/store/v1`
        : `${baseUrl}/wp-json/wc/store/v1`;

    try {
        // Get WooCommerce cookies from browser
        const wooCookieHeader = await getWooCommerceCookies();

        // Also include any other cookies from the incoming request
        const incomingCookieHeader = request.headers.get("cookie") || "";

        // Combine cookies (avoid duplicates)
        const allCookies = [wooCookieHeader, incomingCookieHeader]
            .filter(Boolean)
            .join('; ');

        // Get the item key, currency and nonce from request body
        const { key: itemKey, currency: clientCurrency, nonce: clientNonce } = await request.json();
        
        // Use currency from client if provided, otherwise fallback to server cookie
        const currency = clientCurrency || await getCurrency();
        
        // Add WCML currency cookie to the request for multi-currency support
        const wcmlCurrencyCookie = `wcml_client_currency=${currency}`;
        const cookiesWithWcml = allCookies 
            ? `${allCookies}; ${wcmlCurrencyCookie}` 
            : wcmlCurrencyCookie;

        if (!itemKey) {
            return NextResponse.json({
                success: false,
                error: "Item key is required"
            }, { status: 400 });
        }

        console.log('Removing item with key:', itemKey);
        console.log('Using currency:', currency);

        // Make request to WooCommerce Store API to remove item
        const removeItemUrl = `${WC_STORE_URL}/cart/remove-item?key=${encodeURIComponent(itemKey)}&currency=${currency}`;
        console.log('Remove item URL:', removeItemUrl);

        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(cookiesWithWcml ? { "Cookie": cookiesWithWcml } : {}),
        };
        
        // Add nonce header if provided by client
        if (clientNonce) {
            headers["Nonce"] = clientNonce;
            headers["X-WC-Store-API-Nonce"] = clientNonce;
        }

        const response = await fetch(removeItemUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ key: itemKey }),
            cache: "no-store",
        });

        // Get response text for debugging
        const responseText = await response.text();
        console.log('WooCommerce response status:', response.status);
        
        if (!response.ok) {
            console.log('WooCommerce response body:', responseText);
            let errorMessage = `Failed to remove item: ${response.status}`;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorData.code || errorMessage;
            } catch {
                errorMessage = responseText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const data = JSON.parse(responseText);

        // Create the response
        const jsonResponse = NextResponse.json({
            success: true,
            message: "Item removed from cart",
            data: data,
            cookiesReceived: allCookies ? true : false
        });

        // Parse and set any new cookies from WooCommerce response
        const setCookieHeader = response.headers.get("set-cookie");
        if (setCookieHeader) {
            const parsedCookies = parseSetCookieHeader(setCookieHeader);
            const cookieStore = await cookies();

            for (const c of parsedCookies) {
                const cookieOpts = {
                    path: "/",
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production",
                    httpOnly: false,
                };

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
                            if (!isNaN(maxAge)) cookieOpts.maxAge = maxAge;
                            break;
                        case "expires":
                            const expiresDate = new Date(optValue || "");
                            if (!isNaN(expiresDate.getTime())) cookieOpts.expires = expiresDate;
                            break;
                        case "domain":
                            // Note: domain can't be set via Next.js cookies() API
                            break;
                    }
                });

                // Set the cookie in Next.js cookie store
                cookieStore.set({
                    name: c.name,
                    value: c.value,
                    ...cookieOpts,
                });

                // Also append the cookie to the response headers for browser
                const cookieValue = `${c.name}=${c.value}; Path=${cookieOpts.path}; SameSite=${cookieOpts.sameSite}${cookieOpts.secure ? '; Secure' : ''}${cookieOpts.maxAge ? `; Max-Age=${cookieOpts.maxAge}` : ''}`;
                jsonResponse.headers.append('Set-Cookie', cookieValue);
            }
        }

        return jsonResponse;

    } catch (error) {
        console.error("Remove cart item error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

