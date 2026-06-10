import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
    title: "Corporate Event Production Manchester | Blanc. Events",
    description:
        "Technical production, lighting and AV for conferences, brand activations, galas and corporate celebrations across Greater Manchester and the North West. One team, one point of accountability.",
    alternates: { canonical: "https://www.blanc-events.co.uk/corporate" },
    openGraph: {
        title: "Corporate Event Production | Blanc. Events Manchester",
        description:
            "Technical production, lighting and AV for conferences, brand activations and corporate events across Greater Manchester and the North West.",
        url: "https://www.blanc-events.co.uk/corporate",
    },
};

const SERVICES = [
    {
        icon: "campaign",
        title: "Brand activations & launches",
        desc: "Lighting environments that put your product and brand colours front and centre — pixel-mapped, DMX-controlled and matched to your brand guidelines.",
    },
    {
        icon: "co_present",
        title: "Conferences & town halls",
        desc: "Stage wash, PA, microphones and playback handled by one team, so your speakers are seen and heard without you thinking about it once.",
    },
    {
        icon: "celebration",
        title: "Galas & corporate celebrations",
        desc: "Room transformations for awards nights, Christmas parties and summer events — uplighting, dance floor production and DJ.",
    },
    {
        icon: "engineering",
        title: "On-site technical management",
        desc: "A dedicated lead technician on-site from build to de-rig. Founder-led oversight and a single point of accountability for the technical outcome.",
    },
];

const PROCESS = [
    {
        step: "01",
        title: "Brief us",
        desc: "Tell us the venue, date, audience size and what the event needs to achieve. A two-line email is enough to start.",
    },
    {
        step: "02",
        title: "Proposal within 24 hours",
        desc: "You get a written proposal with transparent pricing, a kit list and a production plan — no obligation.",
    },
    {
        step: "03",
        title: "We deliver, you present",
        desc: "Delivery, build, operation and de-rig handled end to end. Tested and signed off before doors open.",
    },
];

export default function CorporatePage() {
    return (
        <>
            <Navbar />
            <main className="pt-20">

                {/* Hero */}
                <section className="bg-[#0B241D] text-white py-32 md:py-40 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(52,211,153,0.08)_0%,_transparent_60%)]" />
                    <div className="relative max-w-5xl mx-auto">
                        <span className="inline-block py-1 px-3 border border-white/20 text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] rounded mb-8">
                            Corporate Events
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-8 max-w-3xl">
                            Production your <span className="text-[#34d399]">stakeholders</span> will notice.
                        </h1>
                        <p className="text-white/55 text-lg md:text-xl max-w-xl mb-12 leading-relaxed">
                            Lighting, AV and technical production for conferences, brand activations and corporate
                            celebrations — delivered by one accountable team, proposal within 24 hours.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/contact?service=Corporate%20Event"
                                className="inline-block px-10 py-4 bg-[#34d399] text-[#0B241D] font-black rounded-xl uppercase tracking-[0.18em] text-sm hover:brightness-110 transition-all text-center"
                            >
                                Get a proposal
                            </Link>
                            <a
                                href="tel:+447584192578"
                                className="inline-block px-10 py-4 border border-white/20 text-white font-bold rounded-xl uppercase tracking-[0.14em] text-sm hover:bg-white/5 transition-all text-center"
                            >
                                Call 07584 192 578
                            </a>
                        </div>
                    </div>
                </section>

                {/* What we deliver */}
                <section className="py-24 px-6 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-16 max-w-2xl">
                            <span className="text-[#1F5C4B]/70 text-[11px] font-medium tracking-[0.12em] block mb-3">What we deliver</span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                                One team for the whole technical brief.
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {SERVICES.map((s) => (
                                <div key={s.title} className="rounded-3xl p-8 bg-slate-50 border border-slate-100 flex flex-col gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-[#1F5C4B]/8 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl text-[#1F5C4B]">{s.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-3 text-slate-900">{s.title}</h3>
                                        <p className="text-sm leading-relaxed text-slate-400">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why teams book us */}
                <section className="py-24 px-6 bg-[#0B241D] text-white">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-14 max-w-2xl">
                            Built for people whose name is on the event.
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { title: "PAT-tested kit", desc: "Every piece of equipment is PAT tested and performance-verified before every hire. Venue documentation available on request." },
                                { title: "24-hour proposals", desc: "Written proposal with transparent pricing within one working day of your brief — no chasing." },
                                { title: "Founder-led delivery", desc: "You deal with the people who actually rig and operate your event, not an account layer." },
                            ].map((b) => (
                                <div key={b.title}>
                                    <h3 className="font-bold text-lg mb-3 text-[#34d399]">{b.title}</h3>
                                    <p className="text-white/55 text-sm leading-relaxed">{b.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Process */}
                <section className="py-24 px-6 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-16 max-w-2xl">
                            <span className="text-[#1F5C4B]/70 text-[11px] font-medium tracking-[0.12em] block mb-3">How it works</span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                                Brief to show, in three steps.
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {PROCESS.map((p) => (
                                <div key={p.step} className="rounded-3xl p-8 border border-slate-100">
                                    <span className="text-5xl font-black text-[#1F5C4B]/15 block mb-6">{p.step}</span>
                                    <h3 className="text-xl font-bold mb-3 text-slate-900">{p.title}</h3>
                                    <p className="text-sm leading-relaxed text-slate-400">{p.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 px-6 bg-slate-50">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-5">
                            Tell us what you&apos;re building.
                        </h2>
                        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                            Send the venue, date and headcount — we&apos;ll come back within 24 hours with a
                            production proposal and transparent pricing.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact?service=Corporate%20Event"
                                className="inline-block px-12 py-4 bg-[#1F5C4B] text-white font-black rounded-xl uppercase tracking-[0.18em] text-sm hover:bg-[#123A2F] transition-all shadow-xl shadow-[#1F5C4B]/20"
                            >
                                Get a proposal
                            </Link>
                            <Link
                                href="/services"
                                className="inline-block px-10 py-4 border border-slate-200 text-slate-600 font-bold rounded-xl uppercase tracking-[0.14em] text-sm hover:border-[#1F5C4B] transition-all"
                            >
                                See all services
                            </Link>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
