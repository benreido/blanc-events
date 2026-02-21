"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/config";
import { format } from "date-fns";

interface DashboardData {
    stats: { totalEquipment: number; totalBookings: number; confirmedBookings: number; pendingQuotes: number };
    recentEnquiries: Array<{ id: string; name: string; email: string; subject: string; createdAt: string }>;
    upcomingBookings: Array<{ id: string; customerName: string; startDate: string; endDate: string; total: number; status: string }>;
    lowStockItems: Array<{ id: string; name: string; quantityTotal: number; category: string }>;
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        fetch("/api/admin/dashboard").then((r) => r.json()).then(setData).catch(console.error);
    }, []);

    if (!data || !data.stats) {
        if (data && (data as any).error === "Unauthorized") {
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-red-500 text-6xl mb-4">lock</span>
                    <h2 className="text-2xl font-bold mb-2">Session Expired</h2>
                    <p className="text-slate-500 mb-6">Please log in again to access the admin portal.</p>
                    <a href="/admin/login" className="px-6 py-2 bg-[#1F5C4B] text-white font-bold rounded-lg uppercase tracking-widest text-xs">Log In</a>
                </div>
            );
        }
        return <div className="space-y-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-32 skeleton rounded-xl" />)}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-black tracking-tighter mb-8">Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: "Equipment Items", value: data.stats.totalEquipment, icon: "speaker", color: "bg-blue-50 text-blue-600" },
                    { label: "Total Bookings", value: data.stats.totalBookings, icon: "event_available", color: "bg-green-50 text-green-600" },
                    { label: "Confirmed", value: data.stats.confirmedBookings, icon: "check_circle", color: "bg-emerald-50 text-emerald-600" },
                    { label: "Pending Quotes", value: data.stats.pendingQuotes, icon: "pending_actions", color: "bg-amber-50 text-amber-600" },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <span className={`material-symbols-outlined text-2xl p-2 rounded-lg ${s.color}`}>{s.icon}</span>
                        </div>
                        <div className="text-3xl font-black mb-1">{s.value}</div>
                        <div className="text-sm text-slate-500">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Enquiries */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1F5C4B]">mail</span> Recent Enquiries
                    </h2>
                    {data.recentEnquiries.length === 0 ? (
                        <p className="text-slate-400 text-sm">No new enquiries</p>
                    ) : (
                        <div className="space-y-3">
                            {data.recentEnquiries.map((e) => (
                                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                                    <div>
                                        <p className="font-semibold text-sm">{e.name}</p>
                                        <p className="text-xs text-slate-400">{e.subject}</p>
                                    </div>
                                    <span className="text-xs text-slate-400">{format(new Date(e.createdAt), "dd MMM")}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Bookings */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1F5C4B]">calendar_month</span> Upcoming Bookings
                    </h2>
                    {data.upcomingBookings.length === 0 ? (
                        <p className="text-slate-400 text-sm">No upcoming bookings</p>
                    ) : (
                        <div className="space-y-3">
                            {data.upcomingBookings.map((b) => (
                                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                                    <div>
                                        <p className="font-semibold text-sm">{b.customerName}</p>
                                        <p className="text-xs text-slate-400">{format(new Date(b.startDate), "dd MMM")} – {format(new Date(b.endDate), "dd MMM")}</p>
                                    </div>
                                    <span className="font-bold text-sm text-[#1F5C4B]">{formatCurrency(b.total)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">warning</span> Low Stock Warnings
                    </h2>
                    {data.lowStockItems.length === 0 ? (
                        <p className="text-slate-400 text-sm">All stock levels are healthy</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {data.lowStockItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                                    <span className="material-symbols-outlined text-amber-500">inventory</span>
                                    <div>
                                        <p className="font-semibold text-sm">{item.name}</p>
                                        <p className="text-xs text-amber-600">Only {item.quantityTotal} in stock</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
