export const siteConfig = {
    name: "Blanc. Events",
    description: "Premium AV and Event Production Hire in Manchester.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    company: "Blanc. Events Manchester Ltd",
    vatRate: parseFloat(process.env.VAT_RATE || "0.20"),
    depositPercent: parseFloat(process.env.DEPOSIT_PERCENT || "0.25"),
    holdTtlMinutes: parseInt(process.env.HOLD_TTL_MINUTES || "30", 10),
    contactEmail: "hello@blanc.events",
    contactPhone: "0161 123 4567",
    address: "123 Event Parkway, Manchester M1",
    colors: {
        primary: "#1F5C4B",
        deepGreen: "#123A2F",
        darkGreen: "#0B241D",
    },
};

export function calculateDays(start: Date, end: Date): number {
    const diffMs = end.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, days);
}

export function calculateSubtotal(
    items: { dayRate: number; quantity: number }[],
    numberOfDays: number
): number {
    return items.reduce((sum, item) => sum + item.dayRate * item.quantity * numberOfDays, 0);
}

export function calculateServiceCost(
    services: { pricingType: string; priceValue: number }[],
    subtotal: number,
    numberOfDays: number
): number {
    return services.reduce((sum, svc) => {
        switch (svc.pricingType) {
            case "FIXED":
                return sum + svc.priceValue;
            case "PERCENT_OF_SUBTOTAL":
                return sum + subtotal * (svc.priceValue / 100);
            case "PER_DAY":
                return sum + svc.priceValue * numberOfDays;
            default:
                return sum;
        }
    }, 0);
}

export function calculateVat(amount: number): number {
    return amount * siteConfig.vatRate;
}

export function calculateDeposit(total: number): number {
    return total * siteConfig.depositPercent;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(amount);
}
