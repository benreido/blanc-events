import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createCheckoutSession } from "@/lib/stripe";
import { sendPaymentLink } from "@/lib/email";
import { siteConfig, calculateDeposit } from "@/lib/config";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return session;
}

export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bookings = await prisma.bookingOrder.findMany({
        orderBy: { createdAt: "desc" },
        include: { lineItems: true, invoice: true, djServices: true, serviceAddons: true },
    });
    return NextResponse.json({ bookings });
}

export async function PUT(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, action, paymentMode } = await req.json();
    if (!id || !action) {
        return NextResponse.json({ error: "id and action required" }, { status: 400 });
    }

    if (action === "update_status") {
        const { status } = await req.json();
        const booking = await prisma.bookingOrder.update({ where: { id }, data: { status } });
        return NextResponse.json({ booking });
    }

    if (action === "create_payment_link") {
        const booking = await prisma.bookingOrder.findUnique({ where: { id } });
        if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const mode = paymentMode || booking.paymentMode;
        const amount = mode === "FULL" ? booking.total : calculateDeposit(booking.total);

        const checkoutSession = await createCheckoutSession(
            amount,
            `Blanc. Events Booking – ${booking.customerName}`,
            { bookingOrderId: booking.id },
            `${siteConfig.url}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
            `${siteConfig.url}/booking/cancelled`
        );

        await prisma.bookingOrder.update({
            where: { id },
            data: {
                stripeCheckoutSessionId: checkoutSession.id,
                depositAmount: amount,
                paymentMode: mode,
                status: "AWAITING_PAYMENT",
            },
        });

        // Send payment link email
        if (checkoutSession.url) {
            await sendPaymentLink(booking.customerEmail, booking.customerName, amount, checkoutSession.url);
        }

        return NextResponse.json({ checkoutUrl: checkoutSession.url });
    }

    if (action === "mark_paid") {
        const booking = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const order = await tx.bookingOrder.update({
                where: { id },
                data: { status: "CONFIRMED", amountPaid: 0 }, // will be set correctly
            });
            await tx.inventoryReservation.updateMany({
                where: { bookingOrderId: id, status: "HOLD" },
                data: { status: "CONFIRMED" },
            });
            return order;
        });
        return NextResponse.json({ booking });
    }

    if (action === "cancel") {
        const booking = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const order = await tx.bookingOrder.update({
                where: { id },
                data: { status: "CANCELLED" },
            });
            await tx.inventoryReservation.updateMany({
                where: { bookingOrderId: id },
                data: { status: "CANCELLED" },
            });
            return order;
        });
        return NextResponse.json({ booking });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
