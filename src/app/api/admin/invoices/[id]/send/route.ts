import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoiceToClient } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { message } = await req.json().catch(() => ({ message: undefined }));

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await sendInvoiceToClient({
        clientEmail: invoice.clientEmail,
        clientName: invoice.clientName,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        balanceDue: invoice.balanceDue,
        depositAmount: invoice.depositAmount,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-GB") : null,
        id: invoice.id,
        message,
    });

    const updated = await prisma.invoice.update({
        where: { id },
        data: {
            sentAt: new Date(),
            status: invoice.status === "DRAFT" ? "SENT" : invoice.status,
        },
    });

    return NextResponse.json({ success: true, invoice: updated });
}
