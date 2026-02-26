"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/config";
import { format } from "date-fns";

interface Invoice {
    id: string;
    invoiceNumber: string;
    clientName: string;
    clientEmail: string;
    status: string;
    total: number;
    amountPaid: number;
    balanceDue: number;
    dueDate: string | null;
    issueDate: string;
    bookingOrder?: { id: string };
}

const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    SENT: "bg-blue-50 text-blue-700",
    VIEWED: "bg-indigo-50 text-indigo-700",
    PARTIALLY_PAID: "bg-amber-50 text-amber-700",
    PAID: "bg-green-50 text-green-700",
    OVERDUE: "bg-red-50 text-red-700",
    CANCELLED: "bg-slate-200 text-slate-500",
    REFUNDED: "bg-purple-50 text-purple-700",
};

export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchInvoices = async () => {
        setLoading(true);
        const query = new URLSearchParams();
        if (search) query.append("search", search);
        if (statusFilter) query.append("status", statusFilter);

        const res = await fetch(`/api/admin/invoices?${query.toString()}`);
        const data = await res.json();
        setInvoices(data.invoices || []);
        setLoading(false);
    };

    useEffect(() => {
        const t = setTimeout(fetchInvoices, 300);
        return () => clearTimeout(t);
    }, [search, statusFilter]);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-black tracking-tighter">Invoices</h1>
                <Link
                    href="/admin/invoices/new"
                    className="bg-[#1F5C4B] hover:bg-[#123A2F] text-white px-6 py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span> Create Invoice
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search by invoice number or client..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B] bg-white"
                    >
                        <option value="">All Statuses</option>
                        {Object.keys(statusColors).map(s => (
                            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Client & Ref</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Issue / Due Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Loading invoices...
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No invoices found matching your criteria.
                                    </td>
                                </tr>
                            ) : invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{invoice.clientName}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{invoice.invoiceNumber}</div>
                                        {invoice.bookingOrder && (
                                            <div className="inline-flex mt-1 items-center gap-1 bg-[#1F5C4B]/10 text-[#1F5C4B] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                                                <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                                Booking Link
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{formatCurrency(invoice.total)}</div>
                                        {invoice.balanceDue > 0 && invoice.status !== "DRAFT" ? (
                                            <div className="text-xs text-red-500 mt-0.5 mt-0.5">{formatCurrency(invoice.balanceDue)} due</div>
                                        ) : invoice.status === "PAID" ? (
                                            <div className="text-xs text-green-600 mt-0.5">Paid full</div>
                                        ) : null}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700">{format(new Date(invoice.issueDate), "dd MMM yyyy")}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Due: {invoice.dueDate ? format(new Date(invoice.dueDate), "dd MMM yyyy") : "On Receipt"}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${statusColors[invoice.status] || "bg-slate-100 text-slate-700"}`}>
                                            {invoice.status.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Link href={`/admin/invoices/${invoice.id}/edit`} className="inline-flex items-center text-slate-400 hover:text-[#1F5C4B] transition-colors p-2 bg-slate-100 rounded-lg hover:bg-emerald-50">
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </Link>
                                        <Link href={`/invoice/${invoice.id}`} target="_blank" className="inline-flex items-center text-slate-400 hover:text-[#1F5C4B] transition-colors p-2 bg-slate-100 rounded-lg hover:bg-emerald-50">
                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
