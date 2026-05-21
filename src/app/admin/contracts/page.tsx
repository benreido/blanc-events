"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/config";

interface Contract {
    id: string;
    title: string;
    status: string;
    clientName: string;
    clientEmail: string;
    monthlyAmount: number;
    vatRate: number;
    contractStart: string;
    contractEnd: string;
    invoicesGenerated: number;
    maxInvoices: number;
    nextBillingDate: string;
    _count: { invoices: number };
}

const statusStyle: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    PAUSED: "bg-amber-50 text-amber-700",
    CANCELLED: "bg-rose-50 text-rose-700",
    COMPLETED: "bg-slate-100 text-slate-500",
};

export default function AdminContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/contracts")
            .then(r => r.json())
            .then(d => setContracts(d.contracts ?? []))
            .finally(() => setLoading(false));
    }, []);

    const monthlyTotal = contracts
        .filter(c => c.status === "ACTIVE")
        .reduce((sum, c) => sum + c.monthlyAmount * (1 + c.vatRate), 0);

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Recurring Contracts</h1>
                    <p className="text-sm text-slate-500 mt-1">Yearly hire agreements with monthly billing.</p>
                </div>
                <Link
                    href="/admin/contracts/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1F5C4B] text-white text-xs font-bold rounded-xl uppercase tracking-widest hover:bg-[#123A2F] transition-colors"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    New Contract
                </Link>
            </div>

            {/* Summary */}
            {!loading && contracts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Active", value: contracts.filter(c => c.status === "ACTIVE").length, color: "text-emerald-700" },
                        { label: "Paused", value: contracts.filter(c => c.status === "PAUSED").length, color: "text-amber-600" },
                        { label: "Completed", value: contracts.filter(c => c.status === "COMPLETED").length, color: "text-slate-500" },
                        { label: "Monthly MRR", value: formatCurrency(monthlyTotal), color: "text-[#123A2F]" },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                            <p className={`text-2xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-xl" />)}</div>
            ) : contracts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">autorenew</span>
                    <p className="text-slate-400 mb-4">No recurring contracts yet</p>
                    <Link
                        href="/admin/contracts/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F5C4B] text-white text-xs font-bold rounded-xl uppercase tracking-widest hover:bg-[#123A2F] transition-colors"
                    >
                        Create first contract
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {contracts.map(c => {
                        const progress = c.maxInvoices > 0 ? (c.invoicesGenerated / c.maxInvoices) * 100 : 0;
                        const monthly = c.monthlyAmount * (1 + c.vatRate);
                        return (
                            <Link
                                key={c.id}
                                href={`/admin/contracts/${c.id}`}
                                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-[#1F5C4B]/30 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-slate-800 truncate">{c.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${statusStyle[c.status] ?? "bg-slate-100 text-slate-500"}`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 truncate">{c.clientName} · {c.clientEmail}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(c.contractStart).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                                            {" – "}
                                            {new Date(c.contractEnd).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                                        </p>
                                        {/* Progress bar */}
                                        <div className="mt-3">
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                <span>{c.invoicesGenerated} of {c.maxInvoices} invoices sent</span>
                                                {c.status === "ACTIVE" && (
                                                    <span>Next: {new Date(c.nextBillingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                                                )}
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                <div className="bg-[#1F5C4B] h-1.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xl font-black text-[#123A2F]">{formatCurrency(monthly)}</p>
                                        <p className="text-[10px] text-slate-400">/ month inc. VAT</p>
                                        <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500 text-base mt-2 block">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
