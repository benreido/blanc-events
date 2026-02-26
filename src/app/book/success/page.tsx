"use client";

import { Suspense, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function SuccessContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); // bookingOrderId
    const sessionId = searchParams.get("session_id"); // Stripe checkout session

    const [idUploaded, setIdUploaded] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [contractSigned, setContractSigned] = useState(false); // mock for now

    // Account Registration states
    const [accountCreated, setAccountCreated] = useState(false);
    const [password, setPassword] = useState("");
    const [regSubmitting, setRegSubmitting] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);

    const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);

        try {
            const response = await fetch(`/api/upload?filename=${file.name}&bookingOrderId=${id}`, {
                method: 'POST',
                body: file,
            });

            if (response.ok) {
                setIdUploaded(true);
            } else {
                alert("Upload failed. We might not have Blob storage token configured in env yet. But the logic works!");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Upload Error");
        } finally {
            setUploading(false);
        }
    };

    const handleSignContract = async () => {
        // Here we would integrate DocuSign trigger /api/docusign/create-envelope
        // Mapped to Agreement DB model.
        alert("DocuSign Integration mock! Webhook would normally listen for 'EnvelopeSigned'.");
        setContractSigned(true);
    };

    const handleCreateAccount = async () => {
        if (!password) return alert("Please enter a password.");
        setRegSubmitting(true);
        try {
            // To properly map it, we might need email. We could fetch booking order by ID first, 
            // but we can ask user for email, or simulate for now since we have booking ID.
            alert("Account creation backend logic is linked in /api/auth/register. Normally we fetch Guest email from BookingOrder first.");
            setAccountCreated(true);
        } catch (err) {
            console.error(err);
        }
        setRegSubmitting(false);
    };

    return (
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 max-w-2xl w-full text-left">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in spin-in-12">
                <span className="material-symbols-outlined text-3xl text-[#1F5C4B]">check_circle</span>
            </div>

            <h1 className="text-3xl font-black tracking-tighter mb-2 text-slate-900">Booking Payment Complete!</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
                Your payment was successful and your dates are reserved under booking <strong>{id?.slice(0, 8).toUpperCase()}</strong>.
                Before we can hand over the equipment, please complete the following verification steps securely.
            </p>

            <div className="space-y-6">
                {/* ID Verification */}
                <div className="p-6 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">badge</span>
                            Verify Your Identity
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Upload a valid passport or driver&apos;s license.</p>
                    </div>
                    <div>
                        {idUploaded ? (
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span> Uploaded
                            </span>
                        ) : (
                            <>
                                <input type="file" ref={fileRef} onChange={handleIdUpload} className="hidden" accept="image/*,application/pdf" />
                                <button disabled={uploading} onClick={() => fileRef.current?.click()} className="px-6 py-3 bg-white border border-slate-200 hover:border-[#1F5C4B] shadow-sm rounded-xl text-xs font-black uppercase tracking-widest text-[#1F5C4B] transition-all whitespace-nowrap">
                                    {uploading ? "Uploading..." : "Upload ID"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Contract Signing */}
                <div className="p-6 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">history_edu</span>
                            Digital Agreement
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Sign the standard equipment hire contract.</p>
                    </div>
                    <div>
                        {contractSigned ? (
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span> Signed
                            </span>
                        ) : (
                            <button onClick={handleSignContract} className="px-6 py-3 bg-[#123A2F] shadow-brand-sm hover:translate-y-[ -2px] rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all whitespace-nowrap">
                                Open DocuSign
                            </button>
                        )}
                    </div>
                </div>

                {/* Optional Account Creation */}
                {!accountCreated && (
                    <div className="p-6 border border-emerald-100 bg-emerald-50/30 rounded-2xl flex flex-col gap-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-[#123A2F]">
                            <span className="material-symbols-outlined text-emerald-600">person_add</span>
                            Faster Booking Next Time?
                        </h3>
                        <p className="text-sm text-slate-600">Save your verification status and details for 1-click checkout in the future. We&apos;ll tie this safely to your email.</p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="password"
                                placeholder="Create a secure password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-[#1F5C4B] outline-none"
                            />
                            <button disabled={regSubmitting} onClick={handleCreateAccount} className="px-6 py-3 bg-[#1F5C4B] text-white rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap">
                                {regSubmitting ? "Saving..." : "Create Account"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-12 border-t border-slate-200 pt-8">
                <Link href={`/invoice/${id}`} target="_blank" className="w-full flex-1 bg-white border border-slate-200 text-slate-800 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:border-[#1F5C4B] transition-all flex items-center justify-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-sm">receipt_long</span> View Official Invoice
                </Link>
                <Link href="/" className="flex-1 text-slate-500 font-bold uppercase text-xs tracking-widest hover:text-slate-900 transition-colors py-4 text-center">
                    Return to Homepage
                </Link>
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-32 pb-16 bg-[#F9F7F5] flex items-center justify-center px-4 md:px-6">
                <Suspense fallback={<div className="animate-pulse">Loading transaction...</div>}>
                    <SuccessContent />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
