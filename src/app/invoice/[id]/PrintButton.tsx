"use client";

import { useState } from "react";

export default function PrintButton({ invoiceNumber, clientName }: { invoiceNumber?: string, clientName?: string }) {
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState("");

    const handleDownloadPDF = async () => {
        setDownloading(true);
        setError("");

        const element = document.getElementById("invoice-document");
        if (!element) {
            setError("Couldn't find the invoice to export.");
            setDownloading(false);
            return;
        }

        // Tighten the document for the physical render.
        element.classList.add("pdf-rendering");

        try {
            // html2canvas-pro (not the original html2canvas) is required: Tailwind v4
            // emits oklch() colours, which the original parser rejects outright.
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                import("html2canvas-pro"),
                import("jspdf"),
            ]);

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
            });

            const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgData = canvas.toDataURL("image/jpeg", 0.98);
            const imgHeight = (canvas.height * pageWidth) / canvas.width;

            // First page, then add pages until the whole document is placed.
            pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, imgHeight);
            let heightLeft = imgHeight - pageHeight;
            while (heightLeft > 0) {
                pdf.addPage();
                pdf.addImage(imgData, "JPEG", 0, heightLeft - imgHeight, pageWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const safe = (s: string) => s.replace(/[\\/:*?"<>|]/g, "-").trim();
            pdf.save(`${safe(clientName || "Customer")}, ${safe(invoiceNumber || "Invoice")}.pdf`);
        } catch (e) {
            console.error("PDF generation failed", e);
            setError("Couldn't generate the PDF. Use Print → Save as PDF instead.");
        } finally {
            // Always restore, even when the render fails.
            element.classList.remove("pdf-rendering");
            setDownloading(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-2">
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
                        {downloading ? "hourglass_empty" : "download"}
                    </span>
                    {downloading ? "Generating…" : "Download PDF"}
                </button>
            </div>
            {error && <p className="text-xs font-semibold text-red-600 max-w-[18rem] text-right">{error}</p>}
        </div>
    );
}
