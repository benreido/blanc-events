import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { venueBookingSchema } from "@/lib/validations";
import { sendVenueBookingNotification } from "@/lib/email";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string, maxReqs = 5, windowMs = 60000): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (entry.count >= maxReqs) return false;
    entry.count++;
    return true;
}

// ── Alder Root pricing rules ──
// Base rate: 7pm–midnight (5 hrs) = £275
// Extra hours outside that window = £40/hr
const BASE_START = 19; // 7pm in 24h
const BASE_END = 24;   // midnight
const BASE_PRICE = 275;
const EXTRA_HOURLY = 40;

function calculateAlderRootPrice(startTime: string, endTime: string): {
    items: { name: string; description: string; unitPrice: number; quantity: number }[];
    total: number;
} {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    // Convert to decimal hours
    const startDec = startH + startM / 60;
    let endDec = endH + endM / 60;

    // Handle midnight/past-midnight (e.g. end time 00:00 or 01:00 = 24 or 25)
    if (endDec <= startDec) endDec += 24;

    const items: { name: string; description: string; unitPrice: number; quantity: number }[] = [];
    let total = 0;

    // Base rate always applies (7pm–midnight block)
    items.push({
        name: "DJ Services (7pm – Midnight)",
        description: "Standard 5-hour evening session",
        unitPrice: BASE_PRICE,
        quantity: 1,
    });
    total += BASE_PRICE;

    // Extra hours BEFORE 7pm
    if (startDec < BASE_START) {
        const earlyHours = Math.ceil(BASE_START - startDec);
        items.push({
            name: `Early Start (before 7pm)`,
            description: `${earlyHours} additional hour${earlyHours !== 1 ? "s" : ""} @ £${EXTRA_HOURLY}/hr`,
            unitPrice: EXTRA_HOURLY,
            quantity: earlyHours,
        });
        total += earlyHours * EXTRA_HOURLY;
    }

    // Extra hours AFTER midnight
    if (endDec > BASE_END) {
        const lateHours = Math.ceil(endDec - BASE_END);
        items.push({
            name: `Late Finish (after Midnight)`,
            description: `${lateHours} additional hour${lateHours !== 1 ? "s" : ""} @ £${EXTRA_HOURLY}/hr`,
            unitPrice: EXTRA_HOURLY,
            quantity: lateHours,
        });
        total += lateHours * EXTRA_HOURLY;
    }

    return { items, total };
}

// ── Alder Root client details by venue ──
const ALDER_ROOT_ADDRESS = "Alder Root Lane\nWinwick\nWA2 8RZ";
const VENUE_CLIENTS: Record<string, { name: string; email: string }> = {
    MARQUEE: { name: "Alder Root Events & Weddings", email: "" },
    CLUBHOUSE: { name: "Lets Celebrate Ltd", email: "" },
};

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const result = venueBookingSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = result.data;

    // 1. Save the booking
    const booking = await prisma.venueBooking.create({
        data: {
            venue: data.venue,
            eventDate: new Date(data.eventDate),
            eventType: data.eventType,
            startTime: data.startTime,
            endTime: data.endTime,
            clientName: data.clientName,
            clientEmail: data.clientEmail || "",
            clientPhone: data.clientPhone || "",
            notes: data.notes || "",
        },
    });

    // 2. Calculate pricing
    const { items, total } = calculateAlderRootPrice(data.startTime, data.endTime);
    const vatAmount = 0; // No VAT on these invoices
    const venueClient = VENUE_CLIENTS[data.venue] || VENUE_CLIENTS.MARQUEE;

    // 3. Generate invoice number
    const invoiceNumber = `AR-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Format the event date for the invoice notes
    const eventDateStr = new Date(data.eventDate).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    // 5. Create the invoice
    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber,
            status: "DRAFT",
            clientName: venueClient.name,
            clientEmail: venueClient.email,
            clientAddress: ALDER_ROOT_ADDRESS,
            subtotal: total,
            vatAmount,
            total,
            balanceDue: total,
            notes: [
                `Event: ${data.eventType}`,
                `Date: ${eventDateStr}`,
                `Time: ${data.startTime} – ${data.endTime}`,
                `Venue: ${data.venue === "MARQUEE" ? "Marquee" : "Clubhouse"}`,
                `Client: ${data.clientName}`,
                data.clientEmail ? `Email: ${data.clientEmail}` : "",
                data.clientPhone ? `Phone: ${data.clientPhone}` : "",
                data.notes ? `\nNotes: ${data.notes}` : "",
            ].filter(Boolean).join("\n"),
            items: {
                create: items.map((item, idx) => ({
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: 0,
                    discountType: "FIXED",
                    taxable: false,
                    sortOrder: idx,
                })),
            },
        },
        include: { items: true },
    });

    // 6. Send email notification
    await sendVenueBookingNotification({
        venue: data.venue,
        eventDate: data.eventDate,
        eventType: data.eventType,
        startTime: data.startTime,
        endTime: data.endTime,
        clientName: data.clientName,
        clientEmail: data.clientEmail || "",
        clientPhone: data.clientPhone || "",
        notes: data.notes || "",
    }).catch(console.error);

    return NextResponse.json({
        success: true,
        id: booking.id,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
    });
}
