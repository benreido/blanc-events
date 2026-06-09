"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import { ShoppingBag, X, Menu } from "lucide-react";

export default function Navbar() {
    const { itemCount } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="fixed top-0 w-full z-50 border-b border-[#1F5C4B]/10 glass-nav">
            <nav className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-xl font-black tracking-tighter uppercase text-slate-900 leading-none group-hover:text-slate-700 transition-colors">
                        Blanc. <span className="font-medium tracking-normal">Events</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-10">
                    {[
                        { href: "/weddings", label: "Weddings" },
                        { href: "/services", label: "Services" },
                        { href: "/hire", label: "Equipment hire" },
                        { href: "/packages", label: "Packages" },
                        { href: "/about", label: "About" },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-slate-700 hover:text-[#1F5C4B] transition-colors tracking-tight link-underline"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/hire" className="relative p-2 text-slate-400 hover:text-[#1F5C4B] transition-colors">
                        <ShoppingBag size={20} strokeWidth={1.5} />
                        {itemCount > 0 && (
                            <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#1F5C4B] text-white text-[10px] font-bold flex items-center justify-center">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/contact"
                        className="hidden lg:flex px-6 py-2.5 hover:bg-[#1F5C4B]/90 text-white text-xs font-semibold rounded-lg tracking-tight transition-all bg-[#123A2F]"
                    >
                        Contact specialist
                    </Link>
                    <button
                        className="md:hidden p-2 text-slate-700"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
                    {[
                        { href: "/weddings", label: "Weddings" },
                        { href: "/services", label: "Services" },
                        { href: "/hire", label: "Equipment hire" },
                        { href: "/packages", label: "Packages" },
                        { href: "/about", label: "About" },
                        { href: "/contact", label: "Contact" },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block text-sm font-medium tracking-tight py-2 hover:text-[#1F5C4B] text-slate-700"
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
