import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cron job to expire old holds - call via Vercel cron or manually
export async function GET() {
    const result = await prisma.inventoryReservation.updateMany({
        where: {
            status: "HOLD",
            expiresAt: { lt: new Date() },
        },
        data: { status: "EXPIRED" },
    });

    // Also expire quote requests that had HOLD status
    await prisma.quoteRequest.updateMany({
        where: {
            status: "HOLD",
            updatedAt: { lt: new Date(Date.now() - 30 * 60 * 1000) }, // 30 min TTL
        },
        data: { status: "EXPIRED" },
    });

    return NextResponse.json({ expired: result.count, timestamp: new Date().toISOString() });
}
