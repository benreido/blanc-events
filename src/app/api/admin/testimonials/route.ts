import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { sortOrder: 'asc' }
        });
        return NextResponse.json(testimonials);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const testimonial = await prisma.testimonial.create({
            data: {
                name: body.name,
                role: body.role,
                company: body.company,
                eventType: body.eventType,
                quote: body.quote,
                rating: Number(body.rating || 5),
                avatarUrl: body.avatarUrl,
                featured: Boolean(body.featured),
                isActive: Boolean(body.isActive ?? true),
                sortOrder: Number(body.sortOrder || 0),
            },
        });
        return NextResponse.json(testimonial);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
