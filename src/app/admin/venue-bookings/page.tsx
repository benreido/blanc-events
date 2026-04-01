"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface VenueBooking {
    id: string;
    venue: string;
    eventDate: string;
    eventType: string;
    startTime: string;
    endTime: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes: string;
    status: string;
    createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminVenueBookingsPage() {
    const [bookings, setBookings] = useState<VenueBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("ALL");

    useEffect(() => {
        fetch("/api/admin/venue-bookings")
            .then((r) => r.json())
            .then((data) => setBookings(data.bookings || []))
            .finally(() => setLoading(false));
    }, []);

    async function updateStatus(id: string, status: string) {
        const res = await fetch(`/api/admin/venue-bookings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            setBookings((prev) =>
                prev.map((b) => (b.id === id ? { ...b, status } : b))
            );
        }
    }

    async function deleteBooking(id: string) {
        if (!confirm("Are you sure you want to delete this booking?")) return;
        const res = await fetch(`/api/admin/venue-bookings/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setBookings((prev) => prev.filter((b) => b.id !== id));
        }
    }

    const filtered =
        filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

    const counts = {
        ALL: bookings.length,
        NEW: bookings.filter((b) => b.status === "NEW").length,
        CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
        CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">
                        Alder Root Bookings
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Venue booking requests from the Alder Root Golf Club form.
                    </p>
                </div>
                <Link
                    href="/alder-root"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1F5C4B] border border-[#1F5C4B]/20 rounded-lg hover:bg-[#1F5C4B]/5 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">
                        open_in_new
                    </span>
                    View Booking Form
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(["ALL", "NEW", "CONFIRMED", "CANCELLED"] as const).map(
                    (s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                                filter === s
                                    ? "bg-[#1F5C4B] text-white"
                                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}{" "}
                            <span className="ml-1 opacity-60">
                                ({counts[s]})
                            </span>
                        </button>
                    )
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-28 rounded-2xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-4 block">
                        event_busy
                    </span>
                    <p className="text-slate-400">No bookings found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((b) => (
                        <div
                            key={b.id}
                            className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="font-bold text-lg text-slate-900">
                                            {b.eventType}
                                        </h3>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                STATUS_COLORS[b.status] ||
                                                "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {b.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span className="material-symbols-outlined text-base text-slate-400">
                                                {b.venue === "MARQUEE"
                                                    ? "camping"
                                                    : "house"}
                                            </span>
                                            {b.venue === "MARQUEE"
                                                ? "Marquee"
                                                : "Clubhouse"}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span className="material-symbols-outlined text-base text-slate-400">
                                                calendar_today
                                            </span>
                                            {new Date(
                                                b.eventDate
                                            ).toLocaleDateString("en-GB", {
                                                weekday: "short",
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span className="material-symbols-outlined text-base text-slate-400">
                                                schedule
                                            </span>
                                            {b.startTime} – {b.endTime}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span className="material-symbols-outlined text-base text-slate-400">
                                                person
                                            </span>
                                            {b.clientName}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                        <span>{b.clientEmail}</span>
                                        {b.clientPhone && (
                                            <span>· {b.clientPhone}</span>
                                        )}
                                    </div>

                                    {b.notes && (
                                        <div className="mt-3 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-500">
                                            {b.notes}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {b.status === "NEW" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    b.id,
                                                    "CONFIRMED"
                                                )
                                            }
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">
                                                check
                                            </span>
                                            Confirm
                                        </button>
                                    )}
                                    {b.status !== "CANCELLED" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    b.id,
                                                    "CANCELLED"
                                                )
                                            }
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">
                                                close
                                            </span>
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteBooking(b.id)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            delete
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
