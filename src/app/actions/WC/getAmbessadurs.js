"use server"

import { getLocaleValue } from "../Woo-Coommerce/getWooCommerce";

export default async function getAmbessedor() {
    try {
        const localeValue = await getLocaleValue();
        const response = await fetch(`${process.env.WP_BASE_URL}/${localeValue}/wp-json/wp/v2/discipline`, {
            next: { revalidate: 3600 }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return [];
    }
}