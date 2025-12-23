"use server";

import { getLocaleValue } from "../Woo-Coommerce/getWooCommerce";

export const getDealers = async (selectedId) => {
    const localeValue = await getLocaleValue();
    try {
        const baseUrl = `${process.env.WP_BASE_URL}/${localeValue}`;

        if (!baseUrl) {
            console.error("❌ Missing WP_BASE_URL in environment variables.");
            return [];
        }

        let allDealers = [];
        const perPage = 100;


        for (let page = 1; ; page++) {
            const url = selectedId
                ? `${baseUrl}/${localeValue}/wp-json/wp/v2/dealer?_embed&afs-dealers-type=${selectedId}&per_page=${perPage}&page=${page}`
                : `${baseUrl}/${localeValue}/wp-json/wp/v2/dealer?per_page=${perPage}&page=${page}&_embed`;

            const response = await fetch(
                url,
                {
                    next: { revalidate: 3600 },
                    headers: { "Content-Type": "application/json" },
                    cache: "force-cache"
                }
            );

            // If no more pages or error at high page
            if (!response.ok) break;

            const batch = await response.json();

            if (!Array.isArray(batch) || batch.length === 0) break;

            allDealers = [...allDealers, ...batch];

            // If less than the page size, means no more pages
            if (batch.length < perPage) break;
        }

        return allDealers;

    } catch (error) {
        console.error("❌ getDealers(): Unexpected Error", error);
        return [];
    }
};



export const getDealerType = async () => {
    const localeValue = await getLocaleValue();
    const BASE = `${process.env.WP_BASE_URL}/${localeValue}`;

    if (!BASE) {
        console.error("❌ WP_BASE_URL is missing in environment variables");
        return []; // safe fallback
    }

    try {
        const res = await fetch(
            `${BASE}/${localeValue}/wp-json/wp/v2/afs-dealers-type?per_page=100`,
            {
                next: { revalidate: 3600 }, // ISR cache
            }
        );

        if (!res.ok) {
            console.error("❌ Failed to fetch dealer types:", res.status, res.statusText);
            return [];
        }

        const data = await res.json();

        // Validate data is actually an array
        if (!Array.isArray(data)) {
            console.error("❌ Unexpected response format for dealer types:", data);
            return [];
        }

        return data;
    } catch (error) {
        console.error("❌ Error fetching dealer types:", error);
        return []; // production-safe fallback
    }
};
