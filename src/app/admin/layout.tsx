"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";

function AdminSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const links = [
        { href: "/admin", icon: "dashboard", label: "Dashboard" },
        { href: "/admin/calendar", icon: "calendar_month", label: "Calendar" },
        { href: "/admin/reports", icon: "bar_chart", label: "Reports" },
        { href: "/admin/equipment", icon: "speaker", label: "Equipment" },
        { href: "/admin/packages", icon: "inventory_2", label: "Packages" },
        { href: "/admin/dj-services", icon: "headphones", label: "DJ Services" },
        { href: "/admin/services", icon: "engineering", label: "Add-ons" },
        { href: "/admin/testimonials", icon: "format_quote", label: "Testimonials" },
        { href: "/admin/bookings", icon: "event_available", label: "Bookings" },
        { href: "/admin/quotes", icon: "request_quote", label: "Quotes" },
        { href: "/admin/invoices", icon: "receipt_long", label: "Invoices" },
        { href: "/admin/contracts", icon: "autorenew", label: "Contracts" },
        { href: "/admin/enquiries", icon: "mail", label: "Enquiries" },
        { href: "/admin/venue-bookings", icon: "golf_course", label: "Alder Root" },
    ];

    return (
        <aside className="w-64 bg-[#123A2F] min-h-screen p-6 flex flex-col">
            <Link href="/admin" className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 bg-white/10 flex items-center justify-center rounded">
                    <span className="material-symbols-outlined text-white text-sm">layers</span>
                </div>
                <span className="text-lg font-black tracking-tighter uppercase text-white">Admin</span>
            </Link>

            <nav className="flex-1 space-y-1">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <span className="material-symbols-outlined text-xl">{link.icon}</span>
                        {link.label}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10">
                <p className="text-white/40 text-xs mb-3">{session?.user?.email}</p>
                <div className="flex gap-2">
                    <Link href="/" className="flex-1 py-2 text-center text-white/60 text-xs font-bold uppercase hover:text-white border border-white/10 rounded-lg transition-colors">
                        View Site
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin/login" })}
                        className="flex-1 py-2 text-center text-white/60 text-xs font-bold uppercase hover:text-red-400 border border-white/10 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <div className="flex min-h-screen bg-slate-50">
                <AdminSidebar />
                <main className="flex-1 p-8">{children}</main>
            </div>
        </SessionProvider>
    );
}
