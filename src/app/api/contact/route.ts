import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validations";
import { sendEnquiryNotification } from "@/lib/email";

import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = result.data;
    const enquiry = await prisma.enquiry.create({ data });

    await sendEnquiryNotification(enquiry).catch(console.error);

    return NextResponse.json({ success: true, id: enquiry.id });
}
