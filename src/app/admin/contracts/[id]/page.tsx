"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/config";

interface ContractInvoice {
    id: string; invoiceNumber: string; status: string;
    issueDate: string; dueDate: string | null; total: number;
    balanceDue: number; amountPaid: number; paidAt: string | null;
}

interface Contract {
    id: string; title: string; status: string;
    clientName: string; clientEmail: string; clientAddress: string;
    contractStart: string; contractEnd: string; billingDay: number;
    monthlyAmount: number; vatRate: number;
    nextBillingDate: string; invoicesGenerated: number; maxInvoices: number;
    lineItems: Array<{ name: string; description?: string; quantity: number; unitPrice: number }>;
    notes: string; createdAt: string;
    invoices: ContractInvoice[];
}

const statusStyle: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    PAUSED: "bg-amber-50 text-amber-700",
    CANCELLED: "bg-rose-50 text-rose-700",
    COMPLETED: "bg-slate-100 text-slate-500",
};

const invStatusStyle: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-500",
    SENT: "bg-blue-50 text-blue-700",
    PAID: "bg-emerald-50 text-emerald-700",
    OVERDUE: "bg-rose-50 text-rose-700",
    PARTIALLY_PAID: "bg-amber-50 text-amber-700",
    CANCELLED: "bg-slate-100 text-slate-500",
};

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);

    const fetchContract = () => {
        setLoading(true);
        fetch(`/api/admin/contracts/${id}`)
            .then(r => r.json())
            .then(d => setContract(d.contract))
            .finally(() => setLoading(false));
    };

    useEffect(fetchContract, [id]);

    const doAction = async (action: string, confirm?: string) => {
        if (confirm && !window.confirm(confirm)) return;
        setActing(true);
        await fetch(`/api/admin/contracts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
        });
        setActing(false);
        fetchContract();
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this contract? All invoice links will be removed. This cannot be undone.")) return;
        setActing(true);
        await fetch(`/api/admin/contracts/${id}`, { method: "DELETE" });
        router.push("/admin/contracts");
    };

    if (loading) {
        return (
            <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-4">
                <div className="h-8 w-64 skeleton rounded-xl" />
                <div className="h-48 skeleton rounded-2xl" />
                <div className="h-64 skeleton rounded-2xl" />
            </div>
        );
    }

    if (!contract) {
        return <div className="p-10 text-slate-400">Contract not found.</div>;
    }

    const monthly = contract.monthlyAmount * (1 + contract.vatRate);
    const totalContractValue = monthly * contract.maxInvoices;
    const collected = contract.invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const progress = contract.maxInvoices > 0 ? (contract.invoicesGenerated / contract.maxInvoices) * 100 : 0;

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Link href="/admin/contracts" className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-3">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Contracts
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black tracking-tighter">{contract.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${statusStyle[contract.status] ?? "bg-slate-100 text-slate-500"}`}>
                            {contract.status}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{contract.clientName} · {contract.clientEmail}</p>
                </div>

                <div className="flex gap-2 shrink-0">
                    {contract.status === "ACTIVE" && (
                        <button onClick={() => doAction("pause")} disabled={acting}
                            className="px-4 py-2 border border-amber-300 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-50 disabled:opacity-50 transition-colors">
                            Pause
                        </button>
                    )}
                    {contract.status === "PAUSED" && (
                        <button onClick={() => doAction("resume")} disabled={acting}
                            className="px-4 py-2 border border-emerald-300 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-50 disabled:opacity-50 transition-colors">
                            Resume
                        </button>
                    )}
                    {(contract.status === "ACTIVE" || contract.status === "PAUSED") && (
                        <button onClick={() => doAction("cancel", "Cancel this contract? This cannot be undone.")} disabled={acting}
                            className="px-4 py-2 border border-rose-300 text-rose-700 text-xs font-bold rounded-xl hover:bg-rose-50 disabled:opacity-50 transition-colors">
                            Cancel
                        </button>
                    )}
                    <button onClick={handleDelete} disabled={acting}
                        className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
                        Delete
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Monthly (inc. VAT)", value: formatCurrency(monthly) },
                    { label: "Contract Value", value: formatCurrency(totalContractValue) },
                    { label: "Collected", value: formatCurrency(collected) },
                    { label: "Invoices Sent", value: `${contract.invoicesGenerated} / ${contract.maxInvoices}` },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                        <p className="text-xl font-black tracking-tighter text-[#123A2F]">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Details + progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F]">Contract Details</h2>
                    <table className="w-full text-sm">
                        <tbody>
                            {[
                                ["Period", `${new Date(contract.contractStart).toLocaleDateString("en-GB", { month: "short", year: "numeric" })} – ${new Date(contract.contractEnd).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`],
                                ["Billing Day", `${contract.billingDay}${contract.billingDay === 1 ? "st" : contract.billingDay === 2 ? "nd" : contract.billingDay === 3 ? "rd" : "th"} of each month`],
                                ["VAT Rate", `${(contract.vatRate * 100).toFixed(0)}%`],
                                ["Next Invoice", contract.status === "ACTIVE" ? new Date(contract.nextBillingDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"],
                                ["Client Address", contract.clientAddress || "—"],
                            ].map(([k, v]) => (
                                <tr key={k} className="border-b border-slate-50">
                                    <td className="py-2.5 text-slate-400 w-1/2">{k}</td>
                                    <td className="py-2.5 font-semibold text-slate-700">{v}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {contract.notes && (
                        <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Notes</p>
                            {contract.notes}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F]">Line Items (Monthly Template)</h2>
                    <div className="space-y-2">
                        {contract.lineItems.map((li, i) => (
                            <div key={i} className="flex justify-between text-sm py-2 border-b border-slate-50">
                                <div>
                                    <p className="font-semibold text-slate-800">{li.quantity > 1 ? `${li.quantity}× ` : ""}{li.name}</p>
                                    {li.description && <p className="text-xs text-slate-400">{li.description}</p>}
                                </div>
                                <p className="font-bold text-slate-700 shrink-0 ml-4">{formatCurrency(li.unitPrice * li.quantity)}</p>
                            </div>
                        ))}
                        <div className="flex justify-between text-sm pt-2">
                            <span className="text-slate-400">Subtotal</span>
                            <span className="font-bold">{formatCurrency(contract.monthlyAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">VAT ({(contract.vatRate * 100).toFixed(0)}%)</span>
                            <span className="font-bold">{formatCurrency(contract.monthlyAmount * contract.vatRate)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-[#123A2F] border-t border-slate-100 pt-2">
                            <span>Monthly Total</span>
                            <span>{formatCurrency(monthly)}</span>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="pt-2">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                            <span>{contract.invoicesGenerated} of {contract.maxInvoices} invoices generated</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-[#1F5C4B] h-2 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice history */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F] mb-4">Invoice History</h2>
                {contract.invoices.length === 0 ? (
                    <p className="text-sm text-slate-400">No invoices generated yet. The first invoice will be sent on the next billing date.</p>
                ) : (
                    <div className="space-y-2">
                        {contract.invoices.map(inv => (
                            <Link
                                key={inv.id}
                                href={`/admin/invoices/${inv.id}/edit`}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm text-slate-800">{inv.invoiceNumber}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${invStatusStyle[inv.status] ?? "bg-slate-100 text-slate-500"}`}>
                                            {inv.status.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Issued {new Date(inv.issueDate).toLocaleDateString("en-GB")}
                                        {inv.dueDate && ` · Due ${new Date(inv.dueDate).toLocaleDateString("en-GB")}`}
                                        {inv.paidAt && ` · Paid ${new Date(inv.paidAt).toLocaleDateString("en-GB")}`}
                                    </p>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <p className="font-bold text-slate-700">{formatCurrency(inv.total)}</p>
                                    {inv.balanceDue > 0 && (
                                        <p className="text-[10px] text-rose-500 font-bold">{formatCurrency(inv.balanceDue)} due</p>
                                    )}
                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500 text-sm">arrow_forward</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
