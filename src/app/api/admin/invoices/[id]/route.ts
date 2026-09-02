import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { sendPaymentLink } from "@/lib/email";
import { siteConfig } from "@/lib/config";
import { adminInvoiceSchema } from "@/lib/validations";
import {
    assertStatusTransition,
    computeInvoiceTotals,
    deriveInvoiceStatus,
    mustBeVoidedNotDeleted,
    normalizeInvoiceNumber,
} from "@/lib/invoices";

/** Sum of successful payments — the single source of truth for amountPaid. */
async function paidTotal(invoiceId: string): Promise<number> {
    const agg = await prisma.invoicePayment.aggregate({
        where: { invoiceId, status: "SUCCESS" },
        _sum: { amount: true },
    });
    return agg._sum.amount ?? 0;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { items: { orderBy: { sortOrder: "asc" } }, adjustments: true, client: true, payments: true },
    });

    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ invoice });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // ─── Void: keeps the document as a permanent record instead of destroying it ───
    if (data.action === "void") {
        const voided = await prisma.invoice.update({
            where: { id },
            data: { status: "VOID", voidedAt: new Date() },
        });
        return NextResponse.json({ success: true, invoice: voided });
    }

    // ─── Send a Stripe payment link ───
    if (data.action === "send_payment_link") {
        const amount = existing.balanceDue > 0 ? existing.balanceDue : existing.total;
        if (amount <= 0) {
            return NextResponse.json({ error: "Nothing left to pay on this invoice." }, { status: 400 });
        }
        try {
            const checkoutSession = await createCheckoutSession(
                amount,
                `Invoice – ${existing.invoiceNumber}`,
                { invoiceId: existing.id },
                `${siteConfig.url}/invoice/${existing.id}?paid=true`,
                `${siteConfig.url}/invoice/${existing.id}`,
            );

            if (checkoutSession.url) {
                await sendPaymentLink(existing.clientEmail, existing.clientName, amount, checkoutSession.url);
                await prisma.invoice.update({ where: { id }, data: { status: "SENT", sentAt: new Date() } });
            }

            return NextResponse.json({ success: true, url: checkoutSession.url });
        } catch (e: unknown) {
            return NextResponse.json({ error: (e as Error).message }, { status: 500 });
        }
    }

    // ─── Status-only update (from table row actions) ───
    if (Object.keys(data).length === 1 && data.status) {
        try {
            assertStatusTransition(existing.status, data.status);
        } catch (e) {
            return NextResponse.json({ error: (e as Error).message }, { status: 409 });
        }

        const updateData: Record<string, unknown> = { status: data.status };
        if (data.status === "SENT") updateData.sentAt = new Date();
        if (data.status === "VOID") updateData.voidedAt = new Date();
        if (data.status === "PAID") {
            const total = existing.total;
            updateData.paidAt = new Date();
            updateData.balanceDue = 0;
            updateData.amountPaid = total; // keep amountPaid in step with balanceDue
        }

        const minimalUpdate = await prisma.invoice.update({ where: { id }, data: updateData });
        return NextResponse.json({ success: true, invoice: minimalUpdate });
    }

    // ─── Full edit ───
    const parsed = adminInvoiceSchema.safeParse(data);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const payload = parsed.data;

    if (payload.status) {
        try {
            assertStatusTransition(existing.status, payload.status);
        } catch (e) {
            return NextResponse.json({ error: (e as Error).message }, { status: 409 });
        }
    }

    // The invoice number is now editable — and checked for clashes up front so the
    // operator gets a clear message instead of an unhandled unique-constraint 500.
    const requested = normalizeInvoiceNumber(payload.invoiceNumber);
    if (requested && requested !== existing.invoiceNumber) {
        const clash = await prisma.invoice.findUnique({ where: { invoiceNumber: requested } });
        if (clash && clash.id !== id) {
            return NextResponse.json(
                { error: `Invoice number "${requested}" is already used by ${clash.clientName}. Pick another.` },
                { status: 409 },
            );
        }
    }

    const amountPaid = await paidTotal(id);
    const totals = computeInvoiceTotals({
        items: payload.items,
        adjustments: payload.adjustments,
        depositAmount: payload.depositAmount,
        amountPaid,
    });

    const status = deriveInvoiceStatus({
        current: payload.status || existing.status,
        total: totals.total,
        amountPaid: totals.amountPaid,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        voidedAt: existing.voidedAt,
    });

    try {
        // One transaction: clearing the old lines and writing the new ones can no
        // longer half-succeed and strand the invoice with no line items.
        const updatedInvoice = await prisma.$transaction(async (tx) => {
            await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
            await tx.invoiceAdjustment.deleteMany({ where: { invoiceId: id } });

            return tx.invoice.update({
                where: { id },
                data: {
                    ...(requested ? { invoiceNumber: requested } : {}),
                    status,
                    clientId: payload.clientId || null,
                    clientName: payload.clientName,
                    clientEmail: payload.clientEmail,
                    clientAddress: payload.clientAddress || "",
                    dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
                    eventDate: payload.eventDate ? new Date(payload.eventDate) : null,
                    subtotal: totals.subtotal,
                    vatAmount: totals.vatAmount,
                    discount: 0,
                    total: totals.total,
                    depositAmount: totals.depositAmount,
                    amountPaid: totals.amountPaid,
                    balanceDue: totals.balanceDue,
                    notes: payload.notes || "",
                    ...(status === "PAID" && !existing.paidAt ? { paidAt: new Date() } : {}),
                    items: {
                        create: payload.items.map((item, idx) => ({
                            name: item.name,
                            description: item.description || "",
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            discount: item.discount || 0,
                            discountType: item.discountType || "FIXED",
                            taxable: item.taxable ?? true,
                            sortOrder: idx,
                        })),
                    },
                    adjustments: {
                        create: payload.adjustments.map((adj) => ({
                            name: adj.name,
                            description: adj.description || "",
                            amount: adj.amount,
                            type: adj.type || "EXTRA",
                        })),
                    },
                },
                include: { items: { orderBy: { sortOrder: "asc" } }, adjustments: true, client: true },
            });
        });

        return NextResponse.json({ success: true, invoice: updatedInvoice });
    } catch (e: unknown) {
        const err = e as { code?: string };
        if (err?.code === "P2002") {
            return NextResponse.json(
                { error: "That invoice number is already in use. Pick another." },
                { status: 409 },
            );
        }
        throw e;
    }
}

/**
 * Soft delete by default — the invoice moves to Trash and can be restored.
 * Permanent deletion is opt-in and refused for anything already issued or paid,
 * so financial records can't be destroyed with one click.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (permanent) {
        const amountPaid = await paidTotal(id);
        if (mustBeVoidedNotDeleted({ status: invoice.status, amountPaid })) {
            return NextResponse.json(
                {
                    error: `${invoice.invoiceNumber} has been issued or has payments recorded against it, so it can't be permanently deleted. Void it instead — it stays in your records but is clearly marked void.`,
                },
                { status: 409 },
            );
        }
        await prisma.invoice.delete({ where: { id } });
        return NextResponse.json({ success: true, permanent: true });
    }

    const deleted = await prisma.invoice.update({
        where: { id },
        data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true, invoice: deleted });
}
