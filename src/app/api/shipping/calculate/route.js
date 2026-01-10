// app/api/shipping/calculate/route.js
// Calculate shipping rates based on country and products (without syncing cart to WooCommerce)
import { NextResponse } from "next/server";
import { getLocaleValue, getCurrency, getLocation } from "@/app/actions/Woo-Coommerce/getWooCommerce";

// Helper to extract cookies from Set-Cookie headers
function extractSessionCookies(response) {
    let cookies = [];

    // Try getSetCookie first (modern API)
    if (typeof response.headers.getSetCookie === 'function') {
        cookies = response.headers.getSetCookie();
    } else {
        // Fallback to get('set-cookie')
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            // Split on comma followed by a cookie name pattern
            cookies = setCookie.split(/,(?=\s*\w+=)/);
        }
    }

    // Extract just the name=value part from each cookie
    return cookies
        .filter(c => c && (c.includes('woocommerce') || c.includes('wp_woocommerce') || c.includes('PHPSESSID')))
        .map(c => c.split(';')[0].trim())
        .filter(c => c.length > 0);
}

export async function POST(request) {
    try {
        const localeValue = await getLocaleValue();
        const WC_STORE_URL = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/v1`;

        const body = await request.json();
        const {
            country,
            state = '',
            postcode = '',
            city = '',
            items = [] // Array of { id, quantity, variation_id, variation }
        } = body;

        console.log('[Shipping Calculate] Request:', { country, state, postcode, city, itemsCount: items.length });

        if (!country) {
            return NextResponse.json({
                success: false,
                error: "Country is required"
            }, { status: 400 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json({
                success: false,
                error: "Items are required"
            }, { status: 400 });
        }

        // Get currency and location
        const currency = await getCurrency();
        const location = await getLocation() || '2682';

        // Convert currency format
        let currencyCode = currency;
        if (currencyCode === 'euro') currencyCode = 'EUR';
        else if (currencyCode === 'usd') currencyCode = 'USD';
        else if (currencyCode === 'gbp') currencyCode = 'GBP';
        else currencyCode = 'EUR';

        // Build base cookies for WooCommerce request
        const baseCookies = [
            `wcml_client_currency=${currencyCode}`,
            `location=${location}`,
            `wcmlim_selected_location_termid=${location}`
        ];

        // Accumulate session cookies
        let sessionCookiesList = [];

        // Helper to build cookie header
        const buildCookieHeader = () => {
            const allCookies = [...sessionCookiesList, ...baseCookies];
            return allCookies.join('; ');
        };

        // Helper to normalize attribute name for WooCommerce Store API
        // WooCommerce expects: "pa_color" not "attribute_pa_color" or "Color"
        const normalizeAttributeName = (attrName) => {
            if (!attrName) return '';
            let normalized = String(attrName);

            // Strip "attribute_" prefix if present
            if (normalized.startsWith('attribute_')) {
                normalized = normalized.substring(10); // Remove "attribute_"
            }

            return normalized;
        };

        // Helper to build item payload for WC Store API
        const buildItemPayload = (item) => {
            const payload = {
                id: parseInt(item.id),
                quantity: parseInt(item.quantity) || 1,
            };

            if (item.variation_id) {
                payload.variation_id = parseInt(item.variation_id);
            }

            // Add variation attributes if present (required for variable products)
            // WooCommerce Store API expects: [{ attribute: "pa_color", value: "red" }]
            if (item.variation) {
                let variationArray = [];

                if (Array.isArray(item.variation)) {
                    // Already in array format [{ attribute, value }]
                    variationArray = item.variation.map(v => ({
                        attribute: normalizeAttributeName(v.attribute || v.name || ''),
                        value: String(v.value || v.option || '')
                    })).filter(v => v.attribute && v.value);
                } else if (typeof item.variation === 'object' && Object.keys(item.variation).length > 0) {
                    // Convert object format { "attribute_pa_taille": "3.0m2" } to array format
                    variationArray = Object.entries(item.variation).map(([attr, value]) => ({
                        attribute: normalizeAttributeName(attr),
                        value: String(value)
                    })).filter(v => v.attribute && v.value);
                }

                // Only add variation if we have valid attributes
                if (variationArray.length > 0) {
                    payload.variation = variationArray;
                }
            }

            console.log('[Shipping Calculate] Built payload for item:', payload.id, 'variation_id:', payload.variation_id, 'variation:', JSON.stringify(payload.variation || null));

            return payload;
        };

        // Step 1: Add first item to create a session
        const firstItem = items[0];
        const firstPayload = buildItemPayload(firstItem);

        console.log('[Shipping Calculate] Adding first item:', firstPayload);

        const firstResponse = await fetch(`${WC_STORE_URL}/cart/add-item`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Cookie": buildCookieHeader(),
            },
            body: JSON.stringify(firstPayload),
            cache: "no-store",
        });

        if (!firstResponse.ok) {
            const errorText = await firstResponse.text();
            console.error('[Shipping Calculate] Failed to add first item:', errorText);
            return NextResponse.json({
                success: false,
                error: "Failed to create cart session",
                details: errorText
            }, { status: 500 });
        }

        // Capture session cookies from first response
        const firstCookies = extractSessionCookies(firstResponse);
        sessionCookiesList.push(...firstCookies);
        console.log('[Shipping Calculate] Session cookies captured:', sessionCookiesList.length);

        const firstResult = await firstResponse.json();
        console.log('[Shipping Calculate] First item added, cart items:', firstResult.items?.length);

        // Add remaining items if any
        for (let i = 1; i < items.length; i++) {
            const item = items[i];
            const payload = buildItemPayload(item);

            const addResponse = await fetch(`${WC_STORE_URL}/cart/add-item`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Cookie": buildCookieHeader(),
                },
                body: JSON.stringify(payload),
                cache: "no-store",
            });

            // Update session cookies
            const newCookies = extractSessionCookies(addResponse);
            for (const cookie of newCookies) {
                const cookieName = cookie.split('=')[0];
                // Replace existing cookie with same name
                sessionCookiesList = sessionCookiesList.filter(c => !c.startsWith(cookieName + '='));
                sessionCookiesList.push(cookie);
            }

            if (!addResponse.ok) {
                console.warn('[Shipping Calculate] Failed to add item:', item.id);
            }
        }

        // Step 2: Update the shipping address to calculate rates
        console.log('[Shipping Calculate] Updating customer address for country:', country);

        const updateResponse = await fetch(`${WC_STORE_URL}/cart/update-customer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Cookie": buildCookieHeader(),
            },
            body: JSON.stringify({
                shipping_address: {
                    country: country,
                    state: state || '',
                    postcode: postcode || '',
                    city: city || '',
                    address_1: '',
                    address_2: '',
                    first_name: 'Test',
                    last_name: 'User',
                    company: '',
                    phone: ''
                },
                billing_address: {
                    country: country,
                    state: state || '',
                    postcode: postcode || '',
                    city: city || '',
                    address_1: '',
                    address_2: '',
                    first_name: 'Test',
                    last_name: 'User',
                    company: '',
                    email: 'test@example.com',
                    phone: ''
                }
            }),
            cache: "no-store",
        });

        // Update session cookies
        const updateCookies = extractSessionCookies(updateResponse);
        for (const cookie of updateCookies) {
            const cookieName = cookie.split('=')[0];
            sessionCookiesList = sessionCookiesList.filter(c => !c.startsWith(cookieName + '='));
            sessionCookiesList.push(cookie);
        }

        // Read response body once
        const updateResponseText = await updateResponse.text();
        let updateResult;

        if (!updateResponse.ok) {
            console.error('[Shipping Calculate] Failed to update address:', updateResponseText);
            // Try to parse as JSON anyway to get partial data
            try {
                updateResult = JSON.parse(updateResponseText);
            } catch {
                updateResult = { shipping_rates: [] };
            }
        } else {
            try {
                updateResult = JSON.parse(updateResponseText);
            } catch {
                updateResult = { shipping_rates: [] };
            }
        }
        console.log('[Shipping Calculate] Address updated, shipping_rates:', updateResult.shipping_rates?.length);

        // The update-customer response already contains shipping rates
        let shippingRates = updateResult.shipping_rates || [];

        // If no rates in update response, fetch the cart
        if (shippingRates.length === 0 || !shippingRates[0]?.shipping_rates?.length) {
            console.log('[Shipping Calculate] No rates in update response, fetching cart...');

            // Wait a bit for WooCommerce to calculate
            await new Promise(resolve => setTimeout(resolve, 500));

            const cartResponse = await fetch(`${WC_STORE_URL}/cart`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Cookie": buildCookieHeader(),
                },
                cache: "no-store",
            });

            if (cartResponse.ok) {
                const cartData = await cartResponse.json();
                shippingRates = cartData.shipping_rates || [];
                console.log('[Shipping Calculate] Cart fetched, shipping_rates:', shippingRates.length);
            }
        }

        // Step 3: Clear the temporary cart (cleanup)
        try {
            await fetch(`${WC_STORE_URL}/cart/items`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "Cookie": buildCookieHeader(),
                },
                cache: "no-store",
            });
            console.log('[Shipping Calculate] Temporary cart cleared');
        } catch (cleanupError) {
            console.warn('[Shipping Calculate] Failed to cleanup:', cleanupError.message);
        }

        console.log('[Shipping Calculate] Returning rates:', shippingRates.length);

        return NextResponse.json({
            success: true,
            shipping_rates: shippingRates,
            currency_code: updateResult.totals?.currency_code || currencyCode,
            currency_symbol: updateResult.totals?.currency_symbol || '€'
        });

    } catch (error) {
        console.error("[Shipping Calculate] Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
