"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/config";

interface Service { id: string; name: string; description: string; pricingType: string; priceValue: number; isActive: boolean; }

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/services").then((r) => r.json()).then((d) => { setServices(d.services || []); setLoading(false); });
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-black tracking-tighter mb-8">Service Add-Ons</h1>
            {loading ? (
                <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
            ) : services.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">engineering</span>
                    <p className="text-slate-400">No services configured. Add services via the seed script or database.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {services.map((s) => (
                        <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-bold text-lg mb-2">{s.name}</h3>
                            <p className="text-slate-400 text-sm mb-4">{s.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-[#1F5C4B] font-bold text-sm">
                                    {s.pricingType === "FIXED" && formatCurrency(s.priceValue)}
                                    {s.pricingType === "PERCENT_OF_SUBTOTAL" && `${s.priceValue}%`}
                                    {s.pricingType === "PER_DAY" && `${formatCurrency(s.priceValue)}/day`}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${s.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                    {s.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
