import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/config";
import Link from "next/link";

export const metadata = {
    title: "Event Production Services",
    description:
        "Boutique lighting and event production services in Manchester. Lighting design, technical management, DJ talent, delivery and setup across Greater Manchester and the North West.",
    alternates: { canonical: "https://blanc-events.co.uk/services" },
    openGraph: {
        title: "Event Production Services | Blanc. Events Manchester",
        description:
            "Boutique lighting and event production services — lighting design, technical management, DJ talent, delivery and setup across Greater Manchester.",
        url: "https://blanc-events.co.uk/services",
    },
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
    let services: Array<{ id: string; name: string; description: string; pricingType: string; priceValue: number }> = [];
    try {
        services = await prisma.serviceAddon.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
    } catch { /* DB */ }

    const coreServices = [
        { icon: "lightbulb", title: "Lighting Design & Installation", desc: "Full DMX-controlled lighting environments, custom-plotted and operated. From concept through to strike — we design the atmosphere, then build it." },
        { icon: "star", title: "Event Production", desc: "Complete technical delivery including lighting, audio, and on-site production management. We embed in your team and own the technical outcome." },
        { icon: "edit", title: "Technical Production Design", desc: "Pre-event production design for venues and agencies. We create detailed lighting plots, rig plans, and technical riders tailored to your space." },
        { icon: "person", title: "On-site Production Management", desc: "A dedicated lead technician on-site for the duration of your event. Founder-led oversight, personal accountability, zero surprises." },
        { icon: "local_shipping", title: "Delivery & Setup", desc: "White-glove delivery and precision setup across Greater Manchester. Full integration, tested and signed off before doors open." },
        { icon: "nightlife", title: "Nightlife & Club Production", desc: "Specialist production for club nights, residencies, and venue installations. DMX rigs, truss configurations, and fixture programming for the dance floor." },
    ];

    return (
        <>
            <Navbar />
            <main className="pt-20">
                <section className="py-24 px-6 bg-[#123A2F] text-white text-center">
                    <div className="max-w-4xl mx-auto">
                        <span className="inline-block py-1 px-3 border border-white/20 text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] rounded mb-6">
                            Beyond Equipment
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Lighting Design &amp; Production</h1>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            We design, build, and operate lighting environments for nightclubs, corporate events, and private productions. Not equipment rental — production with a point of view.
                        </p>
                    </div>
                </section>

                {/* Core Services */}
                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {coreServices.map((svc) => (
                                <div key={svc.title} className="group border border-slate-200 rounded-xl p-8 hover:border-[#1F5C4B]/50 hover:shadow-xl transition-all">
                                    <div className="w-14 h-14 bg-[#1F5C4B]/10 rounded-xl flex items-center justify-center mb-6">
                                        <span className="material-symbols-outlined text-[#1F5C4B] text-2xl">{svc.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{svc.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{svc.desc}</p>
                                    <Link
                                        href={`/contact?service=${encodeURIComponent(svc.title)}`}
                                        className="text-[#1F5C4B] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                                    >
                                        Request Quote <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 px-6 bg-[#1F5C4B] text-white">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="material-symbols-outlined text-6xl text-white/50 mb-6">headphones</span>
                        <h2 className="text-4xl font-black tracking-tighter mb-6">Premium DJ Services</h2>
                        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                            Elevate your event with our curated roster of professional DJs. From elegant weddings to late-night club sets, we provide expert sound and the perfect atmosphere.
                        </p>
                        <Link href="/book" className="inline-block px-10 py-4 bg-white text-[#1F5C4B] font-black rounded-xl uppercase tracking-[0.2em] text-sm hover:bg-slate-100 transition-all shadow-xl">
                            Book a DJ
                        </Link>
                    </div>
                </section>

                {/* Service Add-ons from DB */}
                {services.length > 0 && (
                    <section className="py-20 px-6 bg-slate-50">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="text-3xl font-black tracking-tighter uppercase text-center mb-12">Add-on Services</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {services.map((svc) => (
                                    <div key={svc.id} className="bg-white rounded-xl p-6 border border-slate-200">
                                        <h4 className="font-bold mb-2">{svc.name}</h4>
                                        <p className="text-slate-400 text-sm mb-4">{svc.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#1F5C4B] font-bold">
                                                {svc.pricingType === "FIXED" && formatCurrency(svc.priceValue)}
                                                {svc.pricingType === "PERCENT_OF_SUBTOTAL" && `${svc.priceValue}% of subtotal`}
                                                {svc.pricingType === "PER_DAY" && `${formatCurrency(svc.priceValue)}/day`}
                                            </span>
                                            <Link href="/book" className="text-xs font-bold text-[#1F5C4B] uppercase tracking-widest">Add</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </>
    );
}
