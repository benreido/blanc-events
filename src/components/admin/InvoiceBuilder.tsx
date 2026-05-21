"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface InvoiceItem {
    id: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    discountType: "FIXED" | "PERCENTAGE";
    taxable: boolean;
}

interface InvoiceAdjustment {
    id: string;
    name: string;
    description: string;
    amount: number;
    type: "EXTRA" | "LATE_FEE" | "DISCOUNT" | "CREDIT";
}

interface SavedClient {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    address: string;
    notes: string;
}

export default function InvoiceBuilder({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || "");
    const [status, setStatus] = useState(initialData?.status || "DRAFT");
    const [dueDate, setDueDate] = useState<string>(initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "");
    const [eventDate, setEventDate] = useState<string>(initialData?.eventDate ? new Date(initialData.eventDate).toISOString().split('T')[0] : "");
    const [notes, setNotes] = useState(initialData?.notes || "");

    // Client State
    const [clientId, setClientId] = useState(initialData?.clientId || "");
    const [clientName, setClientName] = useState(initialData?.clientName || "");
    const [clientEmail, setClientEmail] = useState(initialData?.clientEmail || "");
    const [clientAddress, setClientAddress] = useState(initialData?.clientAddress || "");

    // Saved clients
    const [savedClients, setSavedClients] = useState<SavedClient[]>([]);
    const [clientSearch, setClientSearch] = useState("");
    const [showClientList, setShowClientList] = useState(false);
    const [savingClient, setSavingClient] = useState(false);
    const [clientSaved, setClientSaved] = useState(false);
    const clientSearchRef = useRef<HTMLDivElement>(null);

    // Line Items
    const [items, setItems] = useState<InvoiceItem[]>(initialData?.items?.map((it: any) => ({ ...it, id: it.id || crypto.randomUUID() })) || []);

    // Adjustments
    const [adjustments, setAdjustments] = useState<InvoiceAdjustment[]>(initialData?.adjustments?.map((adj: any) => ({ ...adj, id: adj.id || crypto.randomUUID() })) || []);

    // Payment splits
    const [depositPercent, setDepositPercent] = useState<number>(0);

    useEffect(() => {
        if (initialData?.depositAmount && initialData?.total) {
            setDepositPercent(Math.round((initialData.depositAmount / initialData.total) * 100));
        }
    }, [initialData]);

    // Load saved clients
    useEffect(() => {
        fetch("/api/admin/clients")
            .then(r => r.json())
            .then(data => setSavedClients(data.clients || []))
            .catch(() => {});
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
                setShowClientList(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const filteredClients = useMemo(() => {
        if (!clientSearch.trim()) return savedClients;
        const q = clientSearch.toLowerCase();
        return savedClients.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q)
        );
    }, [savedClients, clientSearch]);

    function selectClient(client: SavedClient) {
        setClientId(client.id);
        setClientName(client.name);
        setClientEmail(client.email);
        setClientAddress(client.address);
        setClientSearch(client.name);
        setShowClientList(false);
        setClientSaved(true);
    }

    function clearSelectedClient() {
        setClientId("");
        setClientSearch("");
        setClientSaved(false);
    }

    async function handleSaveClient() {
        if (!clientName || !clientEmail) return;
        setSavingClient(true);
        try {
            if (clientId) {
                // Update existing client
                const res = await fetch(`/api/admin/clients/${clientId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: clientName, email: clientEmail, address: clientAddress }),
                });
                const data = await res.json();
                if (data.success) {
                    setSavedClients(prev => prev.map(c => c.id === clientId ? data.client : c));
                    setClientSaved(true);
                }
            } else {
                // Create new client
                const res = await fetch("/api/admin/clients", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: clientName, email: clientEmail, address: clientAddress }),
                });
                const data = await res.json();
                if (data.success) {
                    setClientId(data.client.id);
                    setSavedClients(prev => [...prev, data.client]);
                    setClientSaved(true);
                }
            }
        } finally {
            setSavingClient(false);
        }
    }

    const vatRate = 0.20;

    const totals = useMemo(() => {
        let subtotal = 0;
        let vatAmount = 0;

        items.forEach(item => {
            let lineTotal = item.quantity * item.unitPrice;
            if (item.discountType === "FIXED") lineTotal -= item.discount;
            else if (item.discountType === "PERCENTAGE") lineTotal -= lineTotal * (item.discount / 100);
            subtotal += lineTotal;
            if (item.taxable) vatAmount += lineTotal * vatRate;
        });

        let adjTotal = 0;
        adjustments.forEach(adj => { adjTotal += adj.amount; });

        const total = subtotal + vatAmount + adjTotal;
        const depositAmount = total * (depositPercent / 100);
        const amountPaid = initialData?.amountPaid || 0;
        const balanceDue = total - amountPaid;

        return { subtotal, vatAmount, total, depositAmount, balanceDue };
    }, [items, adjustments, depositPercent, initialData]);

    const addItem = () => {
        setItems([...items, { id: crypto.randomUUID(), name: "", description: "", quantity: 1, unitPrice: 0, discount: 0, discountType: "FIXED", taxable: true }]);
    };

    const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
        setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const reorderItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;
        const newItems = [...items];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
        setItems(newItems);
    };

    const addAdjustment = () => {
        setAdjustments([...adjustments, { id: crypto.randomUUID(), name: "", description: "", amount: 0, type: "EXTRA" }]);
    };

    const handleSave = async () => {
        setLoading(true);
        const payload = {
            invoiceNumber, status, dueDate, eventDate, notes,
            clientId, clientName, clientEmail, clientAddress,
            items, adjustments,
            ...totals
        };

        const url = initialData?.id ? `/api/admin/invoices/${initialData.id}` : "/api/admin/invoices";
        const method = initialData?.id ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method, headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                router.push("/admin/invoices");
            } else {
                alert("Error saving invoice: " + data.error);
                setLoading(false);
            }
        } catch (e) {
            alert("Error saving invoice");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">{initialData ? "Edit Invoice" : "Create Custom Invoice"}</h1>
                    <p className="text-sm text-slate-500 mt-1">Build professional quotes and ad-hoc invoices.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => router.back()} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="px-8 py-2.5 bg-[#1F5C4B] hover:bg-[#123A2F] text-white rounded-lg text-sm font-bold uppercase tracking-widest shadow-brand-sm transition-colors">
                        {loading ? "Saving..." : "Save Invoice"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col - Editor */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client & Core Details */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F] flex items-center gap-2 border-b border-slate-100 pb-4">
                            <span className="material-symbols-outlined text-[18px]">person</span> Client Details
                        </h2>

                        {/* Client search / picker */}
                        <div ref={clientSearchRef} className="relative">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                                Saved clients
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                                    <input
                                        type="text"
                                        value={clientSearch}
                                        onChange={e => { setClientSearch(e.target.value); setShowClientList(true); if (!e.target.value) clearSelectedClient(); }}
                                        onFocus={() => setShowClientList(true)}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]"
                                        placeholder={savedClients.length > 0 ? `Search ${savedClients.length} saved client${savedClients.length !== 1 ? 's' : ''}…` : "No saved clients yet"}
                                    />
                                    {clientId && (
                                        <button
                                            onClick={clearSelectedClient}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Selected client badge */}
                            {clientId && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-[#1F5C4B] font-medium">
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                    Linked to saved client
                                </div>
                            )}

                            {/* Dropdown */}
                            {showClientList && filteredClients.length > 0 && (
                                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                                    {filteredClients.map(client => (
                                        <button
                                            key={client.id}
                                            onClick={() => selectClient(client)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                        >
                                            <div className="font-semibold text-sm text-slate-800">{client.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {client.email}{client.company ? ` · ${client.company}` : ""}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showClientList && clientSearch && filteredClients.length === 0 && (
                                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-400">
                                    No clients match &quot;{clientSearch}&quot;
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Client Name</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={e => { setClientName(e.target.value); setClientSaved(false); }}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={clientEmail}
                                    onChange={e => { setClientEmail(e.target.value); setClientSaved(false); }}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]"
                                    placeholder="hello@example.com"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Billing Address</label>
                                <textarea
                                    value={clientAddress}
                                    onChange={e => { setClientAddress(e.target.value); setClientSaved(false); }}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]"
                                    rows={2}
                                    placeholder="123 Street, City..."
                                />
                            </div>
                        </div>

                        {/* Save client button */}
                        {clientName && clientEmail && (
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <p className="text-xs text-slate-400">
                                    {clientId
                                        ? clientSaved ? "Client details saved." : "Details changed — save to update."
                                        : "Save this client for future invoices."}
                                </p>
                                <button
                                    onClick={handleSaveClient}
                                    disabled={savingClient || clientSaved}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                                        clientSaved
                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                                            : "bg-[#1F5C4B]/10 text-[#1F5C4B] border border-[#1F5C4B]/20 hover:bg-[#1F5C4B]/20"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[14px]">
                                        {clientSaved ? "check" : clientId ? "sync" : "person_add"}
                                    </span>
                                    {savingClient ? "Saving…" : clientSaved ? "Saved" : clientId ? "Update client" : "Save client"}
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Event Date</label>
                                <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Due Date</label>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Custom Inv Number</label>
                                <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]" placeholder="Auto-generated if blank" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1F5C4B]">
                                    <option value="DRAFT">Draft</option>
                                    <option value="SENT">Sent</option>
                                    <option value="VIEWED">Viewed</option>
                                    <option value="PARTIALLY_PAID">Partially Paid</option>
                                    <option value="PAID">Paid</option>
                                    <option value="OVERDUE">Overdue</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Editor */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F] flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span> Line Items
                            </h2>
                            <button onClick={addItem} className="text-xs text-[#1F5C4B] font-bold uppercase hover:bg-slate-50 px-3 py-1.5 rounded flex items-center gap-1 transition-colors border border-[#1F5C4B]/20"><span className="material-symbols-outlined text-[16px]">add</span> Add Item</button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="relative bg-slate-50 border border-slate-200 rounded-xl p-4 group">
                                    <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => reorderItem(index, 'up')} className="p-1 bg-white border border-slate-200 rounded-full hover:bg-slate-100"><span className="material-symbols-outlined text-[14px]">arrow_upward</span></button>
                                        <button onClick={() => reorderItem(index, 'down')} className="p-1 bg-white border border-slate-200 rounded-full hover:bg-slate-100"><span className="material-symbols-outlined text-[14px]">arrow_downward</span></button>
                                    </div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="font-bold text-xs uppercase tracking-widest text-[#1F5C4B]">Item {index + 1}</div>
                                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                                    </div>
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-12 md:col-span-6">
                                            <input type="text" value={item.name} onChange={e => updateItem(item.id, { name: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-[#1F5C4B]" placeholder="Service Name (e.g. Full Event Production)" />
                                            <input type="text" value={item.description} onChange={e => updateItem(item.id, { description: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs mt-2 text-slate-500 focus:border-[#1F5C4B]" placeholder="Extended description (optional)" />
                                        </div>
                                        <div className="col-span-4 md:col-span-2">
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Qty</label>
                                            <input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                        <div className="col-span-8 md:col-span-4">
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Unit Price (£)</label>
                                            <input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-200/60">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                                            <input type="checkbox" checked={item.taxable} onChange={e => updateItem(item.id, { taxable: e.target.checked })} className="accent-[#1F5C4B]" />
                                            Apply 20% VAT
                                        </label>
                                        <div className="flex-1 flex gap-2 items-center justify-end">
                                            <span className="text-[10px] font-bold uppercase text-slate-400">Discount:</span>
                                            <input type="number" value={item.discount} onChange={e => updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })} className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-xs" />
                                            <select value={item.discountType} onChange={e => updateItem(item.id, { discountType: e.target.value as any })} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs">
                                                <option value="FIXED">£</option>
                                                <option value="PERCENTAGE">%</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="text-center py-8 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-400 text-sm">
                                    No items added. Click 'Add Item' to begin building.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F] flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">exposure</span> Extras & Adjustments
                            </h2>
                            <button onClick={addAdjustment} className="text-xs text-slate-500 font-bold uppercase hover:bg-slate-50 px-3 py-1.5 rounded flex items-center gap-1 transition-colors border border-slate-200"><span className="material-symbols-outlined text-[16px]">add</span> Add Row</button>
                        </div>
                        <div className="space-y-2">
                            {adjustments.map((adj, index) => (
                                <div key={adj.id} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <select value={adj.type} onChange={e => {
                                        const newAdjustments = [...adjustments];
                                        newAdjustments[index].type = e.target.value as any;
                                        setAdjustments(newAdjustments);
                                    }} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase text-slate-600">
                                        <option value="EXTRA">Add-on Fee</option>
                                        <option value="LATE_FEE">Late Fee</option>
                                        <option value="DISCOUNT">Overall Credit</option>
                                    </select>
                                    <input type="text" value={adj.name} onChange={e => {
                                        const newAdjustments = [...adjustments];
                                        newAdjustments[index].name = e.target.value;
                                        setAdjustments(newAdjustments);
                                    }} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" placeholder="Reason (e.g. Travel Cost)" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 font-medium">£</span>
                                        <input type="number" value={adj.amount} onChange={e => {
                                            const newAdjustments = [...adjustments];
                                            newAdjustments[index].amount = parseFloat(e.target.value) || 0;
                                            setAdjustments(newAdjustments);
                                        }} className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-right" />
                                    </div>
                                    <button onClick={() => setAdjustments(adjustments.filter(a => a.id !== adj.id))} className="text-red-400 p-2"><span className="material-symbols-outlined">close</span></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#123A2F] flex items-center gap-2 border-b border-slate-100 pb-4">
                            <span className="material-symbols-outlined text-[18px]">note</span> Invoice Notes
                        </h2>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1F5C4B]" placeholder="Terms, payment transfer details, or thank you messages..."></textarea>
                    </div>

                    {/* Recurring contract shortcut */}
                    {initialData?.id && !initialData?.contractId && (
                        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5">autorenew</span>
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Set up as recurring contract?</p>
                                    <p className="text-xs text-amber-700 mt-0.5">If this is a monthly hire, convert it to a yearly contract with automatic invoice generation.</p>
                                    <a
                                        href={`/admin/contracts/new?fromInvoice=${initialData.id}`}
                                        className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Create Recurring Contract
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Already linked to a contract */}
                    {initialData?.contractId && (
                        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-xl">autorenew</span>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900">Part of a recurring contract</p>
                                        <p className="text-xs text-emerald-700 mt-0.5">This invoice was auto-generated.</p>
                                    </div>
                                </div>
                                <a
                                    href={`/admin/contracts/${initialData.contractId}`}
                                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
                                >
                                    View Contract <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Col - Totals Panel */}
                <div className="space-y-6">
                    <div className="bg-[#123A2F] text-white p-6 md:p-8 rounded-3xl shadow-brand-lg sticky top-8">
                        <h3 className="font-bold uppercase tracking-widest text-[#1F5C4B] text-xs bg-white/10 inline-block px-3 py-1 rounded-full mb-6">Financial Summary</h3>

                        <div className="space-y-4 text-sm font-medium border-b border-white/10 pb-6 mb-6">
                            <div className="flex justify-between items-center text-white/80">
                                <span>Subtotal</span>
                                <span>£{totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-white/80">
                                <span>VAT (20%)</span>
                                <span>£{totals.vatAmount.toFixed(2)}</span>
                            </div>
                            {adjustments.map((adj, i) => (
                                <div key={i} className="flex justify-between items-center text-emerald-300/80">
                                    <span>{adj.name || adj.type}</span>
                                    <span>{adj.type === 'DISCOUNT' ? '-' : '+'}£{Math.abs(adj.amount).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-end mb-8">
                            <span className="text-lg font-bold">Total</span>
                            <span className="font-black text-4xl tracking-tighter">£{totals.total.toFixed(2)}</span>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 space-y-4 border border-white/10">
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
                                    <span>Deposit Configuration</span>
                                    <span>{depositPercent}%</span>
                                </div>
                                <input type="range" min="0" max="100" step="10" value={depositPercent} onChange={e => setDepositPercent(Number(e.target.value))} className="w-full accent-emerald-500" />
                            </div>
                            <div className="flex justify-between text-sm font-medium text-white/80 pt-2 border-t border-white/10 border-dashed">
                                <span>Deposit Required:</span>
                                <span>£{totals.depositAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-white pt-2 border-t border-white/10">
                                <span>Balance Remaining:</span>
                                <span>£{totals.balanceDue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
