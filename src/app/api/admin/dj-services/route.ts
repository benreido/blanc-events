import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const djServices = await prisma.dJService.findMany({
            orderBy: { name: "asc" }
        });
        return NextResponse.json(djServices);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const djService = await prisma.dJService.create({
            data: {
                name: body.name,
                description: body.description || "",
                basePrice: Number(body.basePrice),
                timeBasedRates: body.timeBasedRates || null,
                isActive: Boolean(body.isActive ?? true),
            },
        });
        return NextResponse.json(djService);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
