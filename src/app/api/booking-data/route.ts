import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const packages = await prisma.package.findMany({
            where: { isActive: true },
            include: { djServices: { include: { djService: true } } }
        });

        const djServices = await prisma.dJService.findMany({
            where: { isActive: true },
            include: { availabilities: true } // Need availabilities for calendar
        });

        // Also get other service addons if needed (e.g. delivery)
        const addons = await prisma.serviceAddon.findMany({
            where: { isActive: true }
        });

        return NextResponse.json({
            packages,
            djServices,
            addons
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
