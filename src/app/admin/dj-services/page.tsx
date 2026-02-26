"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/config";

interface DJService {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    isActive: boolean;
}

export default function DJServicesAdminPage() {
    const [services, setServices] = useState<DJService[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/dj-services")
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setServices(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleStatus = async (id: string, current: boolean) => {
        try {
            const res = await fetch(`/api/admin/dj-services/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !current }),
            });
            if (res.ok) {
                setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !current } : s));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteService = async (id: string) => {
        if (!confirm("Are you sure you want to delete this DJ service?")) return;
        try {
            const res = await fetch(`/api/admin/dj-services/${id}`, { method: "DELETE" });
            if (res.ok) {
                setServices(prev => prev.filter(s => s.id !== id));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">DJ Services</h1>
                    <p className="mt-1 text-slate-500">Manage DJ roster, base pricing, and availability.</p>
                </div>
                <Link
                    href="/admin/dj-services/new"
                    className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold tracking-widest text-white uppercase transition-all bg-[#1F5C4B] rounded-lg hover:bg-[#123A2F]"
                >
                    <span className="text-sm material-symbols-outlined">add</span> Add DJ Service
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-[#1F5C4B]"></div>
                </div>
            ) : services.length === 0 ? (
                <div className="p-16 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50">
                        <span className="text-3xl material-symbols-outlined text-slate-300">headphones</span>
                    </div>
                    <h3 className="mb-1 font-bold text-slate-900">No DJ Services yet</h3>
                    <p className="mb-6 text-sm text-slate-500">Add your first DJ to start accepting bookings.</p>
                    <Link href="/admin/dj-services/new" className="text-[#1F5C4B] font-bold text-sm hover:underline uppercase tracking-widest">Create One Now</Link>
                </div>
            ) : (
                <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-2xl">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">DJ / Service Name</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Base Price</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {services.map(s => (
                                <tr key={s.id} className="transition-colors hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-900">{s.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter truncate max-w-xs">{s.description || "No description"}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-[#1F5C4B]">{formatCurrency(s.basePrice)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleStatus(s.id, s.isActive)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${s.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                        >
                                            {s.isActive ? 'Active' : 'Disabled'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/dj-services/${s.id}/edit`} className="p-2 transition-colors text-slate-400 hover:text-[#1F5C4B]"><span className="text-sm material-symbols-outlined">edit</span></Link>
                                            <button onClick={() => deleteService(s.id)} className="p-2 transition-colors text-slate-400 hover:text-red-500"><span className="text-sm material-symbols-outlined">delete</span></button>
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
