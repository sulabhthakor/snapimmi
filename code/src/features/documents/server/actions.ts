'use server';

import { prisma } from '@/lib/prisma';
import { Document } from '../types';
import { revalidatePath } from 'next/cache';

export async function getDocuments(firmId: string) {
    const docs = await prisma.document.findMany({
        where: {
            customer: {
                firmId: firmId
            }
        },
        include: {
            customer: { select: { fullName: true } }
        },
        orderBy: { uploadedAt: 'desc' }
    });

    return docs.map(d => ({
        id: d.id,
        name: d.name,
        category: d.category as any,
        fileUrl: d.fileUrl,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
        uploadedAt: d.uploadedAt,
        customerId: d.customerId,
        customerName: d.customer.fullName
    }));
}

export async function uploadDocument(formData: FormData) {
    // In a real implementation: Upload to S3/MinIO, then save to DB.
    // For now we just mock the DB entry creation with a dummy URL to allow UI testing.
    // We'll need a Customer ID to attach it to. 
    // Since this action is generic, we'll pick the first customer of the firm for demo purposes
    // Or just skip DB insert since we don't have customer context in this payload yet.

    return { success: true };
}

