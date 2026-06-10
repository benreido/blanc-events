import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingClient from "./BookingClient";

export const metadata = {
    title: "Book Your Event",
    description: "Book lighting, DJ equipment and production packages online. Choose your date, build your setup and secure your booking with a 25% deposit.",
    alternates: { canonical: "https://www.blanc-events.co.uk/book" },
};

export default function BookPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-16 bg-slate-50">
                <h1 className="sr-only">Book your event — equipment hire and production</h1>
                <Suspense fallback={<div className="text-center p-20 animate-pulse text-slate-400">Loading booking portal...</div>}>
                    <BookingClient />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
