import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
    title: "Wedding DJ & Special Effects Manchester | Blanc. Events",
    description:
        "Wedding DJ, dry ice floor clouds, cold spark machines and wireless Astera lighting across Greater Manchester and the North West. Create a first dance moment you'll never forget.",
    alternates: { canonical: "https://blanc-events.co.uk/weddings" },
    openGraph: {
        title: "Wedding DJ & Special Effects | Blanc. Events Manchester",
        description:
            "Wedding DJ, dry ice floor clouds, cold spark machines and wireless lighting for weddings across Greater Manchester and the North West.",
        url: "https://blanc-events.co.uk/weddings",
    },
};

export const dynamic = "force-dynamic";

const EFFECTS = [
    {
        icon: "cloud",
        title: "Dry Ice Floor Cloud",
        desc: "A low-lying blanket of dense white cloud that rolls across the dance floor — perfect for your first dance. The effect stays below knee height, so you float above it while your guests watch in awe. Completely safe, no smell, dissipates cleanly.",
        tag: "First Dance Favourite",
    },
    {
        icon: "auto_awesome",
        title: "Cold Spark Machines",
        desc: "Brilliant sparkling fountains of cold spark that shoot upwards, triggered precisely to the beat of your first dance song. Completely cold to the touch — safe for indoor venues, no fire risk, no pyrotechnics licence needed.",
        tag: "Grand Entrance",
    },
    {
        icon: "lightbulb",
        title: "Wireless Astera Lighting",
        desc: "Battery-powered, cable-free Astera Titan and AX1 tubes placed throughout your venue — ceremony aisles, around tables, inside marquees. Fully colour-controllable and DMX-programmed to change with your evening.",
        tag: "All Evening",
    },
    {
        icon: "headphones",
        title: "DJ & Music",
        desc: "From the ceremony walk-in to the last song of the night — carefully read rooms, proper mixing, and the kind of dance floor that doesn't empty. Not a playlist. A DJ who pays attention.",
        tag: "Ceremony to Close",
    },
];

export default async function WeddingsPage() {
    const testimonials = await prisma.testimonial.findMany({
        where: { isActive: true, eventType: { in: ["Wedding", "wedding"] } },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, role: true, company: true, quote: true, rating: true },
    }).catch(() => []);

    return (
        <>
            <Navbar />
            <main className="pt-20">

                {/* Hero */}
                <section className="bg-[#0B241D] text-white py-32 md:py-44 px-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(52,211,153,0.08)_0%,_transparent_70%)]" />
                    <div className="relative max-w-4xl mx-auto">
                        <span className="inline-block py-1 px-3 border border-white/20 text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] rounded mb-8">
                            Wedding Specialists
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-8">
                            Make the<br />
                            <span className="text-[#34d399]">first dance</span><br />
                            unforgettable.
                        </h1>
                        <p className="text-white/55 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
                            Dry ice clouds, cold sparks, wireless lighting and DJ — everything to make your wedding reception exactly what you pictured.
                        </p>
                        <Link
                            href="/contact?service=Wedding"
                            className="inline-block px-12 py-4 bg-[#34d399] text-[#0B241D] font-black rounded-xl uppercase tracking-[0.18em] text-sm hover:brightness-110 transition-all shadow-2xl shadow-[#34d399]/20"
                        >
                            Check Your Date
                        </Link>
                    </div>
                </section>

                {/* Effects grid */}
                <section className="py-24 px-6 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-16 max-w-2xl">
                            <span className="text-[#1F5C4B]/70 text-[11px] font-medium tracking-[0.12em] block mb-3">What we do</span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                                The moments your guests will talk about for years.
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {EFFECTS.map((effect, i) => (
                                <div key={effect.title} className={`rounded-3xl p-8 flex flex-col gap-5 ${i === 0 ? "bg-[#0B241D] text-white" : "bg-slate-50 border border-slate-100"}`}>
                                    <div className="flex items-center justify-between">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${i === 0 ? "bg-white/10" : "bg-[#1F5C4B]/8"}`}>
                                            <span className={`material-symbols-outlined text-2xl ${i === 0 ? "text-[#34d399]" : "text-[#1F5C4B]"}`}>{effect.icon}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full ${i === 0 ? "bg-white/10 text-white/60" : "bg-[#1F5C4B]/8 text-[#1F5C4B]"}`}>
                                            {effect.tag}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold mb-3 ${i === 0 ? "text-white" : "text-slate-900"}`}>{effect.title}</h3>
                                        <p className={`text-sm leading-relaxed ${i === 0 ? "text-white/55" : "text-slate-400"}`}>{effect.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* First dance moment — editorial */}
                <section className="py-24 px-6 bg-[#0B241D] text-white">
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1">
                            <span className="text-white/40 text-[11px] font-medium tracking-[0.12em] block mb-5">The first dance</span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-6">
                                You, a cloud of dry ice,<br />and the song that matters.
                            </h2>
                            <p className="text-white/55 text-base leading-relaxed mb-6">
                                The dry ice floor cloud is timed to roll out exactly as the song starts. Cold spark machines trigger on the peak moment. Your photographer gets the shot. Your guests get the goosebumps.
                            </p>
                            <p className="text-white/55 text-base leading-relaxed mb-10">
                                We plan it all beforehand — song choice, timing, venue layout — so on the night, you just have to dance.
                            </p>
                            <Link
                                href="/contact?service=Wedding"
                                className="inline-block px-8 py-3.5 border border-white/20 text-white font-bold rounded-xl uppercase tracking-[0.14em] text-xs hover:bg-white/5 transition-all"
                            >
                                Talk to us about your first dance →
                            </Link>
                        </div>
                        <div className="w-full lg:w-[420px] shrink-0">
                            <div className="rounded-3xl bg-white/5 border border-white/10 p-10 text-center">
                                <div className="text-7xl mb-6">☁️</div>
                                <p className="text-white/80 font-bold text-lg mb-2">Dry Ice + Cold Sparks</p>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    The combination that turns a first dance into a photograph. Safe, stunning, and completely memorable.
                                </p>
                                <div className="mt-8 grid grid-cols-2 gap-3 text-left">
                                    {["Safe for indoor venues", "No pyro licence needed", "Timed to your song", "Fully CO₂ dry ice", "Cold to the touch", "Dissipates cleanly"].map((f) => (
                                        <div key={f} className="flex items-center gap-2 text-xs text-white/50">
                                            <span className="text-[#34d399] text-sm">✓</span> {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                {testimonials.length > 0 && (
                    <section className="py-24 px-6 bg-slate-50">
                        <div className="max-w-5xl mx-auto">
                            <div className="mb-14">
                                <span className="text-[#1F5C4B]/70 text-[11px] font-medium tracking-[0.12em] block mb-3">Real couples</span>
                                <h2 className="text-4xl font-black tracking-tighter text-slate-900">What our couples say.</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {testimonials.map((t) => (
                                    <div key={t.id} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: t.rating }).map((_, i) => (
                                                    <span key={i} className="text-amber-400 text-base">★</span>
                                                ))}
                                            </div>
                                            <a
                                                href="https://www.tripadvisor.co.uk/Attraction_Review-g15343868-d15817079-Reviews-Alder_Root_Golf_Club-Winwick_Warrington_Cheshire_England.html"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-bold uppercase tracking-widest text-[#34B233] hover:underline"
                                            >
                                                ✓ Verified on Tripadvisor
                                            </a>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                                        <div className="flex items-center gap-3 pt-5 border-t border-slate-50">
                                            <div className="w-9 h-9 rounded-full bg-[#1F5C4B]/10 flex items-center justify-center text-[#1F5C4B] font-black text-sm">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                                                {t.company && <p className="text-slate-400 text-xs">{t.company}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="py-24 px-6 bg-white">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-5">
                            Your date. Your vision.<br />Let&apos;s make it happen.
                        </h2>
                        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                            Get in touch with your date and venue and we&apos;ll come back to you with exactly what we can do for your wedding.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact?service=Wedding"
                                className="inline-block px-12 py-4 bg-[#1F5C4B] text-white font-black rounded-xl uppercase tracking-[0.18em] text-sm hover:bg-[#123A2F] transition-all shadow-xl shadow-[#1F5C4B]/20"
                            >
                                Check Your Date
                            </Link>
                            <Link
                                href="/hire"
                                className="inline-block px-10 py-4 border border-slate-200 text-slate-600 font-bold rounded-xl uppercase tracking-[0.14em] text-sm hover:border-[#1F5C4B] transition-all"
                            >
                                Browse Equipment
                            </Link>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
