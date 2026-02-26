import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        // DocuSign webhook XML/JSON payload processing
        const payload = await req.json();

        // Normally, you would verify DocuSign HMAC Signature here
        // to ensure the payload is genuinely from DocuSign Connect.

        const envelopeId = payload.data?.envelopeId;
        const status = payload.data?.envelopeSummary?.status; // e.g., 'completed'

        // Let's assume you pass `bookingOrderId` via customFields in DocuSign envelope
        const customFields = payload.data?.envelopeSummary?.customFields?.textCustomFields || [];
        const bookingOrderField = customFields.find((f: any) => f.name === 'bookingOrderId');
        const bookingOrderId = bookingOrderField?.value;

        if (!envelopeId || !status) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        if (status === 'completed') {
            // Retrieve actual signed document URL/PDF from DocuSign API
            // using envelopeId and append it to our local Agreement model.
            const documentUrl = `https://docusign.com/mock-signed-doc/${envelopeId}.pdf`;

            await prisma.agreement.updateMany({
                where: { bookingOrderId: bookingOrderId },
                data: {
                    status: 'SIGNED',
                    signedAt: new Date(),
                    documentUrl: documentUrl
                }
            });

            // If the agreement was completely new and not pre-initiated, we can create it
            const existing = await prisma.agreement.findFirst({ where: { bookingOrderId } });
            if (!existing && bookingOrderId) {
                await prisma.agreement.create({
                    data: {
                        bookingOrderId,
                        documentUrl,
                        status: 'SIGNED',
                        signedAt: new Date()
                    }
                });
            }
        }

        return NextResponse.json({ received: true });

    } catch (e: any) {
        console.error('DocuSign Webhook Error:', e.message);
        return NextResponse.json({ error: 'Internal error handling webhook' }, { status: 500 });
    }
}
