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
    VOID: "bg-slate-800 text-white",
};

// ─── Toasts (replaces blocking alert() dialogs) ───────────────────────────────
interface ToastMsg {
    id: string;
    text: string;
    tone: "success" | "error" | "info";
    action?: { label: string; onClick: () => void };
}

function ToastStack({ toasts, dismiss }: { toasts: ToastMsg[]; dismiss: (id: string) => void }) {
    if (!toasts.length) return null;
    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 w-[min(92vw,26rem)]">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm animate-in slide-in-from-bottom-2 ${
                        t.tone === "error" ? "bg-red-50 border-red-200 text-red-800"
                        : t.tone === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-white border-slate-200 text-slate-700"
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {t.tone === "error" ? "error" : t.tone === "success" ? "check_circle" : "info"}
                    </span>
                    <span className="flex-1 font-medium">{t.text}</span>
                    {t.action && (
                        <button
                            onClick={() => { t.action!.onClick(); dismiss(t.id); }}
                            className="font-bold uppercase tracking-widest text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                        >
                            {t.action.label}
                        </button>
                    )}
                    <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            ))}
        </div>
    );
}

type Notify = (text: string, opts?: { tone?: "success" | "error" | "info"; action?: { label: string; onClick: () => void }; duration?: number }) => void;

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
function DeleteModal({ invoice, permanent, onClose, onDone, notify }: { invoice: Invoice; permanent: boolean; onClose: () => void; onDone: (deleted: Invoice) => void; notify: Notify }) {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/invoices/${invoice.id}${permanent ? "?permanent=true" : ""}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                notify(data.error || "Could not delete this invoice.", { tone: "error", duration: 9000 });
                return;
            }
            onDone(invoice);
            onClose();
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-lg font-black tracking-tight mb-2">
                    {permanent ? "Delete forever?" : "Move to Trash?"}
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                    <span className="font-semibold text-slate-700">{invoice.invoiceNumber}</span> for {invoice.clientName}{" "}
                    {permanent
                        ? "will be permanently destroyed, along with its line items. This cannot be undone."
                        : "will be moved to Trash. You can restore it at any time."}
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        {deleting ? "Working…" : permanent ? "Delete forever" : "Move to Trash"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Schedule Modal ───────────────────────────────────────────────────────────
function ScheduleModal({ invoice, onClose, onDone, notify }: { invoice: Invoice; onClose: () => void; onDone: () => void; notify: Notify }) {
    const [occurrences, setOccurrences] = useState(11);
    const [scheduling, setScheduling] = useState(false);

    async function handleSchedule() {
        if (occurrences < 1 || occurrences > 36) return notify("Occurrences must be between 1 and 36", { tone: "error" });
        setScheduling(true);
        
        try {
            const res = await fetch(`/api/admin/invoices/${invoice.id}/schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ occurrences })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            notify(`Generated ${data.count} draft invoice${data.count === 1 ? "" : "s"}.`, { tone: "success" });
            onDone();
            onClose();
        } catch (e: unknown) {
            notify((e as Error).message || "Failed to schedule invoices", { tone: "error" });
        } finally {
            setScheduling(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-black tracking-tight mb-2">Setup Recurring Contract</h3>
                <p className="text-sm text-slate-500 mb-6">
                    Generate future draft invoices based on <span className="font-semibold text-slate-700">{invoice.invoiceNumber}</span>. 
                    They will advance by 1 month for each occurrence.
                </p>
                
                <div className="mb-6">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                        Occurrences to generate
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="36"
                        value={occurrences}
                        onChange={e => setOccurrences(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                        If this is a 12-month contract, enter 11 (as the current invoice counts as month 1).
                    </p>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button
                        onClick={handleSchedule}
                        disabled={scheduling}
                        className="flex-1 px-4 py-2.5 bg-[#1F5C4B] hover:bg-[#123A2F] text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        {scheduling ? "Generating…" : "Generate Drafts"}
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
    const [view, setView] = useState<"active" | "trash">("active");
    const [trashCount, setTrashCount] = useState(0);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [toasts, setToasts] = useState<ToastMsg[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts(t => t.filter(x => x.id !== id));
    }, []);

    const notify = useCallback<Notify>((text, opts) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(t => [...t, { id, text, tone: opts?.tone || "info", action: opts?.action }]);
        const duration = opts?.duration ?? (opts?.action ? 9000 : 5000);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
    }, []);

    // Modal state
    const [sendTarget, setSendTarget] = useState<Invoice | null>(null);
    const [payTarget, setPayTarget] = useState<Invoice | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ invoice: Invoice; permanent: boolean } | null>(null);
    const [scheduleTarget, setScheduleTarget] = useState<Invoice | null>(null);
    const [duplicating, setDuplicating] = useState<string | null>(null);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        const query = new URLSearchParams();
        if (search) query.append("search", search);
        if (statusFilter) query.append("status", statusFilter);
        if (dateFrom) query.append("from", dateFrom);
        if (dateTo) query.append("to", dateTo);
        query.append("view", view);
        const res = await fetch(`/api/admin/invoices?${query.toString()}`);
        const data = await res.json();
        setInvoices(data.invoices || []);
        setTrashCount(data.trashCount ?? 0);
        setLoading(false);
    }, [search, statusFilter, view, dateFrom, dateTo]);

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
        try {
            const res = await fetch(`/api/admin/invoices/${invoice.id}/duplicate`, { method: "POST" });
            const data = await res.json();
            if (!res.ok || !data.success) {
                notify(data.error || "Failed to duplicate invoice", { tone: "error" });
                return;
            }
            notify(`Created ${data.invoice.invoiceNumber} — opening it now.`, { tone: "success" });
            router.push(`/admin/invoices/${data.invoice.id}/edit`);
        } catch {
            notify("Failed to duplicate invoice", { tone: "error" });
        } finally {
            setDuplicating(null);
        }
    }

    const restoreInvoice = useCallback(async (invoice: Invoice, quiet = false) => {
        const res = await fetch(`/api/admin/invoices/${invoice.id}/restore`, { method: "POST" });
        if (!res.ok) {
            notify(`Could not restore ${invoice.invoiceNumber}.`, { tone: "error" });
            return;
        }
        if (!quiet) notify(`${invoice.invoiceNumber} restored.`, { tone: "success" });
        refresh();
    }, [notify]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleDeleted(invoice: Invoice, permanent: boolean) {
        refresh();
        if (permanent) {
            notify(`${invoice.invoiceNumber} deleted permanently.`, { tone: "success" });
            return;
        }
        notify(`${invoice.invoiceNumber} moved to Trash.`, {
            tone: "success",
            action: { label: "Undo", onClick: () => restoreInvoice(invoice, true) },
        });
    }

    function isOverdue(invoice: Invoice) {
        if (!invoice.dueDate) return false;
        if (["PAID", "CANCELLED", "REFUNDED", "VOID"].includes(invoice.status)) return false;
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
                <div className="px-4 pt-4 flex items-center gap-2 border-b border-slate-100">
                    <button
                        onClick={() => setView("active")}
                        className={`px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-colors ${view === "active" ? "border-[#1F5C4B] text-[#1F5C4B]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                    >
                        Invoices
                    </button>
                    <button
                        onClick={() => setView("trash")}
                        className={`px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${view === "trash" ? "border-[#1F5C4B] text-[#1F5C4B]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                    >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Trash
                        {trashCount > 0 && (
                            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{trashCount}</span>
                        )}
                    </button>
                </div>

                {view === "trash" && (
                    <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">history</span>
                        Deleted invoices are kept here and can be restored. Issued or paid invoices can&apos;t be destroyed — void them instead.
                    </div>
                )}

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
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            title="Issued from"
                            className="py-2 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B] bg-white"
                        />
                        <span className="text-slate-400 text-sm">to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            title="Issued to"
                            className="py-2 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B] bg-white"
                        />
                        {(dateFrom || dateTo || statusFilter || search) && (
                            <button
                                onClick={() => { setDateFrom(""); setDateTo(""); setStatusFilter(""); setSearch(""); }}
                                title="Clear filters"
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                            </button>
                        )}
                    </div>
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
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">{view === "trash" ? "Trash is empty." : "No invoices found."}</td></tr>
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
                                                {view === "trash" ? (
                                                    <>
                                                        <button
                                                            onClick={() => restoreInvoice(invoice)}
                                                            title="Restore invoice"
                                                            className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">restore_from_trash</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget({ invoice, permanent: true })}
                                                            title="Delete forever"
                                                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                <>
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

                                                {/* Schedule Recurring */}
                                                <button
                                                    onClick={() => setScheduleTarget(invoice)}
                                                    title="Setup Recurring"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">event_repeat</span>
                                                </button>

                                                {/* View */}
                                                <Link
                                                    href={`/invoice/${invoice.id}`}
                                                    target="_blank"
                                                    title="View invoice"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-[#1F5C4B] hover:bg-emerald-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                                </Link>

                                                {/* Delete (moves to Trash) */}
                                                <button
                                                    onClick={() => setDeleteTarget({ invoice, permanent: false })}
                                                    title="Move to Trash"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                                </>
                                                )}
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
                <DeleteModal
                    invoice={deleteTarget.invoice}
                    permanent={deleteTarget.permanent}
                    notify={notify}
                    onClose={() => setDeleteTarget(null)}
                    onDone={(inv) => handleDeleted(inv, deleteTarget.permanent)}
                />
            )}
            {scheduleTarget && (
                <ScheduleModal invoice={scheduleTarget} onClose={() => setScheduleTarget(null)} onDone={refresh} notify={notify} />
            )}

            <ToastStack toasts={toasts} dismiss={dismissToast} />
        </div>
    );
}
