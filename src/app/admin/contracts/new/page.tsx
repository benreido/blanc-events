"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { formatCurrency } from "@/lib/config";

interface LineItem {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

function NewContractForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromInvoiceId = searchParams.get("fromInvoice");

    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: "",
        clientName: "",
        clientEmail: "",
        clientAddress: "",
        contractStart: "",
        contractEnd: "",
        billingDay: 1,
        monthlyAmount: 0,
        vatRate: 0.20,
        notes: "",
    });
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { name: "", description: "", quantity: 1, unitPrice: 0 },
    ]);

    const subtotal = lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
    const vatAmount = subtotal * form.vatRate;
    const monthlyTotal = subtotal + vatAmount;

    const addLineItem = () =>
        setLineItems(prev => [...prev, { name: "", description: "", quantity: 1, unitPrice: 0 }]);

    const removeLineItem = (i: number) =>
        setLineItems(prev => prev.filter((_, idx) => idx !== i));

    const updateLineItem = (i: number, field: keyof LineItem, value: string | number) =>
        setLineItems(prev => prev.map((li, idx) => idx === i ? { ...li, [field]: value } : li));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/contracts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    monthlyAmount: subtotal,
                    lineItems,
                    fromInvoiceId,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                alert(data.error ?? "Failed to create contract");
                return;
            }
            router.push(`/admin/contracts/${data.contract.id}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
            <div>
                <button onClick={() => router.back()} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                </button>
                <h1 className="text-3xl font-black tracking-tighter">New Recurring Contract</h1>
                <p className="text-sm text-slate-500 mt-1">Set up a monthly billing contract for a long-term hire.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client details */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F]">Contract Details</h2>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Contract Title</label>
                        <input
                            required
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Annual AV Hire – Acme Corp"
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Client Name</label>
                            <input
                                required
                                value={form.clientName}
                                onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Client Email</label>
                            <input
                                required type="email"
                                value={form.clientEmail}
                                onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Client Address</label>
                        <textarea
                            rows={2}
                            value={form.clientAddress}
                            onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20 resize-none"
                        />
                    </div>
                </div>

                {/* Schedule */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F]">Billing Schedule</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Contract Start</label>
                            <input
                                required type="date"
                                value={form.contractStart}
                                onChange={e => setForm(f => ({ ...f, contractStart: e.target.value }))}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Contract End</label>
                            <input
                                required type="date"
                                value={form.contractEnd}
                                onChange={e => setForm(f => ({ ...f, contractEnd: e.target.value }))}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Bill on Day of Month</label>
                            <input
                                required type="number" min={1} max={28}
                                value={form.billingDay}
                                onChange={e => setForm(f => ({ ...f, billingDay: parseInt(e.target.value) || 1 }))}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20"
                            />
                        </div>
                    </div>
                    <div className="w-40">
                        <label className="block text-xs font-bold text-slate-600 mb-1">VAT Rate</label>
                        <select
                            value={form.vatRate}
                            onChange={e => setForm(f => ({ ...f, vatRate: parseFloat(e.target.value) }))}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20"
                        >
                            <option value={0.20}>20% (Standard)</option>
                            <option value={0.05}>5% (Reduced)</option>
                            <option value={0}>0% (Zero-rated)</option>
                        </select>
                    </div>
                </div>

                {/* Line items */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F]">Monthly Line Items</h2>
                    <p className="text-xs text-slate-400">These items appear on every generated invoice.</p>

                    {lineItems.map((li, i) => (
                        <div key={i} className="grid grid-cols-12 gap-3 items-end border-b border-slate-50 pb-4">
                            <div className="col-span-5">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Item Name</label>
                                <input
                                    required
                                    value={li.name}
                                    onChange={e => updateLineItem(i, "name", e.target.value)}
                                    placeholder="Equipment hire"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20"
                                />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                                <input
                                    value={li.description}
                                    onChange={e => updateLineItem(i, "description", e.target.value)}
                                    placeholder="Optional"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Qty</label>
                                <input
                                    type="number" min={1}
                                    value={li.quantity}
                                    onChange={e => updateLineItem(i, "quantity", parseInt(e.target.value) || 1)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Unit Price (£)</label>
                                <input
                                    type="number" min={0} step="0.01"
                                    value={li.unitPrice}
                                    onChange={e => updateLineItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20"
                                />
                            </div>
                            <div className="col-span-1">
                                {lineItems.length > 1 && (
                                    <button type="button" onClick={() => removeLineItem(i)}
                                        className="w-full flex items-center justify-center h-9 text-rose-400 hover:text-rose-600 transition-colors">
                                        <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={addLineItem}
                        className="text-xs font-bold text-[#1F5C4B] hover:text-[#123A2F] flex items-center gap-1 transition-colors">
                        <span className="material-symbols-outlined text-sm">add</span> Add Line Item
                    </button>

                    {/* Totals preview */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-bold">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">VAT ({(form.vatRate * 100).toFixed(0)}%)</span>
                            <span className="font-bold">{formatCurrency(vatAmount)}</span>
                        </div>
                        <div className="flex justify-between font-black text-[#123A2F] text-base border-t border-slate-200 pt-2">
                            <span>Monthly Total</span>
                            <span>{formatCurrency(monthlyTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F] mb-3">Notes (Internal)</h2>
                    <textarea
                        rows={3}
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="Any internal notes about this contract…"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5C4B]/20 resize-none"
                    />
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={saving}
                        className="px-8 py-3 bg-[#1F5C4B] text-white text-sm font-bold rounded-xl hover:bg-[#123A2F] disabled:opacity-50 transition-colors">
                        {saving ? "Creating…" : "Create Contract"}
                    </button>
                    <button type="button" onClick={() => router.back()}
                        className="px-6 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function NewContractPage() {
    return (
        <Suspense fallback={<div className="p-10 text-slate-400">Loading…</div>}>
            <NewContractForm />
        </Suspense>
    );
}
