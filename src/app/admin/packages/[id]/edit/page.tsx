"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { formatCurrency } from "@/lib/config";
import Link from "next/link";

interface EquipmentItem {
    id: string;
    name: string;
    category: string;
    dayRate: number;
    images: string[];
    brand: string;
    isActive: boolean;
    quantityTotal: number;
}

interface SelectedItem {
    id: string;
    name: string;
    dayRate: number;
    quantity: number;
}

export default function EditPackagePage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
    const [search, setSearch] = useState("");

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [discountType, setDiscountType] = useState<"NONE" | "PERCENT" | "FIXED">("NONE");
    const [discountValue, setDiscountValue] = useState(0);
    const [contactForPrice, setContactForPrice] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [featured, setFeatured] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [includes, setIncludes] = useState<string[]>([]);
    const [optionalAddons, setOptionalAddons] = useState<string[]>([]);

    useEffect(() => {
        // Fetch equipment for selector
        fetch("/api/admin/equipment")
            .then(r => r.json())
            .then(data => setEquipment(data.items || []))
            .catch(console.error);

        // Fetch current package data
        fetch(`/api/admin/packages/${params.id}`)
            .then(r => r.json())
            .then(pkg => {
                setName(pkg.name || "");
                setDescription(pkg.description || "");
                setDiscountType(pkg.discountType || "NONE");
                setDiscountValue(pkg.discountValue || 0);
                setContactForPrice(!!pkg.contactForPrice);
                setIsActive(!!pkg.isActive);
                setFeatured(!!pkg.featured);
                setImages(pkg.images || []);
                setIncludes(pkg.includes || []);
                setOptionalAddons(pkg.optionalAddons || []);

                // Map joined items
                if (pkg.items) {
                    const mappedItems = pkg.items.map((item: any) => ({
                        id: item.equipmentItemId,
                        name: item.equipmentItem?.name || "Unknown Item",
                        dayRate: item.equipmentItem?.dayRate || 0,
                        quantity: item.quantity
                    }));
                    setSelectedItems(mappedItems);
                }
                setFetching(false);
            })
            .catch(console.error);
    }, [params.id]);

    const filteredEquipment = useMemo(() => {
        return equipment.filter(item =>
            item.isActive &&
            item.quantityTotal > 0 &&
            (item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.category.toLowerCase().includes(search.toLowerCase()) ||
                item.brand.toLowerCase().includes(search.toLowerCase()))
        );
    }, [equipment, search]);

    const basePrice = useMemo(() => {
        return selectedItems.reduce((total, item) => total + (item.dayRate * item.quantity), 0);
    }, [selectedItems]);

    const finalPrice = useMemo(() => {
        if (discountType === "NONE") return basePrice;
        if (discountType === "PERCENT") return basePrice * (1 - discountValue / 100);
        if (discountType === "FIXED") return Math.max(0, basePrice - discountValue);
        return basePrice;
    }, [basePrice, discountType, discountValue]);

    const savings = basePrice - finalPrice;

    const addItem = (item: EquipmentItem) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { id: item.id, name: item.name, dayRate: item.dayRate, quantity: 1 }];
        });
    };

    const removeItem = (id: string) => {
        setSelectedItems(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: string, qty: number) => {
        if (qty <= 0) return removeItem(id);
        setSelectedItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItems.length === 0) return alert("Please add at least one item to the package.");
        setLoading(true);

        const payload = {
            name,
            description,
            dayRate: contactForPrice ? null : (isNaN(Number(finalPrice)) ? 0 : Number(finalPrice)),
            contactForPrice,
            images,
            includes,
            optionalAddons,
            discountType,
            discountValue: isNaN(Number(discountValue)) ? 0 : Number(discountValue),
            items: selectedItems.map(item => ({ equipmentItemId: item.id, quantity: item.quantity })),
            isActive,
            featured,
        };

        try {
            const res = await fetch(`/api/admin/packages/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/admin/packages");
            } else {
                const data = await res.json();
                alert(data.error || "Save failed");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        }
        setLoading(false);
    };

    if (fetching) return <div className="p-20 text-center text-slate-400">Loading package data...</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Edit Package</h1>
                    <p className="text-slate-500 text-sm italic">Modifying {name}</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/packages" className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all border border-slate-200 bg-white">Cancel</Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#1F5C4B] text-white px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#123A2F] transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Same layout as new page */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">edit_note</span> Basic Information
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Package Name</label>
                                <input
                                    value={name} onChange={e => setName(e.target.value)} required
                                    className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] transition-all"
                                    placeholder="e.g. Ultimate Wedding DJ Bundle"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
                                <textarea
                                    value={description} onChange={e => setDescription(e.target.value)} rows={3}
                                    className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] transition-all resize-none"
                                    placeholder="Describe the value of this package..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock Selection */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">add_shopping_cart</span> Stock Selection
                            </h2>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                <input
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-1.5 border border-slate-100 rounded-full text-xs focus:ring-1 focus:ring-[#1F5C4B]"
                                    placeholder="Filter equipment..."
                                />
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 mb-6">
                            {filteredEquipment.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                                            {item.images[0] ? <img src={item.images[0]} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400 text-sm">speaker</span>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{item.brand} • {item.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-slate-500">{formatCurrency(item.dayRate)}</span>
                                        <button
                                            type="button" onClick={() => addItem(item)}
                                            className="w-8 h-8 rounded-full bg-[#1F5C4B]/10 text-[#1F5C4B] flex items-center justify-center hover:bg-[#1F5C4B] hover:text-white transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">add</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Selected Items Breakdown */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Included in Package</h3>
                            {selectedItems.length === 0 ? (
                                <p className="text-slate-300 text-sm italic py-4 border-2 border-dashed border-slate-50 rounded-xl text-center">No items selected yet</p>
                            ) : (
                                selectedItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">{item.name}</p>
                                            <p className="text-xs text-slate-500">{formatCurrency(item.dayRate)} per unit</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
                                                <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900">–</button>
                                                <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900">+</button>
                                            </div>
                                            <div className="text-right w-24">
                                                <p className="text-sm font-black">{formatCurrency(item.dayRate * item.quantity)}</p>
                                            </div>
                                            <button type="button" onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing & Controls */}
                <div className="space-y-8">
                    {/* Pricing Summary */}
                    <div className="bg-[#123A2F] text-white p-8 rounded-2xl shadow-xl shadow-[#1F5C4B]/20">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">payments</span> Pricing Engine
                        </h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                                <span className="text-white/60">Base Subtotal</span>
                                <span className="font-bold">{formatCurrency(basePrice)}</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Applied Discount</label>
                                    <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-lg">
                                        {["NONE", "PERCENT", "FIXED"].map((type) => (
                                            <button
                                                key={type} type="button" onClick={() => setDiscountType(type as any)}
                                                className={`py-1.5 text-[10px] font-black rounded uppercase tracking-tighter transition-all ${discountType === type ? "bg-white text-[#123A2F]" : "text-white/40 hover:bg-white/5"}`}
                                            >{type}</button>
                                        ))}
                                    </div>
                                </div>

                                {discountType !== "NONE" && (
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">{discountType === "PERCENT" ? "%" : "£"}</span>
                                            <input
                                                type="number" value={discountValue || 0} onChange={e => setDiscountValue(Number(e.target.value))}
                                                className="w-full bg-white/10 border-transparent rounded-lg py-2 pl-8 pr-4 text-sm focus:ring-1 focus:ring-white/20 transition-all font-bold"
                                            />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-tighter">Savings</p>
                                            <p className="text-sm font-bold text-rose-400">-{formatCurrency(savings)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 py-4 mt-4">
                                <input
                                    type="checkbox" id="contact" checked={contactForPrice} onChange={e => setContactForPrice(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#1F5C4B] focus:ring-0"
                                />
                                <label htmlFor="contact" className="text-xs font-bold text-white/80 cursor-pointer">Hide price / Request Quote only</label>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Final Package Rate</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-black ${contactForPrice ? "text-white/20 line-through" : "text-white"}`}>
                                    {formatCurrency(finalPrice)}
                                </span>
                                <span className="text-white/40 text-xs font-bold">/ day</span>
                            </div>
                        </div>
                    </div>

                    {/* Status & Options */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold">Published Status</p>
                                <p className="text-[10px] text-slate-400 uppercase font-black">Visible on public site</p>
                            </div>
                            <button
                                type="button" onClick={() => setIsActive(!isActive)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isActive ? "bg-[#1F5C4B]" : "bg-slate-200"}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${isActive ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold">Feature Package</p>
                                <p className="text-[10px] text-slate-400 uppercase font-black">Prioritize on homepage</p>
                            </div>
                            <button
                                type="button" onClick={() => setFeatured(!featured)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${featured ? "bg-amber-400" : "bg-slate-200"}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${featured ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
