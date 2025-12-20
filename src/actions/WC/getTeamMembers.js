"use server"

export const getTeamMember = async (id) => {
    try {
        const response = await fetch(`${process.env.WP_BASE_URL}/wp-json/wp/v2/afs-team?member-role=${id}&per_page=100&_embed`, { next: { revalidate: 3600 } });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("getTeamMember() error:", error);
        return []; // Prevents breaking the UI
    }
}