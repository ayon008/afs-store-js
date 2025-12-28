"use server";

import { getLocale } from "next-intl/server";

export const allAmbassadors = async (activeTab, country) => {
    const locale = await getLocale();
    const hasTab = activeTab !== null && activeTab !== undefined;
    const hasCountry = country !== null && country !== undefined;

    let url = `${process.env.WP_BASE_URL}/wp-json/wp/v2/ambassador?per_page=100&_embed&lang=${locale}`;

    // BOTH filters exist
    if (hasTab && hasCountry) {
        url = `${process.env.WP_BASE_URL}/wp-json/wp/v2/ambassador?discipline=${activeTab}&nationalite=${country}&per_page=100&_embed&lang=${locale}`;
        console.log("BOTH FILTERS EXIST");
    }
    // ONLY CATEGORY
    else if (hasTab) {
        url = `${process.env.WP_BASE_URL}/wp-json/wp/v2/ambassador?discipline=${activeTab}&per_page=100&_embed&lang=${locale}`;
        console.log("ONLY CATEGORY");
    }
    // ONLY COUNTRY
    else if (hasCountry) {
        url = `${process.env.WP_BASE_URL}/wp-json/wp/v2/ambassador?nationalite=${country}&per_page=100&_embed&lang=${locale}`;
        console.log("ONLY COUNTRY");
    }
    // NOTHING → ALL
    else {
        console.log("ALL");
    }

    const response = await fetch(url, { next: { revalidate: 3600 }, cache: "force-cache" });
    return await response.json();
};
