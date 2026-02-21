import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/config";

export default async function HomePage() {
    let featuredItems: Array<{ id: string; name: string; slug: string; category: string; brand: string; dayRate: number | null; contactForPrice: boolean; description: string; images: string[] }> = [];
    let featuredPackages: Array<{ id: string; name: string; slug: string; description: string; dayRate: number | null; images: string[] }> = [];

    try {
        featuredItems = await prisma.equipmentItem.findMany({
            where: { isActive: true, featured: true },
            take: 3,
            orderBy: { sortOrder: "asc" },
        });
        featuredPackages = await prisma.package.findMany({
            where: { isActive: true, featured: true },
            take: 2,
            orderBy: { sortOrder: "asc" },
        });
    } catch {
        // DB not ready yet, show fallback
    }

    return (
        <>
            <Navbar />
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:h-screen md:min-h-[800px] flex items-center bg-[#F9F7F5] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F9F7F5] to-[#F0EBE6] z-0"></div>

                <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full relative z-10 h-full flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">

                    {/* Left Column: Text + CTA */}
                    <div className="w-full md:w-1/2 flex flex-col items-start text-left mt-8 md:mt-0">
                        {/* Trust Badge / Eyebrow */}
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 mb-6">
                            <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                            <span className="text-xs font-bold text-slate-700 tracking-wide">Trusted Production Partner</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-[3rem] sm:text-6xl lg:text-[5rem] font-black mb-6 tracking-tighter leading-[0.95] text-slate-900">
                            Premium AV &<br /> Event Production<br /> Hire.
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg md:text-xl text-slate-600 max-w-md mb-10 font-medium leading-relaxed">
                            Elevating events with industry-leading Astera lighting, professional backline, and bespoke production solutions for Manchester&apos;s most ambitious stages.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <Link
                                href="/contact"
                                className="w-full sm:w-auto px-8 py-4 text-white font-bold rounded uppercase tracking-widest hover:-translate-y-1 transition-transform bg-[#123A2F] shadow-lg shadow-[#123A2F]/30 text-sm"
                            >
                                Get a Quote
                            </Link>
                            <Link
                                href="/hire"
                                className="w-full sm:w-auto px-8 py-4 bg-slate-200/50 hover:bg-slate-200 text-slate-900 font-bold border border-slate-300 rounded uppercase tracking-widest transition-all text-sm"
                            >
                                Browse Equipment
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Sliding Grid */}
                    <div className="w-full md:w-1/2 h-[500px] md:h-full relative overflow-hidden mask-image-y">
                        {/* 
                            We need 2 identical columns for the slider content so it loops infinitely. 
                            If mobile, switch to horizontal mask & flex-row if desired, but we'll stick to vertical 
                            to match Sugarland strictly, or adjust based on user's optionally requested mobile horizontal.
                            We'll use a responsive container that slides vertically on desktop, horizontally on mobile.
                        */}
                        {/* Desktop view - vertical scroll animation, 2 columns */}
                        <div className="hidden md:flex absolute inset-0 pt-10 pb-10 justify-end h-[200%] w-full">
                            <div className="flex gap-4 w-full h-full animate-slide-vertical">
                                {/* Left Column (moves natively) */}
                                <div className="flex flex-col gap-4 w-1/2 h-full">
                                    {[
                                        { img: "/images/Titan tube.png", name: "Astera Titan Tube" },
                                        { img: "/images/DJM A9.png", name: "Pioneer DJM-A9" },
                                        { img: "/images/cdj 3000.png", name: "Pioneer CDJ-3000" },
                                        { img: "/images/xdj az.webp", name: "AlphaTheta XDJ-AZ" },
                                        { img: "/images/AX1.webp", name: "Astera AX1 Tube" },
                                        // Duplicated for the infinite loop logic
                                        { img: "/images/Titan tube.png", name: "Astera Titan Tube" },
                                        { img: "/images/DJM A9.png", name: "Pioneer DJM-A9" },
                                        { img: "/images/cdj 3000.png", name: "Pioneer CDJ-3000" },
                                        { img: "/images/xdj az.webp", name: "AlphaTheta XDJ-AZ" },
                                        { img: "/images/AX1.webp", name: "Astera AX1 Tube" },
                                    ].map((item, idx) => (
                                        <div key={`left-${idx}`} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center shrink-0 w-full aspect-square relative group">
                                            <div className="w-full h-full flex items-center justify-center">
                                                <img src={item.img} alt={item.name} className="max-h-[80%] max-w-[80%] object-contain group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Right Column (staggered slightly by shifting content via margin, moves natively) */}
                                <div className="flex flex-col gap-4 w-1/2 h-full mt-12">
                                    {[
                                        { img: "/images/cdj 3000.png", name: "Pioneer CDJ-3000" },
                                        { img: "/images/xdj az.webp", name: "AlphaTheta XDJ-AZ" },
                                        { img: "/images/AX1.webp", name: "Astera AX1 Tube" },
                                        { img: "/images/Titan tube.png", name: "Astera Titan Tube" },
                                        { img: "/images/DJM A9.png", name: "Pioneer DJM-A9" },
                                        { img: "/images/cdj 3000.png", name: "Pioneer CDJ-3000" },
                                        { img: "/images/xdj az.webp", name: "AlphaTheta XDJ-AZ" },
                                        { img: "/images/AX1.webp", name: "Astera AX1 Tube" },
                                        { img: "/images/Titan tube.png", name: "Astera Titan Tube" },
                                        { img: "/images/DJM A9.png", name: "Pioneer DJM-A9" },
                                    ].map((item, idx) => (
                                        <div key={`right-${idx}`} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center shrink-0 w-full aspect-square relative group">
                                            <div className="w-full h-full flex items-center justify-center">
                                                <img src={item.img} alt={item.name} className="max-h-[80%] max-w-[80%] object-contain group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile view - horizontal scroll animation */}
                        <div className="flex md:hidden w-[200%] h-full gap-4 items-center animate-slide-horizontal mask-image-x">
                            {/* First Set */}
                            {[
                                { img: "/images/Titan tube.png", name: "Astera" },
                                { img: "/images/DJM A9.png", name: "DJM" },
                                { img: "/images/cdj 3000.png", name: "CDJ" },
                                { img: "/images/xdj az.webp", name: "XDJ" },
                                { img: "/images/AX1.webp", name: "AX1" },
                                { img: "/images/Titan tube.png", name: "Astera2" },
                                { img: "/images/DJM A9.png", name: "DJM2" },
                            ].map((item, idx) => (
                                <div key={`m1-${idx}`} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 shrink-0 w-64 h-64 flex items-center justify-center group relative">
                                    <img src={item.img} alt={item.name} className="max-h-[80%] max-w-[80%] object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Astera Campaign Section */}
            <section className="py-32 px-6 bg-white overflow-hidden astera-section">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-24">

                        {/* Left: Product Image */}
                        <div className="w-full md:w-1/2 relative group">
                            {/* Subtle animated background glow behind tubes */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 opacity-10 rounded-[3rem] blur-3xl group-hover:opacity-20 transition-opacity duration-1000"></div>

                            <div className="relative bg-[#F9F7F5] rounded-[3rem] p-12 aspect-[4/5] md:aspect-square flex items-center justify-center border border-slate-100 shadow-sm">
                                {/* Use-case tags floating around */}
                                <div className="absolute top-10 left-10 flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded border border-white/60 shadow-sm scroll-badge scroll-badge-1 group-hover:scale-105 group-hover:bg-white/60 transition-all duration-500">
                                    <span className="w-1 h-1 rounded-full bg-[#123A2F]"></span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#123A2F]">Commercial</span>
                                </div>

                                <div className="absolute top-1/2 -left-6 flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded border border-white/60 shadow-sm scroll-badge scroll-badge-2 group-hover:scale-105 group-hover:bg-white/60 transition-all duration-500 transform -translate-y-1/2">
                                    <span className="w-1 h-1 rounded-full bg-[#123A2F]"></span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#123A2F]">Portrait</span>
                                </div>

                                <div className="absolute bottom-12 right-10 flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded border border-white/60 shadow-sm scroll-badge scroll-badge-3 group-hover:scale-105 group-hover:bg-white/60 transition-all duration-500">
                                    <span className="w-1 h-1 rounded-full bg-[#123A2F]"></span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#123A2F]">Music Video</span>
                                </div>

                                <img
                                    src="/images/Titan tube.png"
                                    alt="Astera Titan Tubes Collection"
                                    className="max-h-[90%] w-auto object-contain transform group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>

                        {/* Right: Copy & CTAs */}
                        <div className="w-full md:w-1/2 flex flex-col items-start text-left">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-2 h-2 rounded-full bg-[#1F5C4B] animate-pulse"></span>
                                <span className="text-[#1F5C4B] text-[10px] font-bold uppercase tracking-[0.3em]">Industry-Leading Astera Inventory</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tighter leading-tight text-slate-900">
                                Cinematic Lighting for Photographers.
                            </h2>

                            <p className="text-lg md:text-xl text-slate-500 mb-10 font-medium leading-relaxed max-w-lg">
                                Position your next shoot for perfection with our extensive inventory of Astera Titan Tubes. The ultimate tool for studio precision and on-location flexibility.
                            </p>

                            <ul className="space-y-4 mb-12">
                                {[
                                    "100% Wireless DMX & CRMX Control",
                                    "Individually Pixel-Mapped Effects",
                                    "All-Day Battery Powered Operation",
                                    "Ultra High CRI/TLCI for flawless skin tones"
                                ].map((bullet, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                        <span className="material-symbols-outlined text-[#1F5C4B] text-xl">check_circle</span>
                                        {bullet}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                <Link
                                    href="/hire"
                                    className="w-full sm:w-auto px-8 py-4 text-white font-bold rounded uppercase tracking-widest hover:-translate-y-1 transition-transform bg-[#123A2F] shadow-lg shadow-[#123A2F]/20 text-sm text-center"
                                >
                                    Hire Astera Titan Tubes
                                </Link>
                                <Link
                                    href="/packages"
                                    className="w-full sm:w-auto px-8 py-4 text-slate-700 font-bold rounded uppercase tracking-widest border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm text-center"
                                >
                                    See Lighting Packages
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Service Pathways: Dry Hire vs Production */}
            <section className="py-32 px-6 bg-slate-50">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                    <div className="text-center mb-20">
                        <span className="text-[#1F5C4B] text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">How Can We Help?</span>
                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter uppercase text-slate-900">Two ways to work with Blanc.</h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-lg">
                            Whether you need industry-standard equipment for your crew, or a full technical team to deliver your vision, we have the infrastructure to support you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                        {/* Pathway 1: Dry Hire */}
                        <div className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-[#123A2F]/30 hover:shadow-xl transition-all duration-500">
                            <div className="h-64 sm:h-80 w-full overflow-hidden relative">
                                <div className="absolute inset-0 bg-[#123A2F]/10 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxqVUFiSuTHi2cC86wZRXa2Yt-LDHCsEWAi6jIBvqKneSa1dmJTAy1mpDpU7HCdeYhBneOs5kwrryAA3K6ONvLYSc_VzoOJUfXQ0dYE0bJAcQRiXuibWtt6ZQMo75dCvKKsQJ6qqGS14AY6bTIdH1YZ69SNaPxv_ZE-wUX_ARNNUMlrtfUf_X1qBUYxrBmjHsbFYv6GMerokxIg0x5p0iX-Z-T0m9dZzFHpkOnYGCIqjtjHXKWEYfILOxRpZqa3LiczUh7TLc9PWhy"
                                    alt="Dry Hire Warehouse"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#1F5C4B] text-sm">inventory_2</span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#123A2F]">For Crews & Techs</span>
                                </div>
                            </div>
                            <div className="p-10 md:p-12">
                                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Dry Hire Specialist.</h3>
                                <p className="text-slate-500 mb-8 leading-relaxed">
                                    Immaculately maintained, firmware-updated, and tour-ready equipment. We prep the gear so you can focus on the gig. Rapid quoting, transparent availability, and Manchester depot collection or direct delivery.
                                </p>
                                <ul className="space-y-3 mb-10 border-t border-slate-100 pt-8">
                                    <li className="flex items-center gap-3 text-sm font-semibold text-slate-700"><span className="material-symbols-outlined text-[#1F5C4B] text-lg">bolt</span> 100% Pre-prepped & Tested</li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-slate-700"><span className="material-symbols-outlined text-[#1F5C4B] text-lg">gpp_good</span> Insurance Included as Standard</li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-slate-700"><span className="material-symbols-outlined text-[#1F5C4B] text-lg">pallet</span> Custom Flightcased Packages</li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-slate-700"><span className="material-symbols-outlined text-[#1F5C4B] text-lg">support_agent</span> Dedicated Hire Manager</li>
                                </ul>
                                <Link href="/hire" className="inline-flex items-center gap-2 text-[#123A2F] font-bold uppercase tracking-widest text-sm group-hover:gap-4 transition-all">
                                    Browse Equipment <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                            </div>
                        </div>

                        {/* Pathway 2: Boutique Production */}
                        <div className="group relative bg-[#123A2F] rounded-3xl overflow-hidden shadow-xl hover:-translate-y-1 transition-transform duration-500">
                            <div className="h-64 sm:h-80 w-full overflow-hidden relative">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB02DWxclk8JZizOOjzvEE2Pzi_qaBdYASuJ0gCvzKJjFcRChSVvs5puMyvbXoC2qm5PLFcTR1vb4YCVL5n-WQauwIEoajZJjhZgJI8PJYdaSYUepWVtNaQM2wYXbwjggtxux__SzEH9rDjFpl74qPlTRDG17TvCLkFM6k-FtSQrl26y270PdxDdmbVuJ8xQpw3xoubB9N9vW3CwuL7w2h0ImTlABQuKItFQmwDZxNU857O1hqwsmBYj_ebw89l_aU5wDDupcRhFysp"
                                    alt="Intimate Boutique Event Production"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-6 left-6 z-20 bg-[#0B241D]/90 backdrop-blur border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#F97316] text-sm">stars</span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-white">Planners & Brands</span>
                                </div>
                            </div>
                            <div className="p-10 md:p-12 text-white">
                                <h3 className="text-3xl font-black mb-4 tracking-tight">Boutique Production.</h3>
                                <p className="text-white/70 mb-8 leading-relaxed">
                                    Premium, focused technical delivery for corporate events, private parties, and meaningful occasions. We specialize in impeccable execution, curated atmospheres, and stress-free personal service.
                                </p>
                                <ul className="space-y-3 mb-10 border-t border-white/10 pt-8">
                                    <li className="flex items-center gap-3 text-sm font-semibold text-white/90"><span className="material-symbols-outlined text-[#F97316] text-lg">edit</span> Curated Lighting & Sound</li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-white/90"><span className="material-symbols-outlined text-[#F97316] text-lg">handshake</span> Personalised Direct Communication</li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-white/90"><span className="material-symbols-outlined text-[#F97316] text-lg">done_all</span> Reliable, Flawless Execution</li>
                                </ul>
                                <Link href="/services" className="inline-flex items-center gap-2 text-white font-bold uppercase tracking-widest text-sm group-hover:gap-4 transition-all">
                                    View Production Services <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Portfolio Gallery */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-black mb-16 tracking-tighter uppercase text-center md:text-left">The Portfolio</h2>
                    <div className="hidden md:grid bento-grid">
                        <div className="col-span-2 row-span-2 rounded-xl overflow-hidden bg-white/5 group">
                            <img alt="Concert main stage" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgglQg9y0LTTLFBuq7T3wlEi88Vxi3F6w8BxW_gc9VZEVaEMAzXr0zwTIGI1Z9FbKEwTGtB6NjIsfngbAds67XlYQTM9L7ECvWYYuAoyK3Lyb9ek0jWxPUpaQzIHBwhSp8ZGkSMdy632dk3PXdZcIDiP69HyFjDpSpjmhGZTzXQpP78mzYjtCLvaR-1TYm75Bc4NfetLE7CLuDWw290VJ7fb6Tsiv3puv6vnYFdHB9C8x1zJBreMbejOsY3QKOBnhSvOZocNqkrwKJ" />
                        </div>
                        <div className="col-span-1 rounded-xl overflow-hidden bg-white/5 group">
                            <img alt="Warehouse event" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB02DWxclk8JZizOOjzvEE2Pzi_qaBdYASuJ0gCvzKJjFcRChSVvs5puMyvbXoC2qm5PLFcTR1vb4YCVL5n-WQauwIEoajZJjhZgJI8PJYdaSYUepWVtNaQM2wYXbwjggtxux__SzEH9rDjFpl74qPlTRDG17TvCLkFM6k-FtSQrl26y270PdxDdmbVuJ8xQpw3xoubB9N9vW3CwuL7w2h0ImTlABQuKItFQmwDZxNU857O1hqwsmBYj_ebw89l_aU5wDDupcRhFysp" />
                        </div>
                        <div className="col-span-1 rounded-xl overflow-hidden bg-white/5 group">
                            <img alt="Crowd silhouettes" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRAsN3A0sOv3QL-i7iDklWn--Y-xVtKVayROk_mJrioHa80sRQhZh5NSgekDnGuZWPxMZZzGddFKBnydKfdhIsKNyC9atecF1KFUSsk4nbEWTE2QfU_dK68orFJ7JDRBg2gNL8APCfJnSIbkMAexr9j7QbvzW75boGxJpxhoq3dVOagmYIehWWVU0X7tSrG2KVGsS-TlvWQ7g9rLszevGEIgpeiXAATQN7KwVLJWwjQIUML52ugiqYE82lyYq1QjmBR0uugxgwIMe3" />
                        </div>
                        <div className="col-span-2 rounded-xl overflow-hidden bg-white/5 group">
                            <img alt="Corporate AV setup" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxqVUFiSuTHi2cC86wZRXa2Yt-LDHCsEWAi6jIBvqKneSa1dmJTAy1mpDpU7HCdeYhBneOs5kwrryAA3K6ONvLYSc_VzoOJUfXQ0dYE0bJAcQRiXuibWtt6ZQMo75dCvKKsQJ6qqGS14AY6bTIdH1YZ69SNaPxv_ZE-wUX_ARNNUMlrtfUf_X1qBUYxrBmjHsbFYv6GMerokxIg0x5p0iX-Z-T0m9dZzFHpkOnYGCIqjtjHXKWEYfILOxRpZqa3LiczUh7TLc9PWhy" />
                        </div>
                    </div>
                    <div className="grid md:hidden grid-cols-1 gap-4">
                        <div className="h-64 rounded-xl overflow-hidden">
                            <img alt="Concert stage" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX_wkHdirPSmuHmvlMkz8bKDomHPRemjVugYPpvZCPNmqh5D5WuLT9Rm_MovLlaEY314tESZ1PGUucVIVHDERl1Ju6xYXeUZJCJ5LjlDG5FVhy8fp9_nr5MmM6rNLd5jzC6pI09h9e_X6A88peEV0-ImLmvklCyU6yR50aAEIv_S3RhFZ_S_sr_Omf-BFAg2aIJUMMMu9eyEjU1QPeav7PC7IPloJzbh1NrBPYRaxuY66264KG_Vy2vBOIY3H0Lmiz2fMbII4oYIPd" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <Testimonials />

            {/* How It Works */}
            <section className="py-32 px-6">
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
                            <div key={s.step} className="relative p-8 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-slate-100 last:border-r-0">
                                <div className="w-16 h-16 bg-[#1F5C4B]/10 border border-[#1F5C4B]/20 rounded-full flex items-center justify-center mb-8 relative">
                                    <span className="material-symbols-outlined text-[#1F5C4B] text-3xl">{s.icon}</span>
                                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#123A2F] flex items-center justify-center text-xs font-bold text-white">{s.step}</span>
                                </div>
                                <h4 className="text-lg font-bold mb-4 uppercase tracking-widest">{s.title}</h4>
                                <p className="text-slate-400 text-sm">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden px-10 py-20 text-center bg-[#123A2F]">
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase leading-none">
                                Ready to transform <br /> your next event?
                            </h2>
                            <p className="text-white/80 text-lg mb-12 max-w-xl mx-auto">
                                From intimate launches to arena spectacles, we provide the technical edge you need.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link href="/hire" className="w-full sm:w-auto px-12 py-6 bg-white text-[#1F5C4B] font-black rounded uppercase tracking-widest hover:scale-105 transition-transform">
                                    Start Your Hire
                                </Link>
                                <a className="text-white font-bold flex items-center gap-2 hover:underline" href="tel:01610000000">
                                    <span className="material-symbols-outlined">call</span> 0161 000 0000
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}

// Fallback data when DB is empty
const defaultEquipment = [
    { id: "1", name: "Astera Titan Tubes", slug: "astera-titan-tubes", category: "Lighting", brand: "Astera", dayRate: 45, contactForPrice: false, description: "Wireless film & event lighting with unmatched color rendering and control.", images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuAVtiqbYLiI9UFS2tsI4ujiF_4h1tF3GXnziTOqMQVVJs9DNrXT2x86guylnawOXDkbDzGqwLrurezH7oasgYU8HFpNjLhDbRt55h4e9skw6GBvOcrG9wVFOjsDIeLNI0-1BjCDSJpgtfqsmeGSBa6zcEPzvELLm-K3vj0Te3uoTTGN7DKNGNpj8Daoo2GKsa-lg1Z9u4NPzSdDl8ylzorDrapSUJmzuSsgqmZ04DZSB-DEfGEJLPIN5rF8cgl6L9C_2udjNZbS8mby"] },
    { id: "2", name: "Pioneer CDJ-3000 Set", slug: "pioneer-cdj-3000", category: "Backline", brand: "Pioneer", dayRate: 120, contactForPrice: false, description: "The global industry standard for professional DJ performances.", images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCcrRuxmxSJxAiu2x5pao9vzaT-yYJ1B3EyGbg_S9cBEmkiHUXCQWMRVFYbQt1YOaI8TUZlHy7K2HR4n50wWTge-VxFhJBWIGGtuSFWkGSVHEBgTz867W5zsx1R3Z-2LjGDd2MICZRz_oxbXJpyfOgAe6uVcPJYUTsFjSy7YJVzCbSfAzSmJa71Hvt3tQVjo7A_QdX7QOC2nDVu9lLt23kJcXcAHdyRH7sIpwGQGJlfCID7WRM1TR65-tXoli_KnwrOUp0B9PRbuBQm"] },
    { id: "3", name: "D&B Audiotechnik V-Series", slug: "db-v-series", category: "Audio", brand: "D&B Audiotechnik", dayRate: 0, contactForPrice: true, description: "High-performance line array systems for crystal clear stadium sound.", images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuD1-v74JKesBPyP-pZl6dXx8HMyf1guiyrIBBIB3YWLh38HlqVvrYYf6oCbKMsOWUlGtwf3ZrmTQye0WMW860qUz9NO6fUpvpGUscrU19sKcvnoL9PQJlDStZnsy43J5kORWBGIgCHgTY0PNjwfUQoV-EobCLoKLgxai_HghdQCCXkIIUZ3pSPAfWIJ-KCbAwwcmReCplSBT0EDOpGAdP6ORfwyAXnZ6nGmAnVMgBjOwgGBCP0fG0Uz0-CV4hdYRPJapk3Ur5StONF5"] },
];

const defaultPackages = [
    { id: "1", name: "Vinyl Enthusiast Kit", slug: "vinyl-kit", description: "Includes 2x Technics SL-1210 MK7, Pioneer V10 Mixer, and D&B Monitoring.", dayRate: 350, images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuAVLqfRfWPVHq-e-LgN6PThu-tC0OfQEFcigwhEEPZ9yWgLeO0SCYvaelBtHec7RGax4Ab_DlOyEweT4GOBu5vOWbQjgimzg8reexxuBd5fkLo3ZRAgQwDTDFsjJGshs8pMyCmFjBiA0o8yHuqoRE4XUeLkJbcBjQIK5ydZyoCWUO3alKveOLy-DhEhdUBGnSw4mo7bQ4jwRT29JwM7QYkC4LiJI4TM8yRqP_X1_hxUHu4eWLSuT8Qzov6X4Z3yf1ckrd-XJuGbM6Wk"] },
    { id: "2", name: "Corporate Excellence Pack", slug: "corporate-excellence", description: "Uplighting, 4K Projection systems, wireless mics, and dedicated AV tech.", dayRate: 750, images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuC85scKze55zEIFKGAO8i_hjM4sSqe51HSvuc5kIKkRYxwrYnXxztcH12R8Qffue54drPwz5v7QTJd2CRIB8Gg8pjpoit2Re2l0mSNbQE498WQBqGwHUUbyBf64EFu3fGyNbnT21oAm8HOW_4gMFYmU11QmOvHpzFsfuvdOuE_ceUlDioB2z4mn7sHOVaBMZwo6-wQk1bE78uodUWoLyzkKIpzDpeNfFdNeTfGAH20aWqOhi1pFFBiXhnv-LKT_LT9L28_MxMPpURPn"] },
];
