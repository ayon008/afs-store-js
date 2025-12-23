"use server"

import { getLocaleValue } from "../Woo-Coommerce/getWooCommerce";

const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET
const authHeader = Buffer
    .from(`${consumerKey}:${consumerSecret}`)
    .toString("base64");

// get All the parent Categories
export const getParentCategory = async (slug) => {
    const localeValue = await getLocaleValue();
    if (!slug || typeof slug !== "string") {
        throw new Error("A valid category slug must be provided.");
    }

    const url = `${process.env.WP_BASE_URL}/${localeValue}/wp-json/wc/v3/products/categories?slug=${encodeURIComponent(slug)}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${authHeader}`
            },
            // Next.js cache
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(
                `WooCommerce API error: ${response.status} ${response.statusText} — ${errorText}`
            );
        }

        const data = await response.json().catch(() => {
            throw new Error("Invalid JSON response received from WooCommerce API.");
        });

        return data[0];
    } catch (error) {
        console.error("getParentCategory() failed:", error);
        throw new Error("Unable to fetch parent category. Please try again later.");
    }
};
