"use server"

import { getLocaleValue } from "../Woo-Coommerce/getWooCommerce";

export const getTeamMember = async (id) => {
    try {
        const localeValue = await getLocaleValue();
        const response = await fetch(`${process.env.WP_BASE_URL}/${localeValue}/wp-json/wp/v2/afs-team?member-role=${id}&per_page=100&_embed`, { next: { revalidate: 3600 } });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("getTeamMember() error:", error);
        return []; // Prevents breaking the UI
    }
}