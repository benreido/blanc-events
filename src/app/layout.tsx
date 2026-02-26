import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

export const metadata: Metadata = {
    title: "Blanc. Events | Premium AV & Event Production Manchester",
    description:
        "Elevating events with industry-leading Astera lighting, professional backline, and bespoke production solutions for Manchester's most ambitious stages.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="light" suppressHydrationWarning>
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="bg-[#F9F7F5] text-slate-800 font-[Inter,sans-serif] selection:bg-[#1F5C4B]/30 antialiased">
                <CartProvider>{children}</CartProvider>
            </body>
        </html>
    );
}
