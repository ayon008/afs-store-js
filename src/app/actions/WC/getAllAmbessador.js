"use server";

import { getLocale } from "next-intl/server";

export const allAmbassadors = async () => {
    const locale = await getLocale();
    let url = `${process.env.WP_BASE_URL}/wp-json/wp/v2/ambassador?per_page=100&_embed&lang=${locale}`;
    const response = await fetch(url, { next: { revalidate: 3600 }, cache: "force-cache" });
    return response.json();
};
