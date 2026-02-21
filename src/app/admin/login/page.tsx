"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const result = await signIn("credentials", {
            email, password, redirect: false,
        });
        if (result?.error) {
            setError("Invalid email or password");
        } else {
            router.push("/admin");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#123A2F]">
            <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl">
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="w-10 h-10 bg-[#123A2F] flex items-center justify-center rounded-lg">
                        <span className="material-symbols-outlined text-white">layers</span>
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase">Admin Portal</span>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B]"
                            placeholder="admin@blanc.events" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B]"
                            placeholder="••••••••" required />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={loading}
                        className="w-full py-3.5 bg-[#1F5C4B] text-white font-bold rounded-lg uppercase tracking-widest text-sm hover:bg-[#123A2F] disabled:opacity-50">
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
