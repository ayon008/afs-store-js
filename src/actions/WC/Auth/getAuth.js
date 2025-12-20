"use server"
// app/actions/auth.ts
import { cookies } from "next/headers";
// import { getWooCommerceCookies } from "./StoreApi/cookie-handler";
// import { getCart } from "./StoreApi/cart";


const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET
const authHeader = Buffer
    .from(`${consumerKey}:${consumerSecret}`)
    .toString("base64");

// Get User
export const getAuthenticatedUser = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) return null;

        /* 1️⃣ Get WordPress user */
        const wpRes = await fetch(
            `${process.env.WP_BASE_URL}/wp-json/wp/v2/users/me?context=edit`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (!wpRes.ok) return null;
        const wpUser = await wpRes.json();

        /* 2️⃣ Get WooCommerce customer (billing + shipping) */
        const wcRes = await fetch(
            `${process.env.WP_BASE_URL}/wp-json/wc/v3/customers/${wpUser.id}`,
            {
                headers: {
                    Authorization: `Basic ${authHeader}`,
                },
                cache: "no-store",
            }
        );

        if (!wcRes.ok) {
            // fallback: return WP user if WC fails
            return wpUser;
        }

        const wcCustomer = await wcRes.json();

        console.log(wcCustomer, 'wcCustomer');


        /* 3️⃣ Merge & return */
        return {
            ...wpUser,
            billing: wcCustomer.billing || {},
            shipping: wcCustomer.shipping || {},
        };
    } catch (error) {
        console.error("Error fetching authenticated user:", error);
        return null;
    }
};



// Create User / Register User
export const registerStoreUser = async (userInfo) => {
    try {
        const token = btoa("upwork13:shariar5175A"); // username:password

        const response = await fetch(`${process.env.WP_BASE_URL}/wp-json/wc/v3/customers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic " + token,
            },
            body: JSON.stringify({
                ...userInfo,
                role: "customer",
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
};



// Login User

export const loginUser = async (userInfo) => {

    try {
        const response = await fetch(`${process.env.WP_BASE_URL}/wp-json/jwt-auth/v1/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userInfo)
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        const data = await response.json();

        const cookieStore = await cookies();

        if (data && data?.token) {
            const payload = JSON.parse(
                Buffer.from(data.token.split('.')[1], 'base64').toString()
            )
            const tokenExpirySeconds = payload.exp - Math.floor(Date.now() / 1000)

            // If user asked to be remembered, request a longer-lived cookie when reasonable.
            // Note: actual token validity is determined by the token's `exp` claim from the server.
            const REMEMBER_30_DAYS = 60 * 60 * 24 * 30;
            const requestedRemember = !!userInfo?.remember;
            const maxAge = requestedRemember ? Math.max(tokenExpirySeconds, REMEMBER_30_DAYS) : tokenExpirySeconds;

            cookieStore.set({
                name: "auth_token",
                value: data.token,
                httpOnly: true,       // Secure: cannot access from client JS
                path: "/",            // Cookie available on all pages
                maxAge,               // Expiry time
                sameSite: "strict",   // CSRF protection
                priority: "high",
                secure: process.env.NODE_ENV === "production",
            });
        }
        return data;
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}




// Update Profile in WordPress and WooCommerce

export async function updateProfile(data) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        // 1️⃣ Get the WordPress user (to get the ID)
        const wpRes = await fetch(`${process.env.WP_BASE_URL}/wp-json/wp/v2/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!wpRes.ok) {
            const errorData = await wpRes.json();
            throw new Error(errorData.message || "Failed to fetch user");
        };

        const wpUser = await wpRes.json();

        // 2️⃣ Update WordPress user info (first_name, last_name, email, etc.)
        const wpUpdateRes = await fetch(`${process.env.WP_BASE_URL}/wp-json/wp/v2/users/me`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                display_name: data.display_name,
                nickname: data.nickname,
            }),
        });

        const wpResult = await wpUpdateRes.json();


        if (!wpUpdateRes.ok) {
            const errorData = await wpUpdateRes.json();
            throw new Error(errorData.message || "Failed to update WordPress user");
        }

        // 3️⃣ Update WooCommerce billing/shipping info
        if (data.billing || data.shipping) {

            const wcRes = await fetch(`${process.env.WP_BASE_URL}/wp-json/wc/v3/customers/${wpUser.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${authHeader}`,
                },
                body: JSON.stringify({
                    billing: {
                        phone: data?.billing.phone
                    }
                }),
            });

            const wcResult = await wcRes.json();

            if (!wcRes.ok) {
                const errorData = await wcRes.json();
                throw new Error(errorData.message || "Failed to update WooCommerce info");
            }

            return { success: true, wpUser: wpResult, wcUser: wcResult };
        }

        return { success: true, wpUser: wpResult };

    } catch (error) {
        console.error("Error updating profile:", error);
        throw new Error(error.message);
    }
}