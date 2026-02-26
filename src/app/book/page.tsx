import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingClient from "./BookingClient";

export const metadata = { title: "Book Now | Blanc. Events" };

export default function BookPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-16 bg-slate-50">
                <Suspense fallback={<div className="text-center p-20 animate-pulse text-slate-400">Loading booking portal...</div>}>
                    <BookingClient />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
