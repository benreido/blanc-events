"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/lib/cart-context";
import { formatCurrency, calculateDays } from "@/lib/config";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Equipment {
    id: string; name: string; slug: string; category: string; brand: string;
    dayRate: number | null; contactForPrice: boolean; images: string[];
    tags: string[]; description: string; quantityTotal: number;
}

export default function BlancEventsHirePage() {
    const cart = useCart();
    const [items, setItems] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("popular");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showBasket, setShowBasket] = useState(false);
    const [quoteForm, setQuoteForm] = useState(false);
    const [quoteSubmitting, setQuoteSubmitting] = useState(false);
    const [quoteSuccess, setQuoteSuccess] = useState(false);
    const [customerDetails, setCustomerDetails] = useState({ customerName: "", customerEmail: "", customerPhone: "", company: "", venue: "", notes: "" });

    const categoryIcons: Record<string, string> = {
        Lighting: "lightbulb", Audio: "speaker", Backline: "piano", Effects: "air", "Video & LED": "video_camera_front",
    };

    const fetchItems = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedBrands.length) params.set("brand", selectedBrands[0]);
        if (search) params.set("search", search);
        params.set("sort", sort);
        params.set("page", String(page));
        params.set("limit", "12");
        try {
            const res = await fetch(`/api/equipment?${params}`);
            const data = await res.json();
            setItems(data.items || []);
            setTotalPages(data.totalPages || 1);
            if (data.categories) setCategories(data.categories);
            if (data.brands) setBrands(data.brands);
        } catch { setItems([]); }
        setLoading(false);
    }, [selectedCategory, selectedBrands, search, sort, page]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const numberOfDays = cart.startDate && cart.endDate
        ? calculateDays(new Date(cart.startDate), new Date(cart.endDate)) : 1;
    const subtotal = cart.items.reduce((sum, i) => sum + i.dayRate * i.quantity * numberOfDays, 0);

    const handleQuoteSubmit = async () => {
        if (!cart.startDate || !cart.endDate) return alert("Please select dates first");
        setQuoteSubmitting(true);
        try {
            const res = await fetch("/api/quotes", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...customerDetails,
                    startDate: cart.startDate,
                    endDate: cart.endDate,
                    items: cart.items.map((i) => ({
                        equipmentItemId: i.type === "equipment" ? i.id : undefined,
                        packageId: i.type === "package" ? i.id : undefined,
                        quantity: i.quantity,
                    })),
                    serviceAddonIds: cart.serviceAddonIds,
                }),
            });
            if (res.ok) { setQuoteSuccess(true); cart.clearCart(); }
        } catch { /* error */ }
        setQuoteSubmitting(false);
    };

    return (
        <>
            <Navbar />
            <main className="max-w-[1440px] mx-auto flex gap-8 px-4 sm:px-6 lg:px-8 py-8 pt-24">
                <h1 className="sr-only">Equipment hire — lighting, DJ and audio in Manchester</h1>
                {/* Sidebar Filters */}
                <aside className="w-64 shrink-0 hidden md:block">
                    <div className="sticky top-24 flex flex-col gap-8">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Categories</h3>
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => { setSelectedCategory(""); setPage(1); }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${!selectedCategory ? "active-category text-[#123A2F]" : "text-slate-600 hover:bg-slate-50"}`}
                                >
                                    <span className="material-symbols-outlined text-xl">apps</span> All Equipment
                                </button>
                                {categories.map((cat) => (
                                    <button key={cat} onClick={() => { setSelectedCategory(cat); setPage(1); }}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${selectedCategory === cat ? "active-category text-[#123A2F]" : "text-slate-600 hover:bg-slate-50"}`}
                                    >
                                        <span className="material-symbols-outlined text-xl">{categoryIcons[cat] || "devices"}</span> {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Popular Brands</h3>
                            <div className="flex flex-col gap-3">
                                {brands.map((brand) => (
                                    <label key={brand} className="relative flex items-center group cursor-pointer">
                                        <input type="checkbox" className="peer sr-only" checked={selectedBrands.includes(brand)}
                                            onChange={() => {
                                                setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [brand]);
                                                setPage(1);
                                            }}
                                        />
                                        <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-[#1F5C4B] transition-all peer-checked:bg-[#1F5C4B]/10 peer-checked:border-[#1F5C4B]">
                                            <span className="text-sm font-medium text-slate-700">{brand}</span>
                                            <span className="material-symbols-outlined text-[#1F5C4B] opacity-0 peer-checked:opacity-100 text-lg">check</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-[#123A2F]">event</span> Select Dates
                            </h4>
                            <div className="space-y-2">
                                <input type="date" className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm" value={cart.startDate || ""}
                                    onChange={(e) => cart.setDates(e.target.value, cart.endDate || e.target.value)} />
                                <input type="date" className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm" value={cart.endDate || ""}
                                    onChange={(e) => cart.setDates(cart.startDate || e.target.value, e.target.value)} />
                            </div>
                            {cart.startDate && cart.endDate && (
                                <p className="text-xs text-[#1F5C4B] font-bold mt-2">{numberOfDays} day{numberOfDays !== 1 ? "s" : ""} selected</p>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <section className="flex-1">
                    {/* Search + Sort */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all"
                                    placeholder="Search equipment..." />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                            {[
                                { value: "popular", label: "Popular" },
                                { value: "price_asc", label: "Price: Low" },
                                { value: "price_desc", label: "Price: High" },
                                { value: "newest", label: "Newest" },
                            ].map((s) => (
                                <button key={s.value} onClick={() => { setSort(s.value); setPage(1); }}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${sort === s.value ? "bg-white shadow-sm" : "hover:bg-white"}`}
                                >{s.label}</button>
                            ))}
                        </div>
                    </div>

                    {/* Loading / Empty / Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="rounded-xl overflow-hidden border border-slate-200">
                                    <div className="aspect-[4/3] skeleton" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-3 w-16 skeleton rounded" />
                                        <div className="h-5 w-40 skeleton rounded" />
                                        <div className="h-3 w-full skeleton rounded" />
                                        <div className="h-8 w-full skeleton rounded mt-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">search_off</span>
                            <h3 className="text-xl font-bold text-slate-400">No equipment found</h3>
                            <p className="text-slate-400 mt-2">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map((item) => (
                                    <div key={item.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#1F5C4B]/50 transition-all hover:shadow-xl shadow-sm">
                                        <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                                            {item.images[0] ? (
                                                <Image alt={item.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" src={item.images[0]} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-slate-300">speaker</span></div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-medium text-[#123A2F]">{item.brand}</span>
                                                <span className="text-xs text-slate-400">{item.category}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#1F5C4B] transition-colors">{item.name}</h3>
                                            {item.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {item.tags.slice(0, 3).map((tag) => (
                                                        <span key={tag} className="px-2 py-1 bg-slate-50 rounded text-[10px] text-slate-500 uppercase font-bold tracking-tight border border-slate-100">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                                <div>
                                                    {item.contactForPrice ? (
                                                        <span className="text-lg font-bold text-slate-900">Contact<span className="text-xs text-slate-500 font-medium">/quote</span></span>
                                                    ) : (
                                                        <><span className="text-xl font-bold text-slate-900">{formatCurrency(item.dayRate || 0)}</span><span className="text-xs text-slate-500 font-medium">/day</span></>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => cart.addItem({ id: item.id, type: "equipment", name: item.name, dayRate: item.dayRate || 0, quantity: 1, image: item.images[0], contactForPrice: item.contactForPrice })}
                                                    className="flex items-center justify-center gap-2 hover:bg-[#1F5C4B]/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#1F5C4B]/20 bg-[#1F5C4B]"
                                                >
                                                    <span className="material-symbols-outlined text-lg">add_shopping_cart</span> Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 hover:border-[#1F5C4B] transition-all disabled:opacity-30">
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                                        <button key={p} onClick={() => setPage(p)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${p === page ? "bg-[#1F5C4B] text-white" : "border border-slate-200 hover:border-[#1F5C4B]"}`}
                                        >{p}</button>
                                    ))}
                                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 hover:border-[#1F5C4B] transition-all disabled:opacity-30">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>

            {/* Floating Basket Summary */}
            {cart.itemCount > 0 && (
                <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
                    {showBasket && (
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-96 max-h-[70vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg">Your Basket</h3>
                                <button onClick={() => setShowBasket(false)} className="text-slate-400 hover:text-slate-600">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            {/* Date selection */}
                            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Hire Dates</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="date" className="border border-slate-200 rounded py-1.5 px-2 text-sm" value={cart.startDate || ""}
                                        onChange={(e) => cart.setDates(e.target.value, cart.endDate || e.target.value)} />
                                    <input type="date" className="border border-slate-200 rounded py-1.5 px-2 text-sm" value={cart.endDate || ""}
                                        onChange={(e) => cart.setDates(cart.startDate || e.target.value, e.target.value)} />
                                </div>
                                {cart.startDate && cart.endDate && (
                                    <p className="text-xs text-[#1F5C4B] font-bold mt-1">{numberOfDays} day{numberOfDays !== 1 ? "s" : ""}</p>
                                )}
                            </div>
                            {/* Items */}
                            <div className="space-y-3 mb-4">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-slate-50">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{item.name}</p>
                                            <p className="text-xs text-slate-400">
                                                {item.contactForPrice ? "Quote required" : `${formatCurrency(item.dayRate)}/day × ${item.quantity}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                                                className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-sm hover:bg-slate-100">−</button>
                                            <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                                            <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                                                className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-sm hover:bg-slate-100">+</button>
                                        </div>
                                        <button onClick={() => cart.removeItem(item.id)} className="text-slate-400 hover:text-red-500">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {/* Totals */}
                            <div className="border-t border-slate-100 pt-3 mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Subtotal ({numberOfDays} day{numberOfDays !== 1 ? "s" : ""})</span>
                                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                                </div>
                                <p className="text-xs text-slate-400">+ VAT & services calculated at checkout</p>
                            </div>
                            {/* Actions */}
                            {!quoteForm ? (
                                <div className="space-y-2">
                                    <button onClick={() => setQuoteForm(true)}
                                        className="w-full py-3 bg-[#1F5C4B] text-white font-bold rounded-lg uppercase tracking-widest text-xs hover:bg-[#123A2F] transition-colors">
                                        {cart.hasContactForPriceItems ? "Request Quote" : "Get Quote / Book"}
                                    </button>
                                    <button onClick={() => cart.clearCart()}
                                        className="w-full py-2 text-slate-400 text-xs font-bold uppercase hover:text-red-500 transition-colors">
                                        Clear Basket
                                    </button>
                                </div>
                            ) : quoteSuccess ? (
                                <div className="text-center py-4">
                                    <span className="material-symbols-outlined text-[#1F5C4B] text-4xl mb-2 block">check_circle</span>
                                    <p className="font-bold text-sm">Quote Request Sent!</p>
                                    <p className="text-xs text-slate-400">We&apos;ll be in touch within 24 hours.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h4 className="font-bold text-sm">Your Details</h4>
                                    <input placeholder="Full name *" className="w-full border border-slate-200 rounded py-2 px-3 text-sm" value={customerDetails.customerName}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, customerName: e.target.value })} />
                                    <input placeholder="Email *" type="email" className="w-full border border-slate-200 rounded py-2 px-3 text-sm" value={customerDetails.customerEmail}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, customerEmail: e.target.value })} />
                                    <input placeholder="Phone" className="w-full border border-slate-200 rounded py-2 px-3 text-sm" value={customerDetails.customerPhone}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, customerPhone: e.target.value })} />
                                    <input placeholder="Venue / Location" className="w-full border border-slate-200 rounded py-2 px-3 text-sm" value={customerDetails.venue}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, venue: e.target.value })} />
                                    <textarea placeholder="Any notes..." rows={2} className="w-full border border-slate-200 rounded py-2 px-3 text-sm resize-none" value={customerDetails.notes}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, notes: e.target.value })} />
                                    <button onClick={handleQuoteSubmit} disabled={quoteSubmitting || !customerDetails.customerName || !customerDetails.customerEmail}
                                        className="w-full py-3 bg-[#1F5C4B] text-white font-bold rounded-lg uppercase tracking-widest text-xs hover:bg-[#123A2F] transition-colors disabled:opacity-50">
                                        {quoteSubmitting ? "Submitting..." : "Submit Quote Request"}
                                    </button>
                                    <button onClick={() => setQuoteForm(false)} className="w-full py-2 text-xs text-slate-400 hover:text-slate-600">Back</button>
                                </div>
                            )}
                        </div>
                    )}

                    <button onClick={() => setShowBasket(!showBasket)}
                        className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl shadow-2xl border border-slate-100">
                        <div className="relative p-3 text-white rounded-xl bg-[#1F5C4B]">
                            <span className="material-symbols-outlined text-2xl">pending_actions</span>
                            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[12px] font-bold text-white border-2 border-white">
                                {cart.itemCount}
                            </span>
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Rental Enquiry</p>
                            <p className="text-sm font-bold text-slate-900">Review Basket Summary</p>
                            <p className="text-xs text-slate-400">Estimated: {formatCurrency(subtotal)} ex. VAT</p>
                        </div>
                    </button>
                </div>
            )}
        </>
    );
}
