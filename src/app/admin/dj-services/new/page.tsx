"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewDJServicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [basePrice, setBasePrice] = useState(0);
    const [isActive, setIsActive] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name,
            description,
            basePrice,
            isActive,
        };

        try {
            const res = await fetch("/api/admin/dj-services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/admin/dj-services");
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

    return (
        <div className="max-w-4xl px-4 py-8 mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Add New DJ Service</h1>
                    <p className="text-sm text-slate-500">Create a new DJ profile or service package.</p>
                </div>
                <Link href="/admin/dj-services" className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all border border-slate-200 bg-white shadow-sm">Back to List</Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Basic Info */}
                    <div className="p-8 space-y-6 bg-white border shadow-sm rounded-3xl border-slate-200 md:col-span-2">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">DJ / Service Name</label>
                                <input
                                    value={name} onChange={e => setName(e.target.value)} required
                                    className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] transition-all"
                                    placeholder="e.g. Wedding DJ Standard"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Base Price (£)</label>
                                <div className="relative">
                                    <span className="absolute text-sm -translate-y-1/2 left-4 top-1/2 text-slate-400">£</span>
                                    <input
                                        type="number" value={basePrice || ""} onChange={e => setBasePrice(Number(e.target.value))} required min="0" step="0.01"
                                        className="w-full border border-slate-200 rounded-xl py-3 pl-8 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
                            <textarea
                                value={description} onChange={e => setDescription(e.target.value)} required rows={4}
                                className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] transition-all resize-none"
                                placeholder="Describe the DJ service, play style, what's included..."
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-6 bg-[#123A2F] p-8 rounded-3xl md:col-span-2">
                        <div className="flex flex-col justify-between gap-8 md:flex-row">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button" onClick={() => setIsActive(!isActive)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isActive ? "bg-[#1F5C4B] border border-white/20" : "bg-slate-700 border border-white/10"}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${isActive ? "translate-x-6" : "translate-x-0"}`} />
                                </button>
                                <div>
                                    <p className="text-sm font-bold text-white">Active Status</p>
                                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Available to be booked</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 mt-4 border-t border-white/10">
                            <button
                                type="submit" disabled={loading}
                                className="bg-white text-[#123A2F] px-12 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Create DJ Service"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
