"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { venueBookingSchema, type VenueBookingValues } from "@/lib/validations";
import Link from "next/link";

const EVENT_TYPES = [
    "Wedding Reception",
    "Birthday Party",
    "Corporate Event",
    "Anniversary",
    "Engagement Party",
    "Charity Event",
    "Private Dinner",
    "Christmas Party",
    "Other",
];

// Mirror the server-side pricing for a live preview
const BASE_START = 19;
const BASE_END = 24;
const BASE_PRICE = 275;
const EXTRA_HOURLY = 40;

function calcPrice(startTime: string | undefined, endTime: string | undefined) {
    if (!startTime || !endTime) return null;
    const [sH, sM] = startTime.split(":").map(Number);
    const [eH, eM] = endTime.split(":").map(Number);
    const startDec = sH + sM / 60;
    let endDec = eH + eM / 60;
    if (endDec <= startDec) endDec += 24;

    let total = BASE_PRICE;
    const lines: { label: string; amount: number }[] = [
        { label: "DJ Services (7pm – Midnight)", amount: BASE_PRICE },
    ];

    if (startDec < BASE_START) {
        const hrs = Math.ceil(BASE_START - startDec);
        lines.push({ label: `Early start – ${hrs}hr${hrs > 1 ? "s" : ""} before 7pm`, amount: hrs * EXTRA_HOURLY });
        total += hrs * EXTRA_HOURLY;
    }
    if (endDec > BASE_END) {
        const hrs = Math.ceil(endDec - BASE_END);
        lines.push({ label: `Late finish – ${hrs}hr${hrs > 1 ? "s" : ""} after midnight`, amount: hrs * EXTRA_HOURLY });
        total += hrs * EXTRA_HOURLY;
    }

    return { lines, total };
}

interface InvoiceResult {
    invoiceId: string;
    invoiceNumber: string;
    total: number;
}

export default function AlderRootPage() {
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [invoiceResult, setInvoiceResult] = useState<InvoiceResult | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<VenueBookingValues>({
        resolver: zodResolver(venueBookingSchema),
    });

    const selectedVenue = watch("venue");
    const startTime = watch("startTime");
    const endTime = watch("endTime");

    const pricing = useMemo(() => calcPrice(startTime, endTime), [startTime, endTime]);

    const onSubmit = async (data: VenueBookingValues) => {
        setError("");
        try {
            const res = await fetch("/api/venue-booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to submit");
            }
            const result = await res.json();
            setInvoiceResult({
                invoiceId: result.invoiceId,
                invoiceNumber: result.invoiceNumber,
                total: result.total,
            });
            setSubmitted(true);
        } catch (e: any) {
            setError(e.message || "Something went wrong. Please try again.");
        }
    };

    function handleReset() {
        reset();
        setSubmitted(false);
        setInvoiceResult(null);
    }

    // Get tomorrow's date as the min value for the date picker
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    return (
        <div className="min-h-screen bg-[#0f1f1a]">
            {/* Header */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f1f1a] via-[#132e24] to-[#1a3c2e]" />
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-16 text-center">
                    {/* Logo / Club Name */}
                    <div className="inline-flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                            <span className="text-emerald-400 text-lg font-black">A</span>
                        </div>
                        <div className="text-left">
                            <h2 className="text-white font-black text-lg tracking-tight leading-none">Alder Root</h2>
                            <p className="text-emerald-400/80 text-[10px] font-bold uppercase tracking-[0.3em]">Golf Club</p>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                        Log a Booking
                    </h1>
                    <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
                        Enter the event details and client contact information below.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative -mt-4 pb-20">
                <div className="max-w-3xl mx-auto px-6">
                    {submitted ? (
                        /* Success State */
                        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-2xl text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">Booking Submitted!</h2>
                            <p className="text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                                The booking has been logged and an invoice has been automatically created.
                            </p>

                            {invoiceResult && (
                                <div className="bg-slate-50 rounded-2xl p-6 max-w-sm mx-auto mb-8 text-left">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="material-symbols-outlined text-[#1F5C4B] text-lg">receipt_long</span>
                                        <span className="text-xs font-bold uppercase tracking-widest text-[#1F5C4B]">Invoice Created</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Invoice No.</span>
                                            <span className="font-bold text-slate-900">{invoiceResult.invoiceNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Total</span>
                                            <span className="font-black text-lg text-[#1F5C4B]">£{invoiceResult.total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Status</span>
                                            <span className="text-xs font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Draft</span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/invoices/${invoiceResult.invoiceId}/edit`}
                                        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold text-[#1F5C4B] border border-[#1F5C4B]/20 rounded-xl hover:bg-[#1F5C4B]/5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">edit</span>
                                        View / Edit Invoice
                                    </Link>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 bg-[#1F5C4B] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#123A2F] transition-colors"
                                >
                                    Log Another Booking
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Form */
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Step 1: Venue Selection */}
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-black/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-[#1F5C4B] text-white flex items-center justify-center text-sm font-black">1</div>
                                    <h3 className="text-lg font-black tracking-tight text-slate-900">Choose Your Venue</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Marquee Card */}
                                    <button
                                        type="button"
                                        onClick={() => setValue("venue", "MARQUEE", { shouldValidate: true })}
                                        className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                                            selectedVenue === "MARQUEE"
                                                ? "border-[#1F5C4B] bg-[#1F5C4B]/5 shadow-lg shadow-[#1F5C4B]/10"
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                                        }`}
                                    >
                                        {selectedVenue === "MARQUEE" && (
                                            <div className="absolute top-4 right-4 w-6 h-6 bg-[#1F5C4B] rounded-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-sm">check</span>
                                            </div>
                                        )}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-emerald-600 text-2xl">camping</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-lg mb-1">Marquee</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            Outdoor marquee perfect for larger celebrations, weddings, and summer events.
                                        </p>
                                    </button>

                                    {/* Clubhouse Card */}
                                    <button
                                        type="button"
                                        onClick={() => setValue("venue", "CLUBHOUSE", { shouldValidate: true })}
                                        className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                                            selectedVenue === "CLUBHOUSE"
                                                ? "border-[#1F5C4B] bg-[#1F5C4B]/5 shadow-lg shadow-[#1F5C4B]/10"
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                                        }`}
                                    >
                                        {selectedVenue === "CLUBHOUSE" && (
                                            <div className="absolute top-4 right-4 w-6 h-6 bg-[#1F5C4B] rounded-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-sm">check</span>
                                            </div>
                                        )}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-amber-600 text-2xl">house</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-lg mb-1">Clubhouse</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            Indoor clubhouse venue ideal for dinners, corporate events, and intimate gatherings.
                                        </p>
                                    </button>
                                </div>
                                {errors.venue && (
                                    <p className="text-red-500 text-xs mt-3 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        {errors.venue.message}
                                    </p>
                                )}
                            </div>

                            {/* Step 2: Event Details */}
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-black/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-[#1F5C4B] text-white flex items-center justify-center text-sm font-black">2</div>
                                    <h3 className="text-lg font-black tracking-tight text-slate-900">Event Details</h3>
                                </div>

                                <div className="space-y-5">
                                    {/* Event Type */}
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                            Type of Event *
                                        </label>
                                        <select
                                            {...register("eventType")}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Select event type…</option>
                                            {EVENT_TYPES.map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                        {errors.eventType && (
                                            <p className="text-red-500 text-xs mt-1">{errors.eventType.message}</p>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                            Event Date *
                                        </label>
                                        <input
                                            {...register("eventDate")}
                                            type="date"
                                            min={minDate}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all"
                                        />
                                        {errors.eventDate && (
                                            <p className="text-red-500 text-xs mt-1">{errors.eventDate.message}</p>
                                        )}
                                    </div>

                                    {/* Time Range */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                                Start Time *
                                            </label>
                                            <input
                                                {...register("startTime")}
                                                type="time"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all"
                                            />
                                            {errors.startTime && (
                                                <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                                End Time *
                                            </label>
                                            <input
                                                {...register("endTime")}
                                                type="time"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all"
                                            />
                                            {errors.endTime && (
                                                <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Preview */}
                            {pricing && (
                                <div className="bg-[#123A2F] rounded-3xl p-6 md:p-8 shadow-xl text-white">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-emerald-400 text-lg">receipt_long</span>
                                        </div>
                                        <h3 className="text-lg font-black tracking-tight">Invoice Preview</h3>
                                    </div>

                                    {selectedVenue && (
                                        <div className="text-xs text-white/50 mb-4 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">business</span>
                                            Invoice to: <span className="text-white/80 font-semibold">{selectedVenue === "MARQUEE" ? "Alder Root Events & Weddings" : "Lets Celebrate Ltd"}</span>
                                        </div>
                                    )}

                                    <div className="space-y-3 border-t border-white/10 pt-4">
                                        {pricing.lines.map((line, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <span className="text-white/70">{line.label}</span>
                                                <span className="font-bold">£{line.amount.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-end mt-5 pt-4 border-t border-white/10">
                                        <span className="text-sm font-bold text-white/80">Total</span>
                                        <span className="font-black text-3xl tracking-tighter">£{pricing.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Contact Details */}
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-black/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-[#1F5C4B] text-white flex items-center justify-center text-sm font-black">3</div>
                                    <h3 className="text-lg font-black tracking-tight text-slate-900">Client Details</h3>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                                Client Name *
                                            </label>
                                            <input
                                                {...register("clientName")}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all"
                                                placeholder="John Smith"
                                            />
                                            {errors.clientName && (
                                                <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                                Client Phone
                                            </label>
                                            <input
                                                {...register("clientPhone")}
                                                type="tel"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all"
                                                placeholder="07700 900000"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                            Client Email
                                        </label>
                                        <input
                                            {...register("clientEmail")}
                                            type="email"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all"
                                            placeholder="your@email.com"
                                        />
                                        {errors.clientEmail && (
                                            <p className="text-red-500 text-xs mt-1">{errors.clientEmail.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                            Additional Notes
                                        </label>
                                        <textarea
                                            {...register("notes")}
                                            rows={4}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] focus:border-transparent transition-all resize-none"
                                            placeholder="Any special requirements, dietary needs, or other notes about this booking…"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-[#1F5C4B] text-white font-bold rounded-2xl uppercase tracking-widest text-sm hover:bg-[#123A2F] transition-all disabled:opacity-50 shadow-xl shadow-[#1F5C4B]/20 hover:shadow-2xl hover:shadow-[#1F5C4B]/30 active:scale-[0.99]"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Submitting…
                                    </span>
                                ) : (
                                    "Submit Booking"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="text-center mt-12">
                        <p className="text-white/30 text-xs">
                            Powered by <Link href="/" className="text-white/50 hover:text-white/80 transition-colors font-semibold">Blanc. Events</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
