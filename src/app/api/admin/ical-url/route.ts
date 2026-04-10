import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { siteConfig } from "@/lib/config";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.ICAL_SECRET;
    if (!secret) return NextResponse.json({ error: "iCal not configured" }, { status: 404 });

    const url = `${siteConfig.url}/api/ical?token=${secret}`;
    return NextResponse.json({ url });
}
