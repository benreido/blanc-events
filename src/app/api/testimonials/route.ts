import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Demo rows created by prisma/seed.ts — never show these publicly.
// Delete them from the database via the admin panel, then remove this list.
const SEED_PLACEHOLDER_IDS = ["t-james", "t-sophie", "t-mark", "t-laura"];

export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: { isActive: true, id: { notIn: SEED_PLACEHOLDER_IDS } },
            orderBy: [
                { featured: 'desc' },
                { sortOrder: 'asc' },
                { createdAt: 'desc' }
            ]
        });
        return NextResponse.json(testimonials);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
