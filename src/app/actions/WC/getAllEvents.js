"use server";

import { getLocaleValue } from "../Woo-Coommerce/getWooCommerce";

export const getEventsDestinations = async () => {
    const localeValue = await getLocaleValue();
    const BASE = `${process.env.WP_BASE_URL}/${localeValue}`;

    // Check environment variable
    if (!BASE) {
        console.error("❌ WP_BASE_URL is missing in environment variables");
        return [];
    }

    try {
        const res = await fetch(
            `${BASE}/${localeValue}/wp-json/wp/v2/destination?per_page=100`,
            {
                next: { revalidate: 3600 }, // ISR cache
            }
        );

        if (!res.ok) {
            console.error(
                "❌ Failed to fetch event destinations:",
                res.status,
                res.statusText
            );
            return [];
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
            console.error("❌ Unexpected destination response format:", data);
            return [];
        }

        return data;
    } catch (error) {
        console.error("❌ Error fetching event destinations:", error);
        return [];
    }
};

export const getAllEvents = async (selectedId) => {
    const localeValue = await getLocaleValue();
    const BASE = `${process.env.WP_BASE_URL}/${localeValue}`;

    if (!BASE) {
        console.error("❌ WP_BASE_URL is missing!");
        return [];
    }

    const perPage = 100;
    let allEvents = [];

    try {
        // We loop for 1 → 100 pages max (WP won’t go beyond)
        for (let page = 1; page <= 100; page++) {
            const url = selectedId ? `${BASE}/wp-json/wp/v2/event?destination=${selectedId}` : `${BASE}/wp-json/wp/v2/event?per_page=${perPage}&page=${page}&_embed`
            const res = await fetch(
                url,
                {
                    next: { revalidate: 3600 },
                }
            );

            // WordPress returns 400 when page exceeds max
            if (!res.ok) {
                if (res.status === 400) break; // stop pagination
                console.error("❌ Failed to fetch events:", res.status, res.statusText);
                break;
            }

            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                break; // no more posts
            }

            allEvents.push(...data); // merge events
        }

        return allEvents;
    } catch (err) {
        console.error("❌ Error while fetching events:", err);
        return [];
    }
};
