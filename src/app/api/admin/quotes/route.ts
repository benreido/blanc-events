import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { calculateOrderMargin } from "@/lib/inventory";
import { nextInvoiceNumber } from "@/lib/invoices";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return session;
}

export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const quotes = await prisma.quoteRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: { lineItems: true, serviceAddons: true },
    });
    return NextResponse.json({ quotes });
}

export async function PUT(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, action } = await req.json();

    if (action === "convert_to_booking") {
        const quote = await prisma.quoteRequest.findUnique({
            where: { id },
            include: { lineItems: true, serviceAddons: true },
        });
        if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const marginData = await calculateOrderMargin(
            quote.lineItems,
            quote.numberOfDays,
            quote.total,
            quote.servicesTotal
        );

        const booking = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const order = await tx.bookingOrder.create({
                data: {
                    quoteRequestId: quote.id,
                    customerName: quote.customerName,
                    customerEmail: quote.customerEmail,
                    customerPhone: quote.customerPhone,
                    company: quote.company,
                    venue: quote.venue,
                    startDate: quote.startDate,
                    endDate: quote.endDate,
                    numberOfDays: quote.numberOfDays,
                    subtotal: quote.subtotal,
                    servicesTotal: quote.servicesTotal,
                    vatAmount: quote.vatAmount,
                    total: quote.total,
                    status: "AWAITING_PAYMENT",

                    subhireTotalCost: marginData.subhireTotalCost,
                    ownedEquipmentValue: marginData.ownedEquipmentValue,
                    grossMargin: marginData.grossMargin,
                    netMargin: marginData.netMargin,
                    subhireRequired: marginData.subhireRequired,
                    subhireAlert: marginData.subhireAlert,

                    lineItems: {
                        create: marginData.processedLineItems.map((li: any) => ({
                            equipmentItemId: li.equipmentItemId,
                            packageId: li.packageId,
                            itemName: li.itemName,
                            quantity: li.quantity,
                            dayRate: li.dayRate,
                            lineTotal: li.lineTotal,
                            ownedQtyUsed: li.ownedQtyUsed,
                            subhireQtyNeeded: li.subhireQtyNeeded,
                            subhireCostPerDay: li.subhireCostPerDay,
                            subhireTotalCost: li.subhireTotalCost,
                        })),
                    },
                    serviceAddons: {
                        create: quote.serviceAddons.map((sa: { serviceAddonId: string; serviceName: string; priceValue: number }) => ({
                            serviceAddonId: sa.serviceAddonId,
                            serviceName: sa.serviceName,
                            priceValue: sa.priceValue,
                        })),
                    },
                },
            });

            // Create inventory holds
            for (const li of quote.lineItems) {
                if (li.equipmentItemId) {
                    await tx.inventoryReservation.create({
                        data: {
                            bookingOrderId: order.id,
                            equipmentItemId: li.equipmentItemId,
                            quantityReserved: li.quantity,
                            startDate: quote.startDate,
                            endDate: quote.endDate,
                            status: "HOLD",
                            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                        },
                    });
                }
            }

            await tx.quoteRequest.update({ where: { id }, data: { status: "HOLD" } });
            return order;
        });

        return NextResponse.json({ booking });
    }

    if (action === "update_status") {
        const { status } = await req.json();
        const quote = await prisma.quoteRequest.update({ where: { id }, data: { status } });
        return NextResponse.json({ quote });
    }

    if (action === "convert_to_invoice") {
        const quote = await prisma.quoteRequest.findUnique({
            where: { id },
            include: { lineItems: true, serviceAddons: true },
        });
        if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const invoiceNumber = await nextInvoiceNumber();
        const dueDate = new Date(quote.startDate);
        dueDate.setDate(dueDate.getDate() - 7); // Due 7 days before event

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                status: "DRAFT",
                clientName: quote.customerName,
                clientEmail: quote.customerEmail,
                clientAddress: [quote.company, quote.venue].filter(Boolean).join("\n"),
                subtotal: quote.subtotal,
                vatAmount: quote.vatAmount,
                total: quote.total,
                balanceDue: quote.total,
                depositAmount: quote.total * 0.25,
                dueDate,
                eventDate: quote.startDate,
                notes: `Quote converted to invoice.\nEvent dates: ${quote.startDate.toLocaleDateString("en-GB")} – ${quote.endDate.toLocaleDateString("en-GB")} (${quote.numberOfDays} days)\nVenue: ${quote.venue || "TBC"}`,
                items: {
                    create: quote.lineItems.map((li, idx) => ({
                        name: li.itemName,
                        description: `${li.quantity} × ${quote.numberOfDays} day${quote.numberOfDays !== 1 ? "s" : ""}`,
                        quantity: li.quantity,
                        unitPrice: li.dayRate * quote.numberOfDays,
                        discount: 0,
                        discountType: "FIXED",
                        taxable: true,
                        sortOrder: idx,
                    })),
                },
            },
        });

        return NextResponse.json({ success: true, invoiceId: invoice.id });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
