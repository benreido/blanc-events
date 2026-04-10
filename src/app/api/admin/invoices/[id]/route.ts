import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { sendPaymentLink } from "@/lib/email";
import { siteConfig } from "@/lib/config";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { items: { orderBy: { sortOrder: "asc" } }, adjustments: true, client: true, payments: true }
    });

    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ invoice });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    if (data.action === "send_payment_link") {
        const invoice = await prisma.invoice.findUnique({ where: { id } });
        if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const amount = invoice.balanceDue > 0 ? invoice.balanceDue : invoice.total;

        try {
            const checkoutSession = await createCheckoutSession(
                amount,
                `Invoice – ${invoice.invoiceNumber}`,
                { invoiceId: invoice.id },
                `${siteConfig.url}/invoice/${invoice.id}?paid=true`,
                `${siteConfig.url}/invoice/${invoice.id}`
            );

            if (checkoutSession.url) {
                await sendPaymentLink(invoice.clientEmail, invoice.clientName, amount, checkoutSession.url);
                await prisma.invoice.update({ where: { id }, data: { status: "SENT", sentAt: new Date() } });
            }

            return NextResponse.json({ success: true, url: checkoutSession.url });
        } catch (e: any) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
    }

    // Check if we are just updating status (e.g. from table actions)
    if (Object.keys(data).length === 1 && data.status) {
        const updateData: any = { status: data.status };
        if (data.status === "SENT") updateData.sentAt = new Date();
        if (data.status === "PAID") {
            updateData.paidAt = new Date();
            updateData.balanceDue = 0;
        }

        const minimalUpdate = await prisma.invoice.update({
            where: { id },
            data: updateData
        });
        return NextResponse.json({ success: true, invoice: minimalUpdate });
    }

    // Otherwise, massive update of all items. To keep things clean, delete all existing and recreate.
    await prisma.$transaction([
        prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
        prisma.invoiceAdjustment.deleteMany({ where: { invoiceId: id } }),
    ]);

    const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
            status: data.status,
            clientId: data.clientId || null,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            clientAddress: data.clientAddress || "",
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            eventDate: data.eventDate ? new Date(data.eventDate) : null,
            subtotal: data.subtotal,
            vatAmount: data.vatAmount,
            discount: data.discount || 0,
            total: data.total,
            depositAmount: data.depositAmount || 0,
            balanceDue: data.balanceDue ?? data.total,
            notes: data.notes || "",
            items: {
                create: (data.items || []).map((item: any, idx: number) => ({
                    name: item.name,
                    description: item.description || "",
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount || 0,
                    discountType: item.discountType || "FIXED",
                    taxable: item.taxable ?? true,
                    sortOrder: idx
                }))
            },
            adjustments: {
                create: (data.adjustments || []).map((adj: any) => ({
                    name: adj.name,
                    description: adj.description || "",
                    amount: adj.amount,
                    type: adj.type || "EXTRA",
                }))
            }
        },
        include: { items: { orderBy: { sortOrder: "asc" } }, adjustments: true, client: true }
    });

    return NextResponse.json({ success: true, invoice: updatedInvoice });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
