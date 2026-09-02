import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContractInvoice } from "@/lib/email";
import { nextInvoiceNumber } from "@/lib/invoices";


function advanceByOneMonth(date: Date, billingDay: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(billingDay);
    return d;
}

export async function GET(req: NextRequest) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find active contracts whose nextBillingDate is today or in the past
    const dueContracts = await prisma.recurringContract.findMany({
        where: {
            status: "ACTIVE",
            nextBillingDate: { lte: now },
        },
    });

    const results: Array<{ contractId: string; invoiceId?: string; error?: string }> = [];

    for (const contract of dueContracts) {
        try {
            // Check if we've already hit max invoices
            if (contract.invoicesGenerated >= contract.maxInvoices) {
                await prisma.recurringContract.update({
                    where: { id: contract.id },
                    data: { status: "COMPLETED" },
                });
                results.push({ contractId: contract.id, error: "completed — max invoices reached" });
                continue;
            }

            // Check contract hasn't expired
            if (new Date(contract.contractEnd) < now) {
                await prisma.recurringContract.update({
                    where: { id: contract.id },
                    data: { status: "COMPLETED" },
                });
                results.push({ contractId: contract.id, error: "completed — contract period ended" });
                continue;
            }

            const lineItemsJson = contract.lineItems as Array<{
                name: string; description?: string; quantity: number; unitPrice: number;
            }>;

            const subtotal = contract.monthlyAmount;
            const vatAmount = subtotal * contract.vatRate;
            const total = subtotal + vatAmount;

            const dueDate = new Date(contract.nextBillingDate);
            dueDate.setDate(dueDate.getDate() + 14); // 14-day payment terms

            const month = contract.nextBillingDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
            const invoiceNumber = await nextInvoiceNumber();

            const invoice = await prisma.invoice.create({
                data: {
                    invoiceNumber,
                    status: "SENT",
                    issueDate: now,
                    dueDate,
                    subtotal,
                    vatAmount,
                    total,
                    balanceDue: total,
                    amountPaid: 0,
                    clientName: contract.clientName,
                    clientEmail: contract.clientEmail,
                    clientAddress: contract.clientAddress,
                    clientId: contract.clientId,
                    contractId: contract.id,
                    notes: `Monthly hire – ${contract.title} – ${month}`,
                    sentAt: now,
                    items: {
                        create: lineItemsJson.map((li, i) => ({
                            name: li.name,
                            description: li.description ?? "",
                            quantity: li.quantity,
                            unitPrice: li.unitPrice,
                            taxable: true,
                            sortOrder: i,
                        })),
                    },
                },
            });

            // Advance billing date and increment counter
            const nextDate = advanceByOneMonth(contract.nextBillingDate, contract.billingDay);
            await prisma.recurringContract.update({
                where: { id: contract.id },
                data: {
                    nextBillingDate: nextDate,
                    invoicesGenerated: contract.invoicesGenerated + 1,
                    status: contract.invoicesGenerated + 1 >= contract.maxInvoices ? "COMPLETED" : "ACTIVE",
                },
            });

            // Send invoice email
            await sendContractInvoice({
                invoiceId: invoice.id,
                invoiceNumber,
                clientName: contract.clientName,
                clientEmail: contract.clientEmail,
                total,
                balanceDue: total,
                dueDate: dueDate.toLocaleDateString("en-GB"),
                contractTitle: contract.title,
                month,
            });

            results.push({ contractId: contract.id, invoiceId: invoice.id });
        } catch (err) {
            console.error(`Error processing contract ${contract.id}:`, err);
            results.push({ contractId: contract.id, error: String(err) });
        }
    }

    return NextResponse.json({ processed: dueContracts.length, results });
}
