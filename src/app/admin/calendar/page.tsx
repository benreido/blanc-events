"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface CalendarEvent {
    id: string;
    date: string; // ISO date string YYYY-MM-DD
    label: string;
    sublabel?: string;
    type: "booking" | "venue" | "invoice";
    status: string;
    href: string;
}

const TYPE_STYLES: Record<CalendarEvent["type"], { bg: string; text: string; dot: string }> = {
    booking:  { bg: "bg-blue-50 border-blue-200",   text: "text-blue-800",   dot: "bg-blue-500" },
    venue:    { bg: "bg-amber-50 border-amber-200",  text: "text-amber-800",  dot: "bg-amber-500" },
    invoice:  { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" },
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function AdminCalendarPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/calendar?year=${year}&month=${month}`);
            const data = await res.json();

            const mapped: CalendarEvent[] = [];

            (data.bookings || []).forEach((b: any) => {
                mapped.push({
                    id: b.id,
                    date: b.startDate.slice(0, 10),
                    label: b.customerName,
                    sublabel: b.venue || undefined,
                    type: "booking",
                    status: b.status,
                    href: `/admin/bookings`,
                });
            });

            (data.venueBookings || []).forEach((v: any) => {
                mapped.push({
                    id: v.id,
                    date: v.eventDate.slice(0, 10),
                    label: v.clientName,
                    sublabel: v.eventType,
                    type: "venue",
                    status: v.status,
                    href: `/admin/venue-bookings`,
                });
            });

            (data.invoices || []).forEach((inv: any) => {
                mapped.push({
                    id: inv.id,
                    date: inv.eventDate.slice(0, 10),
                    label: inv.clientName,
                    sublabel: inv.invoiceNumber,
                    type: "invoice",
                    status: inv.status,
                    href: `/admin/invoices/${inv.id}/edit`,
                });
            });

            setEvents(mapped);
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    function prevMonth() {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    }

    function nextMonth() {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    }

    // Build calendar grid (Mon-start)
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    // getDay() is 0=Sun..6=Sat; convert to Mon=0..Sun=6
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const cells: (number | null)[] = [];
    for (let i = 0; i < totalCells; i++) {
        const day = i - startOffset + 1;
        cells.push(day >= 1 && day <= daysInMonth ? day : null);
    }

    function eventsForDay(day: number): CalendarEvent[] {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return events.filter(e => e.date === dateStr);
    }

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const totalEvents = events.length;
    const bookingCount = events.filter(e => e.type === "booking").length;
    const venueCount = events.filter(e => e.type === "venue").length;
    const invoiceCount = events.filter(e => e.type === "invoice").length;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Calendar</h1>
                    <p className="text-sm text-slate-500 mt-1">All bookings and events across the month.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={prevMonth} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-slate-600">chevron_left</span>
                    </button>
                    <span className="text-lg font-black tracking-tight min-w-[160px] text-center">
                        {MONTH_NAMES[month - 1]} {year}
                    </span>
                    <button onClick={nextMonth} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-slate-600">chevron_right</span>
                    </button>
                    <button
                        onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); }}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Stats bar */}
            {!loading && totalEvents > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {bookingCount} Equipment Booking{bookingCount !== 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {venueCount} Alder Root Booking{venueCount !== 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {invoiceCount} Invoice Event{invoiceCount !== 1 ? "s" : ""}
                    </div>
                </div>
            )}

            {/* Calendar grid */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-slate-200">
                    {DAY_NAMES.map(d => (
                        <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Cells */}
                {loading ? (
                    <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
                        Loading…
                    </div>
                ) : (
                    <div className="grid grid-cols-7 divide-x divide-slate-100">
                        {cells.map((day, i) => {
                            const dateStr = day ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
                            const isToday = dateStr === todayStr;
                            const dayEvents = day ? eventsForDay(day) : [];
                            const isNewRow = i % 7 === 0;

                            return (
                                <div
                                    key={i}
                                    className={`min-h-[120px] p-2 flex flex-col gap-1 ${isNewRow ? "" : ""} ${i >= 7 ? "border-t border-slate-100" : ""} ${!day ? "bg-slate-50/50" : ""}`}
                                >
                                    {day && (
                                        <>
                                            <div className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                                                isToday
                                                    ? "bg-[#1F5C4B] text-white"
                                                    : "text-slate-400"
                                            }`}>
                                                {day}
                                            </div>
                                            {dayEvents.map(ev => {
                                                const style = TYPE_STYLES[ev.type];
                                                return (
                                                    <Link
                                                        key={ev.id}
                                                        href={ev.href}
                                                        className={`flex items-start gap-1.5 px-2 py-1 rounded-lg border text-[10px] leading-tight hover:opacity-80 transition-opacity ${style.bg} ${style.text}`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full mt-0.5 shrink-0 ${style.dot}`} />
                                                        <span className="min-w-0">
                                                            <span className="font-bold block truncate">{ev.label}</span>
                                                            {ev.sublabel && <span className="opacity-70 block truncate">{ev.sublabel}</span>}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Equipment bookings (start date)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Alder Root venue bookings</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Invoices with event date set</span>
            </div>
        </div>
    );
}
