import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_123", {
    apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { date, days, startTime, endTime, setupRequired, eventType, venueAddress, specialRequests,
            fullName, email, phone, billingAddress, companyName, selectedPackageId, selectedDJId, selectedAddons, subtotal, vat, total } = body;

        // Parse dates
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + (days - 1));

        // Use standard 25% deposit rule OR full amount parameter if requested
        const isDepositPayment = body.paymentType === "DEPOSIT";
        const depositAmount = total * 0.25;
        const stripeAmount = Math.round((isDepositPayment ? depositAmount : total) * 100);

        // Create the booking order
        const booking = await prisma.bookingOrder.create({
            data: {
                customerName: fullName,
                customerEmail: email,
                customerPhone: phone,
                company: companyName,
                venue: venueAddress,
                startDate,
                endDate,
                numberOfDays: days,
                status: "PENDING", // PENDING approval by admin
                subtotal,
                vatAmount: vat,
                total,
                depositAmount: total * 0.25, // Assuming 25% config
                notes: `Event Type: ${eventType}\nTimes: ${startTime} - ${endTime}\nSetup: ${setupRequired}\nSpecial: ${specialRequests}`,
            }
        });

        // Add the package if selected
        if (selectedPackageId) {
            const pkg = await prisma.package.findUnique({ where: { id: selectedPackageId } });
            if (pkg && pkg.dayRate) {
                await prisma.bookingLineItem.create({
                    data: {
                        bookingOrderId: booking.id,
                        packageId: pkg.id,
                        itemName: pkg.name,
                        quantity: 1,
                        dayRate: pkg.dayRate,
                        lineTotal: pkg.dayRate * days
                    }
                });
            }
        }

        // Add DJ if selected
        if (selectedDJId) {
            const dj = await prisma.dJService.findUnique({ where: { id: selectedDJId } });
            if (dj) {
                await prisma.bookingDJService.create({
                    data: {
                        bookingOrderId: booking.id,
                        djServiceId: dj.id,
                        serviceName: dj.name,
                        priceValue: dj.basePrice,
                        startTime: new Date(`${date}T${startTime}`),
                        endTime: new Date(`${date}T${endTime}`),
                        specialRequests: specialRequests || "",
                    }
                });

                // Block out DJ calendar
                await prisma.dJAvailability.create({
                    data: {
                        djServiceId: dj.id,
                        startDate,
                        endDate,
                        status: "BOOKED",
                        reason: `Booking ${booking.id}`
                    }
                });
            }
        }

        // Add Add-ons
        if (selectedAddons && selectedAddons.length > 0) {
            const addons = await prisma.serviceAddon.findMany({ where: { id: { in: selectedAddons } } });
            for (const addon of addons) {
                const price = addon.pricingType === "PER_DAY" ? addon.priceValue * days : addon.priceValue;
                await prisma.bookingServiceAddon.create({
                    data: {
                        bookingOrderId: booking.id,
                        serviceAddonId: addon.id,
                        serviceName: addon.name,
                        priceValue: price
                    }
                });
            }
        }

        // Generate Invoice
        // Assuming there isn't an external PDF generation library requested immediately,
        // we store the data snapshot into DB so it can be viewed at /api/invoice/[id] or similar.
        const invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

        await prisma.invoice.create({
            data: {
                bookingOrderId: booking.id,
                invoiceNumber,
                status: "ISSUED",
                subtotal,
                vatAmount: vat,
                total,
                clientName: fullName,
                clientEmail: email,
                clientAddress: billingAddress,
                dueDate: new Date(startDate.getTime() - (7 * 24 * 60 * 60 * 1000)), // 7 days before event
                businessDetails: {
                    name: "Blanc Collective LTD",
                    address: "19 Cheetham hill road, M4 4FY",
                    email: "hello@blanc-events.co.uk",
                    phone: "07584192578"
                },
                lineItems: [] // Can be reconstructed from lines
            }
        });

        // Generate Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/success?id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book`,
            customer_email: email,
            metadata: {
                bookingOrderId: booking.id,
                invoiceId: invoiceNumber,
            },
            line_items: [
                {
                    price_data: {
                        currency: "gbp",
                        product_data: {
                            name: `Blanc. Equipment Hire - ${isDepositPayment ? "Deposit" : "Full Payment"}`,
                            description: `${days} Days (${date}) - Ref: ${invoiceNumber}`,
                        },
                        unit_amount: stripeAmount,
                    },
                    quantity: 1,
                },
            ],
        });

        return NextResponse.json({ success: true, url: session.url, id: booking.id });
    } catch (error: any) {
        console.error("Booking API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
