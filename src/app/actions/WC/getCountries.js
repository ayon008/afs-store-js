"use server"
import { getLocaleValue } from "../Woo-Coommerce/getWooCommerce";

export default async function getCountries() {
    const localeValue = await getLocaleValue();
    const response = await fetch(`${process.env.WP_BASE_URL}/${localeValue}/wp-json/wp/v2/nationalite`, {
        next: { revalidate: 3600 }
    });
    const data = await response.json();
    return data;
}