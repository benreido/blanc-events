import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY environment variable is not set");
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2025-02-24.acacia",
        });
    }
    return _stripe;
}

// Backward-compatible alias
export const stripe = { get: getStripe };

export async function createPaymentIntent(
    amountInPounds: number,
    metadata: Record<string, string>
) {
    return getStripe().paymentIntents.create({
        amount: Math.round(amountInPounds * 100),
        currency: "gbp",
        metadata,
        automatic_payment_methods: { enabled: true },
    });
}

export async function createCheckoutSession(
    amountInPounds: number,
    description: string,
    metadata: Record<string, string>,
    successUrl: string,
    cancelUrl: string
) {
    return getStripe().checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "gbp",
                    unit_amount: Math.round(amountInPounds * 100),
                    product_data: { name: description },
                },
                quantity: 1,
            },
        ],
        metadata,
        success_url: successUrl,
        cancel_url: cancelUrl,
    });
}
