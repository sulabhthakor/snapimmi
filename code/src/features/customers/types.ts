import { z } from "zod";

export const CustomerSchema = z.object({
    id: z.string().optional(),
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(10, "Phone number is required"),
    passportMeta: z.string().optional(),
    isFamilyHead: z.boolean().default(false),
    firmId: z.string().optional(),
});

export const PassportSchema = z.object({
    number: z.string().min(3, "Passport number is required"),
    country: z.string().min(2, "Country is required"),
    issueDate: z.coerce.date(),
    expiryDate: z.coerce.date(),
    placeOfIssue: z.string().optional(),
});

export const CreateCustomerRequestSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(10, "Phone number is required"),
    passport: PassportSchema.optional(),

    // Family Logic
    isFamilyHead: z.boolean().default(false),
    // ID of an existing family group to join
    existingFamilyId: z.string().optional(),
    // Or, if creating a new family (isFamilyHead=true), we can auto-generate name or ask for it
    newFamilyName: z.string().optional(),
});

export type Customer = z.infer<typeof CustomerSchema> & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        applications: number;
        documents: number;
    }
};

export const CustomerFiltersSchema = z.object({
    status: z.enum(["ALL", "LEAD", "ACTIVE"]).optional().default("ALL"),
    search: z.string().optional(),
    page: z.number().default(1),
    limit: z.number().default(10),
});

export type CustomerFilters = z.infer<typeof CustomerFiltersSchema>;
