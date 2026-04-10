import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function icalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function icalDateOnly(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
}

function escapeIcal(str: string): string {
    return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(req: NextRequest) {
    const token = new URL(req.url).searchParams.get("token");
    const secret = process.env.ICAL_SECRET;

    if (!secret || token !== secret) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const future = new Date(now.getFullYear() + 2, 11, 31);

    const [bookings, venueBookings, invoiceEvents, invoiceDues] = await Promise.all([
        prisma.bookingOrder.findMany({
            where: { startDate: { gte: past, lte: future } },
            select: { id: true, customerName: true, customerEmail: true, venue: true, startDate: true, endDate: true, status: true, total: true },
        }),
        prisma.venueBooking.findMany({
            where: { eventDate: { gte: past, lte: future } },
            select: { id: true, clientName: true, clientEmail: true, venue: true, eventDate: true, eventType: true, startTime: true, endTime: true, status: true },
        }),
        prisma.invoice.findMany({
            where: { eventDate: { gte: past, lte: future } },
            select: { id: true, clientName: true, invoiceNumber: true, eventDate: true, status: true, total: true },
        }),
        prisma.invoice.findMany({
            where: {
                dueDate: { gte: past, lte: future },
                status: { notIn: ["PAID", "CANCELLED"] },
            },
            select: { id: true, clientName: true, invoiceNumber: true, dueDate: true, status: true, balanceDue: true },
        }),
    ]);

    const stamp = icalDate(now);
    const lines: string[] = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Blanc Events//Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Blanc. Events",
        "X-WR-TIMEZONE:Europe/London",
        "X-WR-CALDESC:All bookings and payment due dates for Blanc. Events",
    ];

    for (const b of bookings) {
        // End date for iCal is exclusive, so add 1 day
        const endDate = new Date(b.endDate);
        endDate.setDate(endDate.getDate() + 1);
        lines.push(
            "BEGIN:VEVENT",
            `UID:booking-${b.id}@blanc-events`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${icalDateOnly(new Date(b.startDate))}`,
            `DTEND;VALUE=DATE:${icalDateOnly(endDate)}`,
            `SUMMARY:${escapeIcal(`📦 ${b.customerName}`)}`,
            `DESCRIPTION:${escapeIcal(`Equipment Booking\\nVenue: ${b.venue || "TBC"}\\nStatus: ${b.status}\\nTotal: £${b.total.toFixed(2)}\\nEmail: ${b.customerEmail}`)}`,
            `CATEGORIES:Equipment Booking`,
            `STATUS:${b.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED"}`,
            "END:VEVENT",
        );
    }

    for (const v of venueBookings) {
        lines.push(
            "BEGIN:VEVENT",
            `UID:venue-${v.id}@blanc-events`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${icalDateOnly(new Date(v.eventDate))}`,
            `DTEND;VALUE=DATE:${icalDateOnly(new Date(v.eventDate))}`,
            `SUMMARY:${escapeIcal(`⛳ ${v.clientName} – ${v.eventType}`)}`,
            `DESCRIPTION:${escapeIcal(`Alder Root ${v.venue === "MARQUEE" ? "Marquee" : "Clubhouse"}\\nTime: ${v.startTime} – ${v.endTime}\\nStatus: ${v.status}\\nEmail: ${v.clientEmail}`)}`,
            `CATEGORIES:Alder Root`,
            `STATUS:${v.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED"}`,
            "END:VEVENT",
        );
    }

    for (const inv of invoiceEvents) {
        lines.push(
            "BEGIN:VEVENT",
            `UID:invoice-event-${inv.id}@blanc-events`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${icalDateOnly(new Date(inv.eventDate!))}`,
            `DTEND;VALUE=DATE:${icalDateOnly(new Date(inv.eventDate!))}`,
            `SUMMARY:${escapeIcal(`🎵 ${inv.clientName} – Event`)}`,
            `DESCRIPTION:${escapeIcal(`Invoice: ${inv.invoiceNumber}\\nStatus: ${inv.status}\\nTotal: £${inv.total.toFixed(2)}`)}`,
            `CATEGORIES:Invoice Event`,
            "END:VEVENT",
        );
    }

    for (const due of invoiceDues) {
        lines.push(
            "BEGIN:VEVENT",
            `UID:invoice-due-${due.id}@blanc-events`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${icalDateOnly(new Date(due.dueDate!))}`,
            `DTEND;VALUE=DATE:${icalDateOnly(new Date(due.dueDate!))}`,
            `SUMMARY:${escapeIcal(`💳 Payment Due – ${due.clientName}`)}`,
            `DESCRIPTION:${escapeIcal(`Invoice: ${due.invoiceNumber}\\nBalance Due: £${due.balanceDue.toFixed(2)}\\nStatus: ${due.status}`)}`,
            `CATEGORIES:Payment Due`,
            "END:VEVENT",
        );
    }

    lines.push("END:VCALENDAR");

    return new NextResponse(lines.join("\r\n"), {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'attachment; filename="blanc-events.ics"',
            "Cache-Control": "no-cache",
        },
    });
}
