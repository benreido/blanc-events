"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/config";
import { format } from "date-fns";

interface Quote {
    id: string; customerName: string; customerEmail: string; venue: string;
    startDate: string; endDate: string; status: string; total: number; numberOfDays: number;
    lineItems: Array<{ itemName: string; quantity: number; lineTotal: number }>;
}

export default function AdminQuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuotes = () => {
        setLoading(true);
        fetch("/api/admin/quotes").then((r) => r.json()).then((d) => { setQuotes(d.quotes || []); setLoading(false); });
    };

    useEffect(fetchQuotes, []);

    const handleConvert = async (id: string) => {
        await fetch("/api/admin/quotes", {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action: "convert_to_booking" }),
        });
        fetchQuotes();
    };

    return (
        <div>
            <h1 className="text-3xl font-black tracking-tighter mb-8">Quote Requests</h1>
            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
            ) : quotes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">request_quote</span>
                    <p className="text-slate-400">No quote requests yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {quotes.map((q) => (
                        <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{q.customerName}</h3>
                                    <p className="text-sm text-slate-400">{q.customerEmail}</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {format(new Date(q.startDate), "dd MMM yyyy")} – {format(new Date(q.endDate), "dd MMM yyyy")} ({q.numberOfDays} days)
                                    </p>
                                    {q.venue && <p className="text-sm text-slate-500">Venue: {q.venue}</p>}
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${q.status === "QUOTE_REQUESTED" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                                        {q.status.replace(/_/g, " ")}
                                    </span>
                                    <p className="text-xl font-black text-[#123A2F] mt-2">{formatCurrency(q.total)}</p>
                                </div>
                            </div>
                            {q.lineItems.length > 0 && (
                                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                    {q.lineItems.map((li, i) => (
                                        <div key={i} className="flex justify-between text-sm py-1">
                                            <span>{li.quantity}x {li.itemName}</span>
                                            <span className="font-bold">{formatCurrency(li.lineTotal)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {q.status === "QUOTE_REQUESTED" && (
                                <button onClick={() => handleConvert(q.id)}
                                    className="px-6 py-2 bg-[#1F5C4B] text-white text-xs font-bold rounded-lg uppercase tracking-widest hover:bg-[#123A2F]">
                                    Convert to Booking
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
