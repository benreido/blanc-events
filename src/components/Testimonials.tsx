"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";

interface Testimonial {
    id: string;
    name: string;
    role: string | null;
    company: string | null;
    eventType: string | null;
    quote: string;
    rating: number;
    avatarUrl: string | null;
}

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/testimonials")
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setTestimonials(data);
                } else {
                    setTestimonials(defaultTestData);
                }
            })
            .catch(() => setTestimonials(defaultTestData))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (testimonials.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % testimonials.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [testimonials]);

    if (loading) return null;

    return (
        <section className="py-32 px-6 overflow-hidden bg-white">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
                    <div className="max-w-2xl">
                        <span className="text-[#1F5C4B]/70 text-[11px] font-medium tracking-[0.12em] block mb-4">Client feedback</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-slate-900">
                            What our <br /> clients say.
                        </h2>
                    </div>
                    <div className="flex gap-4 mb-2">
                        <button
                            onClick={() => setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length)}
                            className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900"
                        >
                            <ArrowLeft size={18} strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={() => setCurrentIndex(prev => (prev + 1) % testimonials.length)}
                            className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900"
                        >
                            <ArrowRight size={18} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                <div className="relative h-[400px] md:h-[350px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 flex flex-col md:flex-row gap-12 items-start"
                        >
                            <div className="flex-1">
                                <div className="flex gap-1 mb-8">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            strokeWidth={0}
                                            fill={i < (testimonials[currentIndex]?.rating || 5) ? "#f59e0b" : "#e2e8f0"}
                                        />
                                    ))}
                                </div>
                                <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium text-slate-800 leading-tight mb-10 italic">
                                    &quot;{testimonials[currentIndex]?.quote}&quot;
                                </blockquote>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                        {testimonials[currentIndex]?.avatarUrl ? (
                                            <img src={testimonials[currentIndex].avatarUrl!} alt={testimonials[currentIndex].name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-slate-400 tracking-tight">
                                                {testimonials[currentIndex]?.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm tracking-tight">{testimonials[currentIndex]?.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {testimonials[currentIndex]?.role}{testimonials[currentIndex]?.company && ` · ${testimonials[currentIndex].company}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="hidden lg:block w-1/3">
                                <div className="bg-slate-50 rounded-3xl p-12 aspect-square flex items-center justify-center relative overflow-hidden border border-slate-100">
                                    <span className="text-[9rem] leading-none text-slate-100 font-black select-none">&ldquo;</span>
                                    <div className="absolute inset-0 border-[40px] border-white pointer-events-none"></div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dots */}
                <div className="flex gap-2 mt-12">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-1 rounded-full transition-all duration-500 ${currentIndex === i ? 'w-12 bg-[#1F5C4B]' : 'w-4 bg-slate-200'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

const defaultTestData: Testimonial[] = [
    {
        id: "d1",
        name: "James Harrington",
        role: "Event Director",
        company: "Manchester Town Hall",
        eventType: "Corporate Gala",
        quote: "Blanc. handled the technical production for our annual gala flawlessly. The lighting design transformed the Great Hall into something truly world-class.",
        rating: 5,
        avatarUrl: null
    },
    {
        id: "d2",
        name: "Sophie Edwards",
        role: "Head of Marketing",
        company: "Victoria Warehouse",
        eventType: "Product Launch",
        quote: "The wireless Astera setup was game-changing for our launch event. Clean, fast setup and stunning results. Highly recommend the Blanc. team.",
        rating: 5,
        avatarUrl: null
    },
    {
        id: "d3",
        name: "Mark Sanderson",
        role: "Wedding Client",
        company: null,
        eventType: "Wedding",
        quote: "From the initial quote to the event night, the service was impeccable. The sound quality and atmosphere for our wedding were exactly what we dreamed of.",
        rating: 5,
        avatarUrl: null
    }
];
