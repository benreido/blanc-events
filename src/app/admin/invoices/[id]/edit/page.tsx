"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import InvoiceBuilder from "@/components/admin/InvoiceBuilder";

export default function EditInvoicePage() {
    const params = useParams();
    const id = params?.id as string;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/admin/invoices/${id}`)
            .then(r => r.json())
            .then(d => {
                if (d.invoice) setData(d.invoice);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Builder Workspace...</div>;
    if (!data) return <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Invoice not found.</div>;

    return <InvoiceBuilder initialData={data} />;
}
