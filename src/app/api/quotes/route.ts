import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { quoteRequestSchema } from "@/lib/validations";
import { calculateDays, calculateSubtotal, calculateServiceCost, calculateVat } from "@/lib/config";
import { sendQuoteRequestNotification } from "@/lib/email";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const result = quoteRequestSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = result.data;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const numberOfDays = calculateDays(startDate, endDate);

    // Resolve items from DB for server-side pricing
    const resolvedItems = await Promise.all(
        data.items.map(async (item) => {
            if (item.equipmentItemId) {
                const eq = await prisma.equipmentItem.findUnique({ where: { id: item.equipmentItemId } });
                if (!eq) throw new Error(`Equipment ${item.equipmentItemId} not found`);
                return {
                    equipmentItemId: eq.id,
                    packageId: null,
                    itemName: eq.name,
                    quantity: item.quantity,
                    dayRate: eq.dayRate || 0,
                    lineTotal: (eq.dayRate || 0) * item.quantity * numberOfDays,
                };
            }
            if (item.packageId) {
                const pkg = await prisma.package.findUnique({ where: { id: item.packageId } });
                if (!pkg) throw new Error(`Package ${item.packageId} not found`);
                return {
                    equipmentItemId: null,
                    packageId: pkg.id,
                    itemName: pkg.name,
                    quantity: item.quantity,
                    dayRate: pkg.dayRate || 0,
                    lineTotal: (pkg.dayRate || 0) * item.quantity * numberOfDays,
                };
            }
            throw new Error("Item must reference equipmentItemId or packageId");
        })
    );

    const subtotal = calculateSubtotal(
        resolvedItems.map((i) => ({ dayRate: i.dayRate, quantity: i.quantity })),
        numberOfDays
    );

    // Resolve service addons
    let servicesTotal = 0;
    const serviceAddons: { serviceAddonId: string; serviceName: string; priceValue: number }[] = [];
    if (data.serviceAddonIds.length > 0) {
        const services = await prisma.serviceAddon.findMany({
            where: { id: { in: data.serviceAddonIds }, isActive: true },
        });
        servicesTotal = calculateServiceCost(services, subtotal, numberOfDays);
        for (const svc of services) {
            let computedPrice = svc.priceValue;
            if (svc.pricingType === "PERCENT_OF_SUBTOTAL") computedPrice = subtotal * (svc.priceValue / 100);
            if (svc.pricingType === "PER_DAY") computedPrice = svc.priceValue * numberOfDays;
            serviceAddons.push({ serviceAddonId: svc.id, serviceName: svc.name, priceValue: computedPrice });
        }
    }

    const vatAmount = calculateVat(subtotal + servicesTotal);
    const total = subtotal + servicesTotal + vatAmount;

    const quoteRequest = await prisma.quoteRequest.create({
        data: {
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone || "",
            company: data.company || "",
            venue: data.venue || "",
            startDate,
            endDate,
            notes: data.notes || "",
            numberOfDays,
            subtotal,
            servicesTotal,
            vatAmount,
            total,
            lineItems: {
                create: resolvedItems.map((item) => ({
                    equipmentItemId: item.equipmentItemId,
                    packageId: item.packageId,
                    itemName: item.itemName,
                    quantity: item.quantity,
                    dayRate: item.dayRate,
                    lineTotal: item.lineTotal,
                })),
            },
            serviceAddons: {
                create: serviceAddons,
            },
        },
        include: { lineItems: true, serviceAddons: true },
    });

    // Send emails
    await sendQuoteRequestNotification({
        customerName: quoteRequest.customerName,
        customerEmail: quoteRequest.customerEmail,
        venue: quoteRequest.venue,
        startDate: format(startDate, "dd MMM yyyy"),
        endDate: format(endDate, "dd MMM yyyy"),
        numberOfDays,
        items: quoteRequest.lineItems.map((li: { itemName: string; quantity: number; dayRate: number; lineTotal: number }) => ({
            itemName: li.itemName,
            quantity: li.quantity,
            dayRate: li.dayRate,
            lineTotal: li.lineTotal,
        })),
        subtotal,
        servicesTotal,
        vatAmount,
        total,
    }).catch(console.error);

    return NextResponse.json({ success: true, quoteId: quoteRequest.id, total });
}
