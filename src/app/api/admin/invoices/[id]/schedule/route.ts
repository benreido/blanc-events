import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addMonths } from "date-fns";
import { nextInvoiceNumber } from "@/lib/invoices";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const occurrences = body.occurrences ? parseInt(body.occurrences) : 11;
    
    if (occurrences <= 0 || occurrences > 36) {
        return NextResponse.json({ error: "Invalid occurrence count (must be between 1 and 36)" }, { status: 400 });
    }

    const original = await prisma.invoice.findUnique({
        where: { id },
        include: {
            items: { orderBy: { sortOrder: "asc" } },
            adjustments: true,
        },
    });

    if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newInvoices = [];

    // Duplicate original N times, incrementing dates
    for (let i = 1; i <= occurrences; i++) {
        // Sequential, atomically allocated — cannot collide.
        const invoiceNumber = await nextInvoiceNumber();
        
        const newIssueDate = original.issueDate ? addMonths(new Date(original.issueDate), i) : new Date();
        const newDueDate = original.dueDate ? addMonths(new Date(original.dueDate), i) : null;

        const duplicate = await prisma.invoice.create({
            data: {
                invoiceNumber,
                status: "DRAFT",
                clientId: original.clientId,
                clientName: original.clientName,
                clientEmail: original.clientEmail,
                clientAddress: original.clientAddress,
                issueDate: newIssueDate,
                dueDate: newDueDate,
                subtotal: original.subtotal,
                vatAmount: original.vatAmount,
                discount: original.discount,
                total: original.total,
                depositAmount: original.depositAmount,
                balanceDue: original.total, // Draft invoices start with full balance due
                amountPaid: 0,
                notes: original.notes,
                items: {
                    create: original.items.map((item) => ({
                        name: item.name,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        discount: item.discount,
                        discountType: item.discountType,
                        taxable: item.taxable,
                        sortOrder: item.sortOrder,
                    })),
                },
                adjustments: {
                    create: original.adjustments.map((adj) => ({
                        name: adj.name,
                        description: adj.description,
                        amount: adj.amount,
                        type: adj.type,
                    })),
                },
            },
        });
        
        newInvoices.push(duplicate);
    }

    return NextResponse.json({ success: true, count: newInvoices.length, invoices: newInvoices });
}
