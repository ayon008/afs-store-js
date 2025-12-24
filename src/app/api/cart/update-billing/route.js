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

        // Get the billing address from request body
        const { billing_address } = await request.json();

        if (!billing_address) {
            return NextResponse.json({
                success: false,
                error: "Billing address is required"
            }, { status: 400 });
        }

        // Clean and validate postcode - some countries don't require postcodes
        // Trim postcode and set to empty string if invalid format might cause issues
        const cleanedBillingAddress = {
            ...billing_address,
            postcode: billing_address.postcode?.trim() || ''
        };

        // Make request to WooCommerce to update billing address
        // Also update shipping address with billing address by default (WooCommerce uses shipping address for shipping rates calculation)
        const response = await fetch(`${WC_STORE_URL}/cart/update-customer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(allCookies ? { "Cookie": allCookies } : {}),
            },
            body: JSON.stringify({
                billing_address: cleanedBillingAddress,
                // Set shipping address to billing address by default (user can override if they check the shipping address checkbox)
                shipping_address: cleanedBillingAddress
            }),
            cache: "no-store",
        });

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
            console.log('WooCommerce cart update response:', JSON.stringify(data, null, 2));
            console.log('Shipping rates in response:', data?.shipping_rates);
            
            // Check if shipping rates are available in the response
            const hasShippingRates = data?.shipping_rates?.some(
                pkg => pkg.shipping_rates && Array.isArray(pkg.shipping_rates) && pkg.shipping_rates.length > 0
            );
            console.log('Has shipping rates in response:', hasShippingRates);
            
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
        const hasShippingRates = data?.shipping_rates?.some(
            pkg => pkg.shipping_rates && Array.isArray(pkg.shipping_rates) && pkg.shipping_rates.length > 0
        );
        console.log('Has shipping rates in response:', hasShippingRates);
        
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

