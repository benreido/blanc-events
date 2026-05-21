import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function nextBillingDateFor(billingDay: number, from: Date): Date {
    const d = new Date(from);
    d.setDate(billingDay);
    // If billingDay is in the past this month, advance to next month
    if (d <= from) {
        d.setMonth(d.getMonth() + 1);
        d.setDate(billingDay);
    }
    return d;
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contracts = await prisma.recurringContract.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { invoices: true } },
        },
    });

    return NextResponse.json({ contracts });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
        title, clientName, clientEmail, clientAddress, clientId,
        contractStart, contractEnd, billingDay, monthlyAmount, vatRate,
        lineItems, notes, fromInvoiceId,
    } = body;

    if (!title || !clientName || !clientEmail || !contractStart || !contractEnd || !monthlyAmount) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const start = new Date(contractStart);
    const end = new Date(contractEnd);

    const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth()) + 1;
    if (months < 1) return NextResponse.json({ error: "Contract end must be after start" }, { status: 400 });

    const nextBilling = nextBillingDateFor(billingDay ?? 1, new Date());

    const contract = await prisma.recurringContract.create({
        data: {
            title,
            clientName,
            clientEmail,
            clientAddress: clientAddress ?? "",
            clientId: clientId ?? null,
            contractStart: start,
            contractEnd: end,
            billingDay: billingDay ?? 1,
            monthlyAmount,
            vatRate: vatRate ?? 0.20,
            nextBillingDate: nextBilling,
            maxInvoices: months,
            lineItems: lineItems ?? [],
            notes: notes ?? "",
        },
    });

    // Link the source invoice if converting one
    if (fromInvoiceId) {
        await prisma.invoice.update({
            where: { id: fromInvoiceId },
            data: { contractId: contract.id },
        });
    }

    return NextResponse.json({ success: true, contract });
}
