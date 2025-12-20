"use server";

export const allAmbassadors = async (activeTab, country) => {
    const hasTab = activeTab !== null && activeTab !== undefined;
    const hasCountry = country !== null && country !== undefined;

    let url = `${process.env.WP_BASE_URL}/wp-json/wp/v2/ambassador?per_page=100&_embed`;

    // BOTH filters exist
    if (hasTab && hasCountry) {
        url = `${process.env.WP_BASE_URL}/wp-json/wp/v2/ambassador?discipline=${activeTab}&nationalite=${country}&per_page=100&_embed`;

    }
    // ONLY CATEGORY
    else if (hasTab) {
        url = `${process.env.WP_BASE_URL}/wp-json/wp/v2/ambassador?discipline=${activeTab}&per_page=100&_embed`;
        console.log("ONLY CATEGORY");
    }
    // ONLY COUNTRY
    else if (hasCountry) {
        url = `${process.env.WP_BASE_URL}/wp-json/wp/v2/ambassador?nationalite=${country}&per_page=100&_embed`;
        console.log("ONLY COUNTRY");
    }
    // NOTHING → ALL
    else {
        console.log("ALL");
    }

    console.log("Fetching URL:", url);

    const response = await fetch(url, { cache: "no-cache" });
    return await response.json();
};
