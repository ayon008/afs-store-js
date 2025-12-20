"use server"

export default async function getAmbessedor() {
    try {
        const response = await fetch(`${process.env.WP_BASE_URL}/wp-json/wp/v2/discipline`, {
            next: { revalidate: 3600 }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return [];
    }
}