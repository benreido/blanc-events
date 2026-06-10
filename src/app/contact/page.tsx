"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormValues } from "@/lib/validations";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ContactForm() {
    const searchParams = useSearchParams();
    const prefillService = searchParams.get("service") || "";
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: { subject: prefillService ? `Quote for ${prefillService}` : "" },
    });

    const onSubmit = async (data: ContactFormValues) => {
        setError("");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to send");
            setSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again or call us directly.");
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 bg-[#1F5C4B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-[#1F5C4B] text-4xl">check_circle</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Message Sent!</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                    Thank you for getting in touch. Our team will respond within 24 hours.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Name *</label>
                    <input {...register("name")} className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all" placeholder="Your name" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Email *</label>
                    <input {...register("email")} type="email" className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all" placeholder="your@email.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Phone</label>
                    <input {...register("phone")} className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all" placeholder="07584192578" />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Company</label>
                    <input {...register("company")} className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all" placeholder="Your company" />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Subject *</label>
                <input {...register("subject")} className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all" placeholder="How can we help?" />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
            </div>
            <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Message *</label>
                <textarea {...register("message")} rows={6} className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all resize-none" placeholder="Tell us about your event, dates, venue, and requirements..." />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm">{error}</div>
            )}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#1F5C4B] text-white font-bold rounded uppercase tracking-widest text-sm hover:bg-[#123A2F] transition-colors disabled:opacity-50"
            >
                {isSubmitting ? "Sending..." : "Send Message"}
            </button>
        </form>
    );
}

export default function ContactPage() {
    return (
        <>
            <Navbar />
            <main className="pt-20">
                <section className="py-24 px-6 bg-[#123A2F] text-white text-center">
                    <div className="max-w-4xl mx-auto">
                        <span className="inline-block py-1 px-3 border border-white/20 text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] rounded mb-6">
                            Get in Touch
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Contact Us</h1>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            Ready to discuss your next production? Our team is here to help with quotes, technical advice, and event planning.
                        </p>
                    </div>
                </section>

                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                            <div className="lg:col-span-2">
                                <Suspense fallback={<div className="skeleton h-96 rounded-xl" />}>
                                    <ContactForm />
                                </Suspense>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { icon: "location_on", title: "Visit Us", lines: [{ text: "19 Cheetham Hill Road" }, { text: "Manchester M4 4FY" }] },
                                    { icon: "email", title: "Email", lines: [{ text: "hello@blanc-events.co.uk", href: "mailto:hello@blanc-events.co.uk" }, { text: "Response within 24 hours" }] },
                                    { icon: "call", title: "Call Us", lines: [{ text: "07584 192 578", href: "tel:+447584192578" }, { text: "Mon–Fri 9am–6pm" }] },
                                ].map((c) => (
                                    <div key={c.title} className="flex gap-4">
                                        <div className="w-12 h-12 bg-[#1F5C4B]/10 rounded-lg flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[#1F5C4B]">{c.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-1">{c.title}</h4>
                                            {c.lines.map((l) => (
                                                "href" in l && l.href ? (
                                                    <a key={l.text} href={l.href} className="block text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm font-medium">{l.text}</a>
                                                ) : (
                                                    <p key={l.text} className="text-slate-400 text-sm">{l.text}</p>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
