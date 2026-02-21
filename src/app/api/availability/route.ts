import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { startDate, endDate, items } = body as {
        startDate: string;
        endDate: string;
        items: { equipmentItemId: string; quantity: number }[];
    };

    if (!startDate || !endDate || !items?.length) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Expire old holds first
    await prisma.inventoryReservation.updateMany({
        where: {
            status: "HOLD",
            expiresAt: { lt: new Date() },
        },
        data: { status: "EXPIRED" },
    });

    const results = await Promise.all(
        items.map(async (item) => {
            const equipment = await prisma.equipmentItem.findUnique({
                where: { id: item.equipmentItemId },
                select: { id: true, name: true },
            });

            if (!equipment) {
                return { equipmentItemId: item.equipmentItemId, status: "NOT_FOUND", available: true, maxQuantity: 999 };
            }

            // Soft Inventory logic: never block bookings due to quantity.
            // Always allow requests, always show "Available on request".
            return {
                equipmentItemId: item.equipmentItemId,
                name: equipment.name,
                quantityTotal: 999,
                reserved: 0,
                status: "AVAILABLE_ON_REQUEST",
                available: true,
                maxQuantity: 999,
            };
        })
    );

    return NextResponse.json({ availability: results });
}
