import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminInvoiceSchema } from "@/lib/validations";
import {
    allocateInvoiceNumber,
    computeInvoiceTotals,
    deriveInvoiceStatus,
    ensureCounterAhead,
    normalizeInvoiceNumber,
} from "@/lib/invoices";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const view = searchParams.get("view") || "active"; // active | trash | all
    const clientId = searchParams.get("clientId") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const where: Record<string, unknown> = {};

    // Soft-deleted invoices live in the Trash and are excluded by default.
    if (view === "trash") where.deletedAt = { not: null };
    else if (view !== "all") where.deletedAt = null;

    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (from || to) {
        where.issueDate = {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
        };
    }
    if (search) {
        where.OR = [
            { invoiceNumber: { contains: search, mode: "insensitive" } },
            { clientName: { contains: search, mode: "insensitive" } },
            { clientEmail: { contains: search, mode: "insensitive" } },
        ];
    }

    const invoices = await prisma.invoice.findMany({
        where: where as never,
        include: { client: true, bookingOrder: true },
        orderBy: { createdAt: "desc" },
    });

    const trashCount = await prisma.invoice.count({ where: { deletedAt: { not: null } } });

    return NextResponse.json({ invoices, trashCount });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = adminInvoiceSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data = parsed.data;

    // Totals are recomputed here — the browser no longer decides what the money is.
    const totals = computeInvoiceTotals({
        items: data.items,
        adjustments: data.adjustments,
        depositAmount: data.depositAmount,
        amountPaid: 0,
    });

    const requested = normalizeInvoiceNumber(data.invoiceNumber);
    if (requested) {
        const clash = await prisma.invoice.findUnique({ where: { invoiceNumber: requested } });
        if (clash) {
            return NextResponse.json(
                { error: `Invoice number "${requested}" is already used by ${clash.clientName}. Pick another.` },
                { status: 409 },
            );
        }
    }

    try {
        const newInvoice = await prisma.$transaction(async (tx) => {
            let invoiceNumber = requested;
            if (!invoiceNumber) {
                const scope = String(new Date().getFullYear());
                await ensureCounterAhead(tx, scope);
                invoiceNumber = await allocateInvoiceNumber(tx, scope);
            }

            const status = deriveInvoiceStatus({
                current: data.status || "DRAFT",
                total: totals.total,
                amountPaid: 0,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
            });

            return tx.invoice.create({
                data: {
                    invoiceNumber,
                    status,
                    clientId: data.clientId || null,
                    clientName: data.clientName,
                    clientEmail: data.clientEmail,
                    clientAddress: data.clientAddress || "",
                    dueDate: data.dueDate ? new Date(data.dueDate) : null,
                    eventDate: data.eventDate ? new Date(data.eventDate) : null,
                    subtotal: totals.subtotal,
                    vatAmount: totals.vatAmount,
                    discount: 0,
                    total: totals.total,
                    depositAmount: totals.depositAmount,
                    balanceDue: totals.balanceDue,
                    amountPaid: 0,
                    notes: data.notes || "",
                    items: {
                        create: data.items.map((item, idx) => ({
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
                        create: data.adjustments.map((adj) => ({
                            name: adj.name,
                            description: adj.description || "",
                            amount: adj.amount,
                            type: adj.type || "EXTRA",
                        })),
                    },
                },
                include: { items: true, adjustments: true, client: true },
            });
        });

        return NextResponse.json({ success: true, invoice: newInvoice });
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
