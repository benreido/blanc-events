"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

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
                    <Link
                        href="/hire"
                        className="text-sm font-semibold hover:text-[#1F5C4B] transition-colors uppercase tracking-widest"
                    >
                        Dry Hire
                    </Link>
                    <Link
                        href="/packages"
                        className="text-sm font-semibold hover:text-[#1F5C4B] transition-colors uppercase tracking-widest"
                    >
                        Packages
                    </Link>
                    <Link
                        href="/services"
                        className="text-sm font-semibold hover:text-[#1F5C4B] transition-colors uppercase tracking-widest"
                    >
                        Services
                    </Link>
                    <Link
                        href="/about"
                        className="text-sm font-semibold hover:text-[#1F5C4B] transition-colors uppercase tracking-widest"
                    >
                        About
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/hire" className="relative p-2 text-slate-400 hover:text-[#1F5C4B] transition-colors">
                        <span className="material-symbols-outlined">shopping_bag</span>
                        {itemCount > 0 && (
                            <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#1F5C4B] text-white text-[10px] font-bold flex items-center justify-center">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/contact"
                        className="hidden lg:flex px-6 py-2.5 hover:bg-[#1F5C4B]/90 text-white text-xs font-bold rounded uppercase tracking-widest transition-all bg-[#123A2F]"
                    >
                        Contact Specialist
                    </Link>
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <span className="material-symbols-outlined">
                            {mobileOpen ? "close" : "menu"}
                        </span>
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
                    {[
                        { href: "/hire", label: "Dry Hire" },
                        { href: "/packages", label: "Packages" },
                        { href: "/services", label: "Services" },
                        { href: "/about", label: "About" },
                        { href: "/contact", label: "Contact" },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block text-sm font-semibold uppercase tracking-widest py-2 hover:text-[#1F5C4B]"
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
