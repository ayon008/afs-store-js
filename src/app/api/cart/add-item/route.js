// app/api/cart/add-item/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLocaleValue, getCurrency, getLocation } from "@/app/actions/Woo-Coommerce/getWooCommerce";


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

        // Filter WooCommerce/WP specific cookies AND location cookies
        // The WCMLIM plugin reads from wcmlim_selected_location and wcmlim_selected_location_termid
        const wooCookies = allCookies
            .filter(cookie =>
                cookie.name.includes('woocommerce') ||
                cookie.name.includes('wordpress') ||
                cookie.name.includes('wp_') ||
                cookie.name.includes('wc_') ||
                cookie.name.includes('wcmlim') || // Include WCMLIM plugin cookies
                cookie.name === 'PHPSESSID' ||
                cookie.name === 'location' // Include location cookie
            )
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        return wooCookies;
    } catch (error) {
        console.error('Error getting WooCommerce cookies:', error);
        return '';
    }
}

// Set location in WooCommerce session (required by Multi-Locations-Inventory-Management plugin)
async function setLocationInSession(location, cookiesWithWcml, WC_STORE_URL) {
    try {
        // Update customer session with location via update-customer endpoint
        // The location cookie in the headers will be read by the plugin
        // Also try to pass location in the body as metadata (some plugins read from body)
        const updateResponse = await fetch(`${WC_STORE_URL}/cart/update-customer?location=${location}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(cookiesWithWcml ? { "Cookie": cookiesWithWcml } : {}),
            },
            body: JSON.stringify({
                billing_address: {
                    // Minimal address data, location cookie in headers will be read by plugin
                },
                shipping_address: {
                    // Minimal address data
                },
                // Try to pass location in metadata (some plugins might read from here)
                meta_data: [
                    {
                        key: 'location',
                        value: location
                    }
                ]
            }),
            cache: "no-store",
        });

        if (!updateResponse.ok) {
            return false;
        }

        // After updating customer, fetch the cart to initialize the session properly
        // This ensures the plugin reads the location cookie and sets it in the session
        const cartResponse = await fetch(`${WC_STORE_URL}/cart`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                ...(cookiesWithWcml ? { "Cookie": cookiesWithWcml } : {}),
            },
            cache: "no-store",
        });

        return cartResponse.ok;
    } catch (error) {
        console.error('Error setting location in session:', error);
        return false;
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
    const WC_STORE_URL = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/v1`;
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
        const { id: productId, quantity = 1, variation_id: variationId, variation = {}, location: bodyLocation } = body;

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

        // Always use the site currency (from cookie) to ensure consistency
        const cookieCurrency = await getCurrency();
        // Convert cookie currency format (euro/usd/gbp) to currency code (EUR/USD/GBP)
        let currencyToUse = cookieCurrency;
        if (currencyToUse === 'euro') currencyToUse = 'EUR';
        else if (currencyToUse === 'usd') currencyToUse = 'USD';
        else if (currencyToUse === 'gbp') currencyToUse = 'GBP';
        else currencyToUse = 'EUR'; // Default to EUR
        
        // Ensure currency is in uppercase format
        currencyToUse = currencyToUse.toUpperCase();

        // Get location from body (preferred) or cookies (required by WooCommerce, from "Available Store Location" modal)
        // The bodyLocation takes precedence if provided in the request
        const cookieLocation = await getLocation();
        const location = bodyLocation || cookieLocation || '2682'; // Default to '2682' (Europe) if not set

        // Build payload for WooCommerce
        const payload = {
            id: parseInt(productId),
            quantity: parseInt(quantity),
            currency: currencyToUse, // Include currency in payload
            location: parseInt(location) || parseInt('2682') // Convert to integer (required by Multi-Locations-Inventory-Management plugin)
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

        // Add WCML currency cookie for multi-currency support
        const wcmlCurrencyCookie = `wcml_client_currency=${currencyToUse}`;
        
        // Build cookies string with currency and location
        let cookiesWithWcml = allCookies || '';
        if (wcmlCurrencyCookie) {
            cookiesWithWcml = cookiesWithWcml 
                ? `${cookiesWithWcml}; ${wcmlCurrencyCookie}` 
                : wcmlCurrencyCookie;
        }
        
        // Add location cookies (required by WooCommerce-Multi-Locations-Inventory-Management plugin)
        // The plugin reads from cookies: wcmlim_selected_location (index) and wcmlim_selected_location_termid (term ID)
        // We have the term ID in the 'location' cookie, so we set wcmlim_selected_location_termid
        const locationCookie = `location=${location}`;
        const wcmlimLocationTermIdCookie = `wcmlim_selected_location_termid=${location}`;
        cookiesWithWcml = cookiesWithWcml
            ? `${cookiesWithWcml}; ${locationCookie}; ${wcmlimLocationTermIdCookie}`
            : `${locationCookie}; ${wcmlimLocationTermIdCookie}`;

        // Set location in WooCommerce session BEFORE adding item
        // This is required by WooCommerce-Multi-Locations-Inventory-Management plugin
        if (location) {
            // First, initialize the session by fetching the cart
            // This ensures the WooCommerce session is created
            try {
                await fetch(`${WC_STORE_URL}/cart`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        ...(cookiesWithWcml ? { "Cookie": cookiesWithWcml } : {}),
                    },
                    cache: "no-store",
                });
            } catch (error) {
                console.warn('Failed to initialize cart session:', error);
            }

            // Then, ensure location is set in the session
            // We'll call update-customer with minimal data to establish the session
            // The location cookie will be read by the plugin from the Cookie header
            const locationSet = await setLocationInSession(location, cookiesWithWcml, WC_STORE_URL);
            if (!locationSet) {
                console.warn('Failed to set location in session, continuing anyway...');
            }
            
            // Small delay to ensure session is updated and plugin processes location
            await new Promise(resolve => setTimeout(resolve, 300)); // Increased from 100ms to 300ms
        }

        // Make request to WooCommerce to add item
        // Include location as query parameter as well (some plugins read from query params)
        const addItemUrl = `${WC_STORE_URL}/cart/add-item${location ? `?location=${location}` : ''}`;
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

        // Parse and forward Set-Cookie headers from WooCommerce response to the browser
        // This is CRITICAL for session persistence
        const responseHeaders = new Headers();

        // Get all Set-Cookie headers from WooCommerce response
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
        if (setCookieHeaders.length > 0) {
            setCookieHeaders.forEach(header => {
                responseHeaders.append("Set-Cookie", header);
            });

            // Also set cookies in Next.js cookie store for server-side access
            const setCookieHeader = setCookieHeaders.join(', ');
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
            }
        }

        const data = JSON.parse(responseText);
        return NextResponse.json({
            success: true,
            message: "Added to cart successfully",
            data: data,
            // For debugging
            cookiesReceived: allCookies ? true : false
        }, {
            headers: responseHeaders // Forward Set-Cookie headers to browser
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}