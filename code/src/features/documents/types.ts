import { z } from 'zod';

export const DocumentCategorySchema = z.enum([
    'PASSPORT',
    'VISA',
    'ID_PROOF',
    'FINANCIAL',
    'LEGAL',
    'OTHER'
]);

export type DocumentCategory = z.infer<typeof DocumentCategorySchema>;

export const DocumentSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: DocumentCategorySchema,
    fileUrl: z.string().url(),
    fileSize: z.number(),
    mimeType: z.string(),
    uploadedAt: z.date(),
    customerId: z.string(),
    customerName: z.string().nullable().optional(), // For global view
    applicationId: z.string().nullable().optional(),
    applicationName: z.string().nullable().optional(),
});

export type Document = z.infer<typeof DocumentSchema>;
