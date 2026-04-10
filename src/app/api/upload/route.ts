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

        const blob = await put(`id-verification/${bookingOrderId}/${filename}`, request.body!, {
            access: 'public',
        }).catch((e: any) => {
            console.error("Vercel Blob upload failed:", e.message);
            return null;
        });

        if (!blob) {
            return NextResponse.json({ error: "File upload failed. Please check BLOB_READ_WRITE_TOKEN is configured." }, { status: 500 });
        }

        const uploadUrl = blob.url;

        // 2. Link Identity Document to booking order in DB
        const identityDoc = await prisma.identityDocument.create({
            data: {
                bookingOrderId,
                documentType: "PASSPORT", // or ID, simplified for demo
                documentUrl: uploadUrl,
                status: "PENDING"
            }
        });

        return NextResponse.json({ success: true, url: uploadUrl, identityDocumentId: identityDoc.id });
    } catch (error: any) {
        console.error('File Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
