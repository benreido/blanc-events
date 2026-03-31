"use client";

import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import MotionLink from "@/components/MotionLink";
import { Lightbulb, Music2, Speaker } from "lucide-react";
import { useRef } from "react";

const nightlifeServices = [
    {
        title: "Nightclub lighting",
        description: "Immersive lighting installations for club environments and dance floors.",
        icon: Lightbulb,
    },
    {
        title: "DJ backline",
        description: "Industry-standard Pioneer and AlphaTheta setups for DJs and touring artists.",
        icon: Music2,
    },
    {
        title: "Club sound systems",
        description: "Professional audio systems designed for high-energy nightlife environments.",
        icon: Speaker,
    },
];

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-100, 100], [3, -3]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-3, 3]), { stiffness: 300, damping: 30 });

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    }

    function handleMouseLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    return (
        <motion.div
            ref={ref}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function NightlifeSection() {
    const shouldReduceMotion = useReducedMotion();

    const cardVariants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
        },
    };

    const [featured, ...rest] = nightlifeServices;

    return (
        <section className="py-32 px-6 bg-[#0a0a0a] text-white overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">

                {/* Section Header — left-anchored editorial split */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
                >
                    <div>
                        <span className="text-emerald-400/70 text-[11px] font-medium tracking-[0.12em] block mb-3">
                            For clubs &amp; DJs
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.92]">
                            Nightlife
                        </h2>
                    </div>
                    <p className="text-white/50 max-w-xs text-sm leading-relaxed lg:text-right">
                        Lighting, sound and DJ backline for nightclubs, promoters and touring DJs.
                    </p>
                </motion.div>

                {/* Asymmetric grid: large card left, two stacked right */}
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-10%" }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
                    }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16"
                >
                    {/* Featured large card */}
                    <motion.div variants={cardVariants}>
                        {shouldReduceMotion ? (
                            <div className="group relative bg-white/[0.06] rounded-3xl border border-white/10 p-12 lg:p-16 h-full hover:bg-white/[0.09] transition-colors duration-500">
                                <featured.icon size={28} strokeWidth={1.5} className="text-emerald-400 mb-8" />
                                <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{featured.title}</h3>
                                <p className="text-white/50 leading-relaxed">{featured.description}</p>
                            </div>
                        ) : (
                            <TiltCard className="group relative bg-white/[0.06] rounded-3xl border border-white/10 p-12 lg:p-16 h-full hover:bg-white/[0.09] transition-colors duration-500 cursor-default">
                                <featured.icon size={28} strokeWidth={1.5} className="text-emerald-400 mb-8" />
                                <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{featured.title}</h3>
                                <p className="text-white/50 leading-relaxed">{featured.description}</p>
                            </TiltCard>
                        )}
                    </motion.div>

                    {/* Two stacked smaller cards */}
                    <div className="flex flex-col gap-6">
                        {rest.map((service) => (
                            <motion.div
                                key={service.title}
                                variants={cardVariants}
                                whileHover={shouldReduceMotion ? {} : {
                                    y: -4,
                                    boxShadow: "0 20px 40px -12px rgba(52, 211, 153, 0.1)"
                                }}
                                transition={{ duration: 0.2 }}
                                className="group relative bg-white/[0.06] rounded-3xl border border-white/10 p-8 md:p-10 will-change-transform hover:bg-white/[0.09] transition-colors duration-500"
                            >
                                <service.icon size={22} strokeWidth={1.5} className="text-emerald-400 mb-5" />
                                <h3 className="text-xl font-black text-white mb-2 tracking-tight">{service.title}</h3>
                                <p className="text-white/50 leading-relaxed text-sm">{service.description}</p>
                            </motion.div>
                        ))}
                    </div>
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
                        href="/services"
                        className="inline-flex items-center justify-center px-10 py-4 bg-white text-[#0a0a0a] font-semibold rounded-lg tracking-tight text-sm shadow-brand-sm"
                    >
                        Explore nightlife services
                    </MotionLink>
                </motion.div>

            </div>
        </section>
    );
}
