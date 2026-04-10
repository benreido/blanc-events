import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const [bookings, venueBookings, invoices] = await Promise.all([
        prisma.bookingOrder.findMany({
            where: { startDate: { gte: start, lt: end } },
            select: { id: true, customerName: true, venue: true, startDate: true, endDate: true, status: true, total: true },
        }),
        prisma.venueBooking.findMany({
            where: { eventDate: { gte: start, lt: end } },
            select: { id: true, clientName: true, venue: true, eventDate: true, eventType: true, status: true },
        }),
        prisma.invoice.findMany({
            where: { eventDate: { gte: start, lt: end } },
            select: { id: true, clientName: true, invoiceNumber: true, eventDate: true, status: true, total: true },
        }),
    ]);

    return NextResponse.json({ bookings, venueBookings, invoices });
}
