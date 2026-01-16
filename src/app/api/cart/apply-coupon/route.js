// app/api/cart/apply-coupon/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLocaleValue } from "@/app/actions/Woo-Coommerce/getWooCommerce";

const WC_STORE_URL = `${process.env.WP_BASE_URL}/wp-json/wc/store/v1`;

// Helper function to decode HTML entities
const decodeEntities = (str = "") => {
    if (!str) return str;
    return str
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
};

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

export async function POST(request) {
    try {
        // Get WooCommerce cookies from browser (Next.js cookie store)
        const wooCookieHeader = await getWooCommerceCookies();

        // Also include any other cookies from the incoming request (from server action or browser)
        const incomingCookieHeader = request.headers.get("cookie") || "";

        // Combine cookies (avoid duplicates)
        // Priority: incoming cookies (from server action) > WooCommerce cookies from Next.js store
        let allCookies = incomingCookieHeader;
        if (wooCookieHeader && !allCookies.includes('woocommerce') && !allCookies.includes('wc_')) {
            // Only add WooCommerce cookies if they're not already in incoming cookies
            allCookies = allCookies ? `${allCookies}; ${wooCookieHeader}` : wooCookieHeader;
        } else if (!allCookies && wooCookieHeader) {
            allCookies = wooCookieHeader;
        }

        // Get the coupon code from request body
        const { code: couponCode } = await request.json();

        if (!couponCode || couponCode.trim() === '') {
            return NextResponse.json({
                success: false,
                error: "Please enter a coupon code"
            }, { status: 400 });
        }

        // Use the same URL format as other cart endpoints (without locale in path)
        const WC_STORE_URL = `${process.env.WP_BASE_URL}/wp-json/wc/store/v1`;

        // Make request to WooCommerce to apply coupon
        const response = await fetch(`${WC_STORE_URL}/cart/apply-coupon`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(allCookies ? { "Cookie": allCookies } : {}),
            },
            body: JSON.stringify({
                code: couponCode.trim()
            }),
            cache: "no-store",
        });

        // Parse and set any new cookies from WooCommerce response
        // This is CRITICAL - WooCommerce may return new session cookies after applying coupon
        const setCookieHeaders = [];
        if (typeof response.headers.getSetCookie === 'function') {
            setCookieHeaders.push(...response.headers.getSetCookie());
        } else {
            const setCookieHeader = response.headers.get("set-cookie");
            if (setCookieHeader) {
                setCookieHeaders.push(...(Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]));
            }
        }
        
        if (setCookieHeaders.length > 0) {
            const cookieStore = await cookies();

            for (const setCookieHeader of setCookieHeaders) {
                const parsedCookies = parseSetCookieHeader(setCookieHeader);
                
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
        }

        if (!response.ok) {
            // Try to get error message from WooCommerce response
            let errorMessage = `Failed to apply coupon: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = decodeEntities(errorData.message);
                } else if (errorData.error) {
                    errorMessage = decodeEntities(errorData.error);
                } else if (typeof errorData === 'string') {
                    errorMessage = decodeEntities(errorData);
                }
            } catch (e) {
                // If response is not JSON, try to get text
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        errorMessage = decodeEntities(errorText.substring(0, 200));
                    }
                } catch (textError) {
                    // Keep default error message
                }
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Check if coupon was actually applied by checking the response
        const couponApplied = data.coupons && Array.isArray(data.coupons) && data.coupons.length > 0;
        const hasDiscount = data.totals?.total_discount && parseFloat(data.totals.total_discount) > 0;
        
        // If coupon is not in the immediate response, try fetching the cart to verify
        let verifiedCoupons = data.coupons || [];
        let verifiedDiscount = data.totals?.total_discount || "0";
        
        if (!couponApplied && !hasDiscount) {
            // Wait a bit for WooCommerce to process
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Fetch cart to verify coupon was applied
            try {
                const cartResponse = await fetch(`${WC_STORE_URL}/cart`, {
                    method: 'GET',
                    headers: {
                        "Accept": "application/json",
                        ...(allCookies ? { "Cookie": allCookies } : {}),
                    },
                    cache: "no-store",
                });
                
                if (cartResponse.ok) {
                    const cartData = await cartResponse.json();
                    if (cartData.coupons && Array.isArray(cartData.coupons) && cartData.coupons.length > 0) {
                        verifiedCoupons = cartData.coupons;
                        verifiedDiscount = cartData.totals?.total_discount || "0";
                    }
                }
            } catch (verifyError) {
                console.error('[Apply Coupon API] Error verifying coupon in cart:', verifyError);
            }
        }
        
        return NextResponse.json({
            success: true,
            message: "Coupon applied successfully",
            data: {
                ...data,
                coupons: verifiedCoupons, // Use verified coupons
                totals: {
                    ...data.totals,
                    total_discount: verifiedDiscount // Use verified discount
                }
            }
        });

    } catch (error) {
        console.error("Apply coupon error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}