"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    depositAmount: number;
    bookingOrder?: { id: string };
}

interface Stats {
    totalOutstanding: number;
    overdueCount: number;
    paidThisMonth: number;
    draftCount: number;
}

const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    SENT: "bg-blue-50 text-blue-700",
    VIEWED: "bg-indigo-50 text-indigo-700",
    PARTIALLY_PAID: "bg-amber-50 text-amber-700",
    PAID: "bg-green-50 text-green-700",
    OVERDUE: "bg-red-50 text-red-700",
    CANCELLED: "bg-slate-200 text-slate-500",
    REFUNDED: "bg-purple-50 text-purple-700",
};

// ─── Send Modal ───────────────────────────────────────────────────────────────
function SendModal({ invoice, onClose, onDone }: { invoice: Invoice; onClose: () => void; onDone: () => void }) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSend() {
        setSending(true);
        await fetch(`/api/admin/invoices/${invoice.id}/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message || undefined }),
        });
        setSent(true);
        setSending(false);
        setTimeout(() => { onDone(); onClose(); }, 1200);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-black tracking-tight mb-1">Send Invoice</h3>
                <p className="text-sm text-slate-500 mb-5">
                    Sending <span className="font-semibold text-slate-700">{invoice.invoiceNumber}</span> to <span className="font-semibold text-slate-700">{invoice.clientEmail}</span>
                </p>
                <div className="mb-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Custom message (optional)</label>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]"
                        placeholder="Add a personal note to the email..."
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button
                        onClick={handleSend}
                        disabled={sending || sent}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-colors ${sent ? "bg-green-500" : "bg-[#1F5C4B] hover:bg-[#123A2F]"}`}
                    >
                        {sent ? "✓ Sent!" : sending ? "Sending…" : "Send Invoice"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ invoice, onClose, onDone }: { invoice: Invoice; onClose: () => void; onDone: () => void }) {
    const [amount, setAmount] = useState(invoice.balanceDue > 0 ? invoice.balanceDue.toFixed(2) : invoice.total.toFixed(2));
    const [method, setMethod] = useState("BACS");
    const [reference, setReference] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    async function handleRecord() {
        setSaving(true);
        await fetch(`/api/admin/invoices/${invoice.id}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: parseFloat(amount), paymentMethod: method, reference, paymentDate: date }),
        });
        setSaved(true);
        setSaving(false);
        setTimeout(() => { onDone(); onClose(); }, 1000);
    }

    const remaining = invoice.balanceDue > 0 ? invoice.balanceDue : invoice.total;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-black tracking-tight mb-1">Record Payment</h3>
                <p className="text-sm text-slate-500 mb-5">
                    <span className="font-semibold text-slate-700">{invoice.invoiceNumber}</span> — {invoice.clientName}
                    <span className="ml-2 text-amber-600 font-semibold">{formatCurrency(remaining)} outstanding</span>
                </p>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Amount (£)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#1F5C4B]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Method</label>
                        <div className="flex gap-2">
                            {["BACS", "CASH", "STRIPE"].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMethod(m)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${method === m ? "bg-[#1F5C4B] text-white border-[#1F5C4B]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Reference (optional)</label>
                        <input
                            type="text"
                            value={reference}
                            onChange={e => setReference(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]"
                            placeholder="Bank ref, receipt number…"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button
                        onClick={handleRecord}
                        disabled={saving || saved || !amount}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-colors ${saved ? "bg-green-500" : "bg-[#1F5C4B] hover:bg-[#123A2F]"}`}
                    >
                        {saved ? "✓ Recorded!" : saving ? "Saving…" : "Record Payment"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteModal({ invoice, onClose, onDone }: { invoice: Invoice; onClose: () => void; onDone: () => void }) {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        setDeleting(true);
        await fetch(`/api/admin/invoices/${invoice.id}`, { method: "DELETE" });
        onDone();
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-lg font-black tracking-tight mb-2">Delete invoice?</h3>
                <p className="text-sm text-slate-500 mb-6">
                    <span className="font-semibold text-slate-700">{invoice.invoiceNumber}</span> for {invoice.clientName} will be permanently deleted. This cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        {deleting ? "Deleting…" : "Yes, delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminInvoicesPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Modal state
    const [sendTarget, setSendTarget] = useState<Invoice | null>(null);
    const [payTarget, setPayTarget] = useState<Invoice | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
    const [duplicating, setDuplicating] = useState<string | null>(null);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        const query = new URLSearchParams();
        if (search) query.append("search", search);
        if (statusFilter) query.append("status", statusFilter);
        const res = await fetch(`/api/admin/invoices?${query.toString()}`);
        const data = await res.json();
        setInvoices(data.invoices || []);
        setLoading(false);
    }, [search, statusFilter]);

    const fetchStats = useCallback(async () => {
        const res = await fetch("/api/admin/invoices/stats");
        const data = await res.json();
        setStats(data);
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        const t = setTimeout(fetchInvoices, 300);
        return () => clearTimeout(t);
    }, [fetchInvoices]);

    function refresh() {
        fetchInvoices();
        fetchStats();
    }

    async function handleDuplicate(invoice: Invoice) {
        setDuplicating(invoice.id);
        const res = await fetch(`/api/admin/invoices/${invoice.id}/duplicate`, { method: "POST" });
        const data = await res.json();
        setDuplicating(null);
        if (data.success) {
            router.push(`/admin/invoices/${data.invoice.id}/edit`);
        }
    }

    function isOverdue(invoice: Invoice) {
        if (!invoice.dueDate) return false;
        if (["PAID", "CANCELLED", "REFUNDED"].includes(invoice.status)) return false;
        return new Date(invoice.dueDate) < new Date();
    }

    const displayStatus = (invoice: Invoice) => isOverdue(invoice) ? "OVERDUE" : invoice.status;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-black tracking-tighter">Invoices</h1>
                <Link
                    href="/admin/invoices/new"
                    className="bg-[#1F5C4B] hover:bg-[#123A2F] text-white px-6 py-3 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors flex items-center gap-2 w-fit"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span> Create Invoice
                </Link>
            </div>

            {/* Stats Bar */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Outstanding</p>
                        <p className="text-2xl font-black tracking-tight text-slate-900">{formatCurrency(stats.totalOutstanding)}</p>
                    </div>
                    <div className={`rounded-xl border shadow-sm p-5 ${stats.overdueCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Overdue</p>
                        <p className={`text-2xl font-black tracking-tight ${stats.overdueCount > 0 ? "text-red-600" : "text-slate-900"}`}>
                            {stats.overdueCount} invoice{stats.overdueCount !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Paid this month</p>
                        <p className="text-2xl font-black tracking-tight text-green-700">{formatCurrency(stats.paidThisMonth)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Drafts</p>
                        <p className="text-2xl font-black tracking-tight text-slate-900">{stats.draftCount}</p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search by invoice number or client…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
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
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Issue / Due</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading invoices…</td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No invoices found.</td></tr>
                            ) : invoices.map(invoice => {
                                const status = displayStatus(invoice);
                                const overdue = isOverdue(invoice);
                                return (
                                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{invoice.clientName}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{invoice.invoiceNumber}</div>
                                            {invoice.bookingOrder && (
                                                <div className="inline-flex mt-1 items-center gap-1 bg-[#1F5C4B]/10 text-[#1F5C4B] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                                                    <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                                    Booking
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{formatCurrency(invoice.total)}</div>
                                            {invoice.balanceDue > 0 && invoice.status !== "DRAFT" ? (
                                                <div className="text-xs text-red-500 mt-0.5">{formatCurrency(invoice.balanceDue)} due</div>
                                            ) : invoice.status === "PAID" ? (
                                                <div className="text-xs text-green-600 mt-0.5">Paid in full</div>
                                            ) : null}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700">{format(new Date(invoice.issueDate), "dd MMM yyyy")}</div>
                                            <div className={`text-xs mt-0.5 ${overdue ? "text-red-500 font-semibold" : "text-slate-500"}`}>
                                                Due: {invoice.dueDate ? format(new Date(invoice.dueDate), "dd MMM yyyy") : "On receipt"}
                                                {overdue && " · Overdue"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${statusColors[status] || "bg-slate-100 text-slate-700"}`}>
                                                {status.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Send */}
                                                <button
                                                    onClick={() => setSendTarget(invoice)}
                                                    title="Send to client"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                                </button>

                                                {/* Record Payment */}
                                                {!["PAID", "CANCELLED", "REFUNDED"].includes(invoice.status) && (
                                                    <button
                                                        onClick={() => setPayTarget(invoice)}
                                                        title="Record payment"
                                                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">payments</span>
                                                    </button>
                                                )}

                                                {/* Duplicate */}
                                                <button
                                                    onClick={() => handleDuplicate(invoice)}
                                                    title="Duplicate"
                                                    disabled={duplicating === invoice.id}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        {duplicating === invoice.id ? "hourglass_empty" : "content_copy"}
                                                    </span>
                                                </button>

                                                {/* Edit */}
                                                <Link
                                                    href={`/admin/invoices/${invoice.id}/edit`}
                                                    title="Edit"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-[#1F5C4B] hover:bg-emerald-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </Link>

                                                {/* View */}
                                                <Link
                                                    href={`/invoice/${invoice.id}`}
                                                    target="_blank"
                                                    title="View invoice"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-[#1F5C4B] hover:bg-emerald-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                                </Link>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => setDeleteTarget(invoice)}
                                                    title="Delete"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {sendTarget && (
                <SendModal invoice={sendTarget} onClose={() => setSendTarget(null)} onDone={refresh} />
            )}
            {payTarget && (
                <PaymentModal invoice={payTarget} onClose={() => setPayTarget(null)} onDone={refresh} />
            )}
            {deleteTarget && (
                <DeleteModal invoice={deleteTarget} onClose={() => setDeleteTarget(null)} onDone={refresh} />
            )}
        </div>
    );
}
