import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Alder Root Golf Club – Book an Event",
    description:
        "Book an event at Alder Root Golf Club. Choose between the Marquee or Clubhouse for weddings, corporate events, parties, and celebrations. Powered by Blanc. Events.",
    robots: { index: false, follow: false },
};

export default function AlderRootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
