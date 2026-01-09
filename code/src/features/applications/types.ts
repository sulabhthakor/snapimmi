import { z } from 'zod';

export const ApplicationStatusSchema = z.enum([
    'INQUIRY',
    'DOC_COLLECTION',
    'APPLIED',
    'DECISION'
]);

export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const PrioritySchema = z.enum([
    'HIGH',
    'MEDIUM',
    'LOW'
]);

export type Priority = z.infer<typeof PrioritySchema>;

export const ApplicationSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    customerName: z.string(),
    customerAvatar: z.string().optional(),
    country: z.string(), // e.g. "Canada"
    visaType: z.string(), // e.g. "Student Visa"
    status: ApplicationStatusSchema,
    priority: PrioritySchema,
    lastUpdated: z.date(),
    fees: z.number().optional(),
});

export type Application = z.infer<typeof ApplicationSchema>;

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
    INQUIRY: 'Inquiry',
    DOC_COLLECTION: 'Docs Collection',
    APPLIED: 'Applied',
    DECISION: 'Decision',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
    INQUIRY: 'bg-gray-100 text-gray-700',
    DOC_COLLECTION: 'bg-blue-50 text-blue-700',
    APPLIED: 'bg-purple-50 text-purple-700',
    DECISION: 'bg-green-50 text-green-700',
};
