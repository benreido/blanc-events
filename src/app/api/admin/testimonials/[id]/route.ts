import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const testimonial = await prisma.testimonial.findUnique({
            where: { id: id },
        });

        if (!testimonial) return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
        return NextResponse.json(testimonial);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();

        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.role !== undefined) updateData.role = body.role;
        if (body.company !== undefined) updateData.company = body.company;
        if (body.eventType !== undefined) updateData.eventType = body.eventType;
        if (body.quote !== undefined) updateData.quote = body.quote;
        if (body.rating !== undefined) updateData.rating = Number(body.rating);
        if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
        if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
        if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
        if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder);

        const testimonial = await prisma.testimonial.update({
            where: { id: id },
            data: updateData,
        });

        return NextResponse.json(testimonial);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await prisma.testimonial.delete({
            where: { id: id },
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
