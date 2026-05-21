import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const contract = await prisma.recurringContract.findUnique({
        where: { id },
        include: {
            invoices: {
                orderBy: { issueDate: "desc" },
                select: {
                    id: true, invoiceNumber: true, status: true,
                    issueDate: true, dueDate: true, total: true,
                    balanceDue: true, amountPaid: true, paidAt: true,
                },
            },
        },
    });

    if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ contract });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { action, ...fields } = body;

    if (action === "pause") {
        const c = await prisma.recurringContract.update({
            where: { id },
            data: { status: "PAUSED" },
        });
        return NextResponse.json({ success: true, contract: c });
    }

    if (action === "resume") {
        const c = await prisma.recurringContract.update({
            where: { id },
            data: { status: "ACTIVE" },
        });
        return NextResponse.json({ success: true, contract: c });
    }

    if (action === "cancel") {
        const c = await prisma.recurringContract.update({
            where: { id },
            data: { status: "CANCELLED" },
        });
        return NextResponse.json({ success: true, contract: c });
    }

    // General field update
    const updated = await prisma.recurringContract.update({
        where: { id },
        data: {
            ...(fields.title !== undefined && { title: fields.title }),
            ...(fields.notes !== undefined && { notes: fields.notes }),
            ...(fields.billingDay !== undefined && { billingDay: fields.billingDay }),
            ...(fields.monthlyAmount !== undefined && { monthlyAmount: fields.monthlyAmount }),
            ...(fields.vatRate !== undefined && { vatRate: fields.vatRate }),
            ...(fields.lineItems !== undefined && { lineItems: fields.lineItems }),
            ...(fields.contractEnd !== undefined && {
                contractEnd: new Date(fields.contractEnd),
                maxInvoices:
                    (() => {
                        const end = new Date(fields.contractEnd);
                        const existing = fields.contractStart
                            ? new Date(fields.contractStart)
                            : undefined;
                        // recalculate from current start if not provided
                        return existing
                            ? (end.getFullYear() - existing.getFullYear()) * 12 +
                              (end.getMonth() - existing.getMonth()) + 1
                            : undefined;
                    })(),
            }),
        },
    });

    return NextResponse.json({ success: true, contract: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    // Unlink invoices first, then delete
    await prisma.invoice.updateMany({ where: { contractId: id }, data: { contractId: null } });
    await prisma.recurringContract.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
