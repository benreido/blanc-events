import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/config";
import Link from "next/link";

export const metadata = { title: "Packages | Blanc. Events" };

export default async function PackagesPage() {
    let packages: Array<{
        id: string; name: string; slug: string; description: string;
        dayRate: number | null; contactForPrice: boolean; images: string[];
        includes: string[]; savingsNote: string; optionalAddons: string[];
    }> = [];

    try {
        packages = await prisma.package.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
        });
    } catch { /* DB not ready */ }

    return (
        <>
            <Navbar />
            <main className="pt-20">
                {/* Hero */}
                <section className="py-24 px-6 bg-[#123A2F] text-white text-center">
                    <div className="max-w-4xl mx-auto">
                        <span className="inline-block py-1 px-3 border border-white/20 text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] rounded mb-6">
                            Curated Bundles
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                            Production Packages
                        </h1>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            Pre-configured equipment bundles optimized for common event formats. Each package includes delivery, setup guidance, and technical support.
                        </p>
                    </div>
                </section>

                {/* Package Cards */}
                <section className="py-20 px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        {packages.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">inventory_2</span>
                                <h3 className="text-xl font-bold text-slate-400">Packages coming soon</h3>
                                <p className="text-slate-400 mt-2">Our team is curating the perfect production bundles.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {packages.map((pkg) => (
                                    <div key={pkg.id} className="group border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                                        <div className="relative h-72 bg-slate-100 overflow-hidden">
                                            {pkg.images[0] ? (
                                                <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#123A2F] to-[#0B241D] flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white/30 text-6xl">package_2</span>
                                                </div>
                                            )}
                                            {(pkg.dayRate !== null || pkg.contactForPrice) && (
                                                <div className="absolute top-4 right-4 bg-white rounded-lg px-4 py-2 shadow-lg">
                                                    {pkg.contactForPrice ? (
                                                        <span className="text-lg font-bold text-[#123A2F]">Contact for Quote</span>
                                                    ) : (
                                                        <>
                                                            <span className="text-lg font-bold text-[#123A2F]">{formatCurrency(pkg.dayRate || 0)}</span>
                                                            <span className="text-xs text-slate-500">/day</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-8">
                                            <h3 className="text-2xl font-bold mb-3">{pkg.name}</h3>
                                            <p className="text-slate-400 mb-6">{pkg.description}</p>
                                            {pkg.savingsNote && (
                                                <p className="text-[#1F5C4B] font-bold text-sm mb-6">{pkg.savingsNote}</p>
                                            )}
                                            {pkg.includes.length > 0 && (
                                                <div className="mb-6">
                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Includes</h4>
                                                    <ul className="space-y-2">
                                                        {pkg.includes.map((item, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                                <span className="material-symbols-outlined text-[#1F5C4B] text-[18px]">check_circle</span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {pkg.optionalAddons && pkg.optionalAddons.length > 0 && (
                                                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Optional Add-ons</h4>
                                                    <ul className="space-y-1">
                                                        {pkg.optionalAddons.map((addon, i) => (
                                                            <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-slate-400 text-[14px]">add</span> {addon}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <Link
                                                href="/contact"
                                                className="inline-block px-8 py-3 bg-[#1F5C4B] text-white font-bold rounded uppercase tracking-widest text-xs hover:bg-[#123A2F] transition-colors"
                                            >
                                                Book This Package
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
