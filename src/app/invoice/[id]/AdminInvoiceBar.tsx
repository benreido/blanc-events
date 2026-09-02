"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Admin-only controls shown on the public invoice link page, so an invoice can be
 * edited, recreated (duplicated) or restored straight from its own URL.
 */
export default function AdminInvoiceBar({
    invoiceId,
    invoiceNumber,
    isDeleted,
}: {
    invoiceId: string;
    invoiceNumber: string;
    isDeleted: boolean;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState<"duplicate" | "restore" | null>(null);
    const [error, setError] = useState("");

    async function handleDuplicate() {
        setBusy("duplicate");
        setError("");
        try {
            const res = await fetch(`/api/admin/invoices/${invoiceId}/duplicate`, { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                setError(data.error || "Could not recreate this invoice.");
                return;
            }
            router.push(`/admin/invoices/${data.invoice.id}/edit`);
        } catch {
            setError("Could not recreate this invoice.");
        } finally {
            setBusy(null);
        }
    }

    async function handleRestore() {
        setBusy("restore");
        setError("");
        try {
            const res = await fetch(`/api/admin/invoices/${invoiceId}/restore`, { method: "POST" });
            if (!res.ok) {
                setError("Could not restore this invoice.");
                return;
            }
            router.refresh();
        } catch {
            setError("Could not restore this invoice.");
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="max-w-[800px] w-full mb-6 print:hidden">
            {isDeleted && (
                <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-600 text-2xl">delete</span>
                    <div className="flex-1">
                        <p className="font-bold text-amber-900 text-sm">{invoiceNumber} is in the Trash</p>
                        <p className="text-amber-800 text-xs mt-0.5">Clients can&apos;t see this invoice while it&apos;s deleted. Restore it to make the link live again.</p>
                    </div>
                </div>
            )}

            <div className="bg-slate-900 text-white rounded-xl px-4 py-3 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-2">Admin</span>

                <Link
                    href={`/admin/invoices/${invoiceId}/edit`}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                    <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                </Link>

                <button
                    onClick={handleDuplicate}
                    disabled={busy !== null}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    {busy === "duplicate" ? "Recreating…" : "Recreate as new invoice"}
                </button>

                {isDeleted && (
                    <button
                        onClick={handleRestore}
                        disabled={busy !== null}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[16px]">restore_from_trash</span>
                        {busy === "restore" ? "Restoring…" : "Restore"}
                    </button>
                )}

                <Link
                    href="/admin/invoices"
                    className="ml-auto px-3 py-1.5 rounded-lg hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors"
                >
                    All invoices
                </Link>
            </div>

            {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
        </div>
    );
}
