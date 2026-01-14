'use server';

import { prisma } from '@/lib/prisma';
import { Document } from '../types';
import { revalidatePath } from 'next/cache';
import { auth } from "@/auth";

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

export async function deleteDocument(documentId: string) {
    try {
        const doc = await prisma.document.findUnique({
            where: { id: documentId },
            include: { customer: true }
        });

        if (!doc) return { success: false, error: "Document not found" };

        await prisma.document.update({
            where: { id: documentId },
            data: { deletedAt: new Date() }
        });

        revalidatePath(`/dashboard/${doc.customer.firmId}/documents`);
        return { success: true };
    } catch (error) {
        console.error("Delete document error:", error);
        return { success: false, error: "Failed to delete document" };
    }
}

export async function createDocument(
    customerId: string,
    category: string,
    files: { name: string; fileUrl: string; fileSize: number; mimeType: string }[]
) {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;

    if (!firmId) return { success: false, error: "Unauthorized" };

    try {
        await prisma.$transaction(
            files.map(file =>
                prisma.document.create({
                    data: {
                        customerId,
                        name: file.name,
                        category,
                        fileUrl: file.fileUrl,
                        fileSize: file.fileSize,
                        mimeType: file.mimeType,
                    }
                })
            )
        );

        revalidatePath(`/dashboard/${firmId}/documents`);
        return { success: true };
    } catch (error) {
        console.error("Create document error:", error);
        return { success: false, error: "Failed to create document records" };
    }
}

