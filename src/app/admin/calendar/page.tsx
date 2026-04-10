"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";

type EventType = "booking" | "venue" | "invoice" | "due";

interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    label: string;
    sublabel?: string;
    type: EventType;
    status: string;
    href: string;
    // Popover detail fields
    email?: string;
    phone?: string;
    venue?: string;
    timeRange?: string;
    amount?: number;
    balanceDue?: number;
    endDate?: string;
}

const TYPE_STYLES: Record<EventType, { bg: string; text: string; dot: string; badge: string }> = {
    booking: { bg: "bg-blue-50 border-blue-200",     text: "text-blue-800",   dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700" },
    venue:   { bg: "bg-amber-50 border-amber-200",   text: "text-amber-800",  dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700" },
    invoice: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
    due:     { bg: "bg-rose-50 border-rose-200",     text: "text-rose-800",   dot: "bg-rose-500",   badge: "bg-rose-100 text-rose-700" },
};

const TYPE_LABELS: Record<EventType, string> = {
    booking: "Equipment Booking",
    venue:   "Alder Root",
    invoice: "Invoice Event",
    due:     "Payment Due",
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function AdminCalendarPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<CalendarEvent | null>(null);
    const [icalUrl, setIcalUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Fetch iCal URL (derives from the window origin + secret from a hint endpoint)
    useEffect(() => {
        fetch("/api/admin/ical-url")
            .then(r => r.ok ? r.json() : null)
            .then(d => d?.url && setIcalUrl(d.url))
            .catch(() => {});
    }, []);

    // Close popover on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setSelected(null);
            }
        }
        if (selected) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [selected]);

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
                    endDate: b.endDate.slice(0, 10),
                    label: b.customerName,
                    sublabel: b.venue || undefined,
                    type: "booking",
                    status: b.status,
                    href: `/admin/bookings`,
                    email: b.customerEmail,
                    phone: b.customerPhone,
                    venue: b.venue,
                    amount: b.total,
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
                    email: v.clientEmail,
                    phone: v.clientPhone,
                    venue: v.venue === "MARQUEE" ? "Marquee" : "Clubhouse",
                    timeRange: v.startTime && v.endTime ? `${v.startTime} – ${v.endTime}` : undefined,
                });
            });

            (data.invoiceEvents || []).forEach((inv: any) => {
                mapped.push({
                    id: `ev-${inv.id}`,
                    date: inv.eventDate.slice(0, 10),
                    label: inv.clientName,
                    sublabel: inv.invoiceNumber,
                    type: "invoice",
                    status: inv.status,
                    href: `/admin/invoices/${inv.id}/edit`,
                    email: inv.clientEmail,
                    amount: inv.total,
                    balanceDue: inv.balanceDue,
                });
            });

            (data.invoiceDues || []).forEach((inv: any) => {
                mapped.push({
                    id: `due-${inv.id}`,
                    date: inv.dueDate.slice(0, 10),
                    label: inv.clientName,
                    sublabel: inv.invoiceNumber,
                    type: "due",
                    status: inv.status,
                    href: `/admin/invoices/${inv.id}/edit`,
                    email: inv.clientEmail,
                    amount: inv.total,
                    balanceDue: inv.balanceDue,
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

    async function copyIcal() {
        if (!icalUrl) return;
        await navigator.clipboard.writeText(icalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // Build grid (Mon-start)
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const cells: (number | null)[] = [];
    for (let i = 0; i < totalCells; i++) {
        const d = i - startOffset + 1;
        cells.push(d >= 1 && d <= daysInMonth ? d : null);
    }

    function eventsForDay(day: number): CalendarEvent[] {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return events.filter(e => e.date === dateStr);
    }

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const counts = {
        booking: events.filter(e => e.type === "booking").length,
        venue:   events.filter(e => e.type === "venue").length,
        invoice: events.filter(e => e.type === "invoice").length,
        due:     events.filter(e => e.type === "due").length,
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Calendar</h1>
                    <p className="text-sm text-slate-500 mt-1">All bookings, events, and payment due dates.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* iCal subscription */}
                    {icalUrl && (
                        <button
                            onClick={copyIcal}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
                            title="Copy iCal subscription URL"
                        >
                            <span className="material-symbols-outlined text-base">{copied ? "check" : "calendar_add_on"}</span>
                            {copied ? "Copied!" : "Subscribe (iCal)"}
                        </button>
                    )}
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
            {!loading && Object.values(counts).some(v => v > 0) && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {(Object.entries(counts) as [EventType, number][]).filter(([, c]) => c > 0).map(([type, count]) => {
                        const style = TYPE_STYLES[type];
                        return (
                            <div key={type} className={`flex items-center gap-2 text-xs font-bold rounded-lg px-3 py-1.5 border ${style.bg} ${style.text}`}>
                                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                                {count} {TYPE_LABELS[type]}{count !== 1 ? "s" : ""}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Calendar grid */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 border-b border-slate-200">
                    {DAY_NAMES.map(d => (
                        <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</div>
                    ))}
                </div>

                {loading ? (
                    <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Loading…</div>
                ) : (
                    <div className="grid grid-cols-7 divide-x divide-slate-100">
                        {cells.map((day, i) => {
                            const dateStr = day ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
                            const isToday = dateStr === todayStr;
                            const dayEvents = day ? eventsForDay(day) : [];

                            return (
                                <div
                                    key={i}
                                    className={`min-h-[120px] p-2 flex flex-col gap-1 ${i >= 7 ? "border-t border-slate-100" : ""} ${!day ? "bg-slate-50/50" : ""}`}
                                >
                                    {day && (
                                        <>
                                            <div className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? "bg-[#1F5C4B] text-white" : "text-slate-400"}`}>
                                                {day}
                                            </div>
                                            {dayEvents.map(ev => {
                                                const style = TYPE_STYLES[ev.type];
                                                return (
                                                    <button
                                                        key={ev.id}
                                                        onClick={() => setSelected(selected?.id === ev.id ? null : ev)}
                                                        className={`w-full flex items-start gap-1.5 px-2 py-1 rounded-lg border text-[10px] leading-tight text-left transition-opacity hover:opacity-80 ${style.bg} ${style.text} ${selected?.id === ev.id ? "ring-2 ring-offset-1 ring-current" : ""}`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full mt-0.5 shrink-0 ${style.dot}`} />
                                                        <span className="min-w-0">
                                                            <span className="font-bold block truncate">{ev.label}</span>
                                                            {ev.sublabel && <span className="opacity-70 block truncate">{ev.sublabel}</span>}
                                                        </span>
                                                    </button>
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
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Equipment bookings</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Alder Root venue</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Invoice events</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Payment due dates</span>
            </div>

            {/* Event detail popover */}
            {selected && (
                <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 sm:p-0" onClick={() => setSelected(null)}>
                    <div
                        ref={popoverRef}
                        onClick={e => e.stopPropagation()}
                        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                    >
                        {/* Popover header */}
                        <div className={`px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3 ${TYPE_STYLES[selected.type].bg}`}>
                            <div className="min-w-0">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${TYPE_STYLES[selected.type].text} opacity-70`}>
                                    {TYPE_LABELS[selected.type]}
                                </span>
                                <h3 className={`font-black text-base tracking-tight mt-0.5 ${TYPE_STYLES[selected.type].text}`}>{selected.label}</h3>
                                {selected.sublabel && <p className={`text-xs mt-0.5 opacity-70 ${TYPE_STYLES[selected.type].text}`}>{selected.sublabel}</p>}
                            </div>
                            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Popover body */}
                        <div className="px-5 py-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="material-symbols-outlined text-slate-400 text-base">calendar_today</span>
                                {new Date(selected.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                {selected.endDate && selected.endDate !== selected.date && (
                                    <> → {new Date(selected.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</>
                                )}
                            </div>

                            {selected.timeRange && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="material-symbols-outlined text-slate-400 text-base">schedule</span>
                                    {selected.timeRange}
                                </div>
                            )}

                            {selected.venue && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="material-symbols-outlined text-slate-400 text-base">location_on</span>
                                    {selected.venue}
                                </div>
                            )}

                            {selected.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="material-symbols-outlined text-slate-400 text-base">mail</span>
                                    <a href={`mailto:${selected.email}`} className="hover:text-[#1F5C4B] hover:underline truncate">{selected.email}</a>
                                </div>
                            )}

                            {selected.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="material-symbols-outlined text-slate-400 text-base">phone</span>
                                    <a href={`tel:${selected.phone}`} className="hover:text-[#1F5C4B] hover:underline">{selected.phone}</a>
                                </div>
                            )}

                            {(selected.amount !== undefined || selected.balanceDue !== undefined) && (
                                <div className="flex gap-4 pt-2 border-t border-slate-100">
                                    {selected.amount !== undefined && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Total</p>
                                            <p className="font-black text-slate-800">£{selected.amount.toFixed(2)}</p>
                                        </div>
                                    )}
                                    {selected.balanceDue !== undefined && selected.balanceDue > 0 && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Balance Due</p>
                                            <p className="font-black text-rose-600">£{selected.balanceDue.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${TYPE_STYLES[selected.type].badge}`}>
                                    {selected.status}
                                </span>
                            </div>
                        </div>

                        {/* Popover footer */}
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                            <Link
                                href={selected.href}
                                className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold uppercase tracking-widest text-[#1F5C4B] hover:bg-[#1F5C4B]/5 rounded-lg transition-colors"
                                onClick={() => setSelected(null)}
                            >
                                <span className="material-symbols-outlined text-base">open_in_new</span>
                                View Full Details
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
