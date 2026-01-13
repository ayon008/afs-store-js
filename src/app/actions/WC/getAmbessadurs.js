"use server"

import { getLocale } from "next-intl/server";

export default async function getAmbessedor() {
    try {
        const locale = await getLocale();
        const response = await fetch(`${process.env.WP_BASE_URL}/wp-json/wp/v2/discipline?lang=${locale}`, {
            next: { revalidate: 3600 }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return [];
    }
}