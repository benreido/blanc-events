import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || "popular";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (featured === "true") where.featured = true;
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { tags: { hasSome: [search] } },
        ];
    }

    let orderBy: Record<string, string> = { sortOrder: "asc" };
    if (sort === "price_asc") orderBy = { dayRate: "asc" };
    else if (sort === "price_desc") orderBy = { dayRate: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };

    const [items, total] = await Promise.all([
        prisma.equipmentItem.findMany({
            where: where as never,
            orderBy: orderBy as never,
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.equipmentItem.count({ where: where as never }),
    ]);

    const categories = await prisma.equipmentItem.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ["category"],
    });

    const brands = await prisma.equipmentItem.findMany({
        where: { isActive: true },
        select: { brand: true },
        distinct: ["brand"],
    });

    return NextResponse.json({
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        categories: categories.map((c: { category: string }) => c.category),
        brands: brands.map((b: { brand: string }) => b.brand),
    });
}
