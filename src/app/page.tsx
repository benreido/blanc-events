import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import HeroSection from "@/components/HeroSection";
import AnimatedSection from "@/components/AnimatedSection";
import MotionLink from "@/components/MotionLink";
import TwoWaysSection from "@/components/TwoWaysSection";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/config";

export default async function HomePage() {
    return (
        <>
            <Navbar />

            <HeroSection />

            {/* Astera Campaign Section */}
            <AnimatedSection className="py-32 px-6 bg-[#0B241D] text-white overflow-hidden">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-24">

                        {/* Left: Product Image */}
                        <div className="w-full md:w-1/2 relative group">
                            {/* Subtle animated background glow behind tubes */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#1F5C4B] via-[#123A2F] to-[#0B241D] opacity-20 rounded-[3rem] blur-3xl group-hover:opacity-40 transition-opacity duration-1000"></div>

                            <div className="relative bg-[#123A2F] rounded-[3rem] p-12 aspect-[4/5] md:aspect-square flex items-center justify-center border border-white/10 shadow-xl">
                                {/* Use-case tags floating around */}
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
                                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em]">Industry-Leading Astera Inventory</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tighter leading-tight text-white drop-shadow-sm">
                                Cinematic Lighting for Photographers.
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
                                        <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
                                        {bullet}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                <MotionLink
                                    href="/hire"
                                    className="w-full sm:w-auto px-8 py-4 text-[#123A2F] font-black rounded-xl uppercase tracking-widest bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm text-center"
                                >
                                    Hire Astera Titan Tubes
                                </MotionLink>
                                <MotionLink
                                    href="/packages"
                                    className="w-full sm:w-auto px-8 py-4 text-white font-bold rounded-xl uppercase tracking-widest border border-white/20 bg-transparent hover:bg-white/5 shadow-sm text-sm text-center"
                                >
                                    See Lighting Packages
                                </MotionLink>
                            </div>
                        </div>

                    </div>
                </div>
            </AnimatedSection>

            {/* Service Pathways: Dry Hire vs Production */}
            <TwoWaysSection />

            {/* Portfolio Gallery */}
            <AnimatedSection className="py-32 px-6 bg-[#0a0a0a] text-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-black mb-16 tracking-tighter uppercase text-center md:text-left drop-shadow-xl">The Portfolio</h2>
                    <div className="hidden md:grid bento-grid">
                        <div className="col-span-2 row-span-2 rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 group relative">
                            <div className="absolute inset-0 bg-[#0B241D]/20 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-700 z-10 pointer-events-none"></div>
                            <img alt="Concert main stage" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgglQg9y0LTTLFBuq7T3wlEi88Vxi3F6w8BxW_gc9VZEVaEMAzXr0zwTIGI1Z9FbKEwTGtB6NjIsfngbAds67XlYQTM9L7ECvWYYuAoyK3Lyb9ek0jWxPUpaQzIHBwhSp8ZGkSMdy632dk3PXdZcIDiP69HyFjDpSpjmhGZTzXQpP78mzYjtCLvaR-1TYm75Bc4NfetLE7CLuDWw290VJ7fb6Tsiv3puv6vnYFdHB9C8x1zJBreMbejOsY3QKOBnhSvOZocNqkrwKJ" />
                        </div>
                        <div className="col-span-1 rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 group relative">
                            <div className="absolute inset-0 bg-[#0B241D]/20 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-700 z-10 pointer-events-none"></div>
                            <img alt="Warehouse event" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB02DWxclk8JZizOOjzvEE2Pzi_qaBdYASuJ0gCvzKJjFcRChSVvs5puMyvbXoC2qm5PLFcTR1vb4YCVL5n-WQauwIEoajZJjhZgJI8PJYdaSYUepWVtNaQM2wYXbwjggtxux__SzEH9rDjFpl74qPlTRDG17TvCLkFM6k-FtSQrl26y270PdxDdmbVuJ8xQpw3xoubB9N9vW3CwuL7w2h0ImTlABQuKItFQmwDZxNU857O1hqwsmBYj_ebw89l_aU5wDDupcRhFysp" />
                        </div>
                        <div className="col-span-1 rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 group relative">
                            <div className="absolute inset-0 bg-[#0B241D]/20 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-700 z-10 pointer-events-none"></div>
                            <img alt="Crowd silhouettes" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRAsN3A0sOv3QL-i7iDklWn--Y-xVtKVayROk_mJrioHa80sRQhZh5NSgekDnGuZWPxMZZzGddFKBnydKfdhIsKNyC9atecF1KFUSsk4nbEWTE2QfU_dK68orFJ7JDRBg2gNL8APCfJnSIbkMAexr9j7QbvzW75boGxJpxhoq3dVOagmYIehWWVU0X7tSrG2KVGsS-TlvWQ7g9rLszevGEIgpeiXAATQN7KwVLJWwjQIUML52ugiqYE82lyYq1QjmBR0uugxgwIMe3" />
                        </div>
                        <div className="col-span-2 rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 group relative">
                            <div className="absolute inset-0 bg-[#0B241D]/30 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-700 z-10 pointer-events-none"></div>
                            <img alt="Corporate AV setup" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxqVUFiSuTHi2cC86wZRXa2Yt-LDHCsEWAi6jIBvqKneSa1dmJTAy1mpDpU7HCdeYhBneOs5kwrryAA3K6ONvLYSc_VzoOJUfXQ0dYE0bJAcQRiXuibWtt6ZQMo75dCvKKsQJ6qqGS14AY6bTIdH1YZ69SNaPxv_ZE-wUX_ARNNUMlrtfUf_X1qBUYxrBmjHsbFYv6GMerokxIg0x5p0iX-Z-T0m9dZzFHpkOnYGCIqjtjHXKWEYfILOxRpZqa3LiczUh7TLc9PWhy" />
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* Testimonials */}
            <Testimonials />

            {/* How It Works */}
            <AnimatedSection className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-[#1F5C4B] text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">Workflow</span>
                        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">How it Works</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 relative">
                        {[
                            { icon: "forum", title: "Enquire", desc: "Submit your equipment list or production requirements online.", step: "01" },
                            { icon: "check_circle", title: "Approve", desc: "Receive a digital quote with real-time availability confirmation.", step: "02" },
                            { icon: "payments", title: "Pay", desc: "Secure online payments or account-based billing options.", step: "03" },
                            { icon: "local_shipping", title: "Deliver", desc: "Direct delivery to venue or Manchester depot collection.", step: "04" },
                        ].map((s) => (
                            <div key={s.step} className="relative p-8 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-slate-200 last:border-r-0">
                                <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mb-8 relative">
                                    <span className="material-symbols-outlined text-[#1F5C4B] text-3xl">{s.icon}</span>
                                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#1F5C4B] flex items-center justify-center text-xs font-bold text-white shadow-brand-sm">{s.step}</span>
                                </div>
                                <h4 className="text-lg font-bold mb-4 uppercase tracking-widest text-[#123A2F]">{s.title}</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* CTA */}
            <AnimatedSection className="pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="relative rounded-[3rem] overflow-hidden px-10 py-24 text-center bg-[#123A2F] shadow-brand-lg border border-[#1F5C4B]/20">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase leading-none drop-shadow-sm">
                                Ready to transform <br /> your next event?
                            </h2>
                            <p className="text-white/80 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                                From intimate launches to arena spectacles, we provide the technical edge you need.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <MotionLink href="/hire" className="w-full sm:w-auto px-12 py-5 bg-white text-[#1F5C4B] font-black rounded-xl uppercase tracking-widest shadow-brand-sm">
                                    Start Your Hire
                                </MotionLink>
                                <MotionLink href="/contact" className="w-full sm:w-auto px-12 py-5 bg-transparent border border-white/30 text-white font-bold rounded-xl uppercase tracking-widest">
                                    Contact Us
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
