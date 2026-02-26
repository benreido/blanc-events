import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const services = await prisma.serviceAddon.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
    });
    return NextResponse.json({ services });
}
