import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { GeistSans } from "geist/font/sans";

const BASE_URL = "https://www.blanc-events.co.uk";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "Blanc. Events | Lighting Design & Production Manchester",
        template: "%s | Blanc. Events",
    },
    description:
        "Manchester's specialist lighting production studio. DMX-controlled lighting environments, Astera wireless fixtures, and full event production for nightclubs, corporate events, and private parties.",
    keywords: [
        "lighting production Manchester",
        "event production Manchester",
        "Astera Titan Tube hire Manchester",
        "AV hire Manchester",
        "DMX lighting hire",
        "corporate event lighting",
        "nightclub lighting production",
        "wedding lighting Manchester",
        "dry hire Manchester",
        "DJ equipment hire Manchester",
        "Pioneer CDJ hire Manchester",
        "Pioneer DJM hire Manchester",
        "turntable hire Manchester",
        "DJ mixer hire Manchester",
        "backline hire Manchester",
        "sound system hire Manchester",
        "PA system hire Manchester",
        "XDJ AZ hire Manchester",
        "equipment hire Manchester",
        "Blanc Events",
    ],
    authors: [{ name: "Blanc. Events" }],
    creator: "Blanc. Events",
    publisher: "Blanc. Events",
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        type: "website",
        locale: "en_GB",
        url: BASE_URL,
        siteName: "Blanc. Events",
        title: "Blanc. Events | Lighting Design & Production Manchester",
        description:
            "Manchester's specialist lighting production studio. DMX-controlled lighting environments, Astera wireless fixtures, and full event production for nightclubs, corporate events, and private parties.",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Blanc. Events — Lighting Design & Production Manchester",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Blanc. Events | Lighting Design & Production Manchester",
        description:
            "Manchester's specialist lighting production studio. DMX-controlled lighting environments, Astera wireless fixtures, and full event production.",
        images: ["/og-image.jpg"],
    },
    // No site-wide canonical: it would mark every page without its own
    // canonical (e.g. /book) as a copy of the homepage. Pages set their own.
};

const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#organization`,
    name: "Blanc. Events",
    legalName: "Blanc. Events Manchester Ltd",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    image: `${BASE_URL}/og-image.jpg`,
    description:
        "Manchester's specialist lighting production studio offering DMX-controlled lighting environments, Astera wireless fixture hire, and full event production for nightclubs, corporate events, and private parties.",
    telephone: "07584192578",
    email: "hello@blanc-events.co.uk",
    address: {
        "@type": "PostalAddress",
        streetAddress: "19 Cheetham Hill Road",
        addressLocality: "Manchester",
        postalCode: "M4 4FY",
        addressCountry: "GB",
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: "53.4808",
        longitude: "-2.2426",
    },
    areaServed: [
        { "@type": "City", name: "Manchester" },
        { "@type": "AdministrativeArea", name: "Greater Manchester" },
        { "@type": "AdministrativeArea", name: "North West England" },
    ],
    priceRange: "££–£££",
    openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "22:00",
    },
    sameAs: [],
};

const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Blanc. Events",
    publisher: { "@id": `${BASE_URL}/#organization` },
    potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/hire?search={search_term_string}` },
        "query-input": "required name=search_term_string",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`light ${GeistSans.variable}`} suppressHydrationWarning>
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
                />
            </head>
            <body className={`${GeistSans.className} bg-[#F9F7F5] text-slate-800 selection:bg-[#1F5C4B]/30 antialiased`}>
                <CartProvider>{children}</CartProvider>
            </body>
        </html>
    );
}
