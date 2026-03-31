import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import HeroSection from "@/components/HeroSection";
import AnimatedSection from "@/components/AnimatedSection";
import MotionLink from "@/components/MotionLink";
import EventsSection from "@/components/EventsSection";
import NightlifeSection from "@/components/NightlifeSection";
import PackagesPreview from "@/components/PackagesPreview";
import ProductionHireSection from "@/components/ProductionHireSection";
import EventEnquiryForm from "@/components/EventEnquiryForm";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const BASE_URL = "https://blanc-events.co.uk";

const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${BASE_URL}/#service`,
    name: "Event Production & Equipment Hire",
    provider: { "@id": `${BASE_URL}/#organization` },
    serviceType: "Event Production",
    areaServed: { "@type": "AdministrativeArea", name: "Greater Manchester" },
    description:
        "DMX-controlled lighting environments, Astera wireless fixture hire, Pioneer DJ equipment hire, and full event production for nightclubs, corporate events, and private parties in Manchester.",
    offers: [
        { "@type": "Offer", name: "Lighting Hire", url: `${BASE_URL}/hire` },
        { "@type": "Offer", name: "DJ Equipment Hire", url: `${BASE_URL}/hire` },
        { "@type": "Offer", name: "Production Packages", url: `${BASE_URL}/packages` },
        { "@type": "Offer", name: "Event Production Services", url: `${BASE_URL}/services` },
    ],
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Do you hire out DJ equipment like CDJs and mixers?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. We stock Pioneer CDJ-3000s, DJM-A9 mixers, XDJ-AZ all-in-ones, and Technics turntables available for dry hire across Manchester and the North West. All DJ equipment is delivered, set up, and collected.",
            },
        },
        {
            "@type": "Question",
            name: "What areas do you cover for equipment hire and event production?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "We're based in Manchester and cover Greater Manchester, the North West, and nationwide for larger productions. Delivery, setup, and collection are included in all hire packages.",
            },
        },
        {
            "@type": "Question",
            name: "Can I hire lighting and DJ equipment together?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Absolutely. We offer combined packages covering Astera lighting, sound systems, and full DJ backline. Browse our production packages or contact us for a tailored quote.",
            },
        },
        {
            "@type": "Question",
            name: "Do you provide full event production or just dry hire?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Both. We offer dry hire (equipment only with delivery) and full production services where our team designs, installs, and operates lighting and audio for your event.",
            },
        },
        {
            "@type": "Question",
            name: "How much does it cost to hire Astera Titan Tubes in Manchester?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Pricing depends on quantity and hire duration. We offer competitive day and weekend rates for our Astera Titan Tube inventory. Contact us for a quote or browse our hire catalogue.",
            },
        },
    ],
};

export default async function HomePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Navbar />

            {/* 1. Hero */}
            <HeroSection />

            {/* 2. Events Section */}
            <EventsSection />

            {/* 3. Nightlife Section */}
            <NightlifeSection />

            {/* 4. Curated Packages */}
            <PackagesPreview />

            {/* 5. Production & Dry Hire */}
            <ProductionHireSection />

            {/* 6. Astera Campaign Section */}
            <AnimatedSection className="py-32 px-6 bg-[#0B241D] text-white overflow-hidden">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-24">

                        {/* Left: Product Image */}
                        <div className="w-full md:w-1/2 relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#1F5C4B] via-[#123A2F] to-[#0B241D] opacity-20 rounded-[3rem] blur-3xl group-hover:opacity-40 transition-opacity duration-1000"></div>

                            <div className="relative bg-[#123A2F] rounded-[3rem] p-12 aspect-[4/5] md:aspect-square flex items-center justify-center border border-white/10 shadow-xl">
                                <div className="absolute top-10 left-10 flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded-xl border border-white/60 shadow-brand-sm group-hover:scale-105 group-hover:bg-white/60 transition-all duration-500">
                                    <span className="w-1 h-1 rounded-full bg-[#123A2F]"></span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#123A2F]">Commercial</span>
                                </div>

                                <div className="absolute top-1/2 -left-6 flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded-xl border border-white/60 shadow-brand-sm group-hover:scale-105 group-hover:bg-white/60 transition-all duration-500 transform -translate-y-1/2">
                                    <span className="w-1 h-1 rounded-full bg-[#123A2F]"></span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#123A2F]">Portrait</span>
                                </div>

                                <div className="absolute bottom-12 right-10 flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded-xl border border-white/60 shadow-brand-sm group-hover:scale-105 group-hover:bg-white/60 transition-all duration-500">
                                    <span className="w-1 h-1 rounded-full bg-[#123A2F]"></span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#123A2F]">Music Video</span>
                                </div>

                                <img
                                    src="/images/Titan tube.png"
                                    alt="Astera Titan Tubes Collection"
                                    className="max-h-[90%] w-auto object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                            </div>
                        </div>

                        {/* Right: Copy & CTAs */}
                        <div className="w-full md:w-1/2 flex flex-col items-start text-left">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                                <span className="text-emerald-400 text-[10px] font-medium tracking-[0.12em]">Industry-leading Astera inventory</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tighter leading-tight text-white drop-shadow-sm">
                                Cinematic lighting for photographers.
                            </h2>

                            <p className="text-lg md:text-xl text-white/70 mb-10 font-medium leading-relaxed max-w-lg">
                                Position your next shoot for perfection with our extensive inventory of Astera Titan Tubes. The ultimate tool for studio precision and on-location flexibility.
                            </p>

                            <ul className="space-y-4 mb-12">
                                {[
                                    "100% Wireless DMX & CRMX Control",
                                    "Individually Pixel-Mapped Effects",
                                    "All-Day Battery Powered Operation",
                                    "Ultra High CRI/TLCI for flawless skin tones"
                                ].map((bullet, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/90 font-medium">
                                        <CheckCircle2 size={18} strokeWidth={2} className="text-emerald-400 shrink-0" />
                                        {bullet}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                <MotionLink
                                    href="/hire"
                                    className="w-full sm:w-auto px-8 py-4 text-[#123A2F] font-semibold rounded-lg tracking-tight bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm text-center"
                                >
                                    Hire Astera Titan Tubes
                                </MotionLink>
                                <MotionLink
                                    href="/packages"
                                    className="w-full sm:w-auto px-8 py-4 text-white font-medium rounded-lg tracking-tight border border-white/20 bg-transparent hover:bg-white/5 shadow-sm text-sm text-center"
                                >
                                    See lighting packages
                                </MotionLink>
                            </div>
                        </div>

                    </div>
                </div>
            </AnimatedSection>

            {/* 7. Testimonials */}
            <Testimonials />

            {/* 8. Guided Event Enquiry */}
            <EventEnquiryForm />

            {/* 9. CTA */}
            <AnimatedSection className="pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="relative rounded-[3rem] overflow-hidden px-10 py-24 text-center bg-[#123A2F] shadow-brand-lg border border-[#1F5C4B]/20">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none">
                                Ready to transform <br /> your next event?
                            </h2>
                            <p className="text-white/80 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                                From intimate celebrations to arena spectacles, we provide the technical edge you need.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <MotionLink href="/contact" className="w-full sm:w-auto px-12 py-5 bg-white text-[#1F5C4B] font-semibold rounded-lg tracking-tight shadow-brand-sm">
                                    Get a proposal
                                </MotionLink>
                                <MotionLink href="/hire" className="w-full sm:w-auto px-12 py-5 bg-transparent border border-white/30 text-white font-medium rounded-lg tracking-tight">
                                    Browse equipment
                                </MotionLink>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            <Footer />
        </>
    );
}
