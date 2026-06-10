"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const eventTypes = ["Wedding", "Private Party", "Corporate Event", "Nightclub Event", "Other"];
const budgetRanges = ["£1,000–£3,000", "£3,000–£7,500", "£7,500–£15,000", "£15,000–£30,000", "£30,000+", "Unsure — help me plan"];

export default function EventEnquiryForm() {
    const shouldReduceMotion = useReducedMotion();
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        eventType: "",
        eventDate: "",
        guestCount: "",
        location: "",
        budget: "",
        name: "",
        email: "",
        phone: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Basic validation
        if (!form.eventType || !form.name || !form.email) {
            setError("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);

        // Map guided fields to the existing contact form schema
        const messageLines = [
            `Event Type: ${form.eventType}`,
            form.eventDate ? `Event Date: ${form.eventDate}` : "",
            form.guestCount ? `Guest Count: ${form.guestCount}` : "",
            form.location ? `Location: ${form.location}` : "",
            form.budget ? `Budget: ${form.budget}` : "",
        ].filter(Boolean).join("\n");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone || "",
                    company: "",
                    subject: `Event Enquiry: ${form.eventType}`,
                    message: messageLines,
                }),
            });
            if (!res.ok) throw new Error("Failed to send");
            setSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again or call us directly.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClasses = "w-full bg-white border border-slate-200 rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all outline-none";
    const labelClasses = "text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 block";

    if (submitted) {
        return (
            <section id="enquiry" className="py-32 px-6 bg-[#F9F7F5] overflow-hidden">
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="w-20 h-20 bg-[#1F5C4B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-[#1F5C4B] text-4xl">check_circle</span>
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase text-slate-900">Enquiry Received!</h2>
                        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                            Thank you for reaching out. Our team will review your event details and respond within 24 hours.
                        </p>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section id="enquiry" className="py-32 px-6 bg-[#F9F7F5] overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                    {/* Left: Copy */}
                    <motion.div
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                    >
                        <span className="text-[#1F5C4B] text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">Work with us</span>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-slate-900 leading-tight">
                            Brief us.
                        </h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-md">
                            Tell us what you&apos;re building. We&apos;ll respond with a production proposal within 24 hours.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: "schedule", title: "Quick Response", desc: "We respond to all enquiries within 24 hours." },
                                { icon: "handshake", title: "No Obligation", desc: "Get a tailored proposal with transparent pricing." },
                                { icon: "support_agent", title: "Expert Advice", desc: "Our team will help you plan the perfect setup." },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#1F5C4B]/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[#1F5C4B] text-lg">{item.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                                        <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Form */}
                    <motion.div
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
                    >
                        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200/60 shadow-sm space-y-5">

                            {/* Event Type */}
                            <div>
                                <label className={labelClasses}>Event Type *</label>
                                <select
                                    name="eventType"
                                    value={form.eventType}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">Select event type</option>
                                    {eventTypes.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date + Guest Count */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClasses}>Event Date</label>
                                    <input
                                        type="date"
                                        name="eventDate"
                                        value={form.eventDate}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Guest Count</label>
                                    <input
                                        type="number"
                                        name="guestCount"
                                        value={form.guestCount}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="e.g. 150"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className={labelClasses}>Event Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder="Venue or city"
                                />
                            </div>

                            {/* Budget Range */}
                            <div>
                                <label className={labelClasses}>Budget Range</label>
                                <select
                                    name="budget"
                                    value={form.budget}
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="">Select budget range</option>
                                    {budgetRanges.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Divider */}
                            <hr className="border-slate-100" />

                            {/* Name + Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClasses}>Your Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className={labelClasses}>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder="07584192578"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-[#123A2F] text-white font-bold rounded-xl uppercase tracking-widest text-sm hover:bg-[#0B241D] transition-colors disabled:opacity-50"
                            >
                                {submitting ? "Sending..." : "Send my brief"}
                            </button>

                            <p className="text-center text-xs text-slate-400">
                                We&apos;ll respond within 24 hours. No spam, ever.
                            </p>
                        </form>
                    </motion.div>

                </div>

            </div>
        </section>
    );
}
