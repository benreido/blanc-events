"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewTestimonialPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [eventType, setEventType] = useState("");
    const [quote, setQuote] = useState("");
    const [rating, setRating] = useState(5);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [featured, setFeatured] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [sortOrder, setSortOrder] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name,
            role,
            company,
            eventType,
            quote,
            rating,
            avatarUrl,
            featured,
            isActive,
            sortOrder,
        };

        try {
            const res = await fetch("/api/admin/testimonials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/admin/testimonials");
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
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Add New Testimonial</h1>
                    <p className="text-slate-500 text-sm">Create a new client review for the public site.</p>
                </div>
                <Link href="/admin/testimonials" className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all border border-slate-200 bg-white shadow-sm">Back to List</Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Client name</label>
                                <input
                                    value={name} onChange={e => setName(e.target.value)} required
                                    className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] transition-all"
                                    placeholder="e.g. Sarah Mitchell"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Role / Context</label>
                                <input
                                    value={role} onChange={e => setRole(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] transition-all"
                                    placeholder="e.g. Wedding Client"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Company / Venue</label>
                                <input
                                    value={company} onChange={e => setCompany(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] transition-all"
                                    placeholder="e.g. Victoria Warehouse"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Event Type</label>
                                <input
                                    value={eventType} onChange={e => setEventType(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] transition-all"
                                    placeholder="e.g. Corporate Party"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">The Quote</label>
                            <textarea
                                value={quote} onChange={e => setQuote(e.target.value)} required rows={4}
                                className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] transition-all resize-none italic"
                                placeholder="&quot;Blanc. Events made our wedding atmosphere absolutely incredible...&quot;"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Star Rating</label>
                                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star} type="button" onClick={() => setRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <span className={`material-symbols-outlined transition-all ${star <= rating ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-200 hover:text-amber-200'}`}>star</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Avatar URL (Optional)</label>
                                <input
                                    value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] transition-all"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-6 bg-[#123A2F] p-8 rounded-3xl md:col-span-2">
                        <div className="flex flex-col md:flex-row gap-8 justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button" onClick={() => setIsActive(!isActive)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isActive ? "bg-[#1F5C4B] border border-white/20" : "bg-slate-700 border border-white/10"}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${isActive ? "translate-x-6" : "translate-x-0"}`} />
                                </button>
                                <div>
                                    <p className="text-white font-bold text-sm">Active Status</p>
                                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Visible on public site</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button" onClick={() => setFeatured(!featured)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${featured ? "bg-amber-400" : "bg-slate-700"}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform duration-300 ${featured ? "translate-x-6" : "translate-x-0"}`} />
                                </button>
                                <div>
                                    <p className="text-white font-bold text-sm">Featured</p>
                                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Show in primary positions</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <input
                                    type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))}
                                    className="w-16 bg-white/10 border-white/20 rounded-lg py-1 px-2 text-white text-center text-sm focus:ring-1 focus:ring-white/20"
                                />
                                <div>
                                    <p className="text-white font-bold text-sm">Sort Order</p>
                                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Lower = first</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 mt-4 flex justify-end">
                            <button
                                type="submit" disabled={loading}
                                className="bg-white text-[#123A2F] px-12 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Create Testimonial"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
