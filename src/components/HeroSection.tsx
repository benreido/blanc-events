"use client";

import { motion } from "framer-motion";
import { STAGGER_CONTAINER, FADE_UP } from "./AnimatedSection";
import MotionLink from "./MotionLink";

export default function HeroSection() {
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
                    {/* Trust Badge / Eyebrow */}
                    <motion.div variants={FADE_UP} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 mb-6">
                        <span className="material-symbols-outlined text-yellow-500 text-sm drop-shadow-sm">star</span>
                        <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">Trusted Production Partner</span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1 variants={FADE_UP} className="text-[3rem] sm:text-6xl lg:text-[5rem] font-black mb-6 tracking-tighter leading-[0.95] text-slate-800">
                        Premium AV &<br /> Event Production<br /> Hire.
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p variants={FADE_UP} className="text-lg md:text-xl text-slate-600 max-w-md mb-10 font-medium leading-relaxed">
                        Elevating events with industry-leading Astera lighting, professional backline, and bespoke production solutions for Manchester&apos;s most ambitious stages.
                    </motion.p>

                    {/* Buttons */}
                    <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <MotionLink
                            href="/contact"
                            className="w-full sm:w-auto px-8 py-4 text-white font-bold rounded-xl uppercase tracking-widest bg-[#123A2F] shadow-brand-sm text-sm text-center"
                        >
                            Get a Quote
                        </MotionLink>
                        <MotionLink
                            href="/hire"
                            className="w-full sm:w-auto px-8 py-4 bg-white/50 text-slate-800 font-bold border border-slate-200 shadow-sm rounded-xl uppercase tracking-widest transition-all text-sm text-center"
                        >
                            Browse Equipment
                        </MotionLink>
                    </motion.div>
                </motion.div>

                {/* Right Column: Sliding Grid - Fade In Globally */}
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
                                {/* Array repeated exactly twice for a perfect 50% scroll loop */}
                                {[...Array(2)].map((_, loopIdx) => (
                                    <div key={`left-loop-${loopIdx}`} className="flex flex-col gap-4">
                                        {[
                                            { img: "/images/Titan tube.png", name: "Astera Titan Tube" },
                                            { img: "/images/DJM A9.png", name: "Pioneer DJM-A9" },
                                            { img: "/images/cdj 3000.png", name: "Pioneer CDJ-3000" },
                                            { img: "/images/xdj az.webp", name: "AlphaTheta XDJ-AZ" },
                                            { img: "/images/AX1.webp", name: "Astera AX1 Tube" },
                                        ].map((item, idx) => (
                                            <div key={`left-${loopIdx}-${idx}`} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center shrink-0 w-full aspect-square relative group">
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <img src={item.img} alt={item.name} className="max-h-[80%] max-w-[80%] object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Right Column - Starting Offset but moving at same container speed */}
                            <div className="flex flex-col gap-4 mt-16">
                                {[...Array(2)].map((_, loopIdx) => (
                                    <div key={`right-loop-${loopIdx}`} className="flex flex-col gap-4">
                                        {[
                                            { img: "/images/cdj 3000.png", name: "Pioneer CDJ-3000" },
                                            { img: "/images/xdj az.webp", name: "AlphaTheta XDJ-AZ" },
                                            { img: "/images/AX1.webp", name: "Astera AX1 Tube" },
                                            { img: "/images/Titan tube.png", name: "Astera Titan Tube" },
                                            { img: "/images/DJM A9.png", name: "Pioneer DJM-A9" },
                                        ].map((item, idx) => (
                                            <div key={`right-${loopIdx}-${idx}`} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center shrink-0 w-full aspect-square relative group">
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <img src={item.img} alt={item.name} className="max-h-[80%] max-w-[80%] object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                </div>
                                            </div>
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
                                    { img: "/images/Titan tube.png", name: "Astera" },
                                    { img: "/images/DJM A9.png", name: "DJM" },
                                    { img: "/images/cdj 3000.png", name: "CDJ" },
                                    { img: "/images/xdj az.webp", name: "XDJ" },
                                    { img: "/images/AX1.webp", name: "AX1" },
                                ].map((item, idx) => (
                                    <div key={`m1-${loopIdx}-${idx}`} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 shrink-0 w-64 h-64 flex items-center justify-center group relative">
                                        <img src={item.img} alt={item.name} className="max-h-[80%] max-w-[80%] object-contain" />
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
