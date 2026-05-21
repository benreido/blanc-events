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

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
        return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    // Expire old holds first
    await prisma.inventoryReservation.updateMany({
        where: { status: "HOLD", expiresAt: { lt: new Date() } },
        data: { status: "EXPIRED" },
    });

    const results = await Promise.all(
        items.map(async (item) => {
            const equipment = await prisma.equipmentItem.findUnique({
                where: { id: item.equipmentItemId },
                select: { id: true, name: true, quantityTotal: true },
            });

            if (!equipment) {
                return { equipmentItemId: item.equipmentItemId, status: "NOT_FOUND", available: false, maxQuantity: 0 };
            }

            // Sum all active reservations overlapping the requested date range
            const reservations = await prisma.inventoryReservation.aggregate({
                where: {
                    equipmentItemId: item.equipmentItemId,
                    status: { in: ["HOLD", "CONFIRMED"] },
                    startDate: { lt: end },
                    endDate: { gt: start },
                },
                _sum: { quantityReserved: true },
            });

            const reserved = reservations._sum.quantityReserved ?? 0;
            const available = Math.max(0, equipment.quantityTotal - reserved);
            const canFulfil = available >= item.quantity;

            return {
                equipmentItemId: item.equipmentItemId,
                name: equipment.name,
                quantityTotal: equipment.quantityTotal,
                reserved,
                available,
                requested: item.quantity,
                status: canFulfil ? "AVAILABLE" : available > 0 ? "PARTIALLY_AVAILABLE" : "UNAVAILABLE",
                canFulfil,
            };
        })
    );

    return NextResponse.json({ availability: results });
}
