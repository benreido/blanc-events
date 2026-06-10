import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Equipment Hire — Lighting, DJ & Audio",
    description:
        "Hire lighting, DJ equipment, and audio in Manchester. Astera Titan Tubes, Pioneer CDJ-3000, DJM-A9, XDJ-AZ, PA systems and more. Delivery across Greater Manchester and the North West.",
    keywords: [
        "DJ equipment hire Manchester",
        "Pioneer CDJ hire Manchester",
        "Pioneer DJM hire Manchester",
        "XDJ AZ hire Manchester",
        "turntable hire Manchester",
        "lighting hire Manchester",
        "Astera Titan Tube hire",
        "PA system hire Manchester",
        "dry hire Manchester",
        "backline hire Manchester",
    ],
    alternates: { canonical: "https://www.blanc-events.co.uk/hire" },
    openGraph: {
        title: "Equipment Hire Manchester — Lighting, DJ & Audio | Blanc. Events",
        description:
            "Hire lighting, DJ equipment, and audio in Manchester. Astera Titan Tubes, Pioneer CDJ-3000, DJM-A9, XDJ-AZ, PA systems and more. Delivery across Greater Manchester.",
        url: "https://www.blanc-events.co.uk/hire",
    },
};

export default function HireLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
