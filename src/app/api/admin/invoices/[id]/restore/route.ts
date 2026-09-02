import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Restores a soft-deleted invoice from the Trash. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!invoice.deletedAt) {
        return NextResponse.json({ success: true, invoice, alreadyActive: true });
    }

    const restored = await prisma.invoice.update({
        where: { id },
        data: { deletedAt: null },
    });

    return NextResponse.json({ success: true, invoice: restored });
}
