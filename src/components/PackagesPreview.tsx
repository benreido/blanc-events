"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import MotionLink from "@/components/MotionLink";
import { formatCurrency } from "@/lib/config";
import { Package, CheckCircle2, ArrowRight } from "lucide-react";

interface PackageData {
    id: string;
    name: string;
    slug: string;
    description: string;
    dayRate: number | null;
    contactForPrice: boolean;
    images: string[];
    includes: string[];
    savingsNote: string;
}

const placeholderPackages: PackageData[] = [
    {
        id: "ph1", name: "House Party Package", slug: "house-party", description: "Everything you need to light up your house party with premium sound and lighting.",
        dayRate: null, contactForPrice: true, images: [], includes: ["Wireless LED uplighters", "Bluetooth speaker system", "DJ lighting effects"], savingsNote: "",
    },
    {
        id: "ph2", name: "Wedding Lighting Package", slug: "wedding-lighting", description: "Elegant wireless lighting design to transform your wedding venue.",
        dayRate: null, contactForPrice: true, images: [], includes: ["Astera Titan Tubes", "Wireless uplighting", "Fairy light canopy"], savingsNote: "",
    },
    {
        id: "ph3", name: "Corporate Event Package", slug: "corporate-event", description: "Professional production for conferences, brand activations and corporate celebrations.",
        dayRate: null, contactForPrice: true, images: [], includes: ["Stage lighting rig", "PA system with microphones", "Technician on-site"], savingsNote: "",
    },
    {
        id: "ph4", name: "Nightclub Lighting Package", slug: "nightclub-lighting", description: "High-impact lighting installations for nightclub environments.",
        dayRate: null, contactForPrice: true, images: [], includes: ["Moving head fixtures", "LED wash lighting", "DMX controller"], savingsNote: "",
    },
];

export default function PackagesPreview() {
    const shouldReduceMotion = useReducedMotion();
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/packages")
            .then(r => r.json())
            .then(data => {
                const pkgs = data.packages || data;
                if (Array.isArray(pkgs) && pkgs.length > 0) {
                    setPackages(pkgs.slice(0, 4));
                } else {
                    setPackages(placeholderPackages);
                }
            })
            .catch(() => setPackages(placeholderPackages))
            .finally(() => setLoading(false));
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
        },
    };

    if (loading) {
        return (
            <section className="py-32 px-6 bg-[#F9F7F5]">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton h-80 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-32 px-6 bg-[#F9F7F5] overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                    className="text-center mb-20"
                >
                    <span className="text-[#1F5C4B]/70 text-[11px] font-medium tracking-[0.12em] block mb-4">Curated bundles</span>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900">Packages</h2>
                    <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">
                        Pre-configured production bundles for every event type. Equipment, delivery and support included.
                    </p>
                </motion.div>

                {/* Package Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-10%" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                >
                    {packages.map((pkg) => (
                        <motion.div
                            key={pkg.id}
                            variants={cardVariants}
                            whileHover={shouldReduceMotion ? {} : {
                                y: -4,
                                boxShadow: "0 20px 40px -15px rgba(31,92,75,0.12)"
                            }}
                            transition={{ duration: 0.2 }}
                            className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col will-change-transform"
                        >
                            {/* Image or gradient header */}
                            {pkg.images && pkg.images[0] ? (
                                <div className="h-48 overflow-hidden relative bg-slate-50">
                                    <img
                                        src={pkg.images[0]}
                                        alt={pkg.name}
                                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                </div>
                            ) : (
                                <div className="h-28 bg-gradient-to-br from-[#123A2F] to-[#0B241D] flex items-center justify-center">
                                    <Package size={36} strokeWidth={1} className="text-white/20" />
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">{pkg.name}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-1">{pkg.description}</p>

                                {/* Includes */}
                                {pkg.includes && pkg.includes.length > 0 && (
                                    <ul className="space-y-1.5 mb-5">
                                        {pkg.includes.slice(0, 3).map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                                <CheckCircle2 size={13} strokeWidth={2} className="text-[#1F5C4B] mt-0.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Price badge */}
                                {pkg.dayRate !== null && !pkg.contactForPrice && (
                                    <div className="mb-4">
                                        <span className="text-lg font-bold text-[#123A2F]">{formatCurrency(pkg.dayRate)}</span>
                                        <span className="text-xs text-slate-400 ml-1">/day</span>
                                    </div>
                                )}

                                <MotionLink
                                    href={pkg.id.startsWith("ph") ? "/packages" : pkg.contactForPrice ? `/contact?service=${encodeURIComponent(pkg.name)}` : `/book?packageId=${pkg.id}`}
                                    className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-slate-50 text-[#123A2F] border border-slate-200 font-semibold tracking-tight text-xs transition-all hover:bg-slate-100"
                                >
                                    View package
                                </MotionLink>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* View All */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <MotionLink
                        href="/packages"
                        className="inline-flex items-center gap-2 text-[#1F5C4B] font-semibold text-sm tracking-tight"
                    >
                        View all packages
                        <ArrowRight size={14} strokeWidth={1.5} />
                    </MotionLink>
                </motion.div>

            </div>
        </section>
    );
}
