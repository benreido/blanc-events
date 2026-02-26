import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getStripe } from "@/lib/stripe";
import { sendBookingConfirmation } from "@/lib/email";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
    const sig = req.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

    const body = await req.text();
    let event;
    try {
        event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
        const data = event.data.object as unknown as Record<string, unknown>;
        const metadata = (data.metadata || {}) as Record<string, string>;
        const bookingOrderId = metadata.bookingOrderId;
        const invoiceId = metadata.invoiceId;

        if (bookingOrderId) {
            const amountPaid = typeof data.amount_total === "number"
                ? data.amount_total / 100
                : typeof data.amount_received === "number"
                    ? data.amount_received / 100
                    : 0;

            // Update booking + reservations in a transaction
            const booking = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                const order = await tx.bookingOrder.update({
                    where: { id: bookingOrderId },
                    data: {
                        status: "CONFIRMED",
                        amountPaid,
                        stripePaymentIntentId:
                            typeof data.payment_intent === "string" ? data.payment_intent : undefined,
                    },
                    include: { lineItems: true },
                });

                await tx.inventoryReservation.updateMany({
                    where: { bookingOrderId, status: "HOLD" },
                    data: { status: "CONFIRMED" },
                });

                // ALSO mark associated invoice as paid if it exists
                await tx.invoice.updateMany({
                    where: { bookingOrderId },
                    data: { status: "PAID", paidAt: new Date(), amountPaid, balanceDue: 0 }
                });

                return order;
            });

            // Send confirmation email
            await sendBookingConfirmation({
                customerName: booking.customerName,
                customerEmail: booking.customerEmail,
                startDate: format(booking.startDate, "dd MMM yyyy"),
                endDate: format(booking.endDate, "dd MMM yyyy"),
                total: booking.total,
                amountPaid,
                items: booking.lineItems.map((li: { itemName: string; quantity: number; lineTotal: number }) => ({
                    itemName: li.itemName,
                    quantity: li.quantity,
                    lineTotal: li.lineTotal,
                })),
            }).catch(console.error);
        } else if (invoiceId) {
            const amountPaid = typeof data.amount_total === "number"
                ? data.amount_total / 100
                : typeof data.amount_received === "number"
                    ? data.amount_received / 100
                    : 0;

            const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
            if (invoice) {
                const newAmountPaid = invoice.amountPaid + amountPaid;
                const newBalanceDue = Math.max(0, invoice.total - newAmountPaid);
                const isPaid = newBalanceDue === 0;

                await prisma.invoice.update({
                    where: { id: invoiceId },
                    data: {
                        amountPaid: newAmountPaid,
                        balanceDue: newBalanceDue,
                        status: isPaid ? "PAID" : "PARTIALLY_PAID",
                        paidAt: isPaid ? new Date() : undefined
                    }
                });

                await prisma.invoicePayment.create({
                    data: {
                        invoiceId,
                        amount: amountPaid,
                        status: "SUCCESS",
                        reference: typeof data.payment_intent === "string" ? data.payment_intent : ""
                    }
                });
            }
        }
    }

    return NextResponse.json({ received: true });
}
