"use client";

import { useState } from "react";

export default function PrintButton({ invoiceNumber, clientName }: { invoiceNumber?: string, clientName?: string }) {
    const [downloading, setDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            // Dynamically import html2pdf to avoid SSR issues
            const html2pdf = (await import('html2pdf.js')).default;

            const element = document.getElementById('invoice-document');
            if (!element) return;

            // Temporarily add a class to slightly tighten the document for the physical PDF render
            element.classList.add('pdf-rendering');

            const opt = {
                margin: 5, // mm
                filename: `${clientName || 'Customer'}, ${invoiceNumber || 'Invoice'}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, windowWidth: 800 },
                jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();

            element.classList.remove('pdf-rendering');
        } catch (error) {
            console.error("PDF generation failed", error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => window.print()}
                className="bg-white border border-slate-200 hover:border-[#1F5C4B] text-[#1F5C4B] px-4 py-2.5 rounded-lg text-xs tracking-widest font-black uppercase shadow-sm transition-all flex justify-center items-center gap-2"
            >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print
            </button>
            <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="bg-[#1F5C4B] hover:bg-[#123A2F] text-white px-6 py-2.5 rounded-lg text-xs tracking-widest font-black uppercase shadow-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
                <span className="material-symbols-outlined text-[16px]">
                    {downloading ? 'hourglass_empty' : 'download'}
                </span>
                {downloading ? 'Generating...' : 'Download PDF'}
            </button>
        </div>
    );
}
