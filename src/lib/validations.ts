import { z } from "zod";

export const contactFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().optional().default(""),
    company: z.string().optional().default(""),
    subject: z.string().min(2, "Subject is required"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const quoteRequestSchema = z.object({
    customerName: z.string().min(2, "Name is required"),
    customerEmail: z.string().email("Valid email is required"),
    customerPhone: z.string().optional().default(""),
    company: z.string().optional().default(""),
    venue: z.string().optional().default(""),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    notes: z.string().optional().default(""),
    items: z.array(
        z.object({
            equipmentItemId: z.string().optional(),
            packageId: z.string().optional(),
            quantity: z.number().int().min(1),
        })
    ).min(1, "At least one item is required"),
    serviceAddonIds: z.array(z.string()).optional().default([]),
});
export type QuoteRequestValues = z.infer<typeof quoteRequestSchema>;

export const equipmentFilterSchema = z.object({
    category: z.string().optional(),
    brand: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(["popular", "price_asc", "price_desc", "newest"]).optional().default("popular"),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(50).optional().default(12),
});
export type EquipmentFilterValues = z.infer<typeof equipmentFilterSchema>;

export const adminEquipmentSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().optional().default(""),
    category: z.string().min(1),
    brand: z.string().min(1),
    images: z.array(z.string()).optional().default([]),
    dayRate: z.number().nullable().optional(),
    weekRate: z.number().nullable().optional(),
    contactForPrice: z.boolean().optional().default(false),
    quantityTotal: z.number().int().min(0).optional().default(1),
    specs: z.any().optional(),
    tags: z.array(z.string()).optional().default([]),
    featured: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
    ownedQuantity: z.number().int().min(0).optional().default(0),
    subhireAvailable: z.boolean().optional().default(false),
    subhireMax: z.number().int().min(0).optional().default(0),
    preferredSupplier: z.string().optional().default(""),
    subhireCostPerDay: z.number().min(0).optional().default(0),
    markupPercent: z.number().min(0).optional().default(0),
    leadTimeDays: z.number().int().min(0).optional().default(0),
    internalNotes: z.string().optional().default(""),
});
export type AdminEquipmentValues = z.infer<typeof adminEquipmentSchema>;

export const adminPackageSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().optional().default(""),
    dayRate: z.number().nullable().optional(),
    images: z.array(z.string()).optional().default([]),
    featured: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
    items: z.array(
        z.object({
            equipmentItemId: z.string(),
            quantity: z.number().int().min(1),
        })
    ).optional().default([]),
});
export type AdminPackageValues = z.infer<typeof adminPackageSchema>;

export const adminServiceSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional().default(""),
    pricingType: z.enum(["FIXED", "PERCENT_OF_SUBTOTAL", "PER_DAY"]),
    priceValue: z.number().min(0),
    isActive: z.boolean().optional().default(true),
});
export type AdminServiceValues = z.infer<typeof adminServiceSchema>;

export const venueBookingSchema = z.object({
    venue: z.enum(["MARQUEE", "CLUBHOUSE"], { required_error: "Please select a venue" }),
    eventDate: z.string().min(1, "Event date is required"),
    eventType: z.string().min(2, "Event type is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    clientName: z.string().min(2, "Name must be at least 2 characters"),
    clientEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
    clientPhone: z.string().optional().default(""),
    notes: z.string().optional().default(""),
});
export type VenueBookingValues = z.infer<typeof venueBookingSchema>;

// ─── Invoices ───
export const invoiceItemSchema = z.object({
    name: z.string().default(""),
    description: z.string().optional().default(""),
    quantity: z.number().int().min(0).default(1),
    unitPrice: z.number().default(0),
    discount: z.number().min(0).optional().default(0),
    discountType: z.enum(["FIXED", "PERCENTAGE"]).optional().default("FIXED"),
    taxable: z.boolean().optional().default(true),
});

export const invoiceAdjustmentSchema = z.object({
    name: z.string().default(""),
    description: z.string().optional().default(""),
    amount: z.number(),
    type: z.enum(["EXTRA", "LATE_FEE", "DISCOUNT", "CREDIT"]).optional().default("EXTRA"),
});

export const adminInvoiceSchema = z.object({
    invoiceNumber: z.string().trim().min(1).max(64).optional().nullable(),
    status: z.enum([
        "DRAFT", "SENT", "VIEWED", "PARTIALLY_PAID",
        "PAID", "OVERDUE", "CANCELLED", "REFUNDED", "VOID",
    ]).optional(),
    clientId: z.string().nullable().optional(),
    clientName: z.string().trim().default(""),
    clientEmail: z.union([z.string().trim().email("That client email doesn't look valid"), z.literal("")]).default(""),
    clientAddress: z.string().optional().default(""),
    dueDate: z.string().nullable().optional(),
    eventDate: z.string().nullable().optional(),
    notes: z.string().optional().default(""),
    depositAmount: z.number().min(0).optional().default(0),
    items: z.array(invoiceItemSchema).default([]),
    adjustments: z.array(invoiceAdjustmentSchema).default([]),
});

export const invoicePaymentSchema = z.object({
    amount: z.number().positive("Payment amount must be greater than zero"),
    paymentMethod: z.enum(["STRIPE", "BACS", "CASH"]).optional().default("BACS"),
    reference: z.string().optional().default(""),
    paymentDate: z.string().optional().nullable(),
});
