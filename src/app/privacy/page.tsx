import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
    title: "Privacy Policy | Blanc. Events",
    description: "How Blanc. Events collects, uses and protects your personal data.",
    alternates: { canonical: "https://www.blanc-events.co.uk/privacy" },
};

const LAST_UPDATED = "10 June 2026";

export default function PrivacyPage() {
    return (
        <>
            <Navbar />
            <main className="pt-20">
                <section className="py-20 px-6 bg-white">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-4">Privacy Policy</h1>
                        <p className="text-slate-400 text-sm mb-12">Last updated: {LAST_UPDATED}</p>

                        <div className="space-y-10 text-slate-600 text-sm leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
                            <div>
                                <h2>Who we are</h2>
                                <p>
                                    Blanc. Events Manchester Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is an event production and equipment
                                    hire company based at 19 Cheetham Hill Road, Manchester M4 4FY. We are the data controller for
                                    personal data collected through this website. You can contact us about anything in this policy
                                    at <a className="text-[#1F5C4B] underline" href="mailto:hello@blanc-events.co.uk">hello@blanc-events.co.uk</a>.
                                </p>
                            </div>

                            <div>
                                <h2>What we collect and why</h2>
                                <ul>
                                    <li><strong>Enquiry and contact forms</strong> — your name, email address, phone number, company name and event details. We use these to respond to your enquiry and prepare quotes. Legal basis: steps taken at your request prior to entering a contract.</li>
                                    <li><strong>Bookings</strong> — the above plus venue address, billing address and order details. We use these to fulfil your hire or production booking, issue invoices and provide support. Legal basis: performance of a contract.</li>
                                    <li><strong>Payments</strong> — card payments are processed by Stripe. We never see or store your full card number. Stripe&apos;s privacy policy is at <a className="text-[#1F5C4B] underline" href="https://stripe.com/gb/privacy" target="_blank" rel="noopener noreferrer">stripe.com/gb/privacy</a>.</li>
                                    <li><strong>Correspondence</strong> — emails we exchange with you, kept so we have a record of your booking and our advice. Legal basis: legitimate interests.</li>
                                </ul>
                            </div>

                            <div>
                                <h2>Cookies</h2>
                                <p>
                                    This site uses only essential cookies needed to make the site work (for example, keeping your
                                    equipment basket while you browse). We do not use advertising or cross-site tracking cookies.
                                </p>
                            </div>

                            <div>
                                <h2>Who we share data with</h2>
                                <p>We share personal data only with service providers who help us run the business:</p>
                                <ul>
                                    <li>Stripe (payment processing)</li>
                                    <li>Vercel (website hosting)</li>
                                    <li>Resend (transactional email delivery)</li>
                                </ul>
                                <p className="mt-3">
                                    We do not sell personal data. Where a provider processes data outside the UK, transfers are
                                    protected by recognised safeguards such as the UK International Data Transfer Agreement or
                                    adequacy regulations.
                                </p>
                            </div>

                            <div>
                                <h2>How long we keep it</h2>
                                <p>
                                    Enquiry data is kept for up to 2 years from last contact. Booking and invoice records are kept
                                    for 6 years after the end of the tax year they relate to, as required by HMRC rules.
                                </p>
                            </div>

                            <div>
                                <h2>Your rights</h2>
                                <p>
                                    Under UK GDPR you have the right to access, correct, delete, restrict or object to our use of
                                    your personal data, and to data portability. To exercise any of these rights, email{" "}
                                    <a className="text-[#1F5C4B] underline" href="mailto:hello@blanc-events.co.uk">hello@blanc-events.co.uk</a>.
                                    You also have the right to complain to the Information Commissioner&apos;s Office at{" "}
                                    <a className="text-[#1F5C4B] underline" href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
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
