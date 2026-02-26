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
                            Premium AV hire and event production based in the heart of Manchester. Quality without compromise.
                        </p>
                        <div className="flex gap-4">
                            <a className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#1F5C4B] transition-colors" href="#">
                                <span className="material-symbols-outlined text-sm">public</span>
                            </a>
                            <a className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#1F5C4B] transition-colors" href="#">
                                <span className="material-symbols-outlined text-sm">photo_camera</span>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-8">Equipment</h5>
                        <ul className="space-y-4">
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/hire?category=Lighting">Astera Lighting</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/hire?category=Audio">Audio Systems</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/hire?category=Backline">DJ Backline</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/hire?category=Video+%26+LED">LED Video Walls</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-8">Services</h5>
                        <ul className="space-y-4">
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/services">Event Production</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/services">Technical Support</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/services">Long-term Hire</Link></li>
                            <li><Link className="text-slate-600 hover:text-[#1F5C4B] transition-colors text-sm" href="/services">Installation</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-8">Contact</h5>
                        <ul className="space-y-4">
                            <li className="text-slate-400 text-sm">19 Cheetham hill road</li>
                            <li className="text-slate-400 text-sm">M4 4FY</li>
                            <li className="text-slate-400 text-sm">hello@blanc-events.co.uk</li>
                            <li className="text-slate-400 text-sm">07584192578</li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-100">
                    <p className="text-slate-500 text-xs">© 2025 Blanc. Events Manchester Ltd. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a className="text-slate-500 hover:text-[#1F5C4B] transition-colors text-xs" href="#">Privacy Policy</a>
                        <a className="text-slate-500 hover:text-[#1F5C4B] transition-colors text-xs" href="#">Terms of Hire</a>
                        <a className="text-slate-500 hover:text-[#1F5C4B] transition-colors text-xs" href="#">Cookie Settings</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
