"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/config";

export default function BookingClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialPackage = searchParams.get("packageId") || "";
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);

    // Data from API
    const [packages, setPackages] = useState<any[]>([]);
    const [djServices, setDjServices] = useState<any[]>([]);
    const [addons, setAddons] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        date: "",
        days: 1,
        startTime: "",
        endTime: "",
        setupRequired: "2 hours",
        eventType: "",
        venueAddress: "",
        specialRequests: "",
        fullName: "",
        email: "",
        phone: "",
        billingAddress: "",
        companyName: "",
        selectedPackageId: initialPackage,
        selectedDJId: searchParams.get("djId") || "",
        selectedAddons: [] as string[],
        paymentType: "DEPOSIT" // "DEPOSIT" or "FULL"
    });

    useEffect(() => {
        fetch("/api/booking-data")
            .then(res => res.json())
            .then(data => {
                setPackages(data.packages || []);
                setDjServices(data.djServices || []);
                setAddons(data.addons || []);
                // Quote-only packages can't go through checkout — send those
                // enquiries to the contact form instead of a £0 Stripe session.
                const initial = (data.packages || []).find((p: any) => p.id === initialPackage);
                if (initial?.contactForPrice) {
                    router.replace(`/contact?service=${encodeURIComponent(initial.name)}`);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(s => Math.min(s + 1, 5));
    };

    const toggleAddon = (id: string) => {
        setFormData(prev => ({
            ...prev,
            selectedAddons: prev.selectedAddons.includes(id) ? prev.selectedAddons.filter(a => a !== id) : [...prev.selectedAddons, id]
        }));
    };

    // Calculation logic
    const selectedPkg = packages.find(p => p.id === formData.selectedPackageId);
    const selectedDJ = djServices.find(d => d.id === formData.selectedDJId);

    let subtotal = 0;
    if (selectedPkg && selectedPkg.dayRate) subtotal += selectedPkg.dayRate * formData.days;
    if (selectedDJ) subtotal += selectedDJ.basePrice;
    addons.filter(a => formData.selectedAddons.includes(a.id)).forEach(addon => {
        if (addon.pricingType === "FIXED" || addon.pricingType === "PER_DAY") {
            subtotal += addon.pricingType === "PER_DAY" ? addon.priceValue * formData.days : addon.priceValue;
        }
    });

    const vat = subtotal * 0.20;
    const total = subtotal + vat;

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const handleSubmit = async () => {
        setSubmitting(true);
        setSubmitError("");
        try {
            const res = await fetch("/api/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, subtotal, vat, total })
            });

            if (res.ok) {
                const result = await res.json();
                if (result.url) {
                    window.location.href = result.url;
                } else {
                    router.push(`/book/success?id=${result.id}`);
                }
            } else {
                const err = await res.json();
                setSubmitError(err.error || "Something went wrong confirming your booking. Please try again, or call us on 07584 192 578.");
            }
        } catch (e) {
            console.error(e);
            setSubmitError("Something went wrong confirming your booking. Please try again, or call us on 07584 192 578.");
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex items-center justify-between mb-12 px-4 animate-pulse">
                    <div className="w-full h-1 bg-slate-100 rounded" />
                </div>
                <div className="bg-white p-8 md:p-12 border shadow-sm rounded-3xl border-slate-100 animate-pulse space-y-6">
                    <div className="h-8 bg-slate-100 rounded w-1/3 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><div className="h-3 bg-slate-100 rounded w-1/4"></div><div className="h-12 bg-slate-50 rounded-xl w-full"></div></div>
                        <div className="space-y-2"><div className="h-3 bg-slate-100 rounded w-1/4"></div><div className="h-12 bg-slate-50 rounded-xl w-full"></div></div>
                        <div className="space-y-2"><div className="h-3 bg-slate-100 rounded w-1/4"></div><div className="h-12 bg-slate-50 rounded-xl w-full"></div></div>
                        <div className="space-y-2"><div className="h-3 bg-slate-100 rounded w-1/4"></div><div className="h-12 bg-slate-50 rounded-xl w-full"></div></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-12 relative px-4 md:px-12">
                <div className="absolute top-5 left-8 right-8 md:left-16 md:right-16 h-1 bg-slate-100 -z-10 rounded" />
                <div className="absolute top-5 left-8 md:left-16 h-1 bg-[#1F5C4B] -z-10 rounded transition-all duration-700 ease-in-out" style={{ width: `calc(${((step - 1) / 4) * 100}% - 4rem)` }} />

                {[
                    { num: 1, label: "Date" },
                    { num: 2, label: "Event" },
                    { num: 3, label: "Services" },
                    { num: 4, label: "Details" },
                    { num: 5, label: "Review" }
                ].map(s => (
                    <div key={s.num} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex justify-center items-center text-sm font-bold border-[3px] transition-colors duration-500 shadow-sm ${step >= s.num ? "bg-[#1F5C4B] border-white text-white drop-shadow" : "bg-white border-slate-100 text-slate-300"}`}>
                            {step > s.num ? <span className="material-symbols-outlined text-[18px]">check</span> : s.num}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest hidden md:block transition-colors ${step >= s.num ? "text-[#123A2F]" : "text-slate-300"}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Running order summary — keeps what's being booked and the price visible on every step */}
            {(formData.date || selectedPkg || selectedDJ) && (
                <div className="mb-6 px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    {formData.date && (
                        <span className="flex items-center gap-2 text-slate-600">
                            <span className="material-symbols-outlined text-[18px] text-[#1F5C4B]">event</span>
                            {new Date(formData.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            {formData.days > 1 && <span className="text-slate-400">· {formData.days} days</span>}
                        </span>
                    )}
                    {selectedPkg && (
                        <span className="flex items-center gap-2 text-slate-600">
                            <span className="material-symbols-outlined text-[18px] text-[#1F5C4B]">package_2</span>
                            {selectedPkg.name}
                        </span>
                    )}
                    {selectedDJ && (
                        <span className="flex items-center gap-2 text-slate-600">
                            <span className="material-symbols-outlined text-[18px] text-[#1F5C4B]">headphones</span>
                            {selectedDJ.name}
                        </span>
                    )}
                    {total > 0 && (
                        <span className="ml-auto font-bold text-[#123A2F]">
                            {formatCurrency(total)} <span className="font-normal text-slate-400 text-xs">inc. VAT</span>
                        </span>
                    )}
                </div>
            )}

            <div className="bg-white p-8 md:p-12 border shadow-sm rounded-3xl border-slate-200">
                <form onSubmit={step < 5 ? handleNext : (e) => { e.preventDefault(); handleSubmit(); }}>

                    {/* STEP 1: DATE & TIME */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95">
                            <h2 className="text-3xl font-black mb-8">When is your event?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Event Date</label>
                                    <input type="date" required value={formData.date} onChange={e => handleChange("date", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none" min={new Date().toISOString().split("T")[0]} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Duration (Days)</label>
                                    <input type="number" required min="1" value={formData.days} onChange={e => handleChange("days", Number(e.target.value))}
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Start Time</label>
                                    <input type="time" required value={formData.startTime} onChange={e => handleChange("startTime", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">End Time</label>
                                    <input type="time" required value={formData.endTime} onChange={e => handleChange("endTime", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: EVENT DETAILS */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-3xl font-black mb-8">Event Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Event Type</label>
                                    <select value={formData.eventType} onChange={e => handleChange("eventType", e.target.value)} required
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none bg-transparent">
                                        <option value="">Select an event type...</option>
                                        <option value="Wedding">Wedding</option>
                                        <option value="Corporate">Corporate / Brand Activation</option>
                                        <option value="Private Party">Private Party</option>
                                        <option value="Club/Festival">Club Night / Festival</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Setup Time Required</label>
                                    <select value={formData.setupRequired} onChange={e => handleChange("setupRequired", e.target.value)} required
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none bg-transparent">
                                        <option value="1 hour">1 Hour</option>
                                        <option value="2 hours">2 Hours</option>
                                        <option value="4+ hours">4+ Hours</option>
                                        <option value="Previous Day">Previous Day</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Venue Address</label>
                                    <input type="text" value={formData.venueAddress} onChange={e => handleChange("venueAddress", e.target.value)} required
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none" placeholder="123 Example Street, City, Postcode" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: CUSTOMER INFO */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-3xl font-black mb-8">Your Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name</label>
                                    <input type="text" required value={formData.fullName} onChange={e => handleChange("fullName", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none" placeholder="Jane Doe" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Email Address</label>
                                    <input type="email" required value={formData.email} onChange={e => handleChange("email", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none" placeholder="hello@example.com" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Phone Number</label>
                                    <input type="tel" required value={formData.phone} onChange={e => handleChange("phone", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none" placeholder="07123 456789" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Company Name (Optional)</label>
                                    <input type="text" value={formData.companyName} onChange={e => handleChange("companyName", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none" placeholder="Blanc Ltd." />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Billing Address</label>
                                    <textarea required rows={2} value={formData.billingAddress} onChange={e => handleChange("billingAddress", e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none resize-none" placeholder="Same as venue or provide a different address..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PACKAGE & DJ SELECTION — price is visible before we ask for personal details */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-3xl font-black mb-4">Packages & Services</h2>

                            <div>
                                <h3 className="font-bold text-lg mb-4">Choose a Pre-Configured Package</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => handleChange("selectedPackageId", "")}
                                        className={`p-4 border rounded-xl cursor-pointer transition-all ${formData.selectedPackageId === "" ? "border-[#1F5C4B] bg-emerald-50/30 ring-2 ring-emerald-500/20" : "border-slate-200 hover:border-[#1F5C4B]"}`}
                                    >
                                        <p className="font-bold text-slate-900">Custom Build / None</p>
                                        <p className="text-xs text-slate-500 mt-1">Select individual services below.</p>
                                    </div>
                                    {packages.filter(p => !p.contactForPrice).map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => handleChange("selectedPackageId", p.id)}
                                            className={`relative p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-center ${formData.selectedPackageId === p.id ? "border-[#1F5C4B] bg-emerald-50/30 ring-2 ring-emerald-500/20" : "border-slate-200 hover:border-[#1F5C4B]"}`}
                                        >
                                            <p className="font-bold text-slate-900 pr-16">{p.name}</p>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.description}</p>
                                            {p.dayRate && <span className="absolute top-4 right-4 font-bold text-[#1F5C4B]">{formatCurrency(p.dayRate)}/d</span>}
                                        </div>
                                    ))}
                                    {packages.some(p => p.contactForPrice) && (
                                        <a
                                            href={`/contact?service=${encodeURIComponent(packages.find(p => p.contactForPrice)?.name || "Premium Package")}`}
                                            className="p-4 border border-dashed rounded-xl cursor-pointer transition-all flex flex-col justify-center border-slate-200 hover:border-[#1F5C4B]"
                                        >
                                            <p className="font-bold text-slate-900 pr-16">{packages.find(p => p.contactForPrice)?.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">Quoted individually — request a tailored quote →</p>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="font-bold text-lg mb-4">Book a Professional DJ</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div
                                        onClick={() => handleChange("selectedDJId", "")}
                                        className={`p-4 border rounded-xl cursor-pointer transition-all ${formData.selectedDJId === "" ? "border-[#1F5C4B] bg-emerald-50/30 ring-2 ring-emerald-500/20" : "border-slate-200 hover:border-[#1F5C4B]"}`}
                                    >
                                        <p className="font-bold text-slate-900">No DJ required</p>
                                    </div>
                                    {djServices.map(dj => (
                                        <div
                                            key={dj.id}
                                            onClick={() => handleChange("selectedDJId", dj.id)}
                                            className={`p-4 border flex items-center justify-between rounded-xl cursor-pointer transition-all ${formData.selectedDJId === dj.id ? "border-[#1F5C4B] bg-emerald-50/30 ring-2 ring-emerald-500/20" : "border-slate-200 hover:border-[#1F5C4B]"}`}
                                        >
                                            <div>
                                                <p className="font-bold text-slate-900">{dj.name}</p>
                                                <p className="text-sm text-slate-500 mt-1">{dj.description}</p>
                                            </div>
                                            <span className="font-bold text-[#123A2F] text-lg bg-slate-50 px-3 py-1 rounded-lg">+{formatCurrency(dj.basePrice)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="font-bold text-lg mb-4">Add-ons</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addons.map(addon => (
                                        <div
                                            key={addon.id}
                                            onClick={() => toggleAddon(addon.id)}
                                            className={`p-4 border flex items-center gap-4 rounded-xl cursor-pointer transition-all ${formData.selectedAddons.includes(addon.id) ? "border-[#1F5C4B] bg-emerald-50/30" : "border-slate-200"}`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${formData.selectedAddons.includes(addon.id) ? "bg-[#1F5C4B] border-[#1F5C4B] text-white" : "border-slate-300"}`}>
                                                {formData.selectedAddons.includes(addon.id) && <span className="material-symbols-outlined text-[14px]">check</span>}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 text-sm">{addon.name}</p>
                                            </div>
                                            {(addon.pricingType === "FIXED" || addon.pricingType === "PER_DAY") && <span className="font-bold text-[#1F5C4B] text-sm">+{formatCurrency(addon.priceValue)}{addon.pricingType === "PER_DAY" ? '/d' : ''}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: REVIEW */}
                    {step === 5 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-3xl font-black">Review Details</h2>

                            <div className="bg-slate-50 rounded-2xl p-6 md:p-8 space-y-6 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-slate-500 font-bold mb-1 text-xs uppercase tracking-widest">Client Name</p>
                                        <p className="font-medium text-slate-900">{formData.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-bold mb-1 text-xs uppercase tracking-widest">Event Date</p>
                                        <p className="font-medium text-slate-900">{new Date(formData.date).toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div className="col-span-2 border-t border-slate-200 my-2"></div>
                                    <div className="col-span-2">
                                        <p className="text-slate-500 font-bold mb-1 text-xs uppercase tracking-widest">Venue</p>
                                        <p className="font-medium text-slate-900">{formData.venueAddress}</p>
                                    </div>
                                </div>

                                <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm">
                                    <h4 className="font-black text-lg mb-4 border-b pb-4 border-slate-100">Order Summary</h4>
                                    <div className="space-y-3">
                                        {selectedPkg && (
                                            <div className="flex justify-between items-center">
                                                <span>{selectedPkg.name} ({formData.days} days)</span>
                                                <span className="font-medium">{formatCurrency((selectedPkg.dayRate || 0) * formData.days)}</span>
                                            </div>
                                        )}
                                        {selectedDJ && (
                                            <div className="flex justify-between items-center">
                                                <span>DJ Service: {selectedDJ.name}</span>
                                                <span className="font-medium">{formatCurrency(selectedDJ.basePrice)}</span>
                                            </div>
                                        )}
                                        {addons.filter(a => formData.selectedAddons.includes(a.id)).map(a => (
                                            <div key={a.id} className="flex justify-between items-center">
                                                <span className="text-slate-600 pl-4 border-l-2 border-slate-200">{a.name}</span>
                                                <span className="font-medium">
                                                    {a.pricingType === "FIXED" && formatCurrency(a.priceValue)}
                                                    {a.pricingType === "PER_DAY" && formatCurrency(a.priceValue * formData.days)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-200">
                                        <div className="flex justify-between text-slate-500 mb-2">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500 mb-4">
                                            <span>VAT (20%)</span>
                                            <span>{formatCurrency(vat)}</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-black text-slate-900 border-b border-slate-100 pb-6 mb-6">
                                            <span>Total (inc VAT)</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-black uppercase tracking-widest text-[#1F5C4B] mb-2 block">Payment Option</label>

                                            <div
                                                onClick={() => handleChange("paymentType", "DEPOSIT")}
                                                className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${formData.paymentType === "DEPOSIT" ? "border-[#1F5C4B] bg-emerald-50/30 ring-2 ring-emerald-500/20" : "border-slate-200"}`}
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-900">Pay 25% Deposit Now</p>
                                                    <p className="text-xs text-slate-500">Remainder due 7 days before event.</p>
                                                </div>
                                                <span className="font-black text-lg text-[#1F5C4B]">{formatCurrency(total * 0.25)}</span>
                                            </div>

                                            <div
                                                onClick={() => handleChange("paymentType", "FULL")}
                                                className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${formData.paymentType === "FULL" ? "border-[#1F5C4B] bg-emerald-50/30 ring-2 ring-emerald-500/20" : "border-slate-200"}`}
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-900">Pay Full Balance</p>
                                                    <p className="text-xs text-slate-500">Settle everything upfront.</p>
                                                </div>
                                                <span className="font-black text-lg text-[#1F5C4B]">{formatCurrency(total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 text-center">By confirming, you agree to our <a href="/terms" target="_blank" className="underline hover:text-[#1F5C4B]">Terms of Hire</a>. An automatic PDF invoice will be generated and emailed to you following confirmation.</p>
                        </div>
                    )}


                    {submitError && (
                        <div className="mt-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
                            {submitError}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-10 pt-8 border-t border-slate-100">
                        {step > 1 ? (
                            <button type="button" onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-[#123A2F] border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm focus:ring-2 focus:ring-[#1F5C4B] outline-none">
                                Go Back
                            </button>
                        ) : <div />}

                        <button type="submit" disabled={submitting} className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${submitting ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500' : 'bg-[#123A2F] hover:bg-[#0B241D] text-white shadow-brand-sm hover:translate-y-[-2px]'}`}>
                            {submitting ? "Processing..." : step === 5 ? "Confirm & Book" : "Next Step"}
                            {!submitting && step < 5 && <span className="material-symbols-outlined text-[16px]">arrow_forward</span>}
                            {!submitting && step === 5 && <span className="material-symbols-outlined text-[16px]">lock</span>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
