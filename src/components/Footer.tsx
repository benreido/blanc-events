import Link from "next/link";

export default function Footer() {
    return (
        <footer className="py-20 px-6 border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 bg-[#123A2F] flex items-center justify-center rounded">
                                <span className="material-symbols-outlined text-white text-sm">layers</span>
                            </div>
                            <span className="text-lg font-black tracking-tighter uppercase">Blanc. Events</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            Lighting design and production studio based in Manchester. DMX-controlled environments for events that matter.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-8">Equipment</h5>
                        <ul className="space-y-4">
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/hire?category=Lighting">Astera Lighting</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href={`/hire?category=${encodeURIComponent("DJ & Playback")}`}>DJ &amp; Playback</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/packages">Production Packages</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/hire">View full catalogue</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-8">Services</h5>
                        <ul className="space-y-4">
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/weddings">Weddings</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/services">Lighting Design</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/services">Event Production</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/contact">Get a proposal</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-8">Contact</h5>
                        <ul className="space-y-4">
                            <li className="text-slate-400 text-sm">19 Cheetham Hill Road</li>
                            <li className="text-slate-400 text-sm">Manchester M4 4FY</li>
                            <li><a className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="mailto:hello@blanc-events.co.uk">hello@blanc-events.co.uk</a></li>
                            <li><a className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="tel:+447584192578">07584 192 578</a></li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-100">
                    <p className="text-slate-500 text-xs">© {new Date().getFullYear()} Blanc. Events Manchester Ltd. All rights reserved. Registered in England &amp; Wales.</p>
                    <div className="flex gap-8">
                        <Link className="text-slate-500 hover:text-[#1F5C4B] transition-colors text-xs" href="/privacy">Privacy Policy</Link>
                        <Link className="text-slate-500 hover:text-[#1F5C4B] transition-colors text-xs" href="/terms">Terms of Hire</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
