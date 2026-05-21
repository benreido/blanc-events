"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/config";

interface MonthData { label: string; revenue: number; invoiceCount: number }
interface OverdueInvoice { id: string; invoiceNumber: string; clientName: string; balanceDue: number; dueDate: string }
interface TopClient { name: string; total: number; invoiceCount: number }
interface UpcomingEvent { id: string; invoiceNumber: string; clientName: string; eventDate: string; status: string; total: number; balanceDue: number }
interface UpcomingVenue { id: string; clientName: string; eventDate: string; eventType: string; venue: string; startTime: string; endTime: string }

interface ReportData {
    months: MonthData[];
    outstanding: { amount: number; count: number };
    overdue: OverdueInvoice[];
    topClients: TopClient[];
    upcomingEvents: UpcomingEvent[];
    upcomingVenueBookings: UpcomingVenue[];
    summary: { allTimePaid: number; allTimePaidCount: number; thisMonthRevenue: number };
}

export default function AdminReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/reports")
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
                <div className="h-10 w-48 skeleton rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
                </div>
                <div className="h-64 skeleton rounded-2xl" />
            </div>
        );
    }

    if (!data) return <div className="p-10 text-slate-400">Failed to load report data.</div>;

    const maxRevenue = Math.max(...data.months.map(m => m.revenue), 1);

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tighter">Revenue & Reports</h1>
                <p className="text-sm text-slate-500 mt-1">Financial overview and upcoming events.</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">This Month</p>
                    <p className="text-3xl font-black tracking-tighter text-[#123A2F]">{formatCurrency(data.summary.thisMonthRevenue)}</p>
                    <p className="text-xs text-slate-400 mt-1">Revenue collected</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Outstanding</p>
                    <p className="text-3xl font-black tracking-tighter text-amber-600">{formatCurrency(data.outstanding.amount)}</p>
                    <p className="text-xs text-slate-400 mt-1">{data.outstanding.count} unpaid invoice{data.outstanding.count !== 1 ? "s" : ""}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">All-Time Collected</p>
                    <p className="text-3xl font-black tracking-tighter text-[#123A2F]">{formatCurrency(data.summary.allTimePaid)}</p>
                    <p className="text-xs text-slate-400 mt-1">Across {data.summary.allTimePaidCount} paid invoice{data.summary.allTimePaidCount !== 1 ? "s" : ""}</p>
                </div>
            </div>

            {/* Revenue bar chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F] mb-6">Monthly Revenue (Last 6 Months)</h2>
                <div className="flex items-end gap-3 h-48">
                    {data.months.map((m) => {
                        const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                        return (
                            <div key={m.label} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                                <span className="text-xs font-bold text-slate-600 truncate">{formatCurrency(m.revenue)}</span>
                                <div className="w-full relative flex items-end" style={{ height: "120px" }}>
                                    <div
                                        className="w-full rounded-t-lg bg-[#1F5C4B] transition-all duration-500"
                                        style={{ height: `${Math.max(pct, m.revenue > 0 ? 4 : 0)}%` }}
                                        title={`${m.invoiceCount} invoice${m.invoiceCount !== 1 ? "s" : ""}`}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overdue invoices */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-500 text-lg">warning</span>
                        Overdue Invoices
                    </h2>
                    {data.overdue.length === 0 ? (
                        <p className="text-sm text-slate-400">No overdue invoices.</p>
                    ) : (
                        <div className="space-y-2">
                            {data.overdue.map(inv => (
                                <Link
                                    key={inv.id}
                                    href={`/admin/invoices/${inv.id}/edit`}
                                    className="flex items-center justify-between p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors group"
                                >
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-slate-800 truncate">{inv.clientName}</p>
                                        <p className="text-xs text-slate-500">{inv.invoiceNumber} · Due {new Date(inv.dueDate).toLocaleDateString("en-GB")}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className="font-black text-rose-600">{formatCurrency(inv.balanceDue)}</p>
                                        <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500 text-base">arrow_forward</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top clients */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1F5C4B] text-lg">stars</span>
                        Top Clients
                    </h2>
                    {data.topClients.length === 0 ? (
                        <p className="text-sm text-slate-400">No client data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.topClients.map((client, i) => {
                                const maxTotal = data.topClients[0].total;
                                const pct = maxTotal > 0 ? (client.total / maxTotal) * 100 : 0;
                                return (
                                    <div key={client.name}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-semibold text-slate-800 truncate max-w-[60%]">
                                                <span className="text-slate-400 mr-1.5">#{i + 1}</span>{client.name}
                                            </span>
                                            <span className="font-black text-[#123A2F]">{formatCurrency(client.total)}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div className="bg-[#1F5C4B] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{client.invoiceCount} invoice{client.invoiceCount !== 1 ? "s" : ""}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Upcoming invoice events */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1F5C4B] text-lg">event</span>
                        Upcoming Events (30 days)
                    </h2>
                    {data.upcomingEvents.length === 0 ? (
                        <p className="text-sm text-slate-400">No events scheduled in the next 30 days.</p>
                    ) : (
                        <div className="space-y-2">
                            {data.upcomingEvents.map(ev => (
                                <Link
                                    key={ev.id}
                                    href={`/admin/invoices/${ev.id}/edit`}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-slate-100"
                                >
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-slate-800 truncate">{ev.clientName}</p>
                                        <p className="text-xs text-slate-500">{new Date(ev.eventDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className="font-bold text-sm text-slate-700">{formatCurrency(ev.total)}</p>
                                        {ev.balanceDue > 0 && (
                                            <p className="text-[10px] text-rose-500 font-bold">{formatCurrency(ev.balanceDue)} due</p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Alder Root bookings */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-lg">golf_course</span>
                        Alder Root (30 days)
                    </h2>
                    {data.upcomingVenueBookings.length === 0 ? (
                        <p className="text-sm text-slate-400">No Alder Root bookings in the next 30 days.</p>
                    ) : (
                        <div className="space-y-2">
                            {data.upcomingVenueBookings.map(v => (
                                <Link
                                    key={v.id}
                                    href="/admin/venue-bookings"
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 group"
                                >
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-slate-800 truncate">{v.clientName}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(v.eventDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                                            {" · "}{v.startTime}–{v.endTime}
                                            {" · "}{v.venue === "MARQUEE" ? "Marquee" : "Clubhouse"}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-full shrink-0 ml-2">{v.eventType}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
