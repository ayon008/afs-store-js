"use server"

import { cookies } from "next/headers";
import { getWooCommerceCookies, setCookiesFromResponse } from "../../Cookies/cookie-handler";


const WP_URL = process.env.WP_BASE_URL || 'https://staging.afs-foiling.com/fr';
const WC_STORE_URL = `${WP_URL}/wp-json/wc/store/v1`;



// Get cart
export async function getCart() {
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

        await setCookiesFromResponse(response);

        if (!response.ok) {
            throw new Error(`Failed to get cart: ${response.status}`);
        }

        const cartData = await response.json();
        return { success: true, data: cartData };

    } catch (error) {
        console.error('Get cart error:', error);
        return { success: false, error: error.message };
    }
}

export const updateBillingAndCart = async (billingData) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
        return { success: false, error: "Not authenticated" };
    }
    const cookieHeader = await getWooCommerceCookies();
    try {
        const cartRes = await fetch(
            `${process.env.WP_BASE_URL}/wp-json/wc/store/v1/cart/update-customer`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookieHeader,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    billing_address: {
                        first_name: billingData.billing_first_name || billingData.first_name || "",
                        last_name: billingData.billing_last_name || billingData.last_name || "",
                        company: billingData.billing_company || billingData.company || "",
                        address_1: billingData.billing_address_1 || billingData.address_1 || "",
                        address_2: billingData.billing_address_2 || billingData.address_2 || "", // optional
                        postcode: billingData.billing_postcode || billingData.postcode || "",
                        city: billingData.billing_city || billingData.city || "",
                        phone: billingData.billing_phone || billingData.phone || "",
                        email: billingData.billing_email || billingData.email || "",
                        country: billingData.country || billingData.country,
                    },
                }),
                cache: "no-store",
            }
        );

        if (!cartRes.ok) {
            const err = await cartRes.json();
            console.error("Cart update failed:", err);
            return { success: false, error: err.message };
        }
        const cart = await getCart();
        return { success: true, cart: cart };

    } catch (error) {
        console.error("Error updating shipping and cart:", error);
        return { success: false, error: error.message };
    }
}



export const updateShippingAndCart = async (shippingData) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
        return { success: false, error: "Not authenticated" };
    }
    const cookieHeader = await getWooCommerceCookies();
    try {
        const cartRes = await fetch(
            `${process.env.WP_BASE_URL}/wp-json/wc/store/v1/cart/update-customer`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookieHeader,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    shipping_address: {
                        first_name: shippingData.shipping_first_name || shippingData.first_name || "",
                        last_name: shippingData.shipping_last_name || shippingData.last_name || "",
                        company: shippingData.entreprise || shippingData.company || "",
                        address_1: shippingData.adresse || shippingData.address_1 || "",
                        address_2: shippingData.shipping_address_2 || shippingData.address_2 || "",
                        postcode: shippingData.postal || shippingData.postcode || "",
                        city: shippingData.ville || shippingData.city || "",
                        country: shippingData.country || shippingData.country || "FR",
                    },
                }),
                cache: "no-store",
            }
        );

        if (!cartRes.ok) {
            const err = await cartRes.json();
            console.error("Cart update failed:", err);
            return { success: false, error: err.message };
        }
        const cart = await getCart();
        return { success: true, cart: cart };

    } catch (error) {
        console.error("Error updating shipping and cart:", error);
        return { success: false, error: error.message };
    }
}