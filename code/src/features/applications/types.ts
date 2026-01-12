import { z } from 'zod';

export const ApplicationStatusSchema = z.enum([
    'PENDING',
    'DOCUMENTS_COLLECTED',
    'APPLIED',
    'APPROVED',
    'REJECTED'
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
    PENDING: 'Pending',
    DOCUMENTS_COLLECTED: 'Documents Collected',
    APPLIED: 'Applied',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700',
    DOCUMENTS_COLLECTED: 'bg-blue-50 text-blue-700',
    APPLIED: 'bg-purple-50 text-purple-700',
    APPROVED: 'bg-green-50 text-green-700',
    REJECTED: 'bg-red-50 text-red-700',
};

// ... existing code ...
export const UpdateApplicationRequestSchema = z.object({
    id: z.string(),
    country: z.string().min(2, "Country is required"),
    visaType: z.string().min(2, "Visa Type is required"),
    status: ApplicationStatusSchema,
    priority: PrioritySchema,
    notes: z.string().optional(),
});

export const CreateApplicationRequestSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    country: z.string().min(2, "Country is required"),
    visaType: z.string().min(2, "Visa Type is required"),
    status: ApplicationStatusSchema.default('PENDING'),
    priority: PrioritySchema.default('MEDIUM'),
    notes: z.string().optional(),

    // Optional Document Details
    passport: z.object({
        number: z.string().min(1, "Passport Number is required"),
        country: z.string().min(2, "Country is required"),
        expiryDate: z.date(),
        fileUrl: z.string().optional(), // Front Image
        backFileUrl: z.string().optional(), // Back Image
    }).optional(),

    visa: z.object({
        type: z.string().min(1, "Visa Type is required"),
        country: z.string().min(1, "Country is required"),
        expiryDate: z.date(),
        fileUrl: z.string().optional(),
    }).optional(),
});


