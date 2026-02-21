import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { formatCurrency } from "@/lib/config";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const pkg = await prisma.package.findUnique({
            where: { id: id },
            include: {
                items: {
                    include: {
                        equipmentItem: true,
                    },
                },
            },
        });

        if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });
        return NextResponse.json(pkg);
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

        // Destructure only what we need
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
            items,
            isActive,
            featured,
            sortOrder,
        } = body;

        // 1. Existence check
        const existing = await prisma.package.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        // 2. Prepare calculated fields
        const slugValue = name ? slugify(name, { lower: true, strict: true }) : undefined;
        let generatedSavingsNote = "";
        const finalDiscountType = discountType || existing.discountType;
        const finalDiscountValue = discountValue !== undefined ? Number(discountValue) : existing.discountValue;

        if (finalDiscountType === "PERCENT" && finalDiscountValue > 0) {
            generatedSavingsNote = `Save ${finalDiscountValue}% — Exclusive bundle rate`;
        } else if (finalDiscountType === "FIXED" && finalDiscountValue > 0) {
            generatedSavingsNote = `Save ${formatCurrency(finalDiscountValue)} — Exclusive bundle rate`;
        }

        // 3. Build updateData
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (slugValue !== undefined) updateData.slug = slugValue;
        if (dayRate !== undefined) updateData.dayRate = dayRate;
        if (contactForPrice !== undefined) updateData.contactForPrice = !!contactForPrice;
        if (isActive !== undefined) updateData.isActive = !!isActive;
        if (featured !== undefined) updateData.featured = !!featured;
        if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

        if (discountType !== undefined) updateData.discountType = String(discountType);
        if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
        updateData.savingsNote = generatedSavingsNote;

        if (images !== undefined) updateData.images = Array.isArray(images) ? images : [];
        if (includes !== undefined) updateData.includes = Array.isArray(includes) ? includes : [];
        if (optionalAddons !== undefined) updateData.optionalAddons = Array.isArray(optionalAddons) ? optionalAddons : [];

        // 4. Atomic Transaction
        const updatedRecord = await prisma.$transaction(async (tx: any) => {
            if (items && Array.isArray(items)) {
                await tx.packageItem.deleteMany({ where: { packageId: id } });

                // Nest the creation inside the update data
                updateData.items = {
                    create: items.map((item: any) => ({
                        equipmentItemId: item.equipmentItemId,
                        quantity: Number(item.quantity || 1)
                    }))
                };
            }

            return await tx.package.update({
                where: { id: id },
                data: updateData,
                include: { items: true }
            });
        });

        return NextResponse.json(updatedRecord);
    } catch (error: any) {
        console.error("PRISMA ERROR:", error);
        return NextResponse.json({
            error: "Failed to update package",
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await prisma.package.delete({
            where: { id: id },
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
