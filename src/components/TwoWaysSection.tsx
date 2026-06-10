"use client";

import { motion, useReducedMotion } from "framer-motion";
import MotionLink from "@/components/MotionLink";
import Image from "next/image";

/**
 * Premium "Two Ways to Work with Blanc" Section
 * Implements smooth, staggered entrance animations and hover micro-interactions
 * using hardware-accelerated transforms and respect for reduced-motion preferences.
 */
export default function TwoWaysSection() {
    const shouldReduceMotion = useReducedMotion();

    // Animation Configuration
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15, // Staggered Reveal (150ms delay between cards)
                delayChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : 24, // Subtle vertical offset (24px)
        },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6, // 600ms duration
                ease: [0.22, 1, 0.36, 1] as const, // Premium ease-out-expo
            },
        },
    };

    return (
        <section className="py-32 px-6 bg-[#F9F7F5] overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">

                {/* Section Header (Fades in first) */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                    className="text-center mb-20"
                >
                    <span className="text-[#1F5C4B] text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">How Can We Help?</span>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter uppercase text-slate-900">Two ways to work with Blanc.</h2>
                    <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">
                        Whether you need industry-standard equipment for your crew, or a full technical team to deliver your vision, we have the infrastructure to support you.
                    </p>
                </motion.div>

                {/* Staggered Cards Container */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-10%" }} // Trigger once on scroll
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
                >

                    {/* Pathway 1: Dry Hire */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={shouldReduceMotion ? {} : {
                            y: -4,
                            boxShadow: "0 20px 40px -15px rgba(31,92,75,0.15)"
                        }}
                        transition={{ duration: 0.2 }} // Fast hover interaction
                        className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-200/60 shadow-sm flex flex-col will-change-transform"
                    >
                        <div className="h-64 sm:h-80 w-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-[#123A2F]/10 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                            <Image
                                src="/images/twoways-production.jpg"
                                alt="Dry Hire Warehouse"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-brand-sm">
                                <span className="material-symbols-outlined text-[#1F5C4B] text-sm">inventory_2</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#123A2F]">For Crews & Techs</span>
                            </div>
                        </div>
                        <div className="p-10 md:p-12 flex-1 flex flex-col">
                            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Dry Hire Specialist.</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Immaculately maintained, firmware-updated, and tour-ready equipment. We prep the gear so you can focus on the gig. Rapid quoting, transparent availability, and Manchester depot collection or direct delivery.
                            </p>
                            <div className="mt-auto">
                                <hr className="border-slate-100 mb-8" />
                                <ul className="space-y-4 mb-10">
                                    <li className="flex items-center gap-3 text-sm font-semibold text-slate-700"><span className="material-symbols-outlined text-[#1F5C4B] text-lg">bolt</span> 100% Pre-prepped & Tested</li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-slate-700"><span className="material-symbols-outlined text-[#1F5C4B] text-lg">gpp_good</span> Insurance Included as Standard</li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-slate-700"><span className="material-symbols-outlined text-[#1F5C4B] text-lg">pallet</span> Custom Flightcased Packages</li>
                                </ul>
                                <MotionLink href="/hire" className="inline-flex items-center justify-center w-full py-4 rounded-xl bg-slate-50 text-[#123A2F] border border-slate-200 font-bold uppercase tracking-widest text-sm shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)] transition-all">
                                    Browse Equipment
                                </MotionLink>
                            </div>
                        </div>
                    </motion.div>

                    {/* Pathway 2: Boutique Production */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={shouldReduceMotion ? {} : {
                            y: -4,
                            boxShadow: "0 24px 50px -12px rgba(18,58,47,0.5)"
                        }}
                        transition={{ duration: 0.2 }} // Fast hover interaction
                        className="group relative bg-[#123A2F] rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col will-change-transform"
                    >
                        <div className="h-64 sm:h-80 w-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                            <Image
                                src="/images/twoways-dryhire.jpg"
                                alt="Intimate Boutique Event Production"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute top-6 left-6 z-20 bg-[#0B241D]/90 backdrop-blur border border-white/10 px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg">
                                <span className="material-symbols-outlined text-[#F97316] text-sm">stars</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-white">Planners & Brands</span>
                            </div>
                        </div>
                        <div className="p-10 md:p-12 text-white flex-1 flex flex-col">
                            <h3 className="text-3xl font-black mb-4 tracking-tight">Boutique Production.</h3>
                            <p className="text-white/80 mb-8 leading-relaxed">
                                Premium, focused technical delivery for corporate events, private parties, and meaningful occasions. We specialize in impeccable execution, curated atmospheres, and stress-free personal service.
                            </p>
                            <div className="mt-auto">
                                <hr className="border-white/10 mb-8" />
                                <ul className="space-y-4 mb-10">
                                    <li className="flex items-center gap-3 text-sm font-semibold text-white/90"><span className="material-symbols-outlined text-[#F97316] text-lg">edit</span> Curated Lighting & Sound</li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-white/90"><span className="material-symbols-outlined text-[#F97316] text-lg">handshake</span> Personalised Direct Communication</li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-white/90"><span className="material-symbols-outlined text-[#F97316] text-lg">done_all</span> Reliable, Flawless Execution</li>
                                </ul>
                                <MotionLink href="/services" className="inline-flex items-center justify-center w-full py-4 rounded-xl bg-[#0B241D] text-white border border-white/10 font-bold uppercase tracking-widest text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all">
                                    View Production Services
                                </MotionLink>
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    );
}
