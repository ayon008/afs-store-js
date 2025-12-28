"use server"

import { getLocale } from "next-intl/server";
import { getCurrency } from "../Woo-Coommerce/getWooCommerce";
import { convertWpUrlToNextUrl } from "@/lib/urlConverter";



export const getMenuItems = async () => {
    const locale = await getLocale();
    const currency = await getCurrency();
    try {
        const response = await fetch(`${process.env.WP_BASE_URL}/wp-json/custom/v1/menus/2118`,
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
            // Convertir l'URL principale
            const convertedHref = item?.url 
                ? convertWpUrlToNextUrl(item.url, locale) 
                : "#";

            return (
                {
                    name: item?.title ?? "",
                    href: convertedHref,

                    sublinks: Array.isArray(item?.children)
                        ? item.children.map((child) => {
                            // Convertir l'URL du sous-lien
                            const convertedChildUrl = child?.url 
                                ? convertWpUrlToNextUrl(child.url, locale) 
                                : null;

                            // Convertir les URLs des produits
                            const convertedProducts = Array.isArray(child?.menu_products)
                                ? child.menu_products.map((product) => ({
                                    ...product,
                                    url: product?.url 
                                        ? convertWpUrlToNextUrl(product.url, locale) 
                                        : product?.url
                                }))
                                : [];

                            // Convertir les URLs des boutons
                            const convertedButtonOne = child?.button_one 
                                ? {
                                    ...child.button_one,
                                    url: child.button_one?.url 
                                        ? convertWpUrlToNextUrl(child.button_one.url, locale) 
                                        : child.button_one?.url
                                }
                                : null;

                            const convertedButtonTwo = child?.button_two 
                                ? {
                                    ...child.button_two,
                                    url: child.button_two?.url 
                                        ? convertWpUrlToNextUrl(child.button_two.url, locale) 
                                        : child.button_two?.url
                                }
                                : null;

                            return {
                                name: child?.title ?? "",
                                id: child?.id ?? null,
                                button_one: convertedButtonOne,
                                button_two: convertedButtonTwo,
                                products: convertedProducts,
                                url: convertedChildUrl,
                            };
                        })
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

