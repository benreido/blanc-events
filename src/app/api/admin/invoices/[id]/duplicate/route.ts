import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const original = await prisma.invoice.findUnique({
        where: { id },
        include: {
            items: { orderBy: { sortOrder: "asc" } },
            adjustments: true,
        },
    });

    if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const duplicate = await prisma.invoice.create({
        data: {
            invoiceNumber,
            status: "DRAFT",
            clientId: original.clientId,
            clientName: original.clientName,
            clientEmail: original.clientEmail,
            clientAddress: original.clientAddress,
            dueDate: null,
            subtotal: original.subtotal,
            vatAmount: original.vatAmount,
            discount: original.discount,
            total: original.total,
            depositAmount: original.depositAmount,
            balanceDue: original.total,
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

    return NextResponse.json({ success: true, invoice: duplicate });
}
