"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

interface Testimonial {
    id: string;
    name: string;
    role: string | null;
    company: string | null;
    quote: string;
    rating: number;
    featured: boolean;
    isActive: boolean;
    createdAt: string;
}

export default function TestimonialsAdminPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/testimonials")
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setTestimonials(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleStatus = async (id: string, current: boolean) => {
        try {
            const res = await fetch(`/api/admin/testimonials/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !current }),
            });
            if (res.ok) {
                setTestimonials(prev => prev.map(t => t.id === id ? { ...t, isActive: !current } : t));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteTestimonial = async (id: string) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) return;
        try {
            const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
            if (res.ok) {
                setTestimonials(prev => prev.filter(t => t.id !== id));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Customer Testimonials</h1>
                    <p className="text-slate-500 mt-1">Manage public reviews and social proof shown on the home page.</p>
                </div>
                <Link
                    href="/admin/testimonials/new"
                    className="bg-[#1F5C4B] text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#123A2F] transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span> Add Testimonial
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F5C4B]"></div>
                </div>
            ) : testimonials.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-slate-300 text-3xl">format_quote</span>
                    </div>
                    <h3 className="text-slate-900 font-bold mb-1">No testimonials yet</h3>
                    <p className="text-slate-500 text-sm mb-6">Start building trust by adding your first client review.</p>
                    <Link href="/admin/testimonials/new" className="text-[#1F5C4B] font-bold text-sm hover:underline uppercase tracking-widest">Create One Now</Link>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Client</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Quote</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Featured</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {testimonials.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{t.role || t.company || "Client"}</p>
                                    </td>
                                    <td className="px-6 py-4 max-w-md">
                                        <p className="text-xs text-slate-600 line-clamp-2 italic">&quot;{t.quote}&quot;</p>
                                        <div className="flex mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`material-symbols-outlined text-xs ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}>star</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {t.featured && (
                                            <span className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-600 rounded text-[9px] font-black uppercase tracking-tighter border border-amber-100">Featured</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleStatus(t.id, t.isActive)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${t.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                        >
                                            {t.isActive ? 'Active' : 'Hidden'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/testimonials/${t.id}/edit`} className="p-2 text-slate-400 hover:text-[#1F5C4B] transition-colors"><span className="material-symbols-outlined text-sm">edit</span></Link>
                                            <button onClick={() => deleteTestimonial(t.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </div>
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
