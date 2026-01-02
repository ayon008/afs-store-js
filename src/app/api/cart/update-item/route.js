// app/api/cart/update-item/route.js
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
    
    // Use WooCommerce Store API (same as remove-item for session consistency)
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

        // Get the item key, quantity, currency and nonce from request body
        const { key: itemKey, quantity, currency: clientCurrency, nonce: clientNonce } = await request.json();
        
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

        if (quantity === undefined || quantity < 1) {
            return NextResponse.json({
                success: false,
                error: "Quantity must be at least 1"
            }, { status: 400 });
        }

        console.log('Updating item with key:', itemKey, 'to quantity:', quantity);
        console.log('Using currency:', currency);

        // Make request to WooCommerce Store API to update item (same pattern as remove-item)
        const updateItemUrl = `${WC_STORE_URL}/cart/update-item?key=${encodeURIComponent(itemKey)}&quantity=${quantity}&currency=${currency}`;
        console.log('Update item URL:', updateItemUrl);

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

        const response = await fetch(updateItemUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ key: itemKey, quantity: parseInt(quantity) }),
            cache: "no-store",
        });

        // Get response text for debugging
        const responseText = await response.text();
        console.log('WooCommerce response status:', response.status);
        
        if (!response.ok) {
            console.log('WooCommerce response body:', responseText);
            let errorMessage = `Failed to update item: ${response.status}`;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorData.code || errorMessage;
            } catch {
                errorMessage = responseText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const data = JSON.parse(responseText);

        // Get new nonce from response for future requests
        const newNonce = response.headers.get("x-wc-store-api-nonce") || response.headers.get("nonce");

        // Create the response
        const jsonResponse = NextResponse.json({
            success: true,
            message: "Cart updated successfully",
            data: data,
            nonce: newNonce,
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
        console.error("Update cart item error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
