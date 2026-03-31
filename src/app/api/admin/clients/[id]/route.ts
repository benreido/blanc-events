import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const data = await req.json();
    const client = await prisma.client.update({
        where: { id },
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            company: data.company || "",
            address: data.address || "",
            notes: data.notes || "",
        },
    });

    return NextResponse.json({ success: true, client });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
