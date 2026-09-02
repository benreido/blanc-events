import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoicePaymentSchema } from "@/lib/validations";
import { computeInvoiceTotals, deriveInvoiceStatus, round2 } from "@/lib/invoices";

/**
 * Recomputes the invoice's money and status from the payments table, which is the
 * single source of truth. Previously amountPaid/balanceDue were incremented by hand
 * in several places and drifted out of step with the recorded payments.
 */
async function resyncInvoice(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { items: true, adjustments: true },
    });
    if (!invoice) return null;

    const agg = await prisma.invoicePayment.aggregate({
        where: { invoiceId, status: "SUCCESS" },
        _sum: { amount: true },
    });
    const amountPaid = round2(agg._sum.amount ?? 0);

    const totals = computeInvoiceTotals({
        items: invoice.items,
        adjustments: invoice.adjustments,
        depositAmount: invoice.depositAmount,
        amountPaid,
    });

    const status = deriveInvoiceStatus({
        current: invoice.status,
        total: totals.total,
        amountPaid: totals.amountPaid,
        dueDate: invoice.dueDate,
        voidedAt: invoice.voidedAt,
    });

    return prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            amountPaid: totals.amountPaid,
            balanceDue: totals.balanceDue,
            status,
            ...(status === "PAID" && !invoice.paidAt ? { paidAt: new Date() } : {}),
            ...(status !== "PAID" ? { paidAt: null } : {}),
        },
    });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = invoicePaymentSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { amount, paymentMethod, reference, paymentDate } = parsed.data;

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const payment = await prisma.invoicePayment.create({
        data: {
            invoiceId: id,
            amount: round2(amount),
            paymentMethod: paymentMethod || "BACS",
            reference: reference || "",
            status: "SUCCESS",
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        },
    });

    const updated = await resyncInvoice(id);
    return NextResponse.json({ success: true, payment, invoice: updated });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const payments = await prisma.invoicePayment.findMany({
        where: { invoiceId: id },
        orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json({ payments });
}

/** Removes a mistakenly-recorded payment and resyncs the invoice. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");
    if (!paymentId) return NextResponse.json({ error: "paymentId required" }, { status: 400 });

    const payment = await prisma.invoicePayment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.invoiceId !== id) {
        return NextResponse.json({ error: "Payment not found on this invoice" }, { status: 404 });
    }

    await prisma.invoicePayment.delete({ where: { id: paymentId } });
    const updated = await resyncInvoice(id);
    return NextResponse.json({ success: true, invoice: updated });
}
