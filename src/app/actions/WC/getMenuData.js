"use server"

import { getLocaleValue } from "../Woo-Coommerce/getWooCommerce";

export const getMenuItems = async () => {
    const localeValue = await getLocaleValue();
    try {
        const response = await fetch(`${process.env.WP_BASE_URL}/${localeValue}/wp-json/custom/v1/menus/2118`,
            {
                next: { revalidate: 3600 },
                cache: "force-cache"
            });

        // Check content type first before checking response.ok
        const contentType = response.headers.get('content-type') || '';
        const isHTML = contentType.includes('text/html') || !contentType.includes('application/json');

        // Get response text to check if it's HTML
        let responseText = '';
        try {
            responseText = await response.text();
        } catch (textError) {
            console.warn("getMenuItems() failed to read response text:", textError);
            return [];
        }

        // Check if response is HTML
        if (isHTML || responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            console.warn("getMenuItems() received HTML response (status:", response.status, "), returning empty array");
            return [];
        }

        // If response is not OK, return empty array
        if (!response.ok) {
            console.warn("getMenuItems() API error:", response.status);
            return [];
        }

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.warn("getMenuItems() failed to parse JSON, received:", responseText.substring(0, 100));
            return [];
        }

        const items = data;
        const menuData = items?.map((item) => {
            return (
                {
                    name: item?.title ?? "",
                    href: item?.url ?? "#",

                    sublinks: Array.isArray(item?.children)
                        ? item.children.map((child) => ({
                            name: child?.title ?? "",
                            id: child?.id ?? null,
                            button_one: child?.button_one ?? null,
                            button_two: child?.button_two ?? null,
                            products: child?.menu_products ?? [],
                            url: child?.url ?? null,
                        }))
                        : [],
                }
            )
        })
        return menuData || [];
    } catch (error) {
        console.error("getMenuItems() error:", error);
        return []; // Prevents breaking the UI
    }
}

