"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const events = [
    {
        title: "Weddings",
        description: "Lighting and sound design for elegant celebrations.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB02DWxclk8JZizOOjzvEE2Pzi_qaBdYASuJ0gCvzKJjFcRChSVvs5puMyvbXoC2qm5PLFcTR1vb4YCVL5n-WQauwIEoajZJjhZgJI8PJYdaSYUepWVtNaQM2wYXbwjggtxux__SzEH9rDjFpl74qPlTRDG17TvCLkFM6k-FtSQrl26y270PdxDdmbVuJ8xQpw3xoubB9N9vW3CwuL7w2h0ImTlABQuKItFQmwDZxNU857O1hqwsmBYj_ebw89l_aU5wDDupcRhFysp",
        href: "/services",
    },
    {
        title: "Private parties",
        description: "Transform homes, gardens and venues into unforgettable parties.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgglQg9y0LTTLFBuq7T3wlEi88Vxi3F6w8BxW_gc9VZEVaEMAzXr0zwTIGI1Z9FbKEwTGtB6NjIsfngbAds67XlYQTM9L7ECvWYYuAoyK3Lyb9ek0jWxPUpaQzIHBwhSp8ZGkSMdy632dk3PXdZcIDiP69HyFjDpSpjmhGZTzXQpP78mzYjtCLvaR-1TYm75Bc4NfetLE7CLuDWw290VJ7fb6Tsiv3puv6vnYFdHB9C8x1zJBreMbejOsY3QKOBnhSvOZocNqkrwKJ",
        href: "/services",
    },
    {
        title: "Corporate events",
        description: "Production, lighting and sound for brand activations, conferences and corporate celebrations.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxqVUFiSuTHi2cC86wZRXa2Yt-LDHCsEWAi6jIBvqKneSa1dmJTAy1mpDpU7HCdeYhBneOs5kwrryAA3K6ONvLYSc_VzoOJUfXQ0dYE0bJAcQRiXuibWtt6ZQMo75dCvKKsQJ6qqGS14AY6bTIdH1YZ69SNaPxv_ZE-wUX_ARNNUMlrtfUf_X1qBUYxrBmjHsbFYv6GMerokxIg0x5p0iX-Z-T0m9dZzFHpkOnYGCIqjtjHXKWEYfILOxRpZqa3LiczUh7TLc9PWhy",
        href: "/services",
    },
];

export default function EventsSection() {
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
                    className="mb-16"
                >
                    <span className="text-[#1F5C4B]/70 text-[11px] font-medium tracking-[0.12em] block mb-4">What we do</span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">Events</h2>
                </motion.div>

                {/* Editorial layout: list + featured image */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">

                    {/* Left: numbered editorial list */}
                    <motion.div
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
                        className="flex-1 divide-y divide-slate-100"
                    >
                        {events.map((event, idx) => (
                            <motion.a
                                key={event.title}
                                href={event.href}
                                className="group flex items-center justify-between py-8 first:pt-0 last:pb-0"
                                whileHover={shouldReduceMotion ? {} : { x: 6 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                <div className="flex items-baseline gap-6">
                                    <span className="text-[11px] font-medium text-slate-300 w-5 tabular-nums shrink-0">
                                        {String(idx + 1).padStart(2, "0")}
                                    </span>
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight group-hover:text-[#1F5C4B] transition-colors duration-300">
                                            {event.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm mt-1 leading-relaxed">{event.description}</p>
                                    </div>
                                </div>
                                <ArrowRight
                                    size={16}
                                    strokeWidth={1.5}
                                    className="text-slate-300 group-hover:text-[#1F5C4B] group-hover:translate-x-1 transition-all duration-300 shrink-0 ml-6"
                                />
                            </motion.a>
                        ))}
                    </motion.div>

                    {/* Right: featured image */}
                    <motion.div
                        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
                        className="w-full lg:w-[380px] shrink-0"
                    >
                        <div className="rounded-3xl overflow-hidden aspect-[3/4] relative">
                            <img
                                src={events[0].image}
                                alt={events[0].title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-[#123A2F]/10"></div>
                        </div>
                    </motion.div>

                </div>

            </div>
        </section>
    );
}
