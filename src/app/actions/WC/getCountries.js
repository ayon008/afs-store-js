"use server"
export default async function getCountries() {
    const response = await fetch(`${process.env.WP_BASE_URL}/wp-json/wp/v2/nationalite`, {
        next: { revalidate: 3600 }
    });
    const data = await response.json();
    return data;
}