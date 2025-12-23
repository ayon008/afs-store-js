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

        // Make request to WooCommerce to update billing address
        const response = await fetch(`${WC_STORE_URL}/cart/update-customer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(allCookies ? { "Cookie": allCookies } : {}),
            },
            body: JSON.stringify({
                billing_address: billing_address
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
            return NextResponse.json({
                success: true,
                data: data
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
        return NextResponse.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error("Update billing address error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to update billing address"
        }, { status: 500 });
    }
}

