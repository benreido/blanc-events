"use client";

import { useState } from "react";

export default function PayNowButton({ invoiceId, amount }: { invoiceId: string; amount: number }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handlePay() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/invoice/${invoiceId}/pay`, { method: "POST" });
            const data = await res.json();
            if (!res.ok || !data.url) {
                setError(data.error || "Unable to start payment. Please try again.");
                return;
            }
            window.location.href = data.url;
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={handlePay}
                disabled={loading}
                className="bg-[#1F5C4B] hover:bg-[#123A2F] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-xs tracking-widest font-black uppercase shadow-sm transition-all flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[16px]">
                    {loading ? "hourglass_empty" : "credit_card"}
                </span>
                {loading ? "Redirecting…" : `Pay £${amount.toFixed(2)}`}
            </button>
            {error && <p className="text-xs text-red-500 max-w-[200px] text-right">{error}</p>}
        </div>
    );
}
