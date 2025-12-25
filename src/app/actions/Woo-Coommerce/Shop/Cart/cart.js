
"use server"

import { cookies } from "next/headers";
import { getWooCommerceCookies } from "../../Cookies/cookie-handler";
import { getLocaleValue } from "../../getWooCommerce";




// Get cart - calls WooCommerce API directly to ensure cookies are synchronized
export async function getCart() {
    const localeValue = await getLocaleValue();
    const WP_URL = `${process.env.WP_BASE_URL}/${localeValue}`;
    const WC_STORE_URL = `${WP_URL}/wp-json/wc/store/v1`;
    try {
        const cookieHeader = await getWooCommerceCookies();

        const response = await fetch(`${WC_STORE_URL}/cart`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            // If error is HTML, return empty cart
            if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
                console.warn('getCart() received HTML error page, returning empty cart');
                return { success: true, data: { items: [], items_count: 0, totals: {} } };
            }
            throw new Error(`Failed to get cart: ${response.status}`);
        }

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.warn('getCart() response is not JSON, received:', text.substring(0, 100));
            return { success: true, data: { items: [], items_count: 0, totals: {} } };
        }

        const data = await response.json();

        return { success: true, data };

    } catch (error) {
        console.error('Get cart error:', error);
        return { success: false, error: error.message };
    }
}

export const updateBillingAndCart = async (billingData) => {
    const localeValue = await getLocaleValue();
    const WP_URL = `${process.env.WP_BASE_URL}/${localeValue}`;
    const WC_STORE_URL = `${WP_URL}/wp-json/wc/store/v1`;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
        return { success: false, error: "Not authenticated" };
    }
    const cookieHeader = await getWooCommerceCookies();
    try {
        const billingPayload = {
            first_name: billingData.billing_first_name || billingData.first_name || "",
            last_name: billingData.billing_last_name || billingData.last_name || "",
            company: billingData.billing_company || billingData.company || "",
            address_1: billingData.billing_address_1 || billingData.address_1 || "",
            address_2: billingData.billing_address_2 || billingData.address_2 || "",
            postcode: billingData.billing_postcode || billingData.postcode || "",
            city: billingData.billing_city || billingData.city || "",
            phone: billingData.billing_phone || billingData.phone || "",
            email: billingData.billing_email || billingData.email || "",
            country: billingData.country || "",
        };

        console.log("Updating billing address with payload:", billingPayload);

        const cartRes = await fetch(
            `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/v1/cart/update-customer`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookieHeader,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    billing_address: billingPayload,
                }),
                cache: "no-store",
            }
        );

        if (!cartRes.ok) {
            const err = await cartRes.json();
            console.error("Cart update failed:", err);
            return { success: false, error: err.message || "Failed to update billing address" };
        }

        const cartResData = await cartRes.json();
        console.log("Cart update response:", cartResData);

        // Now getCart() calls WooCommerce directly with synchronized cookies
        const cart = await getCart();
        console.log("Cart after update:", cart);

        return { success: true, cart };

    } catch (error) {
        console.error("Error updating billing and cart:", error);
        return { success: false, error: error.message };
    }
}



export const updateShippingAndCart = async (shippingData) => {
    const localeValue = await getLocaleValue();
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
        return { success: false, error: "Not authenticated" };
    }

    const cookieHeader = await getWooCommerceCookies();
    try {
        // Get current user to retrieve first_name and last_name if not provided
        let firstName = shippingData.shipping_first_name || shippingData.first_name;
        let lastName = shippingData.shipping_last_name || shippingData.last_name;

        // If first_name or last_name are missing, try to get them from the current cart
        if (!firstName || !lastName) {
            try {
                const currentCartRes = await fetch(
                    `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/v1/cart`,
                    {
                        method: 'GET',
                        headers: {
                            'Cookie': cookieHeader,
                            'Accept': 'application/json',
                        },
                        cache: 'no-store',
                    }
                );
                if (currentCartRes.ok) {
                    const currentCart = await currentCartRes.json();
                    if (currentCart?.shipping_address) {
                        firstName = firstName || currentCart.shipping_address.first_name || currentCart.billing_address?.first_name || "";
                        lastName = lastName || currentCart.shipping_address.last_name || currentCart.billing_address?.last_name || "";
                    }
                }
            } catch (cartError) {
                console.warn("Could not fetch current cart for first_name/last_name:", cartError);
            }
        }

        const shippingPayload = {
            first_name: firstName || "",
            last_name: lastName || "",
            company: shippingData.entreprise || shippingData.company || "",
            address_1: shippingData.adresse || shippingData.address_1 || "",
            address_2: shippingData.shipping_address_2 || shippingData.address_2 || "",
            postcode: shippingData.postal || shippingData.postcode || "",
            city: shippingData.ville || shippingData.city || "",
            country: shippingData.country || "FR",
        };

        console.log("Updating shipping address with payload:", shippingPayload);

        const cartRes = await fetch(
            `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/store/v1/cart/update-customer`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookieHeader,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    shipping_address: shippingPayload,
                }),
                cache: "no-store",
            }
        );

        if (!cartRes.ok) {
            const err = await cartRes.json();
            console.error("Cart update failed:", err);
            return { success: false, error: err.message || "Failed to update shipping address" };
        }

        const cartResData = await cartRes.json();
        console.log("Cart update response:", cartResData);

        // Now getCart() calls WooCommerce directly with synchronized cookies
        const cart = await getCart();
        console.log("Cart after update:", cart);

        return { success: true, cart };

    } catch (error) {
        console.error("Error updating shipping and cart:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Select shipping rate - WooCommerce version
 */
export async function selectShippingRate(rateId, packageId = 0) {
    const localeValue = await getLocaleValue();
    const WP_URL = `${process.env.WP_BASE_URL}/${localeValue}`;
    const WC_STORE_URL = `${WP_URL}/wp-json/wc/store/v1`;
    
    try {
        if (!rateId) {
            return { success: false, error: 'Shipping rate ID is required' };
        }

        const cookieHeader = await getWooCommerceCookies();

        const payload = {
            rate_id: rateId,
            package_id: parseInt(packageId) || 0
        };

        const response = await fetch(`${WC_STORE_URL}/cart/select-shipping-rate`, {
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

        return {
            success: true,
            cart: updatedCart
        };

    } catch (error) {
        console.error('Select shipping rate error:', error);
        return { success: false, error: error.message };
    }
}
