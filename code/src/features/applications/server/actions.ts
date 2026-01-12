'use server';

import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '../types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function getApplications(
    firmId: string,
    filters?: {
        customerId?: string;
        search?: string;
        status?: string;
        priority?: string;
    }
) {
    if (!firmId) return [];

    const where: any = { firmId };

    if (filters?.customerId) {
        where.customerId = filters.customerId;
    }

    if (filters?.status && filters.status !== 'ALL') {
        where.status = filters.status;
    }

    if (filters?.priority && filters.priority !== 'ALL') {
        where.priority = filters.priority;
    }

    if (filters?.search) {
        where.OR = [
            { customer: { fullName: { contains: filters.search, mode: 'insensitive' } } },
            { visaType: { contains: filters.search, mode: 'insensitive' } },
            { targetCountry: { contains: filters.search, mode: 'insensitive' } }
        ];
    }

    const apps = await prisma.application.findMany({
        where,
        include: {
            customer: {
                select: { fullName: true }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    // Map Prisma result to our UI Application type
    return apps.map(app => ({
        id: app.id,
        customerId: app.customerId,
        customerName: app.customer.fullName,
        country: app.targetCountry, // Map targetCountry -> country
        visaType: app.visaType,
        status: app.status as ApplicationStatus, // Ensure enum match
        priority: app.priority as any,
        lastUpdated: app.updatedAt
    }));
}

export async function updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus) {
    try {
        await prisma.application.update({
            where: { id: applicationId },
            data: { status: newStatus as any }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) {
        console.error("Failed to update status", e);
        return { success: false };
    }
}

export async function updateApplication(data: z.infer<typeof import("../types").UpdateApplicationRequestSchema>) {
    const { UpdateApplicationRequestSchema } = await import("../types");
    const validation = UpdateApplicationRequestSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, error: validation.error.format() };
    }

    const { id, country, visaType, status, priority, notes } = validation.data;

    try {
        const result = await prisma.application.update({
            where: { id },
            data: {
                targetCountry: country,
                visaType,
                status: status as any,
                priority,
                notes
            }
        });

        revalidatePath('/dashboard');
        return { success: true, data: result };
    } catch (e) {
        console.error("Failed to update application", e);
        return { success: false, error: "Failed to update application" };
    }
}

export async function createApplication(data: z.infer<typeof import("../types").CreateApplicationRequestSchema>) {
    const { CreateApplicationRequestSchema } = await import("../types");
    const session = await import("@/auth").then(m => m.auth());
    // @ts-ignore
    const firmId = session?.user?.firmId;

    if (!firmId) {
        return { success: false, error: "Unauthorized" };
    }

    const validation = CreateApplicationRequestSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, error: validation.error.format() };
    }

    const { customerId, country, visaType, status, priority, notes, passport, visa } = validation.data;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Application
            const app = await tx.application.create({
                data: {
                    firmId,
                    customerId,
                    targetCountry: country,
                    visaType,
                    status: status as any,
                    priority,
                    notes
                }
            });

            // 2. Create Passport if provided
            if (passport) {
                // Check if passport exists? For now assume adding new one or just creating record
                // Ideally check existence or just create.
                await tx.passport.create({
                    data: {
                        customerId,
                        number: passport.number,
                        country: passport.country,
                        issueDate: new Date(), // Using today as default issue date since it wasn't in form
                        expiryDate: passport.expiryDate,
                        frontImage: passport.fileUrl,
                        backImage: passport.backFileUrl
                    }
                });
            }

            // 3. Create Visa if provided
            if (visa) {
                await tx.visa.create({
                    data: {
                        customerId,
                        country: visa.country,
                        type: visa.type,
                        status: 'Active',
                        expiryDate: visa.expiryDate,
                        fileUrl: visa.fileUrl
                    }
                });
            }

            return app;
        });

        revalidatePath('/dashboard');
        return { success: true, data: result };
    } catch (e) {
        console.error("Failed to create application", e);
        return { success: false, error: "Failed to create application" };
    }
}
