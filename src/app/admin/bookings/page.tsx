"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/config";
import { format } from "date-fns";

interface Booking {
    id: string; customerName: string; customerEmail: string; startDate: string; endDate: string;
    status: string; total: number; amountPaid: number; paymentMode: string;
    subhireAlert: string; subhireRequired: boolean; grossMargin: number;
    ownedEquipmentValue: number; subhireTotalCost: number; netMargin: number;
    lineItems: Array<{ itemName: string; quantity: number; lineTotal: number }>;
}

const statusColors: Record<string, string> = {
    AWAITING_PAYMENT: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-green-50 text-green-700",
    HOLD: "bg-blue-50 text-blue-700",
    IN_PROGRESS: "bg-purple-50 text-purple-700",
    COMPLETED: "bg-slate-100 text-slate-700",
    CANCELLED: "bg-red-50 text-red-700",
    EXPIRED: "bg-slate-100 text-slate-500",
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    const fetchBookings = () => {
        setLoading(true);
        fetch("/api/admin/bookings").then((r) => r.json()).then((d) => { setBookings(d.bookings || []); setLoading(false); });
    };

    useEffect(fetchBookings, []);

    const handleAction = async (id: string, action: string) => {
        await fetch("/api/admin/bookings", {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action }),
        });
        fetchBookings();
    };

    const filtered = filter ? bookings.filter((b) => b.status === filter) : bookings;

    return (
        <div>
            <h1 className="text-3xl font-black tracking-tighter mb-8">Bookings</h1>

            <div className="flex gap-2 mb-6 flex-wrap">
                {["", "AWAITING_PAYMENT", "CONFIRMED", "HOLD", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${filter === s ? "bg-[#1F5C4B] text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-[#1F5C4B]"
                            }`}>
                        {s || "All"}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">inbox</span>
                    <p className="text-slate-400">No bookings found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((b) => (
                        <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{b.customerName}</h3>
                                    <p className="text-sm text-slate-400">{b.customerEmail}</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {format(new Date(b.startDate), "dd MMM yyyy")} – {format(new Date(b.endDate), "dd MMM yyyy")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[b.status] || "bg-slate-100"}`}>{b.status.replace(/_/g, " ")}</span>
                                    <p className="text-xl font-black text-[#123A2F] mt-2">{formatCurrency(b.total)}</p>
                                    {b.amountPaid > 0 && <p className="text-xs text-green-600">Paid: {formatCurrency(b.amountPaid)}</p>}
                                </div>
                            </div>
                            {b.lineItems.length > 0 && (
                                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                    {b.lineItems.map((li, i) => (
                                        <div key={i} className="flex justify-between text-sm py-1">
                                            <span>{li.quantity}x {li.itemName}</span>
                                            <span className="font-bold">{formatCurrency(li.lineTotal)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Internal Profit Dashboard & Subhire Alerts */}
                            <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#1F5C4B] mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">monitoring</span>
                                    Internal Profit Dashboard
                                </h4>

                                {b.subhireRequired && b.subhireAlert && (
                                    <div className="bg-amber-100 border border-amber-200 rounded p-2 mb-3 mt-1 flex items-start gap-2">
                                        <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
                                        <p className="text-sm font-bold text-amber-800">{b.subhireAlert}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-500">Customer Total</p>
                                        <p className="font-bold text-sm">{formatCurrency(b.total)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-500">Owned Value</p>
                                        <p className="font-bold text-sm text-blue-700">{formatCurrency(b.ownedEquipmentValue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-500">Subhire Cost</p>
                                        <p className="font-bold text-sm text-red-600">{formatCurrency(b.subhireTotalCost)}</p>
                                    </div>
                                    <div className={`rounded px-2 flex flex-col justify-center ${b.grossMargin < 30 ? "bg-red-100 border border-red-200" : "bg-green-100 border border-green-200"}`}>
                                        <p className={`text-[10px] font-bold uppercase ${b.grossMargin < 30 ? "text-red-700" : "text-green-800"}`}>Gross Margin</p>
                                        <p className={`font-black text-sm ${b.grossMargin < 30 ? "text-red-700" : "text-green-800"}`}>{b.grossMargin.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {b.status === "AWAITING_PAYMENT" && (
                                    <>
                                        <button onClick={() => handleAction(b.id, "create_payment_link")}
                                            className="px-4 py-2 bg-[#1F5C4B] text-white text-xs font-bold rounded-lg uppercase">Send Payment Link</button>
                                        <button onClick={() => handleAction(b.id, "mark_paid")}
                                            className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg uppercase">Mark Paid</button>
                                    </>
                                )}
                                {!["CANCELLED", "COMPLETED"].includes(b.status) && (
                                    <button onClick={() => handleAction(b.id, "cancel")}
                                        className="px-4 py-2 border border-red-200 text-red-500 text-xs font-bold rounded-lg uppercase hover:bg-red-50">Cancel</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
