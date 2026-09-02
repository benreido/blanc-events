import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allActive, paidThisMonth, overdueCount] = await Promise.all([
        prisma.invoice.findMany({
            where: { status: { notIn: ["PAID", "CANCELLED", "REFUNDED", "VOID"] }, deletedAt: null },
            select: { balanceDue: true, dueDate: true, status: true },
        }),
        prisma.invoice.aggregate({
            where: { status: "PAID", paidAt: { gte: startOfMonth }, deletedAt: null },
            _sum: { total: true },
        }),
        prisma.invoice.count({
            where: {
                status: { notIn: ["PAID", "CANCELLED", "REFUNDED", "VOID"] },
                deletedAt: null,
                dueDate: { lt: now },
            },
        }),
    ]);

    const totalOutstanding = allActive.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
    const draftCount = allActive.filter(inv => inv.status === "DRAFT").length;

    return NextResponse.json({
        totalOutstanding,
        overdueCount,
        paidThisMonth: paidThisMonth._sum.total || 0,
        draftCount,
    });
}
