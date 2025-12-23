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
        const data = await response.json();
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

