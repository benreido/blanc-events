"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/config";

interface EquipmentItem {
    id: string; name: string; slug: string; category: string; brand: string;
    dayRate: number | null; contactForPrice: boolean; quantityTotal: number;
    isActive: boolean; featured: boolean; images: string[];
    ownedQuantity: number; subhireAvailable: boolean; subhireMax: number;
    preferredSupplier: string; subhireCostPerDay: number; markupPercent: number;
    leadTimeDays: number; internalNotes: string;
}

export default function AdminEquipmentPage() {
    const [items, setItems] = useState<EquipmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<EquipmentItem | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        name: "", slug: "", description: "", category: "", brand: "",
        dayRate: 0, contactForPrice: false, quantityTotal: 1,
        featured: false, isActive: true, images: [] as string[], tags: [] as string[],
        ownedQuantity: 0, subhireAvailable: false, subhireMax: 0,
        preferredSupplier: "", subhireCostPerDay: 0, markupPercent: 0,
        leadTimeDays: 0, internalNotes: "",
    });

    const fetchItems = () => {
        setLoading(true);
        fetch("/api/admin/equipment").then((r) => r.json()).then((d) => { setItems(d.items || []); setLoading(false); });
    };

    useEffect(fetchItems, []);

    const handleSave = async () => {
        const url = "/api/admin/equipment";
        const method = editing ? "PUT" : "POST";
        const body = editing ? { id: editing.id, ...form } : form;
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        setEditing(null);
        setCreating(false);
        fetchItems();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deactivate this item?")) return;
        await fetch(`/api/admin/equipment?id=${id}`, { method: "DELETE" });
        fetchItems();
    };

    const startEdit = (item: EquipmentItem) => {
        setEditing(item);
        setCreating(true);
        setForm({
            name: item.name, slug: item.slug, description: "", category: item.category,
            brand: item.brand, dayRate: item.dayRate || 0, contactForPrice: item.contactForPrice,
            quantityTotal: item.quantityTotal, featured: item.featured, isActive: item.isActive,
            images: item.images, tags: [],
            ownedQuantity: item.ownedQuantity || 0, subhireAvailable: item.subhireAvailable || false,
            subhireMax: item.subhireMax || 0, preferredSupplier: item.preferredSupplier || "",
            subhireCostPerDay: item.subhireCostPerDay || 0, markupPercent: item.markupPercent || 0,
            leadTimeDays: item.leadTimeDays || 0, internalNotes: item.internalNotes || "",
        });
    };

    const startCreate = () => {
        setEditing(null);
        setCreating(true);
        setForm({
            name: "", slug: "", description: "", category: "", brand: "", dayRate: 0, contactForPrice: false, quantityTotal: 1, featured: false, isActive: true, images: [], tags: [],
            ownedQuantity: 0, subhireAvailable: false, subhireMax: 0, preferredSupplier: "", subhireCostPerDay: 0, markupPercent: 0, leadTimeDays: 0, internalNotes: "",
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black tracking-tighter">Equipment Manager</h1>
                <button onClick={startCreate} className="px-6 py-2.5 bg-[#1F5C4B] text-white font-bold rounded-lg text-sm uppercase tracking-widest hover:bg-[#123A2F]">
                    + Add Equipment
                </button>
            </div>

            {/* Create/Edit Form */}
            {creating && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                    <h2 className="font-bold mb-4">{editing ? "Edit" : "New"} Equipment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                            className="border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                        <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                            className="border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                        <input placeholder="Day Rate (£)" type="number" value={form.dayRate} onChange={(e) => setForm({ ...form, dayRate: parseFloat(e.target.value) || 0 })}
                            className="border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                        <input placeholder="Quantity Total" type="number" value={form.quantityTotal} onChange={(e) => setForm({ ...form, quantityTotal: parseInt(e.target.value) || 1 })}
                            className="border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                        <input placeholder="Image URL" value={form.images[0] || ""} onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                            className="border border-slate-200 rounded-lg py-2 px-3 text-sm" />
                    </div>

                    <h3 className="font-bold text-sm mt-6 mb-3 text-[#1F5C4B]">Internal Inventory & Subhire</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                        <div>
                            <label className="text-xs text-slate-500 font-bold mb-1 block">Owned Qty</label>
                            <input type="number" value={form.ownedQuantity} onChange={(e) => setForm({ ...form, ownedQuantity: parseInt(e.target.value) || 0 })}
                                className="w-full border border-slate-200 rounded-lg py-1.5 px-3 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-bold mb-1 block">Max Subhire Qty</label>
                            <input type="number" value={form.subhireMax} onChange={(e) => setForm({ ...form, subhireMax: parseInt(e.target.value) || 0 })}
                                className="w-full border border-slate-200 rounded-lg py-1.5 px-3 text-sm" disabled={!form.subhireAvailable} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-bold mb-1 block">Subhire Cost/Day (£)</label>
                            <input type="number" value={form.subhireCostPerDay} onChange={(e) => setForm({ ...form, subhireCostPerDay: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-slate-200 rounded-lg py-1.5 px-3 text-sm" disabled={!form.subhireAvailable} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-bold mb-1 block">Markup (%)</label>
                            <input type="number" value={form.markupPercent} onChange={(e) => setForm({ ...form, markupPercent: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-slate-200 rounded-lg py-1.5 px-3 text-sm" disabled={!form.subhireAvailable} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-500 font-bold mb-1 block">Preferred Supplier</label>
                            <input value={form.preferredSupplier} onChange={(e) => setForm({ ...form, preferredSupplier: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg py-1.5 px-3 text-sm" disabled={!form.subhireAvailable} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-bold mb-1 block">Lead Time (Days)</label>
                            <input type="number" value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: parseInt(e.target.value) || 0 })}
                                className="w-full border border-slate-200 rounded-lg py-1.5 px-3 text-sm" disabled={!form.subhireAvailable} />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4 mb-4">
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.contactForPrice} onChange={(e) => setForm({ ...form, contactForPrice: e.target.checked })} /> Contact for Price</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
                        <label className="flex items-center gap-2 text-sm font-bold text-[#1F5C4B]"><input type="checkbox" checked={form.subhireAvailable} onChange={(e) => setForm({ ...form, subhireAvailable: e.target.checked })} /> Subhire Available</label>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button onClick={handleSave} className="px-6 py-2 bg-[#1F5C4B] text-white font-bold rounded-lg text-sm">Save</button>
                        <button onClick={() => { setCreating(false); setEditing(null); }} className="px-6 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton rounded-lg" />)}</div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-slate-500 px-6 py-4">Item</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-slate-500 px-6 py-4">Category</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-slate-500 px-6 py-4">Rate</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-slate-500 px-6 py-4">Stock</th>
                                <th className="text-left text-xs font-bold uppercase tracking-widest text-slate-500 px-6 py-4">Status</th>
                                <th className="text-right text-xs font-bold uppercase tracking-widest text-slate-500 px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.images[0] ? (
                                                <img src={item.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-slate-400 text-sm">image</span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-sm">{item.name}</p>
                                                <p className="text-xs text-slate-400">{item.brand}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                                    <td className="px-6 py-4 text-sm font-bold">{item.contactForPrice ? "Contact" : formatCurrency(item.dayRate || 0)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-2 text-xs">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">Owned: {item.ownedQuantity}</span>
                                            {item.subhireAvailable && <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">Subhire: +{item.subhireMax}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                            {item.isActive ? "Active" : "Inactive"}
                                        </span>
                                        {item.featured && <span className="ml-2 px-2 py-1 rounded text-xs font-bold bg-amber-50 text-amber-600">Featured</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => startEdit(item)} className="text-[#1F5C4B] hover:underline text-sm font-bold mr-3">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 text-sm font-bold">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
