"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

interface Enquiry {
    id: string; name: string; email: string; phone: string; subject: string;
    message: string; status: string; createdAt: string;
}

export default function AdminEnquiriesPage() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/enquiries").then((r) => r.json()).then((d) => { setEnquiries(d.enquiries || []); setLoading(false); });
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-black tracking-tighter mb-8">Enquiries</h1>
            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
            ) : enquiries.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">mail</span>
                    <p className="text-slate-400">No enquiries yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {enquiries.map((e) => (
                        <div key={e.id} className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold">{e.name}</h3>
                                    <p className="text-sm text-slate-400">{e.email} {e.phone && `• ${e.phone}`}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${e.status === "NEW" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>{e.status}</span>
                                    <p className="text-xs text-slate-400 mt-1">{format(new Date(e.createdAt), "dd MMM yyyy HH:mm")}</p>
                                </div>
                            </div>
                            <h4 className="font-semibold text-sm text-[#123A2F] mb-1">{e.subject}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{e.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
