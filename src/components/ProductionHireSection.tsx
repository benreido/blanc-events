"use client";

import { motion, useReducedMotion } from "framer-motion";
import MotionLink from "@/components/MotionLink";
import { Lightbulb, Music2, Speaker, Wrench, ArrowRight } from "lucide-react";

const categories: { title: string; description: string; icon: typeof Lightbulb; href: string; cta?: string }[] = [
    {
        title: "Lighting hire",
        description: "Astera Titan Tubes, AX1s, wireless uplighting and moving heads.",
        icon: Lightbulb,
        href: "/hire?category=Lighting",
    },
    {
        title: "DJ equipment",
        description: "Pioneer CDJ-3000s, DJM-A9, AlphaTheta XDJ-AZ and more.",
        icon: Music2,
        href: `/hire?category=${encodeURIComponent("DJ & Playback")}`,
    },
    {
        title: "Audio systems",
        description: "PA systems, monitors and subwoofers — specced and quoted per event.",
        icon: Speaker,
        href: "/contact?service=Audio%20Systems",
        cta: "Enquire",
    },
    {
        title: "Technicians",
        description: "Experienced AV technicians for setup, operation and de-rig.",
        icon: Wrench,
        href: "/contact?service=Technician",
        cta: "Enquire",
    },
];

export default function ProductionHireSection() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className="py-32 px-6 bg-white overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                    className="text-center mb-20"
                >
                    <span className="text-[#1F5C4B]/70 text-[11px] font-medium tracking-[0.12em] block mb-4">For professionals</span>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900">Production &amp; dry hire</h2>
                    <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">
                        Professional lighting, audio and DJ backline for technicians, production companies and creative studios.
                    </p>
                </motion.div>

                {/* 2×2 bordered grid */}
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-10%" }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-slate-100 rounded-2xl overflow-hidden mb-16"
                >
                    {categories.map((cat, idx) => {
                        const Icon = cat.icon;
                        const isRightCol = idx % 2 === 0;
                        const isLastRow = idx >= categories.length - 2;
                        return (
                            <motion.a
                                key={cat.title}
                                href={cat.href}
                                variants={{
                                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
                                    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
                                }}
                                className={[
                                    "group p-10 hover:bg-slate-50/60 transition-colors duration-300",
                                    isRightCol ? "sm:border-r border-slate-100" : "",
                                    !isLastRow ? "border-b border-slate-100" : "",
                                ].join(" ")}
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#1F5C4B]/8 flex items-center justify-center mb-6 group-hover:bg-[#1F5C4B]/15 transition-colors duration-300">
                                    <Icon size={20} strokeWidth={1.5} className="text-[#1F5C4B]" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">{cat.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-5">{cat.description}</p>
                                <span className="inline-flex items-center gap-1.5 text-[#1F5C4B] font-semibold text-sm tracking-tight">
                                    {cat.cta ?? "Browse"}
                                    <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </motion.a>
                        );
                    })}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                    className="text-center"
                >
                    <MotionLink
                        href="/hire"
                        className="inline-flex items-center justify-center px-10 py-4 bg-[#123A2F] text-white font-semibold rounded-lg tracking-tight text-sm shadow-brand-sm"
                    >
                        Browse hire stock
                    </MotionLink>
                </motion.div>

            </div>
        </section>
    );
}
