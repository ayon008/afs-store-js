'use server';
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "../WC/Auth/getAuth";
import { getWooCommerceCookies } from "./Cookies/cookie-handler";
import { getLocale, getTranslations } from "next-intl/server";
const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET
const authHeader = Buffer
    .from(`${consumerKey}:${consumerSecret}`)
    .toString("base64");

// Using your environment variables
const WP_URL = process.env.WP_BASE_URL || 'https://staging.afs-foiling.com/fr';
const WC_STORE_URL = `${WP_URL}/wp-json/wc/store/v1`;

export const getCurrency = async () => {
    const cookieStore = await cookies();
    const currencyValue = cookieStore.get('currency')?.value;
    const currency = currencyValue === 'euro' ? 'EUR' : currencyValue === 'gbp' ? 'GBP' : 'USD';
    console.log(currency);
    return currency;
}

// Helper to parse set-cookie headers
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


export async function getLocaleValue() {
    const localeValue = await getLocale();
    return localeValue === 'en' ? '' : localeValue;
}

// Refresh WooCommerce cookies on page load/refresh
export async function refreshCookies() {
    try {
        const localeValue = await getLocaleValue();
        const WC_STORE_URL = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/v1`;
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        // Get current cookies from the cookie store
        const cookieHeader = await getWooCommerceCookies();

        // Build headers for WooCommerce request
        const headers = {
            "Accept": "application/json",
        };

        // If user is logged in, include authentication token
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Include cookies for session management
        if (cookieHeader) {
            headers["Cookie"] = cookieHeader;
        }

        // Make request to WooCommerce to refresh cookies
        const response = await fetch(`${WC_STORE_URL}/cart`, {
            method: "GET",
            headers,
            cache: "no-store",
        });

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

        // Parse and set cookies in Next.js cookie store
        if (setCookieHeaders.length > 0) {
            const setCookieHeader = setCookieHeaders.join(', ');
            const parsedCookies = parseSetCookieHeader(setCookieHeader);

            for (const c of parsedCookies) {
                const cookieOpts = {
                    path: "/",
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production",
                    httpOnly: false,
                };

                let hasMaxAge = false;
                let hasExpires = false;

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
                            if (!isNaN(maxAge) && maxAge > 0) {
                                cookieOpts.maxAge = maxAge;
                                hasMaxAge = true;
                            }
                            break;
                        case "expires":
                            const expiresDate = new Date(optValue || "");
                            if (!isNaN(expiresDate.getTime())) {
                                cookieOpts.expires = expiresDate;
                                hasExpires = true;
                            }
                            break;
                        case "domain":
                            // Note: domain can't be set via Next.js cookies() API
                            break;
                    }
                });

                // If no expiration is set, set a default maxAge to ensure cookies persist
                if (!hasMaxAge && !hasExpires) {
                    cookieOpts.maxAge = 60 * 60 * 48; // 48 hours in seconds
                }

                // Remove undefined values
                Object.keys(cookieOpts).forEach(key => {
                    if (cookieOpts[key] === undefined) {
                        delete cookieOpts[key];
                    }
                });

                // Set the cookie in Next.js cookie store
                try {
                    cookieStore.set({
                        name: c.name,
                        value: c.value,
                        ...cookieOpts,
                    });
                } catch (cookieError) {
                    console.error(`Error setting cookie ${c.name}:`, cookieError);
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error refreshing cookies:", error);
        return { success: false, error: error.message };
    }
}

export async function getLang(params) {
    const localeValue = await getLocale();
    return localeValue;
}


// logout
export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('user_data');
    return { success: true };
}


export const getCountryDetails = async (country) => {
    const localeValue = await getLocaleValue();
    const url = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/v3/data/countries/${country}`;
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Basic ${authHeader}` },
            cache: "no-store",
        });
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log(error);
        return error;
    }
}



// Get all the products by category Id
export const getProductsByCategoryId = async (ids, max, min) => {
    const locale = await getLocale();
    const currency = await getCurrency();
    try {
        // Convert "12,40" or [12,40] or 12 → always array
        let categories = Array.isArray(ids)
            ? ids.map(Number)
            : String(ids).split(",").map(Number);

        if (categories.length === 0) return [];

        const categoriesIds = categories.join(",");
        let allProducts = [];
        const per_page = 100;

        const user = await getAuthenticatedUser();
        const shippingCountry = user?.shipping?.country || user?.billing?.country || "";

        // 1️⃣ Fetch products only from first category
        for (let i = 1; ; i++) {
            let url = `${process.env.WP_BASE_URL}/wp-json/afs/v1/products?category=${categoriesIds}&per_page=${per_page}&page=${i}&lang=${locale}&shipping_country=${shippingCountry}&currency=${currency}`

            if (min != null) url += `&min_price=${Number(min)}`;
            if (max != null) url += `&max_price=${Number(max)}`;

            const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

            const response = await fetch(url, {
                cache: "force-cache",
                next: { revalidate: 3600 },
            });

            if (!response.ok) break;

            const { data } = await response.json();

            if (!Array.isArray(data) || data.length === 0) break;

            allProducts.push(...data);

            if (data.length < per_page) break;
        }

        return allProducts;

    } catch (error) {
        console.log(error);
        return [];
    }
};





export const getChildCategories = async (parentId) => {
    const locale = await getLocale();
    const url = `${process.env.WP_BASE_URL}/wp-json/wc/v3/products/categories?parent=${parentId}&per_page=100&_fields=id,name,slug&lang=${locale}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
        },
        next: { revalidate: 3600 },
    });


    if (!response.ok) throw new Error(`WooCommerce API error: ${response.statusText}`);
    const data = await response.json();

    const categoriesWithChildren = await Promise.all(
        data.map(async (singleData) => ({
            ...singleData,
            children: await getChildCategories(singleData.id), // recursive
        }))
    );

    return categoriesWithChildren;
}


export const getProductBySlug = async (slug) => {
    const locale = await getLocale();
    const currency = await getCurrency();
    const url = `${process.env.WP_BASE_URL}/wp-json/wc/v3/products?slug=${slug}&lang=${locale}&currency=${currency}`;
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${authHeader}`
            },
            cache: "no-cache",
        })
        const data = await response.json();
        const product = data[0];
        return product;
    } catch (error) {
        console.log(error);
        return { error: true }
    }
}



// get woo-commerce orders 

export const getOrders = async () => {

    const locale = await getLocale();
    const authHeader =
        "Basic " +
        Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64");

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const user = await getAuthenticatedUser();

    if (!token || !user?.id) {
        return [];
    }

    const userId = user.id;
    const perPage = 100;

    let allOrders = [];


    // 1️⃣ First request (to know total pages)
    const firstRes = await fetch(
        `${process.env.WP_BASE_URL}/wp-json/wc/v3/orders?customer=${userId}&page=1&per_page=${perPage}&orderby=date&order=desc&lang=${locale}`,
        {
            headers: { Authorization: authHeader },
            cache: "no-store",
        }
    );


    if (!firstRes.ok) {
        throw new Error("Failed to fetch orders");
    }

    const totalPages = Number(firstRes.headers.get("X-WP-TotalPages")) || 1;
    const firstOrders = await firstRes.json();

    allOrders.push(...firstOrders);

    // 2️⃣ Fetch remaining pages
    for (let page = 2; page <= totalPages; page++) {
        const res = await fetch(
            `${process.env.WP_BASE_URL}/wp-json/wc/v3/orders?customer=${userId}&page=${page}&per_page=${perPage}&orderby=date&order=desc&lang=${locale}`,
            {
                headers: { Authorization: authHeader },
                cache: "no-store",
            }
        );

        if (!res.ok) {
            throw new Error(`Failed to fetch orders on page ${page}`);
        }

        const orders = await res.json();
        allOrders.push(...orders);
    }

    return allOrders;
};


export async function changePasswordAction(data) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const t = await getTranslations("login")

    if (!token) {
        return { success: false, error: 'Not authenticated' };
    }

    const res = await fetch(
        `${process.env.WP_BASE_URL}/wp-json/custom/v1/change-password`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                current_password: data.currentPassword,
                new_password: data.newPassword,
            }),
        }
    );

    if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.message || 'Failed' };
    }

    return { success: true, message: t("updated") };
}


export const lostPassword = async (email) => {
    if (!email) {
        return { success: false, error: 'Email is required' };
    }
    try {
        const res = await fetch(
            `${process.env.WP_BASE_URL}/wp-json/auth/v1/forgot-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            }
        );

        console.log("res", res);

        if (!res.ok) {
            const err = await res.json();
            return { success: false, error: err.message || 'Failed' };
        }
        const data = await res.json();
        return { success: true, message: data.message };

    } catch (error) {
        console.log(error);
        return { success: false, error: error.message };
    }
}




export const getPrice = async (productId, selectedVariation) => {
    const currency = await getCurrency();
    const locale = await getLocale();
    try {
        const user = await getAuthenticatedUser();
        const shippingCountry = user?.shipping?.country || user?.billing?.country || "";
        const url = `${process.env.WP_BASE_URL}/wp-json/wc/v3/products/${productId}/variations?per_page=100&currency=${currency}&lang=${locale}&shipping_country=${shippingCountry}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${authHeader}`,
            },
            cache: "no-cache",
        });
        const variations = await response.json();
        return variations;
    } catch (error) {
        console.log(error);
        return null;
    }
};


// add-item - calls WooCommerce API directly to ensure cookies are synchronized
export async function addToCart(productId, quantity = 1, variationId = null, variation = {}) {
    const localeValue = await getLocaleValue();
    const currency = await getCurrency();
    const WC_STORE_URL = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/v1`;
    try {
        const cookieHeader = await getWooCommerceCookies();

        // Build payload for WooCommerce
        const payload = {
            id: parseInt(productId),
            quantity: parseInt(quantity),
        };

        if (variationId) {
            payload.variation_id = parseInt(variationId);
        }

        // Handle variations
        if (variation && typeof variation === 'object' && Object.keys(variation).length > 0) {
            // Case 1: Variation is already an array
            if (Array.isArray(variation)) {
                payload.variation = variation.map(item => {
                    const attribute = item.attribute || item.name || item.key || '';
                    const value = typeof item.value === 'string' ? item.value : String(item.value || '');
                    return { attribute, value };
                }).filter(item => item.attribute && item.value);
            }
            // Case 2: Variation is an object with key-value pairs
            else {
                payload.variation = Object.entries(variation).map(([attribute, value]) => ({
                    attribute: String(attribute),
                    value: typeof value === 'string' ? value : String(value || '')
                })).filter(item => item.attribute && item.value);
            }
        }

        console.log('Adding to cart with payload:', JSON.stringify(payload, null, 2));

        // Call WooCommerce API directly
        const response = await fetch(`${WC_STORE_URL}/cart/add-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader,
                'Accept': 'application/json',
                'X-WC-Store-API-Currency': currency
            },
            body: JSON.stringify(payload),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Failed to add to cart: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.code || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        // Parse and set cookies from WooCommerce response
        const setCookieHeader = response.headers.get("set-cookie");
        if (setCookieHeader) {
            const cookieStore = await cookies();
            const parsedCookies = parseSetCookieHeader(setCookieHeader);

            for (const cookie of parsedCookies) {
                try {
                    const cookieOptions = {
                        path: '/',
                        sameSite: 'lax',
                        secure: process.env.NODE_ENV === 'production',
                    };

                    // Parse cookie options
                    cookie.options.forEach(option => {
                        const [key, value] = option.split('=');
                        const lowerKey = key.toLowerCase().trim();

                        if (lowerKey === 'max-age' || lowerKey === 'maxage') {
                            cookieOptions.maxAge = parseInt(value) || 60 * 60 * 24 * 2; // Default 2 days
                        } else if (lowerKey === 'expires') {
                            // Expires is handled by maxAge
                        } else if (lowerKey === 'secure') {
                            cookieOptions.secure = true;
                        } else if (lowerKey === 'httponly') {
                            cookieOptions.httpOnly = true;
                        } else if (lowerKey === 'samesite') {
                            cookieOptions.sameSite = value?.toLowerCase() || 'lax';
                        }
                    });

                    // Default maxAge if not set
                    if (!cookieOptions.maxAge) {
                        cookieOptions.maxAge = 60 * 60 * 24 * 2; // 2 days
                    }

                    cookieStore.set({
                        name: cookie.name,
                        value: cookie.value,
                        ...cookieOptions,
                    });
                } catch (err) {
                    console.error(`Error setting cookie ${cookie.name}:`, err);
                }
            }
        }

        const result = await response.json();
        console.log('Add to cart response:', result);

        // Revalidate paths that show cart data
        revalidatePath('/');
        revalidatePath('/cart');
        revalidatePath('/products');

        return { success: true, ...result };

    } catch (error) {
        console.error('Add to cart error:', error);
        return { success: false, error: error.message };
    }
}


// update cart - calls WooCommerce API directly to ensure cookies are synchronized
export async function updateCartItem(itemKey, quantity) {
    const locale = await getLocale();
    const WC_STORE_URL = `${process.env.WP_BASE_URL}/wp-json/wc/store/v1&lang=${locale}`;
    try {
        const cookieHeader = await getWooCommerceCookies();

        // Validate quantity
        if (!itemKey) {
            return { success: false, error: 'Item key is required' };
        }

        if (quantity < 1) {
            return { success: false, error: 'Quantity must be at least 1' };
        }

        const payload = {
            key: itemKey,
            quantity: parseInt(quantity)
        };

        console.log('Updating cart item with payload:', JSON.stringify(payload, null, 2));

        // Call WooCommerce API directly
        const response = await fetch(`${WC_STORE_URL}/cart/update-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader,
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Failed to update cart item: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.code || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Update cart item response:', result);

        // Revalidate paths
        revalidatePath('/cart');
        revalidatePath('/');

        return { success: true, ...result };

    } catch (error) {
        console.error('Update cart error:', error);
        return { success: false, error: error.message };
    }
}



export const getRecentProducts = async () => {
    try {
        const currency = await getCurrency();
        const locale = await getLocale();
        const user = await getAuthenticatedUser();
        const shippingCountry = user?.shipping?.country || user?.billing?.country || "";
        // const authHeader = Buffer
        //     .from(`${consumerKey}:${consumerSecret}`)
        //     .toString("base64");

        // const url = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/v3/products?orderby=date&order=desc&per_page=20&status=publish&_fields=id,name,images,slug,categories,price,regular_price,sale_price,price_html,type&lang=${locale}&currency=${currency}`;
        const url = `${process.env.WP_BASE_URL}/wp-json/afs/v1/products?orderby=date&order=desc&per_page=20&currency=${currency}&lang=${locale}&shipping_country=${shippingCountry}`

        const response = await fetch(url, {
            // headers: {
            //     Authorization: `Basic ${authHeader}`
            // },
            cache: "no-store"
        });

        if (!response.ok) {
            console.error('Failed to fetch recent products:', response.status, response.statusText);
            return [];
        }

        const { data } = await response.json();
        return Array.isArray(data) ? data : [];
    }
    catch (error) {
        console.error('Error fetching recent products:', error);
        return [];
    }
}


export async function searchProducts(query = "") {
    if (!query) return [];

    try {
        const locale = await getLocale();
        const user = await getAuthenticatedUser();
        const shippingCountry = user?.shipping?.country || user?.billing?.country || "";
        const currency = await getCurrency();

        const res = await fetch(
            `${process.env.WP_BASE_URL}/wp-json/afs/v1/products?search=${encodeURIComponent(query)}&currency=${currency}&lang=${locale}&shipping_country=${shippingCountry}&per_page=100`,
            {
                cache: "no-store",
            }
        );

        if (!res.ok) {
            console.error('Failed to search products:', res.status, res.statusText);
            return [];
        }

        const { data } = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
}


// Remove item from cart

export async function removeCartItem(itemKey) {
    const localeValue = await getLocaleValue();
    const WC_STORE_URL = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/v1`;
    try {
        const cookieHeader = await getWooCommerceCookies();

        const response = await fetch(`${WC_STORE_URL}/cart/remove-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader,
                'Accept': 'application/json',
            },
            body: JSON.stringify({ key: itemKey }),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Failed to remove item: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.code || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();

        // Revalidate paths if needed (these only work in Server Actions, not Route Handlers)
        revalidatePath('/cart');
        revalidatePath('/');

        return { success: true, ...result };

    } catch (error) {
        console.error('Remove from cart error:', error);
        return { success: false, error: error.message };
    }
}


// apply coupon
export async function applyCoupon(couponCode) {
    const localeValue = await getLocaleValue();
    try {

        // Validation
        if (!couponCode || couponCode.trim() === '') {
            return { success: false, error: 'Please enter a coupon code' };
        }

        const response = await fetch(`${WC_STORE_URL}/${localeValue}/cart/apply-coupon`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                code: couponCode.trim()
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to apply coupon: ${response.status}`);
        }

        const result = await response.json();

        // Revalidate cart page
        revalidatePath('/cart');

        return result;

    } catch (error) {
        console.error('Apply coupon error:', error);
        return { success: false, error: error.message };
    }
}

// Clear Cart
export async function clearCart() {
    const localeValue = await getLocaleValue();
    const WC_STORE_URL = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/v1`;

    try {
        // Get WooCommerce cookies
        const cookieHeader = await getWooCommerceCookies();

        // Use /cart/items endpoint with DELETE method to clear all items
        const response = await fetch(`${WC_STORE_URL}/cart/items`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Cookie': cookieHeader || '',
            },
            credentials: 'include',
        });

        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const errorText = await response.text();
            // Check if it's an HTML error page
            if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
                console.error('Clear cart error: Received HTML instead of JSON');
                return { success: false, error: "Received HTML instead of JSON" };
            }
            throw new Error(`Failed to clear cart: ${response.status} - ${errorText.substring(0, 100)}`);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to clear cart: ${response.status} - ${errorText.substring(0, 100)}`);
        }

        // Parse and set cookies from WooCommerce response
        const setCookieHeader = response.headers.get("set-cookie");
        if (setCookieHeader) {
            const cookieStore = await cookies();
            const parsedCookies = parseSetCookieHeader(setCookieHeader);

            for (const cookie of parsedCookies) {
                try {
                    const cookieOptions = {
                        path: '/',
                        sameSite: 'lax',
                        secure: process.env.NODE_ENV === 'production',
                    };

                    // Parse cookie options
                    cookie.options.forEach(option => {
                        const [key, value] = option.split('=');
                        const lowerKey = key.toLowerCase().trim();

                        if (lowerKey === 'max-age' || lowerKey === 'maxage') {
                            cookieOptions.maxAge = parseInt(value) || 60 * 60 * 24 * 2; // Default 2 days
                        } else if (lowerKey === 'expires') {
                            // Expires is handled by maxAge
                        } else if (lowerKey === 'secure') {
                            cookieOptions.secure = true;
                        } else if (lowerKey === 'httponly') {
                            cookieOptions.httpOnly = true;
                        } else if (lowerKey === 'samesite') {
                            cookieOptions.sameSite = value?.toLowerCase() || 'lax';
                        }
                    });

                    // Default maxAge if not set
                    if (!cookieOptions.maxAge) {
                        cookieOptions.maxAge = 60 * 60 * 24 * 2; // 2 days
                    }

                    cookieStore.set({
                        name: cookie.name,
                        value: cookie.value,
                        ...cookieOptions,
                    });
                } catch (err) {
                    console.error(`Error setting cookie ${cookie.name}:`, err);
                }
            }
        }

        const result = await response.json();

        // Revalidate paths
        revalidatePath('/cart');
        revalidatePath('/');

        return { success: true, ...result };

    } catch (error) {
        console.error('Clear cart error:', error);
        return { success: false, error: error.message };
    }
}


export async function removeCoupon(couponCode) {
    const localeValue = await getLocaleValue();
    try {

        // Validation
        if (!couponCode || couponCode.trim() === '') {
            return { success: false, error: 'Invalid coupon code' };
        }

        const response = await fetch(`${WC_STORE_URL}/${localeValue}/cart/remove-coupon`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                code: couponCode.trim()
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to remove coupon: ${response.status}`);
        }

        const result = await response.json();

        // Revalidate cart page
        revalidatePath('/cart');

        return result;

    } catch (error) {
        console.error('Remove coupon error:', error);
        return { success: false, error: error.message };
    }
}


export const getPaymentMethods = async () => {
    const localeValue = await getLocaleValue();
    const url = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/v3/payment_gateways`;
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Basic ${authHeader}` },
            cache: "no-store",
        });

        console.log(response, 'response');


        if (!response.ok) {
            throw new Error(`Failed to fetch payment methods: ${response.status}`);
        }
        const data = await response.json();
        const enabledMethods = data.filter((method) => method.enabled);
        return enabledMethods;
    }
    catch (error) {
        console.log(error);
        return error;
    }
}


export const createOrder = async (orderData) => {
    const localeValue = await getLocaleValue();
    const url = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/orders`;
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Basic ${authHeader}` },
            cache: "no-store",
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}
