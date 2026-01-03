// app/api/cart/add-item/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLocaleValue, getCurrency } from "@/app/actions/Woo-Coommerce/getWooCommerce";


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
    const localeValue = await getLocaleValue();
    const WP_URL = `${process.env.WP_BASE_URL}`;
    const WC_STORE_URL = `${WP_URL}/wp-json/wc/store/v1`;
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
        const { id: productId, quantity = 1, variation_id: variationId, variation = {}, currency: clientCurrency } = body;
        
        // Use currency from client if provided, otherwise fallback to server cookie
        const currency = clientCurrency || await getCurrency();
        console.log('Using currency:', currency, '(from client:', !!clientCurrency, ')');
        
        // Add WCML currency cookie to the request for multi-currency support
        const wcmlCurrencyCookie = `wcml_client_currency=${currency}`;
        const cookiesWithWcml = allCookies 
            ? `${allCookies}; ${wcmlCurrencyCookie}` 
            : wcmlCurrencyCookie;

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
            currency: currency,
        };

        if (variationId) {
            payload.variation_id = parseInt(variationId);
        }

        // Handle variations - FIXED VERSION
        // For variable products, WooCommerce requires variation attributes even if variation_id is provided
        let variationArray = [];
        
        if (variation && typeof variation === 'object') {
            // Case 1: Variation is already an array
            if (Array.isArray(variation)) {
                console.log('Variation is an array with', variation.length, 'items');
                variationArray = variation.map(item => {
                    // Extract attribute name
                    let attribute = '';
                    if (item.attribute !== undefined) {
                        attribute = String(item.attribute);
                    } else if (item.name !== undefined) {
                        attribute = String(item.name);
                    } else if (item.key !== undefined) {
                        attribute = String(item.key);
                    }
                    
                    // Remove 'attribute_' prefix if present - WooCommerce expects just the attribute slug
                    if (attribute.startsWith('attribute_')) {
                        attribute = attribute.replace('attribute_', '');
                    }

                    // Extract value - check both value and option properties
                    const value = extractStringValue(item.value || item.option);

                    console.log(`Processed: attribute="${attribute}", value="${value}"`);
                    return { attribute, value };
                }).filter(item => item.attribute && item.value);
            }
            // Case 2: Variation is an object with key-value pairs
            else if (Object.keys(variation).length > 0) {
                console.log('Variation is an object with', Object.keys(variation).length, 'keys');
                variationArray = Object.entries(variation)
                    .map(([attribute, value]) => {
                        const stringValue = extractStringValue(value);
                        // Remove 'attribute_' prefix if present - WooCommerce expects just the attribute slug
                        let cleanAttribute = String(attribute);
                        if (cleanAttribute.startsWith('attribute_')) {
                            cleanAttribute = cleanAttribute.replace('attribute_', '');
                        }
                        console.log(`Processed: attribute="${cleanAttribute}", value="${stringValue}"`);
                        return {
                            attribute: cleanAttribute,
                            value: stringValue
                        };
                    })
                    .filter(item => item.attribute && item.value);
            }
        }
        
        // For variable products, variation attributes are required
        // But only throw error if variation object was explicitly empty
        if (variationId && variationArray.length === 0) {
            console.log('WARNING: Variable product without attributes. Variation object received:', variation);
            console.log('Variation keys:', Object.keys(variation || {}));
            // Instead of throwing error, try to proceed without attributes
            // WooCommerce might be able to resolve the variation from variation_id alone
            console.log('Attempting to add to cart with just variation_id...');
        }
        
        // Only add variation if we have valid attributes
        if (variationArray.length > 0) {
            payload.variation = variationArray;
        }

        // For variable products, ensure variation attributes are present
        if (variationId && (!payload.variation || payload.variation.length === 0)) {
            console.warn('Variation ID provided but no variation attributes found. This may cause an error.');
        }

        console.log('Final payload:', JSON.stringify(payload, null, 2));
        console.log('Variation attributes count:', payload.variation?.length || 0);

        // Make request to WooCommerce to add item (include currency param for WCML)
        const addItemUrl = `${WC_STORE_URL}/cart/add-item?currency=${currency}`;
        console.log('Add item URL:', addItemUrl);
        
        const response = await fetch(addItemUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(cookiesWithWcml ? { "Cookie": cookiesWithWcml } : {}),
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
        const data = JSON.parse(responseText);
        
        // Get nonce from response headers for future requests
        const nonce = response.headers.get("x-wc-store-api-nonce") || response.headers.get("nonce");
        
        // Create the response
        const jsonResponse = NextResponse.json({
            success: true,
            message: "Added to cart successfully",
            data: data,
            nonce: nonce, // Include nonce for client-side storage
            // For debugging
            cookiesReceived: allCookies ? true : false
        });

        // Forward WooCommerce cookies to the browser
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

                // Set the cookie in Next.js cookie store (for server-side access)
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
        console.error("Add to cart error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
