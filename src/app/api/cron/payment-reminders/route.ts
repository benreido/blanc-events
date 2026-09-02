import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentReminder } from "@/lib/email";

// Runs daily via Vercel cron. Sends reminders 7 days and 1 day before due date.
export async function GET(req: NextRequest) {
    // Verify this is called by Vercel cron or with the internal secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find unpaid invoices due in exactly 7 days or 1 day
    const targetDays = [7, 1];
    let sent = 0;
    let errors = 0;

    for (const daysUntilDue of targetDays) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + daysUntilDue);
        const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
        const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

        const invoices = await prisma.invoice.findMany({
            where: {
                deletedAt: null,
                dueDate: { gte: dayStart, lte: dayEnd },
                status: { notIn: ["PAID", "CANCELLED", "REFUNDED"] },
                balanceDue: { gt: 0 },
                clientEmail: { not: "" },
            },
            select: { id: true, clientName: true, clientEmail: true, invoiceNumber: true, balanceDue: true, dueDate: true },
        });

        for (const invoice of invoices) {
            try {
                await sendPaymentReminder({
                    ...invoice,
                    dueDate: invoice.dueDate!.toLocaleDateString("en-GB"),
                    daysUntilDue,
                });
                sent++;
            } catch (e) {
                console.error(`Failed to send reminder for invoice ${invoice.invoiceNumber}:`, e);
                errors++;
            }
        }
    }

    return NextResponse.json({ sent, errors, timestamp: new Date().toISOString() });
}
