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

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function uploadFile(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, error: "No file uploaded" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, ''); // Sanitize
    const filename = `${uniqueSuffix}-${originalName}`;

    // Ensure upload dir exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return URL relative to public
    const fileUrl = `/uploads/${filename}`;

    return { success: true, url: fileUrl };
}

