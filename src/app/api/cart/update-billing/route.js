import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLocaleValue } from "@/app/actions/Woo-Coommerce/getWooCommerce";

async function parseSetCookieHeader(setCookieHeader) {
    const cookies = {};
    const cookieStrings = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    
    cookieStrings.forEach(cookieStr => {
        if (!cookieStr) return;
        
        const parts = cookieStr.split(';');
        const [nameValue] = parts;
        const [name, value] = nameValue.split('=');
        
        if (name && value) {
            cookies[name.trim()] = value.trim();
        }
    });
    
    return cookies;
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

        // Get the billing address and optional shipping address from request body
        const { billing_address, shipping_address: provided_shipping_address } = await request.json();

        if (!billing_address) {
            return NextResponse.json({
                success: false,
                error: "Billing address is required"
            }, { status: 400 });
        }

        // Clean and validate address fields - some countries don't require postcodes or address_1
        // Only include fields if they have values to avoid WooCommerce validation errors
        // Build clean address object, only including fields that have non-empty values
        const cleanedBillingAddress = {
            first_name: billing_address.first_name || '',
            last_name: billing_address.last_name || '',
            company: billing_address.company || '',
            address_2: billing_address.address_2 || '',
            city: billing_address.city || '',
            state: billing_address.state || '',
            country: billing_address.country || '',
            email: billing_address.email || '',
            phone: billing_address.phone || '',
        };
        
        // Only include address_1 if it has a value
        const trimmedAddress1 = billing_address.address_1?.trim();
        if (trimmedAddress1) {
            cleanedBillingAddress.address_1 = trimmedAddress1;
        }
        
        // Only include postcode if it has a value (WooCommerce validates postcode format, so omit if empty)
        const trimmedPostcode = billing_address.postcode?.trim();
        if (trimmedPostcode && trimmedPostcode.length > 0) {
            cleanedBillingAddress.postcode = trimmedPostcode;
        }
        // Explicitly ensure postcode is not in the object if empty
        if (!trimmedPostcode || trimmedPostcode.length === 0) {
            delete cleanedBillingAddress.postcode;
        }
        
        // WooCommerce needs at least city or address_1 to calculate shipping rates
        // If only country is provided, add a default city to enable shipping calculation
        // But only if city is truly empty (not just whitespace)
        if (cleanedBillingAddress.country && 
            (!cleanedBillingAddress.city || cleanedBillingAddress.city.trim() === '') && 
            !cleanedBillingAddress.address_1) {
            cleanedBillingAddress.city = 'N/A'; // Temporary city to enable shipping calculation
        }
        
        // If city is "N/A" but we have address_1, remove the temporary city
        if (cleanedBillingAddress.city === 'N/A' && cleanedBillingAddress.address_1) {
            delete cleanedBillingAddress.city;
        }
        
        console.log('Cleaned billing address for shipping calculation:', JSON.stringify(cleanedBillingAddress, null, 2));

        // Create shipping address - use provided shipping address if available, otherwise use billing address
        let cleanedShippingAddress;

        if (provided_shipping_address && provided_shipping_address.country) {
            // Use provided shipping address - clean it the same way as billing address
            cleanedShippingAddress = {
                first_name: provided_shipping_address.first_name || '',
                last_name: provided_shipping_address.last_name || '',
                company: provided_shipping_address.company || '',
                address_2: provided_shipping_address.address_2 || '',
                city: provided_shipping_address.city || '',
                state: provided_shipping_address.state || '',
                country: provided_shipping_address.country || '',
            };

            // Only include address_1 if it has a value
            const trimmedShippingAddress1 = provided_shipping_address.address_1?.trim();
            if (trimmedShippingAddress1) {
                cleanedShippingAddress.address_1 = trimmedShippingAddress1;
            }

            // Only include postcode if it has a value
            const trimmedShippingPostcode = provided_shipping_address.postcode?.trim();
            if (trimmedShippingPostcode && trimmedShippingPostcode.length > 0) {
                cleanedShippingAddress.postcode = trimmedShippingPostcode;
            }

            // WooCommerce needs at least city or address_1 to calculate shipping rates
            if (cleanedShippingAddress.country &&
                (!cleanedShippingAddress.city || cleanedShippingAddress.city.trim() === '') &&
                !cleanedShippingAddress.address_1) {
                cleanedShippingAddress.city = 'N/A';
            }

            // If city is "N/A" but we have address_1, remove the temporary city
            if (cleanedShippingAddress.city === 'N/A' && cleanedShippingAddress.address_1) {
                delete cleanedShippingAddress.city;
            }

            console.log('Using provided shipping address:', JSON.stringify(cleanedShippingAddress, null, 2));
        } else {
            // Use billing address as shipping address (default behavior)
            cleanedShippingAddress = { ...cleanedBillingAddress };
            console.log('Using billing address as shipping address');
        }

        // Double-check: ensure shipping address doesn't have empty postcode
        if (!cleanedShippingAddress.postcode || cleanedShippingAddress.postcode.trim?.()?.length === 0) {
            delete cleanedShippingAddress.postcode;
        }

        // Make request to WooCommerce to update billing address
        // Also update shipping address with billing address by default (WooCommerce uses shipping address for shipping rates calculation)
        const requestBody = {
            billing_address: cleanedBillingAddress,
            // Set shipping address to billing address by default (user can override if they check the shipping address checkbox)
            shipping_address: cleanedShippingAddress
        };
        
        // Final check: remove postcode from both addresses if somehow still present and empty
        // Also remove address_1 if empty
        ['billing_address', 'shipping_address'].forEach(addressKey => {
            const address = requestBody[addressKey];
            if (address.postcode === '' || address.postcode === undefined || !address.postcode?.trim()) {
                delete address.postcode;
            }
            if (address.address_1 === '' || address.address_1 === undefined || !address.address_1?.trim()) {
                delete address.address_1;
            }
        });
        
        console.log('Sending request to WooCommerce /cart/update-customer:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(`${WC_STORE_URL}/cart/update-customer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(allCookies ? { "Cookie": allCookies } : {}),
            },
            body: JSON.stringify(requestBody),
            cache: "no-store",
        });
        
        console.log('WooCommerce /cart/update-customer response status:', response.status);

        // Parse and set any new cookies from WooCommerce response
        const setCookieHeader = response.headers.get("set-cookie");
        if (setCookieHeader) {
            const parsedCookies = parseSetCookieHeader(setCookieHeader);
            const responseHeaders = new Headers();
            
            Object.entries(parsedCookies).forEach(([name, value]) => {
                responseHeaders.append("Set-Cookie", `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                return NextResponse.json({
                    success: false,
                    error: errorData || "Failed to update billing address"
                }, { 
                    status: response.status,
                    headers: responseHeaders
                });
            }

            const data = await response.json();
            console.log('WooCommerce cart update response - items count:', data?.items?.length || 0);
            console.log('WooCommerce cart update response - shipping address:', data?.shipping_address);
            console.log('WooCommerce cart update response - shipping_rates structure:', JSON.stringify(data?.shipping_rates, null, 2));

            // Check if cart has items - shipping rates are only calculated if cart has items
            if (!data?.items || data.items.length === 0) {
                console.warn('WooCommerce cart is empty - shipping rates cannot be calculated without items');
            }

            // Check if shipping rates are available in the response
            let hasShippingRates = data?.shipping_rates?.some(
                pkg => pkg.shipping_rates && Array.isArray(pkg.shipping_rates) && pkg.shipping_rates.length > 0
            );
            console.log('Has shipping rates in response:', hasShippingRates);
            
            // If no shipping rates in response, try to fetch cart to get shipping rates
            // This ensures we get the latest shipping rates calculated by WooCommerce based on zones
            if (!hasShippingRates) {
                try {
                    // Wait a bit for WooCommerce to calculate shipping rates
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Fetch cart to get shipping rates
                    const cartResponse = await fetch(`${WC_STORE_URL}/cart`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            ...(allCookies ? { 'Cookie': allCookies } : {}),
                        },
                        cache: 'no-store',
                    });
                    
                    console.log('Cart fetch response status:', cartResponse.status);
                    
                    if (cartResponse.ok) {
                        const cartData = await cartResponse.json();
                        console.log('Cart data after update:', JSON.stringify(cartData, null, 2));
                        console.log('Shipping rates from cart:', JSON.stringify(cartData?.shipping_rates, null, 2));
                        
                        // Check if shipping rates are now available
                        hasShippingRates = cartData?.shipping_rates?.some(
                            pkg => pkg.shipping_rates && Array.isArray(pkg.shipping_rates) && pkg.shipping_rates.length > 0
                        );
                        
                        console.log('Has shipping rates after cart fetch:', hasShippingRates);
                        
                        // If we got shipping rates from cart, include them in the response
                        if (hasShippingRates && cartData.shipping_rates) {
                            data.shipping_rates = cartData.shipping_rates;
                            console.log('Including shipping rates in response:', JSON.stringify(data.shipping_rates, null, 2));
                        } else {
                            console.warn('No shipping rates found in cart response. Cart structure:', {
                                hasShippingRates: !!cartData?.shipping_rates,
                                shippingRatesType: typeof cartData?.shipping_rates,
                                shippingRatesValue: cartData?.shipping_rates
                            });
                        }
                    } else {
                        const errorText = await cartResponse.text();
                        console.error('Cart fetch failed:', cartResponse.status, errorText);
                    }
                } catch (cartError) {
                    console.error('Failed to fetch cart for shipping rates:', cartError);
                    // Continue with original response even if cart fetch fails
                }
            } else {
                console.log('Shipping rates already in response:', JSON.stringify(data.shipping_rates, null, 2));
            }
            
            return NextResponse.json({
                success: true,
                data: data,
                hasShippingRates: hasShippingRates
            }, {
                headers: responseHeaders
            });
        }

        if (!response.ok) {
            const errorData = await response.text();
            return NextResponse.json({
                success: false,
                error: errorData || "Failed to update billing address"
            }, { status: response.status });
        }

        const data = await response.json();
        console.log('WooCommerce cart update response (no set-cookie):', JSON.stringify(data, null, 2));
        console.log('Shipping rates in response:', data?.shipping_rates);
        
        // Check if shipping rates are available in the response
        let hasShippingRates = data?.shipping_rates?.some(
            pkg => pkg.shipping_rates && Array.isArray(pkg.shipping_rates) && pkg.shipping_rates.length > 0
        );
        console.log('Has shipping rates in response:', hasShippingRates);
        
        // If no shipping rates in response, try to fetch cart to get shipping rates
        // This ensures we get the latest shipping rates calculated by WooCommerce based on zones
        if (!hasShippingRates) {
            try {
                // Wait a bit for WooCommerce to calculate shipping rates
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Fetch cart to get shipping rates
                const cartResponse = await fetch(`${WC_STORE_URL}/cart`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        ...(allCookies ? { 'Cookie': allCookies } : {}),
                    },
                    cache: 'no-store',
                });
                
                console.log('Cart fetch response status (no set-cookie):', cartResponse.status);
                
                if (cartResponse.ok) {
                    const cartData = await cartResponse.json();
                    console.log('Cart data after update (no set-cookie):', JSON.stringify(cartData, null, 2));
                    console.log('Shipping rates from cart (no set-cookie):', JSON.stringify(cartData?.shipping_rates, null, 2));
                    
                    // Check if shipping rates are now available
                    hasShippingRates = cartData?.shipping_rates?.some(
                        pkg => pkg.shipping_rates && Array.isArray(pkg.shipping_rates) && pkg.shipping_rates.length > 0
                    );
                    
                    console.log('Has shipping rates after cart fetch (no set-cookie):', hasShippingRates);
                    
                    // If we got shipping rates from cart, include them in the response
                    if (hasShippingRates && cartData.shipping_rates) {
                        data.shipping_rates = cartData.shipping_rates;
                        console.log('Including shipping rates in response (no set-cookie):', JSON.stringify(data.shipping_rates, null, 2));
                    } else {
                        console.warn('No shipping rates found in cart response (no set-cookie). Cart structure:', {
                            hasShippingRates: !!cartData?.shipping_rates,
                            shippingRatesType: typeof cartData?.shipping_rates,
                            shippingRatesValue: cartData?.shipping_rates
                        });
                    }
                } else {
                    const errorText = await cartResponse.text();
                    console.error('Cart fetch failed (no set-cookie):', cartResponse.status, errorText);
                }
            } catch (cartError) {
                console.error('Failed to fetch cart for shipping rates (no set-cookie):', cartError);
                // Continue with original response even if cart fetch fails
            }
        } else {
            console.log('Shipping rates already in response (no set-cookie):', JSON.stringify(data.shipping_rates, null, 2));
        }
        
        return NextResponse.json({
            success: true,
            data: data,
            hasShippingRates: hasShippingRates
        });

    } catch (error) {
        console.error("Update billing address error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to update billing address"
        }, { status: 500 });
    }
}

