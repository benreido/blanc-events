import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { formatCurrency } from "@/lib/config";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const packages = await prisma.package.findMany({
        include: {
            items: {
                include: {
                    equipmentItem: true,
                },
            },
        },
        orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ packages });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const {
            name,
            description,
            dayRate,
            contactForPrice,
            images,
            includes,
            optionalAddons,
            discountType,
            discountValue,
            items, // Array of { equipmentItemId, quantity }
            isActive,
            featured,
            sortOrder,
        } = body;

        const slugValue = name ? slugify(name, { lower: true, strict: true }) : "";

        let generatedSavingsNote = "";
        if (discountType === "PERCENT" && (discountValue || 0) > 0) {
            generatedSavingsNote = `Save ${discountValue}% — Exclusive bundle rate`;
        } else if (discountType === "FIXED" && (discountValue || 0) > 0) {
            generatedSavingsNote = `Save ${formatCurrency(discountValue || 0)} — Exclusive bundle rate`;
        }

        const newPackage = await prisma.package.create({
            data: {
                name,
                slug: slugValue,
                description: description || "",
                dayRate: dayRate !== undefined ? dayRate : null,
                contactForPrice: Boolean(contactForPrice),
                images: Array.isArray(images) ? images : [],
                includes: Array.isArray(includes) ? includes : [],
                optionalAddons: Array.isArray(optionalAddons) ? optionalAddons : [],
                discountType: String(discountType || "NONE"),
                discountValue: Number(discountValue || 0),
                savingsNote: generatedSavingsNote,
                isActive: isActive ?? true,
                featured: featured ?? false,
                sortOrder: Number(sortOrder || 0),
                items: {
                    create: (items || []).map((item: any) => ({
                        equipmentItemId: item.equipmentItemId,
                        quantity: Number(item.quantity || 1),
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        return NextResponse.json(newPackage);
    } catch (error: any) {
        console.error("Package creation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
