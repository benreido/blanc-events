import { Prisma } from "@prisma/client";
import { siteConfig } from "@/lib/config";

/** All statuses an invoice can hold. */
export const INVOICE_STATUSES = [
    "DRAFT", "SENT", "VIEWED", "PARTIALLY_PAID",
    "PAID", "OVERDUE", "CANCELLED", "REFUNDED", "VOID",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/** Statuses that mean the invoice has left draft and is a real financial document. */
export const ISSUED_STATUSES: InvoiceStatus[] = [
    "SENT", "VIEWED", "PARTIALLY_PAID", "PAID", "OVERDUE", "REFUNDED",
];

/** Money is rounded to pennies at every boundary so floats can't drift. */
export function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface TotalsItemInput {
    quantity: number;
    unitPrice: number;
    discount?: number;
    discountType?: string;
    taxable?: boolean;
}
export interface TotalsAdjustmentInput {
    amount: number;
}

/**
 * Authoritative, server-side totals. Mirrors the historic client-side maths in
 * InvoiceBuilder so figures don't shift, but the server no longer trusts the
 * browser's arithmetic.
 */
export function computeInvoiceTotals(opts: {
    items: TotalsItemInput[];
    adjustments?: TotalsAdjustmentInput[];
    depositAmount?: number;
    amountPaid?: number;
    vatRate?: number;
}) {
    const vatRate = opts.vatRate ?? siteConfig.vatRate;
    let subtotal = 0;
    let vatAmount = 0;

    for (const item of opts.items || []) {
        const qty = Number(item.quantity) || 0;
        const unit = Number(item.unitPrice) || 0;
        const disc = Number(item.discount) || 0;
        let lineTotal = qty * unit;
        if (item.discountType === "PERCENTAGE") lineTotal -= lineTotal * (disc / 100);
        else lineTotal -= disc;
        subtotal += lineTotal;
        if (item.taxable ?? true) vatAmount += lineTotal * vatRate;
    }

    let adjTotal = 0;
    for (const adj of opts.adjustments || []) adjTotal += Number(adj.amount) || 0;

    subtotal = round2(subtotal);
    vatAmount = round2(vatAmount);
    const total = round2(subtotal + vatAmount + adjTotal);

    const amountPaid = round2(Math.max(0, opts.amountPaid ?? 0));
    // Deposit is an operator choice, not derived — but it can never exceed the total.
    const depositAmount = round2(Math.min(Math.max(0, opts.depositAmount ?? 0), Math.max(0, total)));
    const balanceDue = round2(Math.max(0, total - amountPaid));

    return { subtotal, vatAmount, total, depositAmount, amountPaid, balanceDue };
}

/**
 * Derives the status from the money and dates. Manual states (DRAFT/SENT/VIEWED)
 * are preserved; payment- and date-driven states are always computed so the
 * stored status can never drift from the payments table.
 */
export function deriveInvoiceStatus(opts: {
    current: string;
    total: number;
    amountPaid: number;
    dueDate?: Date | null;
    voidedAt?: Date | null;
    now?: Date;
}): InvoiceStatus {
    const now = opts.now ?? new Date();
    if (opts.voidedAt) return "VOID";
    const current = opts.current as InvoiceStatus;
    // Terminal/manual states we never override automatically.
    if (current === "VOID" || current === "CANCELLED" || current === "REFUNDED") return current;

    if (opts.total > 0 && opts.amountPaid >= opts.total) return "PAID";
    if (opts.amountPaid > 0) return "PARTIALLY_PAID";
    if (opts.dueDate && new Date(opts.dueDate) < now && ISSUED_STATUSES.includes(current)) return "OVERDUE";
    if (current === "PAID" || current === "PARTIALLY_PAID" || current === "OVERDUE") {
        // Payments were removed/reduced — fall back to the issued state.
        return "SENT";
    }
    return current;
}

/** Blocks the transitions that are actually wrong, rather than policing everything. */
export function assertStatusTransition(from: string, to: string) {
    if (from === to) return;
    if (!INVOICE_STATUSES.includes(to as InvoiceStatus)) {
        throw new Error(`Unknown status "${to}"`);
    }
    if (from === "VOID") {
        throw new Error("This invoice is void. Voided invoices are kept as a permanent record and cannot be re-opened — duplicate it instead.");
    }
    if (from === "PAID" && !["REFUNDED", "VOID", "PAID"].includes(to)) {
        throw new Error("This invoice is paid. Issue a refund or void it rather than moving it back to an unpaid state.");
    }
}

/** True when the invoice must be voided rather than deleted. */
export function mustBeVoidedNotDeleted(invoice: { status: string; amountPaid: number }) {
    return ISSUED_STATUSES.includes(invoice.status as InvoiceStatus) || invoice.amountPaid > 0;
}

/**
 * Allocates the next sequential invoice number atomically.
 *
 * Runs inside the caller's transaction and relies on the row lock taken by the
 * counter update, so two concurrent saves can never receive the same number
 * (the old Math.random() scheme collided by design).
 */
export async function allocateInvoiceNumber(
    tx: Prisma.TransactionClient,
    scope = String(new Date().getFullYear()),
    prefix = "INV",
): Promise<string> {
    const counter = await tx.invoiceCounter.upsert({
        where: { scope: `${prefix}-${scope}` },
        update: { lastValue: { increment: 1 } },
        create: { scope: `${prefix}-${scope}`, lastValue: 1 },
    });
    return formatInvoiceNumber(scope, counter.lastValue, prefix);
}

export function formatInvoiceNumber(scope: string, value: number, prefix = "INV"): string {
    return `${prefix}-${scope}-${String(value).padStart(4, "0")}`;
}

/**
 * Seeds the counter above any invoice numbers that already exist for the scope,
 * so switching from the old random scheme can't reissue a number already in use.
 */
export async function ensureCounterAhead(tx: Prisma.TransactionClient, scope: string, prefix = "INV") {
    const existing = await tx.invoice.findMany({
        where: { invoiceNumber: { startsWith: `${prefix}-${scope}-` } },
        select: { invoiceNumber: true },
    });
    let max = 0;
    for (const { invoiceNumber } of existing) {
        const tail = invoiceNumber.split("-").pop() || "";
        const n = parseInt(tail, 10);
        if (!Number.isNaN(n) && n > max) max = n;
    }
    if (max > 0) {
        await tx.invoiceCounter.upsert({
            where: { scope: `${prefix}-${scope}` },
            update: { lastValue: { set: max } },
            create: { scope: `${prefix}-${scope}`, lastValue: max },
        });
    }
}

/**
 * Convenience wrapper for call sites that aren't already inside a transaction.
 * Opens its own transaction so the allocation stays atomic.
 */
export async function nextInvoiceNumber(prefix = "INV"): Promise<string> {
    const { prisma } = await import("@/lib/prisma");
    return prisma.$transaction(async (tx) => {
        const scope = String(new Date().getFullYear());
        await ensureCounterAhead(tx, scope, prefix);
        return allocateInvoiceNumber(tx, scope, prefix);
    });
}

/** Trims/upper-cases a user-supplied number and rejects empties. */
export function normalizeInvoiceNumber(input: unknown): string | null {
    if (typeof input !== "string") return null;
    const trimmed = input.trim();
    return trimmed.length ? trimmed : null;
}
