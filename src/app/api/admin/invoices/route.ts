import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (status) where.status = status;
    if (search) {
        where.OR = [
            { invoiceNumber: { contains: search, mode: "insensitive" } },
            { clientName: { contains: search, mode: "insensitive" } },
            { clientEmail: { contains: search, mode: "insensitive" } }
        ];
    }

    const invoices = await prisma.invoice.findMany({
        where,
        include: { client: true, bookingOrder: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    const invoiceNumber = data.invoiceNumber || `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice = await prisma.invoice.create({
        data: {
            invoiceNumber,
            status: data.status || "DRAFT",
            clientId: data.clientId || null,
            clientName: data.clientName || "",
            clientEmail: data.clientEmail || "",
            clientAddress: data.clientAddress || "",
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
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
        include: { items: true, adjustments: true, client: true }
    });

    return NextResponse.json({ success: true, invoice: newInvoice });
}
