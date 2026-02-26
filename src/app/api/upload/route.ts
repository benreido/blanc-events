import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');
        const bookingOrderId = searchParams.get('bookingOrderId');

        if (!filename || !bookingOrderId) {
            return NextResponse.json({ error: 'Filename and bookingOrderId are required' }, { status: 400 });
        }

        // 1. Upload to blob storage securely
        const blob = await put(`id-verification/${bookingOrderId}/${filename}`, request.body!, {
            access: 'public', // Set to public for the purpose of the demo unless secure retrieval is wired
        });

        // 2. Link Identity Document to booking order in DB
        const identityDoc = await prisma.identityDocument.create({
            data: {
                bookingOrderId,
                documentType: "PASSPORT", // or ID, simplified for demo
                documentUrl: blob.url,
                status: "PENDING"
            }
        });

        return NextResponse.json({ success: true, blob, identityDocumentId: identityDoc.id });
    } catch (error: any) {
        console.error('File Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
