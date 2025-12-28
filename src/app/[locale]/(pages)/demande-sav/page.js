// app/tickets/page.tsx
export const metadata = {
    title: "Besoin de conseils",
    description:
        "Besoin de conseils – Contactez notre équipe pour toute demande ou question concernant AFS.",
    keywords: ["AFS", "conseils", "foiling", "support", "contact"],
    openGraph: {
        title: "Besoin de conseils",
        description:
            "Contactez notre équipe pour toute demande ou question concernant AFS.",
        type: "website",
        images: ["https://afs-foiling.com/wp-content/uploads/2024/02/afs.jpg"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Besoin de conseils",
        description:
            "Contactez notre équipe pour toute demande ou question concernant AFS.",
        images: ["https://afs-foiling.com/wp-content/uploads/2024/02/afs.jpg"],
    },
};

export default function TicketsPage() {
    return (
        <div className="global-margin mt-10">
            <iframe
                src="https://n8n.foilandco.com/form/e9b3a3d4-4b77-47af-b9cb-b7bfa436f8b8"
                width="100%"
                height="800"
                frameBorder="0"
                allowFullScreen
                title="Formulaire de demande SAV"
            ></iframe>
        </div>
    );
}
