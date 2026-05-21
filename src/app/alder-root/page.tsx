"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { venueBookingSchema, type VenueBookingValues } from "@/lib/validations";
import Link from "next/link";

// ── Design tokens (self-contained — no CSS vars needed) ──
const C = {
    bg: "#0f1f1a",
    bgCard: "#ffffff",
    ink: "#0f1f1a",
    inkLight: "#f2eed5",
    muted: "rgba(242,238,229,0.45)",
    rule: "rgba(242,238,229,0.12)",
    green: "#34d399",
    greenDark: "#1F5C4B",
    red: "crimson",
};

const mono = "ui-monospace, 'JetBrains Mono', 'Fira Code', monospace";
const serif = "Georgia, 'Times New Roman', serif";

interface VenueBooking {
    id: string;
    venue: "MARQUEE" | "CLUBHOUSE";
    eventDate: string;
    eventType: string;
    startTime: string;
    endTime: string;
    clientName: string;
    status: string;
}

// ── Calendar ──────────────────────────────────────────────
function BookingCalendar({ bookings }: { bookings: VenueBooking[] }) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0

    const bookingsByDate = useMemo(() => {
        const map: Record<string, VenueBooking[]> = {};
        bookings.forEach((b) => {
            const d = new Date(b.eventDate);
            if (d.getFullYear() === year && d.getMonth() === month) {
                const key = d.getDate().toString();
                if (!map[key]) map[key] = [];
                map[key].push(b);
            }
        });
        return map;
    }, [bookings, year, month]);

    function prev() {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    }
    function next() {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    }

    const monthName = new Date(year, month).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const cells: (number | null)[] = [
        ...Array(startOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1;

    return (
        <div style={{ padding: "28px 0 32px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <span style={{ fontFamily: serif, fontSize: "18px", color: C.inkLight, letterSpacing: "-0.01em" }}>{monthName}</span>
                <div style={{ display: "flex", gap: "6px" }}>
                    {[{ fn: prev, label: "‹" }, { fn: next, label: "›" }].map(({ fn, label }) => (
                        <button key={label} onClick={fn} style={{ background: "rgba(242,238,229,0.08)", border: `1px solid ${C.rule}`, color: C.inkLight, width: "32px", height: "32px", cursor: "pointer", fontSize: "18px", lineHeight: 1, borderRadius: "4px" }}>{label}</button>
                    ))}
                </div>
            </div>

            {/* Day labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                    <div key={d} style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, textAlign: "center", padding: "4px 0" }}>{d}</div>
                ))}
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                {cells.map((day, i) => {
                    if (!day) return <div key={`e${i}`} style={{ minHeight: "64px" }} />;
                    const dayBookings = bookingsByDate[day.toString()] || [];
                    const isToday = day === todayDay;
                    return (
                        <div key={day} style={{ minHeight: "64px", padding: "6px", background: isToday ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${isToday ? "rgba(52,211,153,0.3)" : C.rule}`, borderRadius: "4px" }}>
                            <span style={{ fontFamily: mono, fontSize: "11px", color: isToday ? C.green : C.muted, display: "block", marginBottom: "3px" }}>{day}</span>
                            {dayBookings.map((b) => (
                                <div key={b.id} style={{ background: b.venue === "MARQUEE" ? C.green : "#B5A07A", color: C.ink, fontSize: "9px", fontFamily: mono, padding: "2px 4px", marginBottom: "2px", borderRadius: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                                    {b.clientName}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
                {[{ label: "Marquee", colour: C.green }, { label: "Clubhouse", colour: "#B5A07A" }].map((v) => (
                    <div key={v.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "10px", height: "10px", background: v.colour, borderRadius: "2px" }} />
                        <span style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.1em", color: C.muted }}>{v.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Pricing ───────────────────────────────────────────────
const BASE_START = 19, BASE_END = 24, BASE_PRICE = 275, EXTRA_HOURLY = 40;

function calcPrice(startTime?: string, endTime?: string) {
    if (!startTime || !endTime) return null;
    const [sH, sM] = startTime.split(":").map(Number);
    const [eH, eM] = endTime.split(":").map(Number);
    const startDec = sH + sM / 60;
    let endDec = eH + eM / 60;
    if (endDec <= startDec) endDec += 24;

    let total = BASE_PRICE;
    const lines = [{ label: "DJ Services (7pm – Midnight)", amount: BASE_PRICE }];

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


interface InvoiceResult { invoiceId: string; invoiceNumber: string; total: number; }

// ── Shared field style ────────────────────────────────────
const field: React.CSSProperties = {
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: "15px",
    color: C.inkLight,
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${C.rule}`,
    padding: "10px 0",
    outline: "none",
    width: "100%",
};

// ── Page ─────────────────────────────────────────────────
export default function AlderRootPage() {
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [invoiceResult, setInvoiceResult] = useState<InvoiceResult | null>(null);
    const [bookings, setBookings] = useState<VenueBooking[]>([]);

    const fetchBookings = useCallback(async () => {
        try {
            const res = await fetch("/api/venue-booking");
            if (res.ok) setBookings(await res.json());
        } catch { /* silent */ }
    }, []);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<VenueBookingValues>({ resolver: zodResolver(venueBookingSchema) });

    const selectedVenue = watch("venue");
    const startTime = watch("startTime");
    const endTime = watch("endTime");
    const pricing = useMemo(() => calcPrice(startTime, endTime), [startTime, endTime]);

    const onSubmit = async (data: VenueBookingValues) => {
        setError("");
        try {
            const res = await fetch("/api/venue-booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to submit"); }
            const result = await res.json();
            setInvoiceResult({ invoiceId: result.invoiceId, invoiceNumber: result.invoiceNumber, total: result.total });
            setSubmitted(true);
            fetchBookings();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
        }
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const labelStyle: React.CSSProperties = { fontFamily: mono, fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted, display: "block", marginBottom: "8px" };
    const sectionStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: `1px solid ${C.rule}`, borderRadius: "12px", padding: "32px" };
    const stepLabel = (n: string) => <div style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, marginBottom: "20px" }}>{n}</div>;

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, Arial, sans-serif" }}>

            {/* Header */}
            <div style={{ borderBottom: `1px solid ${C.rule}`, padding: "40px 24px 36px" }}>
                <div style={{ maxWidth: "760px", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "36px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "50%", border: `1px solid ${C.rule}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontFamily: serif, fontSize: "16px", color: C.green, fontStyle: "italic" }}>A</span>
                        </div>
                        <div>
                            <div style={{ fontFamily: serif, fontSize: "17px", color: C.inkLight, lineHeight: 1 }}>Alder Root</div>
                            <div style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, marginTop: "2px" }}>Golf Club</div>
                        </div>
                    </div>
                    <h1 style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(36px, 6vw, 68px)", lineHeight: 1, letterSpacing: "-0.02em", color: C.inkLight, margin: 0 }}>
                        Log a <em>Booking.</em>
                    </h1>
                    <p style={{ marginTop: "16px", color: C.muted, fontSize: "15px", lineHeight: 1.6 }}>
                        Enter the event details and client contact information below.
                    </p>
                </div>
            </div>

            {/* Calendar */}
            <div style={{ borderBottom: `1px solid ${C.rule}` }}>
                <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>
                    <BookingCalendar bookings={bookings} />
                </div>
            </div>

            {/* Form / Success */}
            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 100px" }}>
                {submitted ? (
                    <div style={{ ...sectionStyle, background: "rgba(255,255,255,0.06)", textAlign: "center", padding: "56px 40px" }}>
                        <div style={{ width: "56px", height: "56px", background: "rgba(52,211,153,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                            <span style={{ fontSize: "24px" }}>✓</span>
                        </div>
                        <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.015em", color: C.inkLight, margin: "0 0 12px" }}>
                            Booking logged.
                        </h2>
                        <p style={{ color: C.muted, fontSize: "15px", lineHeight: 1.6, marginBottom: "32px" }}>
                            The booking has been saved and an invoice has been automatically created.
                        </p>
                        {invoiceResult && (
                            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "20px 24px", marginBottom: "28px", display: "inline-block", minWidth: "280px" }}>
                                <div style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted, marginBottom: "14px" }}>Invoice Created</div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <span style={{ color: C.muted, fontSize: "13px" }}>Invoice No.</span>
                                    <span style={{ fontFamily: mono, fontSize: "13px", color: C.inkLight }}>{invoiceResult.invoiceNumber}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: C.muted, fontSize: "13px" }}>Total</span>
                                    <span style={{ fontFamily: mono, fontSize: "15px", color: C.green }}>£{invoiceResult.total.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                        <div>
                            <button onClick={() => { reset(); setSubmitted(false); setInvoiceResult(null); }} style={{ fontFamily: mono, fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", background: C.green, color: C.ink, border: "none", padding: "14px 28px", cursor: "pointer", borderRadius: "6px", fontWeight: 700 }}>
                                Log another booking →
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* 01 Venue */}
                        <div style={sectionStyle}>
                            {stepLabel("01 — Choose Venue")}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {[
                                    { value: "MARQUEE", label: "Marquee", desc: "Outdoor marquee — weddings, larger celebrations, summer events." },
                                    { value: "CLUBHOUSE", label: "Clubhouse", desc: "Indoor venue — dinners, corporate events, intimate gatherings." },
                                ].map((v) => {
                                    const on = selectedVenue === v.value;
                                    return (
                                        <button key={v.value} type="button"
                                            onClick={() => setValue("venue", v.value as "MARQUEE" | "CLUBHOUSE", { shouldValidate: true })}
                                            style={{ textAlign: "left", padding: "20px", background: on ? C.greenDark : "rgba(255,255,255,0.04)", border: `2px solid ${on ? C.green : C.rule}`, borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}
                                        >
                                            <div style={{ fontFamily: serif, fontSize: "18px", color: C.inkLight, marginBottom: "8px" }}>{v.label}</div>
                                            <p style={{ fontSize: "13px", lineHeight: 1.5, color: on ? "rgba(242,238,229,0.8)" : C.muted, margin: 0 }}>{v.desc}</p>
                                            {on && <div style={{ marginTop: "10px", fontFamily: mono, fontSize: "10px", letterSpacing: "0.1em", color: C.green }}>Selected ✓</div>}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.venue && <p style={{ fontFamily: mono, fontSize: "11px", color: C.red, marginTop: "8px" }}>{errors.venue.message}</p>}
                        </div>

                        {/* 02 Event Details */}
                        <div style={sectionStyle}>
                            {stepLabel("02 — Event Details")}
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div>
                                    <label style={labelStyle}>Type of Event *</label>
                                    <input {...register("eventType")} style={field} placeholder="e.g. Wedding Reception, Birthday Party…" />
                                    {errors.eventType && <p style={{ fontFamily: mono, fontSize: "11px", color: C.red, marginTop: "4px" }}>{errors.eventType.message}</p>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Event Date *</label>
                                    <input {...register("eventDate")} type="date" min={minDate} style={field} />
                                    {errors.eventDate && <p style={{ fontFamily: mono, fontSize: "11px", color: C.red, marginTop: "4px" }}>{errors.eventDate.message}</p>}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                    <div>
                                        <label style={labelStyle}>Start Time *</label>
                                        <input {...register("startTime")} type="time" style={field} />
                                        {errors.startTime && <p style={{ fontFamily: mono, fontSize: "11px", color: C.red, marginTop: "4px" }}>{errors.startTime.message}</p>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>End Time *</label>
                                        <input {...register("endTime")} type="time" style={field} />
                                        {errors.endTime && <p style={{ fontFamily: mono, fontSize: "11px", color: C.red, marginTop: "4px" }}>{errors.endTime.message}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing preview */}
                        {pricing && (
                            <div style={{ ...sectionStyle, borderLeft: `3px solid ${C.green}` }}>
                                {stepLabel("Invoice Preview")}
                                {selectedVenue && (
                                    <p style={{ fontFamily: mono, fontSize: "11px", color: C.muted, marginBottom: "16px" }}>
                                        Invoice to: <span style={{ color: C.inkLight }}>{selectedVenue === "MARQUEE" ? "Alder Root Events & Weddings" : "Lets Celebrate Ltd"}</span>
                                    </p>
                                )}
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: `1px solid ${C.rule}`, paddingTop: "16px" }}>
                                    {pricing.lines.map((line, i) => (
                                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                                            <span style={{ color: C.muted }}>{line.label}</span>
                                            <span style={{ fontFamily: mono, color: C.inkLight }}>£{line.amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${C.rule}` }}>
                                    <span style={{ fontFamily: mono, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.muted }}>Total</span>
                                    <span style={{ fontFamily: serif, fontSize: "32px", letterSpacing: "-0.02em", color: C.inkLight }}>£{pricing.total.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {/* 03 Client Details */}
                        <div style={sectionStyle}>
                            {stepLabel("03 — Client Details")}
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                    <div>
                                        <label style={labelStyle}>Client Name *</label>
                                        <input {...register("clientName")} style={field} placeholder="John Smith" />
                                        {errors.clientName && <p style={{ fontFamily: mono, fontSize: "11px", color: C.red, marginTop: "4px" }}>{errors.clientName.message}</p>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Client Phone</label>
                                        <input {...register("clientPhone")} type="tel" style={field} placeholder="07700 900000" />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Client Email</label>
                                    <input {...register("clientEmail")} type="email" style={field} placeholder="client@email.com" />
                                    {errors.clientEmail && <p style={{ fontFamily: mono, fontSize: "11px", color: C.red, marginTop: "4px" }}>{errors.clientEmail.message}</p>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Additional Notes</label>
                                    <textarea {...register("notes")} rows={3} style={{ ...field, resize: "vertical" }} placeholder="Special requirements, dietary needs, anything else…" />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "6px", padding: "14px 18px", color: "#f87171", fontSize: "14px" }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={isSubmitting} style={{ fontFamily: mono, fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", background: isSubmitting ? "rgba(52,211,153,0.5)" : C.green, color: C.ink, border: "none", padding: "16px 28px", cursor: isSubmitting ? "not-allowed" : "pointer", borderRadius: "6px", fontWeight: 700, width: "100%" }}>
                            {isSubmitting ? "Submitting…" : "Submit Booking →"}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: "40px", textAlign: "center" }}>
                    <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.12em", color: "rgba(242,238,229,0.2)" }}>
                        Powered by <Link href="/" style={{ color: "rgba(242,238,229,0.35)", textDecoration: "none" }}>Blanc. Events</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
