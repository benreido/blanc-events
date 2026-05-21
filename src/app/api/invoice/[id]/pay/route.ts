import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { siteConfig } from "@/lib/config";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    if (["PAID", "CANCELLED", "REFUNDED"].includes(invoice.status)) {
        return NextResponse.json({ error: "This invoice cannot be paid" }, { status: 400 });
    }

    const amountDue = invoice.balanceDue > 0 ? invoice.balanceDue : invoice.total;
    if (amountDue <= 0) {
        return NextResponse.json({ error: "No amount outstanding" }, { status: 400 });
    }

    const session = await createCheckoutSession(
        amountDue,
        `Invoice ${invoice.invoiceNumber} – Blanc. Events`,
        { invoiceId: invoice.id },
        `${siteConfig.url}/invoice/${invoice.id}?paid=true`,
        `${siteConfig.url}/invoice/${invoice.id}`
    );

    return NextResponse.json({ url: session.url });
}
