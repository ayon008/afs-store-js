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

// Helper to get currency symbol
function getCurrencySymbol(currencyCode) {
    const symbols = {
        'EUR': '€',
        'USD': '$',
        'GBP': '£'
    };
    return symbols[currencyCode] || '€';
}

// Helper to get currency formatting info
function getCurrencyInfo(currencyCode) {
    const info = {
        'EUR': {
            symbol: '€',
            minor_unit: 2,
            decimal_separator: ',',
            thousand_separator: '',
            prefix: '',
            suffix: '€'
        },
        'USD': {
            symbol: '$',
            minor_unit: 2,
            decimal_separator: '.',
            thousand_separator: ',',
            prefix: '$',
            suffix: ''
        },
        'GBP': {
            symbol: '£',
            minor_unit: 2,
            decimal_separator: '.',
            thousand_separator: ',',
            prefix: '£',
            suffix: ''
        }
    };
    return info[currencyCode] || info['EUR'];
}

// Normalize shipping rates currency metadata to match target currency
// Also converts prices if exchange rate is provided
async function normalizeShippingRatesCurrency(shippingRates, targetCurrency, defaultCurrency = 'EUR', exchangeRate = null) {
    if (!Array.isArray(shippingRates) || !targetCurrency) {
        return shippingRates;
    }

    const currencyInfo = getCurrencyInfo(targetCurrency);

    // If target currency is the same as default, no conversion needed
    if (targetCurrency === defaultCurrency) {
        // Just update metadata
        return shippingRates.map(shippingPackage => {
            if (!shippingPackage.shipping_rates || !Array.isArray(shippingPackage.shipping_rates)) {
                return shippingPackage;
            }

            const normalizedPackage = { ...shippingPackage };
            normalizedPackage.shipping_rates = shippingPackage.shipping_rates.map(rate => {
                const normalizedRate = { ...rate };
                normalizedRate.currency_code = targetCurrency;
                normalizedRate.currency_symbol = currencyInfo.symbol;
                normalizedRate.currency_minor_unit = currencyInfo.minor_unit;
                normalizedRate.currency_decimal_separator = currencyInfo.decimal_separator;
                normalizedRate.currency_thousand_separator = currencyInfo.thousand_separator;
                normalizedRate.currency_prefix = currencyInfo.prefix;
                normalizedRate.currency_suffix = currencyInfo.suffix;
                return normalizedRate;
            });
            return normalizedPackage;
        });
    }

    // Convert prices if exchange rate is provided
    return shippingRates.map(shippingPackage => {
        if (!shippingPackage.shipping_rates || !Array.isArray(shippingPackage.shipping_rates)) {
            return shippingPackage;
        }

        const normalizedPackage = { ...shippingPackage };
        normalizedPackage.shipping_rates = shippingPackage.shipping_rates.map(rate => {
            const normalizedRate = { ...rate };
            
            // Convert price if exchange rate is available
            if (exchangeRate && exchangeRate > 0 && normalizedRate.price && !isNaN(normalizedRate.price)) {
                const priceInDefault = parseFloat(normalizedRate.price) / 100; // Convert from centimes
                const priceInTarget = priceInDefault * exchangeRate;
                const priceInTargetRounded = Math.round(priceInTarget * 100) / 100; // Round to 2 decimals
                normalizedRate.price = Math.round(priceInTargetRounded * 100).toString(); // Convert back to centimes
            }

            // Convert taxes if exchange rate is available
            if (exchangeRate && exchangeRate > 0 && normalizedRate.taxes) {
                if (typeof normalizedRate.taxes === 'string' && !isNaN(normalizedRate.taxes)) {
                    const taxInDefault = parseFloat(normalizedRate.taxes) / 100;
                    const taxInTarget = taxInDefault * exchangeRate;
                    const taxInTargetRounded = Math.round(taxInTarget * 100) / 100;
                    normalizedRate.taxes = Math.round(taxInTargetRounded * 100).toString();
                } else if (Array.isArray(normalizedRate.taxes)) {
                    normalizedRate.taxes = normalizedRate.taxes.map(tax => {
                        if (typeof tax === 'string' && !isNaN(tax)) {
                            const taxInDefault = parseFloat(tax) / 100;
                            const taxInTarget = taxInDefault * exchangeRate;
                            const taxInTargetRounded = Math.round(taxInTarget * 100) / 100;
                            return Math.round(taxInTargetRounded * 100).toString();
                        }
                        return tax;
                    });
                }
            }
            
            // Update all currency-related fields
            normalizedRate.currency_code = targetCurrency;
            normalizedRate.currency_symbol = currencyInfo.symbol;
            normalizedRate.currency_minor_unit = currencyInfo.minor_unit;
            normalizedRate.currency_decimal_separator = currencyInfo.decimal_separator;
            normalizedRate.currency_thousand_separator = currencyInfo.thousand_separator;
            normalizedRate.currency_prefix = currencyInfo.prefix;
            normalizedRate.currency_suffix = currencyInfo.suffix;

            return normalizedRate;
        });

        return normalizedPackage;
    });
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
            items = [], // Array of { id, quantity, variation_id, variation }
            location: bodyLocation // Location passed from checkout
        } = body;

        console.log('[Shipping Calculate] Request:', { country, state, postcode, city, itemsCount: items.length, bodyLocation });
        console.log('[Shipping Calculate] Items received:', JSON.stringify(items, null, 2));

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
        // Prefer location from request body (cart metadata), fallback to cookies
        const currencyCode = await getCurrency(); // getCurrency() now returns 'EUR', 'USD', or 'GBP' directly
        const cookieLocation = await getLocation();
        const location = bodyLocation || cookieLocation || '2682';

        console.log('[Shipping Calculate] Using location:', location, '(from body:', bodyLocation, ', from cookie:', cookieLocation, ')');

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
        // WooCommerce expects: "pa_color" not "attribute_pa_color" or "Color" or "Taille"
        const normalizeAttributeName = (attrName) => {
            if (!attrName) return '';
            let normalized = String(attrName);

            // Strip "attribute_" prefix if present
            if (normalized.startsWith('attribute_')) {
                normalized = normalized.substring(10); // Remove "attribute_"
            }

            // If already in pa_ format, return as-is
            if (normalized.startsWith('pa_')) {
                return normalized;
            }

            // Convert display name to slug format: "Taille" -> "pa_taille", "Size" -> "pa_size"
            // This handles cases where cart was saved with display names instead of slugs
            const slugified = normalized
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/[^a-z0-9-]/g, ''); // Remove special characters

            return `pa_${slugified}`;
        };

        // Helper to normalize attribute value for WooCommerce Store API
        // WooCommerce expects slugified values: "bleu" not "Bleu", "oui" not "Oui"
        const normalizeAttributeValue = (value) => {
            if (!value) return '';
            const strValue = String(value);

            // If it looks like a measurement (contains numbers with units), keep as-is
            if (/^\d+(\.\d+)?\s*(m2|m|cm|mm|kg|g|l|ml)?$/i.test(strValue)) {
                return strValue;
            }

            // Slugify the value: "Bleu" -> "bleu", "Oui" -> "oui"
            return strValue
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/[^a-z0-9-_.]/g, ''); // Remove special characters (keep dots for measurements)
        };

        // Helper to build item payload for WC Store API
        const buildItemPayload = (item, includeVariation = true) => {
            const payload = {
                id: parseInt(item.id),
                quantity: parseInt(item.quantity) || 1,
                // Include location in payload (required by Multi-Locations-Inventory-Management plugin)
                location: parseInt(location) || 2682,
            };

            if (item.variation_id) {
                payload.variation_id = parseInt(item.variation_id);
            }

            // Add variation attributes if present and requested
            // WooCommerce Store API expects: [{ attribute: "pa_color", value: "red" }]
            if (includeVariation && item.variation) {
                let variationArray = [];

                if (Array.isArray(item.variation)) {
                    // Already in array format [{ attribute, value }]
                    variationArray = item.variation.map(v => ({
                        attribute: normalizeAttributeName(v.attribute || v.name || ''),
                        value: normalizeAttributeValue(v.value || v.option || '')
                    })).filter(v => v.attribute && v.value);
                } else if (typeof item.variation === 'object' && Object.keys(item.variation).length > 0) {
                    // Convert object format { "attribute_pa_taille": "3.0m2" } to array format
                    variationArray = Object.entries(item.variation).map(([attr, value]) => ({
                        attribute: normalizeAttributeName(attr),
                        value: normalizeAttributeValue(value)
                    })).filter(v => v.attribute && v.value);
                }

                // Only add variation if we have valid attributes
                if (variationArray.length > 0) {
                    payload.variation = variationArray;
                }
            }

            return payload;
        };

        // Helper to add item to cart with retry logic
        const addItemToCart = async (item, cookieHeader) => {
            let response;
            let payload;

            // Strategy 1: If we have variation_id, try with just variation_id first (most reliable)
            if (item.variation_id) {
                payload = buildItemPayload(item, false); // No variation attributes
                console.log('[Shipping Calculate] Attempt 1 - variation_id only:', JSON.stringify(payload));

                response = await fetch(`${WC_STORE_URL}/cart/add-item`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Cookie": cookieHeader,
                    },
                    body: JSON.stringify(payload),
                    cache: "no-store",
                });

                if (response.ok) {
                    console.log('[Shipping Calculate] Success with variation_id only');
                    return { success: true, response };
                }

                console.log('[Shipping Calculate] variation_id only failed, trying with attributes...');
            }

            // Strategy 2: Try with variation attributes
            payload = buildItemPayload(item, true);
            console.log('[Shipping Calculate] Attempt 2 - with variation attributes:', JSON.stringify(payload));

            response = await fetch(`${WC_STORE_URL}/cart/add-item`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Cookie": cookieHeader,
                },
                body: JSON.stringify(payload),
                cache: "no-store",
            });

            if (response.ok) {
                console.log('[Shipping Calculate] Success with variation attributes');
                return { success: true, response };
            }

            // Strategy 3: Try with product ID only (for simple products or as last resort)
            if (item.variation_id) {
                payload = {
                    id: parseInt(item.variation_id), // Use variation_id as the product id
                    quantity: parseInt(item.quantity) || 1,
                    location: parseInt(location) || 2682,
                };
                console.log('[Shipping Calculate] Attempt 3 - variation as product id:', JSON.stringify(payload));

                response = await fetch(`${WC_STORE_URL}/cart/add-item`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Cookie": cookieHeader,
                    },
                    body: JSON.stringify(payload),
                    cache: "no-store",
                });

                if (response.ok) {
                    console.log('[Shipping Calculate] Success with variation as product id');
                    return { success: true, response };
                }
            }

            // All attempts failed
            const errorText = await response.text();
            console.error('[Shipping Calculate] Failed to add item:', errorText);
            return { success: false, response, error: errorText };
        };

        // Step 1: Add first item to create a session
        const firstItem = items[0];
        const firstResult = await addItemToCart(firstItem, buildCookieHeader());

        if (!firstResult.success) {
            return NextResponse.json({
                success: false,
                error: "Failed to create cart session",
                details: firstResult.error
            }, { status: 500 });
        }

        const firstResponse = firstResult.response;

        // Capture session cookies from first response
        const firstCookies = extractSessionCookies(firstResponse);
        sessionCookiesList.push(...firstCookies);
        console.log('[Shipping Calculate] Session cookies captured:', sessionCookiesList.length);

        const firstCartData = await firstResponse.json();
        console.log('[Shipping Calculate] First item added, cart items:', firstCartData.items?.length);

        // Add remaining items if any
        for (let i = 1; i < items.length; i++) {
            const item = items[i];
            const result = await addItemToCart(item, buildCookieHeader());

            if (result.success) {
                // Update session cookies
                const newCookies = extractSessionCookies(result.response);
                for (const cookie of newCookies) {
                    const cookieName = cookie.split('=')[0];
                    // Replace existing cookie with same name
                    sessionCookiesList = sessionCookiesList.filter(c => !c.startsWith(cookieName + '='));
                    sessionCookiesList.push(cookie);
                }
            } else {
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

        // Normalize currency metadata in shipping rates and convert prices
        const defaultCurrency = 'EUR'; // Default currency from WooCommerce
        
        // Get exchange rate from WCML API
        let exchangeRate = null;
        if (currencyCode !== defaultCurrency) {
            try {
                // Normalize URL to avoid double slashes
                const baseUrl = process.env.WP_BASE_URL?.replace(/\/$/, '');
                const exchangeRatesUrl = `${baseUrl}/wp-json/afs-wcml/v1/exchange-rates`;
                const exchangeRatesResponse = await fetch(exchangeRatesUrl, {
                    cache: 'no-store',
                });
                if (exchangeRatesResponse.ok) {
                    const exchangeData = await exchangeRatesResponse.json();
                    if (exchangeData.success && exchangeData.rates && exchangeData.rates[currencyCode]) {
                        exchangeRate = exchangeData.rates[currencyCode];
                        console.log(`[Shipping Calculate] Exchange rate for ${currencyCode}:`, exchangeRate);
                    }
                }
            } catch (error) {
                console.warn('[Shipping Calculate] Failed to fetch exchange rate:', error);
            }
        }
        
        const normalizedRates = await normalizeShippingRatesCurrency(shippingRates, currencyCode, defaultCurrency, exchangeRate);

        return NextResponse.json({
            success: true,
            shipping_rates: normalizedRates,
            currency_code: updateResult.totals?.currency_code || currencyCode,
            currency_symbol: updateResult.totals?.currency_symbol || getCurrencySymbol(currencyCode)
        });

    } catch (error) {
        console.error("[Shipping Calculate] Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
