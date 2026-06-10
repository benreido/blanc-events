import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us",
    description:
        "Get in touch with Blanc. Events Manchester. Request a quote for lighting production, AV hire, or event production across Greater Manchester and the North West.",
    alternates: { canonical: "https://www.blanc-events.co.uk/contact" },
    openGraph: {
        title: "Contact Blanc. Events Manchester",
        description:
            "Request a quote for lighting production, AV hire, or event production across Greater Manchester and the North West.",
        url: "https://www.blanc-events.co.uk/contact",
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
