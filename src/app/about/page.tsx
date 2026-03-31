import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
    title: "About Us",
    description:
        "Learn about Blanc. Events — Manchester's specialist lighting production studio. Founded on a passion for flawless event production, we serve the North West's most ambitious venues and agencies.",
    alternates: { canonical: "https://blanc-events.co.uk/about" },
    openGraph: {
        title: "About Blanc. Events | Lighting Production Manchester",
        description:
            "Manchester-born lighting production specialists with expertise in Astera fixtures, DMX-controlled environments, and full event production across the North West.",
        url: "https://blanc-events.co.uk/about",
    },
};

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main className="pt-20">
                {/* Hero */}
                <section className="py-24 px-6 bg-[#123A2F] text-white text-center">
                    <div className="max-w-4xl mx-auto">
                        <span className="inline-block py-1 px-3 border border-white/20 text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] rounded mb-6">
                            Our Story
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">About Blanc. Events</h1>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            Manchester's specialist lighting production studio. We design and build environments with light.
                        </p>
                    </div>
                </section>

                {/* Story */}
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-3xl font-black tracking-tighter uppercase text-[#123A2F] mb-8">Who We Are</h2>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Founded in Manchester, Blanc. Events is a lighting production studio and specialist hire company serving the North West&apos;s most ambitious venues, agencies, and event planners.
                            </p>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                We&apos;re not a general AV company. We specialise in lighting — DMX-controlled environments, wireless Astera fixtures, and creative production design that defines the atmosphere of an event. Every project starts with a brief, not an equipment list.
                            </p>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Our inventory includes industry-leading fixtures from <strong>Astera</strong> and <strong>MA Lighting</strong>, alongside professional audio from <strong>L-Acoustics</strong> and <strong>Pioneer DJ</strong> backline — ensuring our clients have access to the equipment that actually matters.
                            </p>
                            <p className="text-slate-600 leading-relaxed mb-12">
                                Our production team brings deep expertise across nightlife, corporate events, live music, and private functions. We plan, build, and operate lighting setups that define how a space feels.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-20 px-6 bg-slate-50">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-black tracking-tighter uppercase text-center mb-16">Our Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: "precision_manufacturing", title: "Technical Excellence", desc: "Every piece of equipment is meticulously maintained, PAT tested, and performance verified before every hire." },
                                { icon: "handshake", title: "Partnership Approach", desc: "We embed ourselves in your production team. Your success is our success, and we go the extra mile every time." },
                                { icon: "eco", title: "Sustainable Practice", desc: "We prioritize energy-efficient LED technology and minimize waste through intelligent logistics and reusable packaging." },
                            ].map((v) => (
                                <div key={v.title} className="text-center p-8">
                                    <div className="w-16 h-16 bg-[#1F5C4B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <span className="material-symbols-outlined text-[#1F5C4B] text-3xl">{v.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{v.title}</h3>
                                    <p className="text-slate-400">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>



                {/* CTA */}
                <section className="py-20 px-6 bg-[#123A2F]">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">Let&apos;s Work Together</h2>
                        <p className="text-white/60 mb-10">Ready to elevate your next event? Get in touch and let&apos;s discuss your production needs.</p>
                        <Link href="/contact" className="inline-block px-12 py-5 bg-white text-[#1F5C4B] font-black rounded uppercase tracking-widest hover:scale-105 transition-transform">
                            Get in Touch
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
