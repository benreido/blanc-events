import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminInvoiceBar from "./AdminInvoiceBar";
import { formatCurrency } from "@/lib/config";
import Link from "next/link";
import PrintButton from "./PrintButton";
import PayNowButton from "./PayNowButton";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // First try by Invoice ID directly
    let invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { items: { orderBy: { sortOrder: "asc" } }, adjustments: true, bookingOrder: { include: { lineItems: { include: { equipmentItem: true, package: true } }, serviceAddons: { include: { serviceAddon: true } }, djServices: { include: { djService: true } } } } }
    });

    // If not found, try by booking order ID for backwards compatibility
    if (!invoice) {
        invoice = await prisma.invoice.findUnique({
            where: { bookingOrderId: id },
            include: { items: { orderBy: { sortOrder: "asc" } }, adjustments: true, bookingOrder: { include: { lineItems: { include: { equipmentItem: true, package: true } }, serviceAddons: { include: { serviceAddon: true } }, djServices: { include: { djService: true } } } } }
        });
    }

    if (!invoice) return notFound();

    // Soft-deleted invoices stay reachable for admins (so they can restore or
    // recreate them from this link) but are hidden from clients.
    const session = await getServerSession(authOptions);
    const isAdmin = Boolean(session?.user);
    if (invoice.deletedAt && !isAdmin) return notFound();

    const booking = invoice.bookingOrder;

    const isPaid = invoice.status === "PAID";
    const isCancelled = ["CANCELLED", "REFUNDED", "VOID"].includes(invoice.status);
    const amountDue = invoice.balanceDue > 0 ? invoice.balanceDue : invoice.total;
    const canPay = !isPaid && !isCancelled && amountDue > 0;

    return (
        <div className="min-h-screen bg-[#f1f5f9] py-12 px-4 print:p-0 print:bg-white flex flex-col items-center">

            {isAdmin && (
                <AdminInvoiceBar
                    invoiceId={invoice.id}
                    invoiceNumber={invoice.invoiceNumber}
                    isDeleted={Boolean(invoice.deletedAt)}
                />
            )}

            {/* Quick Actions (Hidden on Print) */}
            <div className="max-w-[800px] w-full mb-8 flex items-center justify-between print:hidden">
                <Link href="/" className="text-sm font-bold tracking-widest uppercase text-[#64748b] hover:text-[#0f172a] transition-colors">
                    <span className="material-symbols-outlined align-middle mr-1 text-[16px]">arrow_back</span>
                    Return to Site
                </Link>
                <div className="flex gap-4">
                    {canPay && <PayNowButton invoiceId={invoice.id} amount={amountDue} />}
                    <PrintButton invoiceNumber={invoice.invoiceNumber} clientName={invoice.clientName} />
                </div>
            </div>

            {/* Payment status banner */}
            {isPaid && (
                <div className="max-w-[800px] w-full mb-6 print:hidden bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
                    <div>
                        <p className="font-bold text-emerald-800 text-sm">Payment received — thank you!</p>
                        <p className="text-emerald-700 text-xs mt-0.5">This invoice has been paid in full. No further action is required.</p>
                    </div>
                </div>
            )}
            {isCancelled && (
                <div className="max-w-[800px] w-full mb-6 print:hidden bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-2xl">cancel</span>
                    <p className="font-bold text-slate-500 text-sm">This invoice has been {invoice.status.toLowerCase()}.</p>
                </div>
            )}
            {canPay && invoice.dueDate && new Date(invoice.dueDate) < new Date() && (
                <div className="max-w-[800px] w-full mb-6 print:hidden bg-rose-50 border border-rose-200 rounded-xl px-5 py-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-rose-500 text-2xl">warning</span>
                    <div>
                        <p className="font-bold text-rose-800 text-sm">Payment overdue</p>
                        <p className="text-rose-700 text-xs mt-0.5">This invoice was due on {new Date(invoice.dueDate).toLocaleDateString("en-GB")}. Please pay as soon as possible.</p>
                    </div>
                </div>
            )}

            {/* A4 Document Area */}
            <div id="invoice-document" className="bg-white w-full max-w-[800px] shadow-lg print:shadow-none min-h-[1131px] print:min-h-0 print:max-h-[296mm] mx-auto p-12 md:p-16 print:p-[12mm] relative flex flex-col rounded-sm print:rounded-none print:overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-start mb-16 print:mb-3 border-b border-[#e2e8f0] pb-12 print:pb-3">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-[#123A2F] mb-1">Blanc. Events</h1>
                        <p className="text-sm text-[#64748b] mb-6">Premium AV & Event Production</p>
                        <div className="text-xs text-[#475569] space-y-1">
                            <p>19 Cheetham hill road</p>
                            <p>M4 4FY</p>
                            <p>United Kingdom</p>
                            <p className="mt-2">hello@blanc-events.co.uk</p>
                            <p>07584192578</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black tracking-tighter text-[#e2e8f0] mb-2 uppercase">Invoice</h2>
                        <div className="text-xs font-bold text-[#64748b] space-y-2 mt-6">
                            <p className="flex justify-between gap-8"><span>Invoice Number:</span> <span className="text-[#0f172a]">{invoice.invoiceNumber}</span></p>
                            <p className="flex justify-between gap-8"><span>Date Issued:</span> <span className="text-[#0f172a]">{new Date(invoice.issueDate).toLocaleDateString("en-GB")}</span></p>
                            <p className="flex justify-between gap-8"><span>Due Date:</span> <span className="text-[#0f172a]">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-GB") : "On Receipt"}</span></p>
                            <p className="flex justify-between gap-8"><span>Reference:</span> <span className="text-[#0f172a] uppercase">{booking ? booking.id.slice(0, 8) : invoice.id.slice(0, 8)}</span></p>
                        </div>
                    </div>
                </div>

                {/* Billed To */}
                <div className="mb-12 print:mb-3 flex justify-between">
                    <div>
                        <p className="text-[10px] font-black tracking-widest uppercase text-[#94a3b8] mb-3">Billed To</p>
                        <h3 className="font-bold text-lg text-[#0f172a] mb-1">{invoice.clientName}</h3>
                        {booking?.company && <p className="text-sm text-[#475569] font-medium mb-1">{booking.company}</p>}
                        <p className="text-sm text-[#64748b] max-w-xs whitespace-pre-wrap">{invoice.clientAddress || booking?.venue}</p>
                        <p className="text-sm text-[#64748b] mt-2">{invoice.clientEmail}</p>
                        {booking?.customerPhone && <p className="text-sm text-[#64748b]">{booking.customerPhone}</p>}
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] font-black tracking-widest uppercase text-[#94a3b8] mb-3">Event Details</p>
                        {booking ? (
                            <div className="text-sm text-[#475569] space-y-1 text-right">
                                <p><span className="font-medium">Dates:</span> {new Date(booking.startDate).toLocaleDateString("en-GB")} - {new Date(booking.endDate).toLocaleDateString("en-GB")}</p>
                                <p><span className="font-medium">Duration:</span> {booking.numberOfDays} Days</p>
                                <p><span className="font-medium">Venue:</span> {booking.venue}</p>
                            </div>
                        ) : (
                            <div className="text-sm text-[#475569] space-y-1 text-right">
                                <p><span className="font-medium">Issue Date:</span> {new Date(invoice.issueDate).toLocaleDateString("en-GB")}</p>
                                {invoice.dueDate && <p><span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString("en-GB")}</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Line Items */}
                <div className="print:flex-none mb-16 print:mb-3">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-[#0f172a]">
                                <th className="py-3 text-[10px] font-black tracking-widest uppercase text-[#64748b]">Description</th>
                                <th className="py-3 text-[10px] font-black tracking-widest uppercase text-[#64748b] text-center">Qty / Days</th>
                                <th className="py-3 text-[10px] font-black tracking-widest uppercase text-[#64748b] text-right">Rate</th>
                                <th className="py-3 text-[10px] font-black tracking-widest uppercase text-[#64748b] text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f1f5f9] text-sm">
                            {/* Custom Invoice Items */}
                            {invoice.items && invoice.items.length > 0 && invoice.items.map((it: any) => {
                                let lineTotal = it.quantity * it.unitPrice;
                                if (it.discountType === "FIXED") lineTotal -= it.discount;
                                else if (it.discountType === "PERCENTAGE") lineTotal -= lineTotal * (it.discount / 100);

                                return (
                                    <tr key={it.id}>
                                        <td className="py-4 text-[#0f172a]">
                                            <span className="font-bold">{it.name}</span>
                                            {it.description && <p className="text-xs text-[#64748b] mt-1">{it.description}</p>}
                                            {it.discount > 0 && (
                                                <p className="text-[11px] text-[#059669] font-bold mt-1 uppercase tracking-wider">
                                                    Discount Applied: {it.discountType === "PERCENTAGE" ? `${it.discount}%` : formatCurrency(it.discount)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-4 text-[#475569] text-center">{it.quantity}</td>
                                        <td className="py-4 text-[#475569] text-right">{formatCurrency(it.unitPrice)}</td>
                                        <td className="py-4 text-[#0f172a] font-bold text-right">{formatCurrency(lineTotal)}</td>
                                    </tr>
                                )
                            })}

                            {/* Legacy Booking Items */}
                            {booking?.lineItems?.map((li: any) => (
                                <tr key={li.id}>
                                    <td className="py-4 text-[#0f172a]"><span className="font-bold">{li.itemName}</span></td>
                                    <td className="py-4 text-[#475569] text-center">{li.quantity} &times; {booking.numberOfDays}d</td>
                                    <td className="py-4 text-[#475569] text-right">{formatCurrency(li.dayRate)}</td>
                                    <td className="py-4 text-[#0f172a] font-bold text-right">{formatCurrency(li.lineTotal)}</td>
                                </tr>
                            ))}
                            {/* Legacy DJ Services */}
                            {booking?.djServices?.map((dj: any) => (
                                <tr key={dj.id}>
                                    <td className="py-4 text-[#0f172a]"><span className="font-bold">DJ Service: {dj.serviceName}</span></td>
                                    <td className="py-4 text-[#475569] text-center">1</td>
                                    <td className="py-4 text-[#475569] text-right">{formatCurrency(dj.priceValue)}</td>
                                    <td className="py-4 text-[#0f172a] font-bold text-right">{formatCurrency(dj.priceValue)}</td>
                                </tr>
                            ))}
                            {/* Legacy Addons */}
                            {booking?.serviceAddons?.map((svc: any) => (
                                <tr key={svc.id}>
                                    <td className="py-4 text-[#0f172a]"><span className="font-bold">Add-on: {svc.serviceName}</span></td>
                                    <td className="py-4 text-[#475569] text-center">1</td>
                                    <td className="py-4 text-[#475569] text-right">{formatCurrency(svc.priceValue)}</td>
                                    <td className="py-4 text-[#0f172a] font-bold text-right">{formatCurrency(svc.priceValue)}</td>
                                </tr>
                            ))}

                            {/* Adjustments / Extras */}
                            {invoice.adjustments && invoice.adjustments.map((adj: any) => (
                                <tr key={adj.id}>
                                    <td className="py-4 text-[#0f172a] italic" colSpan={3}>
                                        {adj.name || adj.type} {adj.description && <span className="text-[#64748b] text-xs">- {adj.description}</span>}
                                    </td>
                                    <td className="py-4 text-[#0f172a] font-bold text-right">{adj.type === 'DISCOUNT' ? '-' : ''}{formatCurrency(Math.abs(adj.amount))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end pt-8 print:pt-2 border-t-2 border-[#0f172a]">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-[#475569]">
                            <span>Subtotal</span>
                            <span>{formatCurrency(invoice.subtotal)}</span>
                        </div>
                        {invoice.discount > 0 && (
                            <div className="flex justify-between text-sm font-medium text-[#059669]">
                                <span>Discount</span>
                                <span>-{formatCurrency(invoice.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-[#475569]">
                            <span>VAT (20%)</span>
                            <span>{formatCurrency(invoice.vatAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-black text-[#123A2F] border-t border-[#e2e8f0] mt-3 pt-3 mb-1">
                            <span>Total Due</span>
                            <span>{formatCurrency(invoice.total)}</span>
                        </div>
                        {invoice.amountPaid > 0 && (
                            <div className="flex justify-between text-sm text-[#16a34a] font-bold">
                                <span>Amount Paid</span>
                                <span>-{formatCurrency(invoice.amountPaid)}</span>
                            </div>
                        )}
                        {(invoice.balanceDue > 0 && invoice.amountPaid > 0) && (
                            <div className="flex justify-between text-sm text-[#1e293b] font-black mt-2">
                                <span>Remaining Balance</span>
                                <span>{formatCurrency(invoice.balanceDue)}</span>
                            </div>
                        )}
                        {(invoice.depositAmount > 0 && invoice.amountPaid === 0) && (
                            <div className="flex justify-between text-sm text-[#1F5C4B] font-bold mt-2 pt-2 border-t border-[#f1f5f9]">
                                <span>Deposit Required Now</span>
                                <span>{formatCurrency(invoice.depositAmount)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {invoice.notes && (
                    <div className="mt-8 print:mt-2 pt-8 print:pt-2 border-t border-[#f1f5f9]">
                        <p className="text-[10px] font-black tracking-widest uppercase text-[#94a3b8] mb-2">Notes & Terms</p>
                        <p className="text-sm text-[#475569] whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                )}

                {/* Footer Notes */}
                <div className="mt-auto print:mt-2 pt-16 print:pt-2 border-t border-[#e2e8f0] text-xs text-[#64748b] text-center">
                    <p className="font-bold text-[#0f172a] mb-1">Payment Details</p>
                    <p>Bank Transfer: Blanc Collective LTD | Sort: 04-00-05 | Acct: 95990226</p>
                    <p className="mt-4">Payment is required 7 days prior to event commencement. Standard terms and conditions apply.</p>
                </div>

                {invoice.status === "PAID" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none opacity-10">
                        <span className="text-8xl font-black uppercase text-[#10b981] border-8 border-[#10b981] px-8 py-4 rounded-xl">Paid</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// Ensure dynamic rendering
export const dynamic = "force-dynamic";
