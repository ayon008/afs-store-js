"use server"

import { getLocale } from "next-intl/server";

const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET
const authHeader = Buffer
    .from(`${consumerKey}:${consumerSecret}`)
    .toString("base64");

// get All the parent Categories
export const getParentCategory = async (slug) => {
    const locale = await getLocale()
    if (!slug || typeof slug !== "string") {
        throw new Error("A valid category slug must be provided.");
    }

    const url = `${process.env.WP_BASE_URL}/wp-json/wc/v3/products/categories?slug=${encodeURIComponent(slug)}&lang=${locale}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${authHeader}`
            },
            // Next.js cache
            next: { revalidate: 3600 }
        });

        // Check if response is OK and is JSON
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");

            // If error is HTML (like 500 error page), truncate it
            let errorMessage = `WooCommerce API error: ${response.status} ${response.statusText}`;
            if (errorText) {
                if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
                    // It's HTML, just log a warning
                    console.warn(`getParentCategory() received HTML error page (${response.status})`);
                    errorMessage += ' - HTML error page received';
                } else {
                    // It's text, include first 200 chars
                    const truncatedError = errorText.length > 200
                        ? errorText.substring(0, 200) + '...'
                        : errorText;
                    errorMessage += ` — ${truncatedError}`;
                }
            }
            throw new Error(errorMessage);
        }

        // Check if response is JSON before parsing
        if (!isJson) {
            const text = await response.text();
            console.warn('getParentCategory() response is not JSON, received:', text.substring(0, 100));
            throw new Error("Invalid JSON response received from WooCommerce API.");
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
