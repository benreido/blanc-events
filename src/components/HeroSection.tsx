"use client";

import { motion } from "framer-motion";
import { STAGGER_CONTAINER, FADE_UP } from "./AnimatedSection";
import MotionLink from "./MotionLink";
import Image from "next/image";

export default function HeroSection() {
    const scrollToEnquiry = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const el = document.getElementById("enquiry");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:h-screen md:min-h-[800px] flex items-center bg-[#F9F7F5] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F9F7F5] to-[#F0EBE6] z-0"></div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full relative z-10 h-full flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">

                {/* Left Column: Text + CTA */}
                <motion.div
                    variants={STAGGER_CONTAINER}
                    initial="hidden"
                    animate="show"
                    className="w-full md:w-1/2 flex flex-col items-start text-left mt-8 md:mt-0"
                >
                    {/* Trust Badge */}
                    <motion.div variants={FADE_UP} className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-full border border-[#1F5C4B]/20 mb-6">
                        <span className="text-[11px] font-medium text-[#1F5C4B] tracking-[0.08em]">Event production &amp; equipment hire — Manchester</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1 variants={FADE_UP} className="text-[3rem] sm:text-6xl lg:text-[5rem] font-black mb-6 tracking-tighter leading-[0.95] text-slate-800">
                        Kit for your<br /> next event?<br /> Keep it <span className="text-[#1F5C4B]">Blanc.</span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p variants={FADE_UP} className="text-lg md:text-xl text-slate-600 max-w-md mb-10 font-medium leading-relaxed">
                        Lighting, sound, and DJ backline for events that demand more. Full production or dry hire — Manchester and beyond.
                    </motion.p>

                    {/* Buttons */}
                    <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <MotionLink
                            href="#enquiry"
                            onClick={scrollToEnquiry}
                            className="w-full sm:w-auto px-8 py-4 text-white font-semibold rounded-lg tracking-tight bg-[#123A2F] shadow-brand-sm text-sm text-center"
                        >
                            Plan your event
                        </MotionLink>
                        <MotionLink
                            href="/hire"
                            className="w-full sm:w-auto px-8 py-4 bg-white/50 text-slate-800 font-medium border border-slate-200 shadow-sm rounded-lg tracking-tight transition-all text-sm text-center"
                        >
                            Browse equipment
                        </MotionLink>
                    </motion.div>

                    {/* Audience doors */}
                    <motion.div variants={FADE_UP} className="mt-10 w-full sm:w-auto">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-3">I&apos;m planning…</span>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {[
                                { label: "A wedding", href: "/weddings" },
                                { label: "A corporate event", href: "/corporate" },
                                { label: "Trade dry hire", href: "/hire" },
                            ].map((door) => (
                                <a
                                    key={door.href}
                                    href={door.href}
                                    className="group flex items-center justify-between sm:justify-start gap-2 px-5 py-3 bg-white/70 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:border-[#1F5C4B] hover:text-[#1F5C4B] transition-colors"
                                >
                                    {door.label}
                                    <span className="text-[#1F5C4B] group-hover:translate-x-0.5 transition-transform">→</span>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Column: Sliding Grid */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                    className="w-full md:w-1/2 h-[500px] md:h-full relative overflow-hidden mask-image-y"
                >
                    {/* Desktop view - vertical scroll animation, 2 columns */}
                    <div className="hidden md:flex absolute inset-0 pt-10 pb-10 justify-end w-full mask-image-y">
                        <div className="grid grid-cols-2 gap-4 w-full h-[max-content] animate-slide-vertical">

                            {/* Left Column */}
                            <div className="flex flex-col gap-4">
                                {[...Array(2)].map((_, loopIdx) => (
                                    <div key={`left-loop-${loopIdx}`} className="flex flex-col gap-4">
                                        {[
                                            { img: "/images/Titan tube.png", name: "Astera Titan Tube" },
                                            { img: "/images/DJM A9.png", name: "Pioneer DJM-A9" },
                                            { img: "/images/AX1.webp", name: "Astera AX1 Tube" },
                                            { img: "/images/cdj 3000.png", name: "Pioneer CDJ-3000" },
                                            { img: "/images/Titan tube.png", name: "Astera Titan Tube" },
                                        ].map((item, idx) => (
                                            <motion.div
                                                key={`left-${loopIdx}-${idx}`}
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 3.5 + idx * 0.3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.4 }}
                                                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center shrink-0 w-full aspect-square relative group"
                                            >
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Image src={item.img} alt={item.name} width={400} height={400} className="max-h-[80%] max-w-[80%] w-auto h-auto object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-4 mt-16">
                                {[...Array(2)].map((_, loopIdx) => (
                                    <div key={`right-loop-${loopIdx}`} className="flex flex-col gap-4">
                                        {[
                                            { img: "/images/cdj 3000.png", name: "Pioneer CDJ-3000" },
                                            { img: "/images/AX1.webp", name: "Astera AX1 Tube" },
                                            { img: "/images/xdj az.webp", name: "AlphaTheta XDJ-AZ" },
                                            { img: "/images/Titan tube.png", name: "Astera Titan Tube" },
                                            { img: "/images/DJM A9.png", name: "Pioneer DJM-A9" },
                                        ].map((item, idx) => (
                                            <motion.div
                                                key={`right-${loopIdx}-${idx}`}
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 3.5 + idx * 0.3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.4 + 0.2 }}
                                                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center shrink-0 w-full aspect-square relative group"
                                            >
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Image src={item.img} alt={item.name} width={400} height={400} className="max-h-[80%] max-w-[80%] w-auto h-auto object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                    {/* Mobile view - horizontal scroll animation */}
                    <div className="flex md:hidden w-[max-content] h-full gap-4 items-center animate-slide-horizontal mask-image-x">
                        {[...Array(2)].map((_, loopIdx) => (
                            <div key={`mobile-loop-${loopIdx}`} className="flex gap-4 items-center">
                                {[
                                    { img: "/images/Titan tube.png", name: "Titan Tube" },
                                    { img: "/images/DJM A9.png", name: "DJM-A9" },
                                    { img: "/images/AX1.webp", name: "AX1 Tube" },
                                    { img: "/images/cdj 3000.png", name: "CDJ-3000" },
                                    { img: "/images/xdj az.webp", name: "XDJ-AZ" },
                                ].map((item, idx) => (
                                    <div key={`m1-${loopIdx}-${idx}`} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 shrink-0 w-64 h-64 flex items-center justify-center group relative">
                                        <Image src={item.img} alt={item.name} width={300} height={300} className="max-h-[80%] max-w-[80%] w-auto h-auto object-contain" />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
