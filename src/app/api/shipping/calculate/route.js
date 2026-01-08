// app/api/shipping/calculate/route.js
// Calculate shipping rates based on country and products (without syncing cart to WooCommerce)
import { NextResponse } from "next/server";
import { getLocaleValue, getCurrency, getLocation } from "@/app/actions/Woo-Coommerce/getWooCommerce";

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
            items = [] // Array of { id, quantity, variation_id }
        } = body;

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

        // Build cookies for WooCommerce request
        const wcmlCurrencyCookie = `wcml_client_currency=${currencyCode}`;
        const locationCookie = `location=${location}`;
        const wcmlimLocationCookie = `wcmlim_selected_location_termid=${location}`;
        const cookieHeader = `${wcmlCurrencyCookie}; ${locationCookie}; ${wcmlimLocationCookie}`;

        // Step 1: Create a temporary cart session by adding items
        // We'll use a fresh session (no existing cookies) to avoid affecting user's cart
        let sessionCookies = '';
        let cartItems = [];

        // Add each item to a temporary cart
        for (const item of items) {
            const payload = {
                id: parseInt(item.id),
                quantity: parseInt(item.quantity) || 1,
                location: parseInt(location)
            };

            if (item.variation_id) {
                payload.variation_id = parseInt(item.variation_id);
            }

            const addResponse = await fetch(`${WC_STORE_URL}/cart/add-item`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Cookie": sessionCookies ? `${sessionCookies}; ${cookieHeader}` : cookieHeader,
                },
                body: JSON.stringify(payload),
                cache: "no-store",
            });

            // Capture session cookies from response
            const setCookieHeaders = addResponse.headers.getSetCookie?.() || [];
            if (setCookieHeaders.length > 0) {
                // Extract woocommerce session cookies
                const wcCookies = setCookieHeaders
                    .filter(c => c.includes('woocommerce') || c.includes('wp_woocommerce'))
                    .map(c => c.split(';')[0])
                    .join('; ');
                if (wcCookies) {
                    sessionCookies = sessionCookies ? `${sessionCookies}; ${wcCookies}` : wcCookies;
                }
            }

            if (!addResponse.ok) {
                console.error('Failed to add item for shipping calculation:', await addResponse.text());
                continue;
            }

            const addResult = await addResponse.json();
            cartItems = addResult.items || [];
        }

        // Step 2: Update the shipping address to calculate rates
        const updateResponse = await fetch(`${WC_STORE_URL}/cart/update-customer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Cookie": sessionCookies ? `${sessionCookies}; ${cookieHeader}` : cookieHeader,
            },
            body: JSON.stringify({
                shipping_address: {
                    country: country,
                    state: state,
                    postcode: postcode,
                    city: city || 'N/A',
                    address_1: '',
                    address_2: '',
                    first_name: '',
                    last_name: '',
                    company: '',
                    phone: ''
                },
                billing_address: {
                    country: country,
                    state: state,
                    postcode: postcode,
                    city: city || 'N/A',
                    address_1: '',
                    address_2: '',
                    first_name: '',
                    last_name: '',
                    company: '',
                    email: '',
                    phone: ''
                }
            }),
            cache: "no-store",
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('Failed to update address for shipping calculation:', errorText);
            return NextResponse.json({
                success: false,
                error: "Failed to calculate shipping rates"
            }, { status: 500 });
        }

        // Capture any additional cookies
        const updateCookies = updateResponse.headers.getSetCookie?.() || [];
        if (updateCookies.length > 0) {
            const wcCookies = updateCookies
                .filter(c => c.includes('woocommerce') || c.includes('wp_woocommerce'))
                .map(c => c.split(';')[0])
                .join('; ');
            if (wcCookies) {
                sessionCookies = sessionCookies ? `${sessionCookies}; ${wcCookies}` : wcCookies;
            }
        }

        // Step 3: Fetch the cart to get calculated shipping rates
        const cartResponse = await fetch(`${WC_STORE_URL}/cart`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Cookie": sessionCookies ? `${sessionCookies}; ${cookieHeader}` : cookieHeader,
            },
            cache: "no-store",
        });

        if (!cartResponse.ok) {
            const errorText = await cartResponse.text();
            console.error('Failed to fetch cart for shipping rates:', errorText);
            return NextResponse.json({
                success: false,
                error: "Failed to retrieve shipping rates"
            }, { status: 500 });
        }

        const cartData = await cartResponse.json();

        // Extract shipping rates
        const shippingRates = cartData.shipping_rates || [];

        // Step 4: Clear the temporary cart (cleanup)
        try {
            await fetch(`${WC_STORE_URL}/cart/items`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "Cookie": sessionCookies ? `${sessionCookies}; ${cookieHeader}` : cookieHeader,
                },
                cache: "no-store",
            });
        } catch (cleanupError) {
            console.warn('Failed to cleanup temporary cart:', cleanupError);
        }

        return NextResponse.json({
            success: true,
            shipping_rates: shippingRates,
            currency_code: cartData.totals?.currency_code || currencyCode,
            currency_symbol: cartData.totals?.currency_symbol || '€'
        });

    } catch (error) {
        console.error("Shipping calculation error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
