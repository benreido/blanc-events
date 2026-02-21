import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
        totalEquipment,
        totalBookings,
        confirmedBookings,
        pendingQuotes,
        recentEnquiries,
        upcomingBookings,
        lowStockItems,
    ] = await Promise.all([
        prisma.equipmentItem.count({ where: { isActive: true } }),
        prisma.bookingOrder.count(),
        prisma.bookingOrder.count({ where: { status: "CONFIRMED" } }),
        prisma.quoteRequest.count({ where: { status: "QUOTE_REQUESTED" } }),
        prisma.enquiry.findMany({ where: { status: "NEW" }, orderBy: { createdAt: "desc" }, take: 5 }),
        prisma.bookingOrder.findMany({
            where: { status: "CONFIRMED", startDate: { gte: now, lte: thirtyDaysFromNow } },
            orderBy: { startDate: "asc" },
            take: 10,
            include: { lineItems: true },
        }),
        prisma.equipmentItem.findMany({
            where: { isActive: true, quantityTotal: { lte: 2 } },
            orderBy: { quantityTotal: "asc" },
            take: 10,
        }),
    ]);

    return NextResponse.json({
        stats: { totalEquipment, totalBookings, confirmedBookings, pendingQuotes },
        recentEnquiries,
        upcomingBookings,
        lowStockItems,
    });
}
