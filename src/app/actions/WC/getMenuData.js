"use server"

import { getLocale } from "next-intl/server";
import { getCurrency } from "../Woo-Coommerce/getWooCommerce";


/**
 * Helper function to fetch menu from the new AFS Menu REST API
 * Falls back to legacy endpoint if new one fails
 *
 * @param {string} menuId - WordPress menu ID
 * @param {string} lang - Language code (en, fr)
 * @param {string} currency - Currency code (EUR, USD, GBP)
 * @returns {Promise<Array|null>}
 */
const fetchMenu = async (menuId, lang = 'en', currency = 'EUR') => {
    // Build URL with query parameters for the new AFS Menu API
    const params = new URLSearchParams();
    if (lang) params.append('lang', lang);
    if (currency) params.append('currency', currency);

    const queryString = params.toString();
    const newApiUrl = `${process.env.WP_BASE_URL}/wp-json/afs-menu/v1/menus/${menuId}${queryString ? '?' + queryString : ''}`;
    const legacyApiUrl = `${process.env.WP_BASE_URL}/wp-json/custom/v1/menus/${menuId}`;

    // Try new API first
    let data = await fetchFromApi(newApiUrl);

    // Fallback to legacy API if new one fails
    if (!data) {
        console.warn("fetchMenu() new API failed, trying legacy endpoint");
        data = await fetchFromApi(legacyApiUrl);
    }

    return data;
};

/**
 * Helper to fetch from a specific API URL
 *
 * @param {string} url - Full API URL
 * @returns {Promise<Array|null>}
 */
const fetchFromApi = async (url) => {
    try {
        const response = await fetch(url, {
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
            console.warn("fetchFromApi() failed to read response text:", textError);
            return null;
        }

        // Check if response is HTML
        if (isHTML || responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            console.warn("fetchFromApi() received HTML response (status:", response.status, ")");
            return null;
        }

        // If response is not OK, return null
        if (!response.ok) {
            console.warn("fetchFromApi() API error:", response.status);
            return null;
        }

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.warn("fetchFromApi() failed to parse JSON, received:", responseText.substring(0, 100));
            return null;
        }

        return data;
    } catch (error) {
        console.error("fetchFromApi() error:", error);
        return null;
    }
};

// Default menu structure as fallback - works for all languages
const getDefaultMenu = (locale = 'en') => {
    const isFrench = locale === 'fr';
    return [
        {
            name: isFrench ? "Produits" : "Products",
            href: isFrench ? "/fr/product-category" : "/product-category",
            sublinks: []
        },
        {
            name: isFrench ? "À propos" : "About",
            href: isFrench ? "/fr/ahd-history" : "/ahd-history",
            sublinks: []
        },
        {
            name: isFrench ? "Événements" : "Events",
            href: isFrench ? "/fr/afs-events" : "/afs-events",
            sublinks: []
        },
        {
            name: isFrench ? "Contact" : "Contact",
            href: isFrench ? "/fr/form" : "/form",
            sublinks: []
        }
    ];
};

export const getMenuItems = async () => {
    const locale = await getLocale();
    const currency = await getCurrency();

    // Menu IDs: 2118 for French, 2303 for English/other languages
    const primaryMenuId = locale === 'fr' ? '2118' : '2303';
    const fallbackMenuId = locale === 'fr' ? '2303' : '2118';

    try {
        // Try primary menu first with lang and currency params
        let data = await fetchMenu(primaryMenuId, locale, currency);

        // If primary menu fails, try fallback menu
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn(`getMenuItems() primary menu ${primaryMenuId} failed, trying fallback ${fallbackMenuId}`);
            data = await fetchMenu(fallbackMenuId, locale, currency);
        }

        // If both fail, return default menu structure
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn("getMenuItems() all menus failed, using default menu");
            return getDefaultMenu(locale);
        }

        // The new API returns data in the correct format already
        // Check if data is from new API (has 'href') or legacy API (has 'url' at root level)
        const isNewApiFormat = data[0] && 'href' in data[0];

        let menuData;
        if (isNewApiFormat) {
            // New AFS Menu API format - already in correct structure
            menuData = data.map((item) => ({
                name: item?.name ?? "",
                href: item?.href ?? "#",
                sublinks: Array.isArray(item?.sublinks)
                    ? item.sublinks.map((child) => ({
                        name: child?.name ?? "",
                        id: child?.id ?? null,
                        button_one: child?.button_one ?? null,
                        button_two: child?.button_two ?? null,
                        products: child?.products ?? [],
                        url: child?.url ?? null,
                        custom_text_one: child?.custom_text_one ?? null,
                        custom_text_two: child?.custom_text_two ?? null,
                        image: child?.image ?? null,
                    }))
                    : [],
            }));
        } else {
            // Legacy API format - needs transformation
            menuData = data.map((item) => ({
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
            }));
        }

        // Ensure we always return at least the default menu
        return menuData && menuData.length > 0 ? menuData : getDefaultMenu(locale);
    } catch (error) {
        console.error("getMenuItems() error:", error);
        // Always return default menu instead of empty array
        return getDefaultMenu(locale);
    }
}

