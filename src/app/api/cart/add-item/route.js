// app/api/cart/add-item/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const WC_STORE_URL = `${process.env.WP_BASE_URL}/wp-json/wc/store/v1`;

// Helper to parse set-cookie headers (same as before)
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

// Get WooCommerce cookies from the browser (same as before)
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

// Helper to extract string value from object
function extractStringValue(value) {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    if (value === null || value === undefined) return '';

    // Handle object
    if (typeof value === 'object') {
        // Try common object properties
        if (value.value !== undefined) return extractStringValue(value.value);
        if (value.name !== undefined) return extractStringValue(value.name);
        if (value.label !== undefined) return extractStringValue(value.label);
        if (value.id !== undefined) return extractStringValue(value.id);
        if (value.slug !== undefined) return extractStringValue(value.slug);

        // If it's an array, join with comma
        if (Array.isArray(value)) return value.map(v => extractStringValue(v)).join(', ');

        // Last resort: stringify
        try {
            return JSON.stringify(value);
        } catch {
            return '';
        }
    }

    return String(value || '');
}

export async function POST(request) {
    try {
        // Get WooCommerce cookies from browser
        const wooCookieHeader = await getWooCommerceCookies();

        // Also include any other cookies from the incoming request
        const incomingCookieHeader = request.headers.get("cookie") || "";

        // Combine cookies (avoid duplicates)
        const allCookies = [wooCookieHeader, incomingCookieHeader]
            .filter(Boolean)
            .join('; ');

        // Get the payload from request body
        const body = await request.json();
        const { id: productId, quantity = 1, variation_id: variationId, variation = {} } = body;

        // Debug logging
        console.log('Received body:', JSON.stringify(body, null, 2));
        console.log('Variation raw:', variation);
        console.log('Variation type:', typeof variation);

        if (!productId) {
            return NextResponse.json({
                success: false,
                error: "Product ID is required"
            }, { status: 400 });
        }

        if (!quantity || quantity < 1) {
            return NextResponse.json({
                success: false,
                error: "Quantity must be at least 1"
            }, { status: 400 });
        }

        // Build payload for WooCommerce
        const payload = {
            id: parseInt(productId),
            quantity: parseInt(quantity),
        };

        if (variationId) {
            payload.variation_id = parseInt(variationId);
        }

        // Handle variations - FIXED VERSION
        if (variation) {
            // Case 1: Variation is already an array (from your log)
            if (Array.isArray(variation)) {
                console.log('Variation is an array');
                payload.variation = variation.map(item => {
                    // Extract attribute name
                    let attribute = '';
                    if (item.attribute !== undefined) {
                        attribute = String(item.attribute);
                    } else if (item.name !== undefined) {
                        attribute = String(item.name);
                    } else if (item.key !== undefined) {
                        attribute = String(item.key);
                    }

                    // Extract value
                    const value = extractStringValue(item.value);

                    console.log(`Processed: attribute="${attribute}", value="${value}"`);
                    return { attribute, value };
                }).filter(item => item.attribute && item.value);
            }
            // Case 2: Variation is an object with key-value pairs
            else if (typeof variation === 'object') {
                console.log('Variation is an object');
                payload.variation = Object.entries(variation)
                    .map(([attribute, value]) => {
                        const stringValue = extractStringValue(value);
                        console.log(`Processed: attribute="${attribute}", value="${stringValue}"`);
                        return {
                            attribute: String(attribute),
                            value: stringValue
                        };
                    })
                    .filter(item => item.attribute && item.value);
            }
        }

        console.log('Final payload:', JSON.stringify(payload, null, 2));

        // Make request to WooCommerce to add item
        const response = await fetch(`${WC_STORE_URL}/cart/add-item`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(allCookies ? { "Cookie": allCookies } : {}),
            },
            body: JSON.stringify(payload),
            cache: "no-store",
        });

        // Get response text for debugging
        const responseText = await response.text();
        console.log('WooCommerce response status:', response.status);
        console.log('WooCommerce response body:', responseText);

        if (!response.ok) {
            // Try to parse error from response
            let errorMessage = `Failed to add item: ${response.status}`;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorData.code || errorMessage;
            } catch {
                errorMessage = responseText || errorMessage;
            }
            throw new Error(errorMessage);
        }

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

                // Set the cookie in the browser
                cookieStore.set({
                    name: c.name,
                    value: c.value,
                    ...cookieOpts,
                });
            }
        }

        const data = JSON.parse(responseText);
        return NextResponse.json({
            success: true,
            message: "Added to cart successfully",
            data: data,
            // For debugging
            cookiesReceived: allCookies ? true : false
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}