import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { amount, paymentMethod, reference, paymentDate } = await req.json();

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const payment = await prisma.invoicePayment.create({
        data: {
            invoiceId: id,
            amount,
            paymentMethod: paymentMethod || "BACS",
            reference: reference || "",
            status: "SUCCESS",
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        },
    });

    const newAmountPaid = invoice.amountPaid + amount;
    const newBalanceDue = Math.max(0, invoice.total - newAmountPaid);
    const newStatus =
        newBalanceDue === 0 ? "PAID" :
        newAmountPaid > 0 ? "PARTIALLY_PAID" :
        invoice.status;

    const updated = await prisma.invoice.update({
        where: { id },
        data: {
            amountPaid: newAmountPaid,
            balanceDue: newBalanceDue,
            status: newStatus,
            ...(newStatus === "PAID" ? { paidAt: new Date() } : {}),
        },
    });

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
