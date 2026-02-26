"use client";

export default function PrintButton() {
    return (
        <button onClick={() => window.print()} className="bg-[#1F5C4B] hover:bg-[#123A2F] text-white px-6 py-2.5 rounded-lg text-xs tracking-widest font-black uppercase shadow-sm transition-all flex justify-center items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">print</span>
            Print / Save PDF
        </button>
    );
}
