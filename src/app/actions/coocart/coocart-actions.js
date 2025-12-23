"use server"

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getWooCommerceCookies } from "../Woo-Coommerce/Cookies/cookie-handler";

const COCART_API_URL = process.env.NEXT_PUBLIC_COCART_URL || process.env.WP_BASE_URL + '/wp-json/cocart/v2';

/**
 * Get cart key from cookies (server-side)
 */
async function getCartKeyFromCookies() {
    const cookieStore = await cookies();
    return cookieStore.get('cocart_cart_key')?.value || '';
}

/**
 * Get cart - CoCart version
 * - For logged-in users: Returns user's cart
 * - For guests: Returns session-based cart using cart_key
 */
export async function getCart() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const cartKey = await getCartKeyFromCookies();

        // Get WooCommerce cookies for session
        const cookieHeader = await getWooCommerceCookies();

        // Build headers
        const headers = {
            'Accept': 'application/json',
        };

        // Add cookies to headers for session management
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        console.log(token, 'token');

        // If user is logged in, include authentication token
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build URL with cart_key if available
        const url = cartKey
            ? `${COCART_API_URL}/cart?cart_key=${cartKey}`
            : `${COCART_API_URL}/cart`;

        const response = await fetch(url, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });


        console.log(response, 'response');


        if (!response.ok) {
            throw new Error(`Failed to get cart: ${response.status}`);
        }

        const data = await response.json();

        // Save cart_key to cookies if returned
        if (data.cart_key && typeof data.cart_key === 'string') {
            cookieStore.set({
                name: 'cocart_cart_key',
                value: data.cart_key,
                path: '/',
                maxAge: 60 * 60 * 24 * 2, // 2 days
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });
        }

        return { success: true, data };

    } catch (error) {
        console.error('Get cart error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add item to cart - CoCart version
 */
export async function addToCart(productId, quantity = 1, variationId = null, variation = {}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const cartKey = await getCartKeyFromCookies();

        // Build payload for CoCart
        // CoCart expects 'id' for the product/variation ID
        // Validate and convert IDs
        const productIdNum = parseInt(productId);
        const quantityNum = parseInt(quantity);

        if (!productId || isNaN(productIdNum) || productIdNum <= 0) {
            throw new Error('Invalid product ID');
        }

        if (isNaN(quantityNum) || quantityNum <= 0) {
            throw new Error('Invalid quantity');
        }

        const payload = {
            id: productIdNum, // CoCart uses 'id' for both products and variations
            quantity: quantityNum,
        };

        // If variationId is provided, use it instead of productId
        if (variationId) {
            const variationIdNum = parseInt(variationId);
            if (!isNaN(variationIdNum) && variationIdNum > 0) {
                payload.id = variationIdNum;
            }
        }

        // Handle variations - CoCart expects variation as an object
        if (variation && typeof variation === 'object' && Object.keys(variation).length > 0) {
            if (Array.isArray(variation)) {
                // Convert array to object format
                payload.variation = {};
                variation.forEach(item => {
                    const attribute = item.attribute || item.name || item.key || '';
                    const value = typeof item.value === 'string' ? item.value : String(item.value || '');
                    if (attribute && value) {
                        payload.variation[attribute] = value;
                    }
                });
            } else {
                // Already an object
                payload.variation = variation;
            }
        }

        // Get WooCommerce cookies for session
        const cookieHeader = await getWooCommerceCookies();

        // Build headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        // Add cookies to headers for session management
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build URL with cart_key if available
        const url = cartKey
            ? `${COCART_API_URL}/cart/add-item?cart_key=${cartKey}`
            : `${COCART_API_URL}/cart/add-item`;

        const response = await fetch(url, {
            method: 'POST',
            headers,
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

        const result = await response.json();
        console.log('Add to cart response:', result);

        // Save cart_key to cookies if returned
        if (result.cart_key && typeof result.cart_key === 'string') {
            cookieStore.set({
                name: 'cocart_cart_key',
                value: result.cart_key,
                path: '/',
                maxAge: 60 * 60 * 24 * 2, // 2 days
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });
        }

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

/**
 * Update cart item quantity - CoCart version
 */
export async function updateCartItem(itemKey, quantity) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const cartKey = await getCartKeyFromCookies();

        // Validate quantity
        if (!itemKey) {
            return { success: false, error: 'Item key is required' };
        }

        if (quantity < 1) {
            return { success: false, error: 'Quantity must be at least 1' };
        }

        const payload = {
            quantity: parseInt(quantity)
        };

        console.log('Updating cart item with payload:', JSON.stringify(payload, null, 2));

        // Get WooCommerce cookies for session
        const cookieHeader = await getWooCommerceCookies();

        // Build headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        // Add cookies to headers for session management
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build URL with cart_key if available
        const url = cartKey
            ? `${COCART_API_URL}/cart/item/${itemKey}?cart_key=${cartKey}`
            : `${COCART_API_URL}/cart/item/${itemKey}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers,
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

/**
 * Remove item from cart - CoCart version
 */
export async function removeCartItem(itemKey) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const cartKey = await getCartKeyFromCookies();

        // Validate item key
        if (!itemKey) {
            return { success: false, error: 'Item key is required' };
        }

        console.log('Removing cart item:', itemKey);

        // Get WooCommerce cookies for session
        const cookieHeader = await getWooCommerceCookies();

        // Build headers
        const headers = {
            'Accept': 'application/json',
        };

        // Add cookies to headers for session management
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build URL with cart_key if available
        const url = cartKey
            ? `${COCART_API_URL}/cart/item/${itemKey}?cart_key=${cartKey}`
            : `${COCART_API_URL}/cart/item/${itemKey}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers,
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
        console.log('Remove cart item response:', result);

        // Revalidate paths
        revalidatePath('/cart');
        revalidatePath('/');

        return { success: true, ...result };

    } catch (error) {
        console.error('Remove from cart error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Clear cart - CoCart version
 */
export async function clearCart() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const cartKey = await getCartKeyFromCookies();

        // Get WooCommerce cookies for session
        const cookieHeader = await getWooCommerceCookies();

        // Build headers
        const headers = {
            'Accept': 'application/json',
        };

        // Add cookies to headers for session management
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build URL with cart_key if available
        const url = cartKey
            ? `${COCART_API_URL}/cart?cart_key=${cartKey}`
            : `${COCART_API_URL}/cart`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers,
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Failed to clear cart: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.code || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Clear cart response:', result);

        // Revalidate paths
        revalidatePath('/cart');
        revalidatePath('/');

        return { success: true, ...result };

    } catch (error) {
        console.error('Clear cart error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Apply coupon - CoCart version
 */
export async function applyCoupon(couponCode) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const cartKey = await getCartKeyFromCookies();

        if (!couponCode) {
            return { success: false, error: 'Coupon code is required' };
        }

        const payload = {
            code: couponCode
        };

        // Get WooCommerce cookies for session
        const cookieHeader = await getWooCommerceCookies();

        // Build headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        // Add cookies to headers for session management
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build URL with cart_key if available
        const url = cartKey
            ? `${COCART_API_URL}/cart/apply-coupon?cart_key=${cartKey}`
            : `${COCART_API_URL}/cart/apply-coupon`;

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Failed to apply coupon: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.code || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Apply coupon response:', result);

        // Revalidate paths
        revalidatePath('/cart');
        revalidatePath('/checkout');

        return { success: true, ...result };

    } catch (error) {
        console.error('Apply coupon error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove coupon - CoCart version
 */
export async function removeCoupon(couponCode) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const cartKey = await getCartKeyFromCookies();

        if (!couponCode) {
            return { success: false, error: 'Coupon code is required' };
        }

        // Get WooCommerce cookies for session
        const cookieHeader = await getWooCommerceCookies();

        // Build headers
        const headers = {
            'Accept': 'application/json',
        };

        // Add cookies to headers for session management
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build URL with cart_key if available
        const url = cartKey
            ? `${COCART_API_URL}/cart/remove-coupon/${couponCode}?cart_key=${cartKey}`
            : `${COCART_API_URL}/cart/remove-coupon/${couponCode}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers,
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Failed to remove coupon: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.code || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Remove coupon response:', result);

        // Revalidate paths
        revalidatePath('/cart');
        revalidatePath('/checkout');

        return { success: true, ...result };

    } catch (error) {
        console.error('Remove coupon error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update cart customer billing address - CoCart version
 */
export async function updateCartBillingAddress(billingData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const cartKey = await getCartKeyFromCookies();

        // Build billing payload exactly as CoCart expects
        const billingPayload = {
            first_name: billingData.billing_first_name || billingData.first_name || "",
            last_name: billingData.billing_last_name || billingData.last_name || "",
            company: billingData.billing_company || billingData.company || "",
            address_1: billingData.billing_address_1 || billingData.address_1 || "",
            address_2: billingData.billing_address_2 || billingData.address_2 || "",
            postcode: billingData.billing_postcode || billingData.postcode || "",
            city: billingData.billing_city || billingData.city || "",
            state: billingData.billing_state || billingData.state || "",
            phone: billingData.billing_phone || billingData.phone || "",
            email: billingData.billing_email || billingData.email || "",
            country: billingData.billing_country || billingData.country || "",
        };

        // Get WooCommerce cookies for session
        const cookieHeader = await getWooCommerceCookies();

        // Build headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        // Add cookies to headers for session management
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build URL with cart_key if available
        const url = cartKey
            ? `${COCART_API_URL}/cart/update-customer?cart_key=${cartKey}`
            : `${COCART_API_URL}/cart/update-customer`;

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                billing_address: billingPayload,
            }),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to update billing address: ${response.status}`);
        }

        const cartData = await response.json();

        // Revalidate cart-related paths
        revalidatePath('/cart');
        revalidatePath('/checkout');

        return {
            success: true,
            data: cartData,
            cart: { success: true, data: cartData }
        };

    } catch (error) {
        console.error("Error updating cart billing address:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update cart customer shipping address - CoCart version
 */
export async function updateCartShippingAddress(shippingData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const cartKey = await getCartKeyFromCookies();

        // Build shipping payload exactly as CoCart expects
        const shippingPayload = {
            first_name: shippingData.shipping_first_name || shippingData.first_name || "",
            last_name: shippingData.shipping_last_name || shippingData.last_name || "",
            company: shippingData.shipping_company || shippingData.company || shippingData.entreprise || "",
            address_1: shippingData.shipping_address_1 || shippingData.address_1 || shippingData.adresse || "",
            address_2: shippingData.shipping_address_2 || shippingData.address_2 || "",
            postcode: shippingData.shipping_postcode || shippingData.postcode || shippingData.postal || "",
            city: shippingData.shipping_city || shippingData.city || shippingData.ville || "",
            state: shippingData.shipping_state || shippingData.state || "",
            country: shippingData.shipping_country || shippingData.country || "FR",
        };

        // Get WooCommerce cookies for session
        const cookieHeader = await getWooCommerceCookies();

        // Build headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        // Add cookies to headers for session management
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build URL with cart_key if available
        const url = cartKey
            ? `${COCART_API_URL}/cart/update-customer?cart_key=${cartKey}`
            : `${COCART_API_URL}/cart/update-customer`;

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                shipping_address: shippingPayload,
            }),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to update shipping address: ${response.status}`);
        }

        const cartData = await response.json();

        // Revalidate cart-related paths
        revalidatePath('/cart');
        revalidatePath('/checkout');

        return {
            success: true,
            data: cartData,
            cart: { success: true, data: cartData }
        };

    } catch (error) {
        console.error("Error updating cart shipping address:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Select shipping rate - CoCart version
 */
export async function selectShippingRate(rateId, packageId = 0) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const cartKey = await getCartKeyFromCookies();

        if (!rateId) {
            return { success: false, error: 'Shipping rate ID is required' };
        }

        const payload = {
            rate_id: rateId,
            package_id: parseInt(packageId) || 0
        };

        // Get WooCommerce cookies for session
        const cookieHeader = await getWooCommerceCookies();

        // Build headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        // Add cookies to headers for session management
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build URL with cart_key if available
        const url = cartKey
            ? `${COCART_API_URL}/cart/select-shipping-rate?cart_key=${cartKey}`
            : `${COCART_API_URL}/cart/select-shipping-rate`;

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Failed to select shipping rate: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.code || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // Get updated cart
        const updatedCart = await getCart();

        revalidatePath('/cart');
        revalidatePath('/checkout');

        return {
            success: true,
            message: 'Shipping rate selected',
            data: data,
            cart: updatedCart
        };

    } catch (error) {
        console.error('Select shipping rate error:', error);
        return { success: false, error: error.message };
    }
}

// Legacy function names for backward compatibility
export const updateBillingAndCart = updateCartBillingAddress;
export const updateShippingAndCart = updateCartShippingAddress;
