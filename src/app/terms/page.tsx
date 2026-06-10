import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
    title: "Terms of Hire | Blanc. Events",
    description: "Terms and conditions for equipment hire and event production services from Blanc. Events Manchester.",
    alternates: { canonical: "https://www.blanc-events.co.uk/terms" },
};

const LAST_UPDATED = "10 June 2026";

export default function TermsPage() {
    return (
        <>
            <Navbar />
            <main className="pt-20">
                <section className="py-20 px-6 bg-white">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4">Terms of Hire</h1>
                        <p className="text-slate-400 text-sm mb-12">Last updated: {LAST_UPDATED}</p>

                        <div className="space-y-10 text-slate-600 text-sm leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
                            <div>
                                <h2>1. These terms</h2>
                                <p>
                                    These terms apply to all equipment hire and event production services provided by
                                    Blanc. Events Manchester Ltd of 19 Cheetham Hill Road, Manchester M4 4FY
                                    (&ldquo;Blanc. Events&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By placing a booking you
                                    (&ldquo;the Hirer&rdquo;) agree to them.
                                </p>
                            </div>

                            <div>
                                <h2>2. Quotes, deposits and payment</h2>
                                <ul>
                                    <li>Quotes are valid for 30 days unless stated otherwise.</li>
                                    <li>A deposit of 25% of the total booking value secures your date. The balance is due before or on the first day of hire unless agreed in writing.</li>
                                    <li>Prices shown on this website are per day and exclude VAT unless stated otherwise.</li>
                                </ul>
                            </div>

                            <div>
                                <h2>3. Cancellation</h2>
                                <ul>
                                    <li>More than 30 days before the hire date: deposit refunded in full.</li>
                                    <li>14–30 days before: deposit retained.</li>
                                    <li>Fewer than 14 days before: 50% of the total booking value is payable.</li>
                                    <li>Fewer than 48 hours before: the full booking value is payable.</li>
                                </ul>
                                <p className="mt-3">We will always try to rebook your date and reduce these charges where we can.</p>
                            </div>

                            <div>
                                <h2>4. The Hirer&apos;s responsibilities</h2>
                                <ul>
                                    <li>Equipment remains our property at all times.</li>
                                    <li>From delivery or collection until return, the Hirer is responsible for the equipment, including loss, theft and damage beyond fair wear and tear.</li>
                                    <li>Replacement or repair costs for lost or damaged items are charged at full replacement value.</li>
                                    <li>Equipment must only be used in line with any instructions we provide, in suitable weather-protected conditions, and must not be repaired, modified or opened by anyone other than us.</li>
                                    <li>For dry hire, the Hirer must be 18 or over and may be asked for ID and proof of address.</li>
                                </ul>
                            </div>

                            <div>
                                <h2>5. Delivery, setup and collection</h2>
                                <p>
                                    Where delivery and setup are included, we require reasonable access to the venue at the agreed
                                    times. Waiting time, parking charges or congestion fees caused by restricted access may be
                                    re-charged at cost. Hired equipment must be available for collection at the agreed end time.
                                </p>
                            </div>

                            <div>
                                <h2>6. Safety and testing</h2>
                                <p>
                                    All electrical equipment is PAT tested and visually inspected before every hire. Special
                                    effects (including dry ice and cold spark machines) are operated only by our trained staff or
                                    in line with written guidance we provide, and are subject to venue approval, which the Hirer
                                    is responsible for obtaining.
                                </p>
                            </div>

                            <div>
                                <h2>7. Our liability</h2>
                                <p>
                                    Nothing in these terms limits our liability for death or personal injury caused by our
                                    negligence or for anything else that cannot lawfully be limited. Subject to that, our total
                                    liability in connection with a booking is limited to the amount paid for that booking, and we
                                    are not liable for indirect or consequential losses.
                                </p>
                            </div>

                            <div>
                                <h2>8. Events beyond our control</h2>
                                <p>
                                    Neither party is liable for failure to perform caused by events beyond reasonable control. If
                                    such an event prevents us from fulfilling your booking, you may choose between rescheduling
                                    and a full refund of amounts paid for the affected services.
                                </p>
                            </div>

                            <div>
                                <h2>9. General</h2>
                                <p>
                                    These terms are governed by the law of England and Wales and any disputes are subject to the
                                    exclusive jurisdiction of the courts of England and Wales. Questions? Email{" "}
                                    <a className="text-[#1F5C4B] underline" href="mailto:hello@blanc-events.co.uk">hello@blanc-events.co.uk</a>{" "}
                                    or call <a className="text-[#1F5C4B] underline" href="tel:+447584192578">07584 192 578</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
