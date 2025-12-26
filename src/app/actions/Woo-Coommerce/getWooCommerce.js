'use server';
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "../WC/Auth/getAuth";
import { getWooCommerceCookies } from "./Cookies/cookie-handler";
import { getCart } from "./Shop/Cart/cart";
import { getLocale } from "next-intl/server";
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

export const calculatePriceWithTax = async (basePrice, tax_class = "standard", country = null) => {
    const localeValue = await getLocaleValue();
    try {
        // Get user country from shipping/billing address, default to France
        const cookieHeader = await getWooCommerceCookies();
        let userCountry = country;
        const cart = await getCart(cookieHeader);
        const defaultCountry = cart?.data?.shipping_address?.country || cart?.data?.billing_address?.country || "FR";

        if (!userCountry) {
            const user = await getAuthenticatedUser();
            if (user) {
                userCountry = user.shipping?.country || user.billing?.country || defaultCountry;
            } else {
                userCountry = defaultCountry;
            }
        }

        // Fetch all tax rates (paginated)
        const per_page = 100;
        let page = 1;
        let allTaxRates = [];

        while (true) {
            const response = await fetch(
                `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/v3/taxes?per_page=${per_page}&page=${page}`,
                {
                    headers: {
                        Authorization: `Basic ${authHeader}`,
                        'Content-Type': 'application/json',
                    },
                    cache: "no-cache"
                }
            );

            if (!response.ok) throw new Error('Failed to fetch tax rates');

            const taxes = await response.json();
            if (!Array.isArray(taxes) || taxes.length === 0) break;

            allTaxRates.push(...taxes);
            if (taxes.length < per_page) break;
            page++;
        }

        // Normalize tax_class (same logic as getUserTaxRate)
        const normalizedTaxClass = (!tax_class || tax_class === "" || tax_class === "standard")
            ? "standard"
            : tax_class.toLowerCase();

        // Find matching tax rate by country AND tax_class
        const matchingTax = allTaxRates.find(rate => {
            const rateCountry = rate?.country?.toLowerCase() || "";
            const rateClass = rate?.class?.toLowerCase() || "standard";

            // Match country (case-insensitive)
            const countryMatch = rateCountry === userCountry.toLowerCase();

            // Match tax class (WooCommerce stores standard class as empty string)
            const classMatch = (normalizedTaxClass === "standard" && (rateClass === "" || rateClass === "standard"))
                || rateClass === normalizedTaxClass;

            return countryMatch && classMatch;
        });

        // Calculate and apply tax
        const taxRate = parseFloat(matchingTax?.rate) || 0;
        const priceWithTax = basePrice + (basePrice * taxRate) / 100;

        return parseFloat(priceWithTax?.toFixed(2));
    } catch (error) {
        console.error('Error calculating tax:', error);
        return basePrice; // fallback to base price on error
    }
};

// Get all the products by category Id
export const getProductsByCategoryId = async (ids, max, min) => {
    const currency = await getCurrency();
    const locale = await getLocale();
    try {
        // Convert "12,40" or [12,40] or 12 → always array
        let categories = Array.isArray(ids)
            ? ids.map(Number)
            : String(ids).split(",").map(Number);

        if (categories.length === 0) return [];

        const categoriesIds = categories.join(",");
        let allProducts = [];
        const per_page = 100;

        // 1️⃣ Fetch products only from first category
        for (let i = 1; ; i++) {
            let url = `${process.env.WP_BASE_URL}/wp-json/wc/v3/products?category=${categoriesIds}&status=publish&stock_status=instock&_fields=id,name,images,slug,categories,price,regular_price,price_with_tax,sale_price,price_html,type&per_page=${per_page}&page=${i}&lang=${locale}&currency=${currency}`;

            if (min != null) url += `&min_price=${Number(min)}`;
            if (max != null) url += `&max_price=${Number(max)}`;

            const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

            const response = await fetch(url, {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
                cache: "force-cache",
                next: { revalidate: 3600 }
            });

            if (!response.ok) break;

            const data = await response.json();

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
    const localeValue = await getLocaleValue();
    const url = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/v3/products/categories?parent=${parentId}&per_page=100&_fields=id,name,slug`;
    // const url = `https://afs-foiling.com/fr/wp-json/wc/v3/products/categories?parent=${parentId}&per_page=100&_fields=id,name,slug`;
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



// Get single product by their slug

export const getProductBySlug = async (slug) => {
    const localeValue = await getLocaleValue();
    const currency = await getCurrency();
    const url = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/v3/products?slug=${slug}&currency=${currency || 'euro'}`;
    // const url = `https://afs-foiling.com/fr/wp-json/wc/v3/products?slug=${slug}`;
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${authHeader}`
            },
            cache: "no-cache",
        })
        const data = await response.json();
        const product = data[0];


        if (product) {
            const basePrice = parseFloat(product.price) || 0;
            const priceWithTax = await calculatePriceWithTax(basePrice, product.tax_class);
            return { ...product, price_with_tax: priceWithTax };
        }
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

    if (!token) {
        return { success: false, error: 'Not authenticated' };
    }

    const { currentPassword, newPassword } = data;

    console.log('currentPassword', currentPassword);


    try {
        // 1️⃣ Get current user (to obtain username/email)
        const user = await getAuthenticatedUser();

        const username = user.slug; // or user.email

        // 2️⃣ Verify current password
        const verifyRes = await fetch(
            `${process.env.WP_BASE_URL}/wp-json/jwt-auth/v1/token`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password: currentPassword,
                }),
            }
        );

        if (!verifyRes.ok) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // 3️⃣ Change password
        const changeRes = await fetch(
            `${process.env.WP_BASE_URL}/wp-json/wp/v2/users/me`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    password: newPassword,
                }),
            }
        );

        if (!changeRes.ok) {
            return { success: false, error: 'Failed to change password' };
        }

        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, error: 'Something went wrong' };
    }
}



export const getPrice = async (productId, selectedVariation) => {
    const locale = await getLocale();
    const currency = await getCurrency();
    console.log(currency, 'currency');

    // const url = `https://afs-foiling.com/fr/wp-json/wc/v3/products/${productId}/variations?per_page=100`;
    const url = `${process.env.WP_BASE_URL}/wp-json/wc/v3/products/${productId}/variations?per_page=100&lang=${locale}&currency=${currency}`;

    try {
        const cart = await getCart();
        const defaultCountry = cart?.data?.shipping_address?.country || cart?.data?.billing_address?.country || "FR"; // Default to France
        const user = await getAuthenticatedUser();
        let userCountry;
        if (user) {
            // Priority: shipping country > billing country > default FR
            userCountry = user.shipping?.country || user.billing?.country || "FR";
        } else {
            userCountry = defaultCountry;
        }

        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${authHeader}`,
            },
            cache: "no-cache",
        });

        const variations = await response.json();

        const matchedVariation = variations.find((variation) => {

            return variation.attributes.every((attr) => {
                // WooCommerce provides english slug → convert to readable name
                const attrName = attr.name
                    .replace("attribute_", "")
                    .toLowerCase()
                    .trim();

                // Convert selectedVariation keys to lower-case comparison form
                const selectedEntry = Object.entries(selectedVariation).find(
                    ([key]) => key.toLowerCase().trim() === attrName
                );

                if (!selectedEntry) {
                    return true;
                }

                const selectedValue = selectedEntry[1];

                if (!selectedValue) return false;

                // Compare values
                return (
                    selectedValue.toLowerCase().trim() ===
                    attr.option.toLowerCase().trim()
                );
            });
        });

        const basePrice = parseFloat(matchedVariation?.price) || 0;
        const priceWithTax = await calculatePriceWithTax(basePrice, matchedVariation?.tax_class, userCountry);
        const taxAmount = parseFloat((priceWithTax - basePrice).toFixed(2));

        return {
            price: priceWithTax,
            priceExcludingTax: basePrice,
            taxAmount: taxAmount,
            userCountry: userCountry, // Return the country used for tax calculation
            id: matchedVariation?.id,
            attributes: matchedVariation
        } || null;

    } catch (error) {
        console.log(error);
        return null;
    }
};

// add-item - calls WooCommerce API directly to ensure cookies are synchronized
export async function addToCart(productId, quantity = 1, variationId = null, variation = {}) {
    const localeValue = await getLocaleValue();
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
    const localeValue = await getLocaleValue();
    const WC_STORE_URL = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/v1`;
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
        const localeValue = await getLocaleValue();
        const authHeader = Buffer
            .from(`${consumerKey}:${consumerSecret}`)
            .toString("base64");

        const url = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/v3/products?orderby=date&order=desc&per_page=20&status=publish&_fields=id,name,images,slug,categories,price,regular_price,sale_price,price_html,type`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${authHeader}`
            },
            cache: "no-store"
        });

        if (!response.ok) {
            console.error('Failed to fetch recent products:', response.status, response.statusText);
            return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    }
    catch (error) {
        console.error('Error fetching recent products:', error);
        return [];
    }
}
export async function searchProducts(query) {
    if (!query) return [];

    try {
        const localeValue = await getLocaleValue();
        const authHeader = Buffer
            .from(`${consumerKey}:${consumerSecret}`)
            .toString("base64");

        const res = await fetch(
            `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/v3/products?search=${encodeURIComponent(query)}&per_page=100&status=publish&_fields=id,name,images,slug,categories,price,regular_price,sale_price,price_html,type`,
            {
                headers: {
                    Authorization: `Basic ${authHeader}`
                },
                cache: "no-store",
            }
        );

        if (!res.ok) {
            console.error('Failed to search products:', res.status, res.statusText);
            return [];
        }

        const data = await res.json();
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