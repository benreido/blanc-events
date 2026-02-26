import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const test = await prisma.equipmentItem.count();
        return NextResponse.json({
            status: "ok",
            count: test,
            urlType: process.env.DATABASE_URL?.includes("6543") ? "Transaction Pool (6543)" : "Direct (5432) or Other",
            hasPgBouncer: process.env.DATABASE_URL?.includes("pgbouncer=true")
        });
    } catch (e: any) {
        return NextResponse.json({
            status: "error",
            message: e.message,
            urlType: process.env.DATABASE_URL?.includes("6543") ? "Transaction Pool (6543)" : "Direct (5432) or Other",
            hasPgBouncer: process.env.DATABASE_URL?.includes("pgbouncer=true")
        });
    }
}
