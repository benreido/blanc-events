import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();

    // Last 6 months of monthly revenue from paid invoices
    const months: { label: string; revenue: number; invoiceCount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const result = await prisma.invoice.aggregate({
            where: {
                deletedAt: null,
                status: "PAID",
                paidAt: { gte: start, lt: end },
            },
            _sum: { total: true },
            _count: true,
        });
        months.push({
            label: start.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
            revenue: result._sum.total ?? 0,
            invoiceCount: result._count,
        });
    }

    // Outstanding balances
    const outstanding = await prisma.invoice.aggregate({
        where: {
            deletedAt: null, status: { notIn: ["PAID", "CANCELLED", "REFUNDED"] }, balanceDue: { gt: 0 } },
        _sum: { balanceDue: true },
        _count: true,
    });

    // Overdue invoices
    const overdue = await prisma.invoice.findMany({
        where: {
            deletedAt: null,
            status: { notIn: ["PAID", "CANCELLED", "REFUNDED"] },
            dueDate: { lt: now },
            balanceDue: { gt: 0 },
        },
        select: { id: true, invoiceNumber: true, clientName: true, balanceDue: true, dueDate: true },
        orderBy: { dueDate: "asc" },
        take: 10,
    });

    // Top clients by total invoiced
    const topClientsRaw = await prisma.invoice.groupBy({
        by: ["clientName"],
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
        _sum: { total: true },
        _count: true,
        orderBy: { _sum: { total: "desc" } },
        take: 5,
    });
    const topClients = topClientsRaw.map(c => ({
        name: c.clientName,
        total: c._sum.total ?? 0,
        invoiceCount: c._count,
    }));

    // Upcoming events in next 30 days (invoices with eventDate)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingEvents = await prisma.invoice.findMany({
        where: {
            deletedAt: null,
            eventDate: { gte: now, lte: thirtyDaysFromNow },
            status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
        select: { id: true, invoiceNumber: true, clientName: true, eventDate: true, status: true, total: true, balanceDue: true },
        orderBy: { eventDate: "asc" },
        take: 10,
    });

    // Alder Root bookings in next 30 days
    const upcomingVenueBookings = await prisma.venueBooking.findMany({
        where: {
            eventDate: { gte: now, lte: thirtyDaysFromNow },
            status: { not: "CANCELLED" },
        },
        select: { id: true, clientName: true, eventDate: true, eventType: true, venue: true, startTime: true, endTime: true },
        orderBy: { eventDate: "asc" },
        take: 10,
    });

    // Summary totals (all time)
    const allTimePaid = await prisma.invoice.aggregate({
        where: {
            deletedAt: null, status: "PAID" },
        _sum: { total: true },
        _count: true,
    });

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthRevenue = await prisma.invoice.aggregate({
        where: {
            deletedAt: null, status: "PAID", paidAt: { gte: currentMonthStart } },
        _sum: { total: true },
    });

    return NextResponse.json({
        months,
        outstanding: { amount: outstanding._sum.balanceDue ?? 0, count: outstanding._count },
        overdue,
        topClients,
        upcomingEvents,
        upcomingVenueBookings,
        summary: {
            allTimePaid: allTimePaid._sum.total ?? 0,
            allTimePaidCount: allTimePaid._count,
            thisMonthRevenue: thisMonthRevenue._sum.total ?? 0,
        },
    });
}
