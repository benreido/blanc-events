import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminEquipmentSchema } from "@/lib/validations";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return null;
    }
    return session;
}

export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.equipmentItem.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const result = adminEquipmentSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const item = await prisma.equipmentItem.create({
        data: {
            ...result.data,
            dayRate: result.data.dayRate ?? null,
            weekRate: result.data.weekRate ?? null,
        },
    });
    return NextResponse.json({ item }, { status: 201 });
}

export async function PUT(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const result = adminEquipmentSchema.safeParse(rest);
    if (!result.success) {
        return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const item = await prisma.equipmentItem.update({
        where: { id },
        data: {
            ...result.data,
            dayRate: result.data.dayRate ?? null,
            weekRate: result.data.weekRate ?? null,
        },
    });
    return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.equipmentItem.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
}
