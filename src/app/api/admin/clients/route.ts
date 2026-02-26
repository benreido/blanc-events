import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clients = await prisma.client.findMany({
        orderBy: { name: "asc" }
    });
    return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const client = await prisma.client.create({
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            company: data.company || "",
            address: data.address || "",
            notes: data.notes || ""
        }
    });

    return NextResponse.json({ success: true, client });
}
