"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/config";
import { format } from "date-fns";

interface Package {
    id: string;
    name: string;
    dayRate: number | null;
    contactForPrice: boolean;
    isActive: boolean;
    featured: boolean;
    updatedAt: string;
    items: Array<{ id: string; quantity: number }>;
}

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/packages");
            const data = await res.json();
            setPackages(data.packages || []);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
            if (res.ok) fetchPackages();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Packages</h1>
                    <p className="text-slate-500 text-sm">Manage equipment bundles and promotional pricing</p>
                </div>
                <Link
                    href="/admin/packages/new"
                    className="bg-[#1F5C4B] text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#123A2F] transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">add</span> Create Package
                </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Package Name</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Items</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Day Rate</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Last Updated</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <tr key={i}>
                                    <td colSpan={6} className="px-6 py-4"><div className="h-8 skeleton rounded w-full" /></td>
                                </tr>
                            ))
                        ) : packages.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inventory_2</span>
                                    <p className="text-slate-400 font-medium">No packages found</p>
                                </td>
                            </tr>
                        ) : (
                            packages.map((pkg) => (
                                <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{pkg.name}</span>
                                            {pkg.featured && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded w-fit mt-1 uppercase">
                                                    <span className="material-symbols-outlined text-[12px]">star</span> Featured
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-600">{pkg.items.length} items</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {pkg.contactForPrice ? (
                                            <span className="text-sm font-bold text-slate-500">Quote Required</span>
                                        ) : (
                                            <span className="text-sm font-bold text-[#1F5C4B]">{formatCurrency(pkg.dayRate || 0)}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${pkg.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                                            {pkg.isActive ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {format(new Date(pkg.updatedAt), "dd MMM yyyy")}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/packages/${pkg.id}/edit`} className="p-2 text-slate-400 hover:text-[#1F5C4B] transition-colors hover:bg-white rounded-lg border border-transparent hover:border-slate-200">
                                                <span className="material-symbols-outlined">edit</span>
                                            </Link>
                                            <button onClick={() => handleDelete(pkg.id, pkg.name)} className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-white rounded-lg border border-transparent hover:border-slate-200">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
