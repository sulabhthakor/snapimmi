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
            },
            payments: {
                select: { amount: true }
            },
            _count: {
                select: { tasks: true, documents: true, payments: true }
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
        lastUpdated: app.updatedAt,
        tasksCount: app._count.tasks,
        documentsCount: app._count.documents,
        paymentsCount: app._count.payments,
        totalPaid: app.payments.reduce((sum, p) => sum + Number(p.amount), 0)
    }));
}

export async function updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus) {
    try {
        // 1. Fetch current state & dependencies
        const app = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                customer: {
                    include: { documents: true }
                }
            }
        });

        if (!app) return { success: false, error: "Application not found" };

        // 2. State Guards (Business Logic)

        // Guard: Cannot move to APPLIED without at least one ID Proof
        if (newStatus === 'APPLIED') {
            const hasIdProof = app.customer.documents.some(d => d.category === 'ID Proof');
            if (!hasIdProof) {
                return { success: false, error: "Compliance Block: Customer missing Passport/ID Proof." };
            }
        }

        // Guard: Cannot move to APPROVED without a Visa Document
        if (newStatus === 'APPROVED') {
            const hasVisaDoc = app.customer.documents.some(d =>
                d.category === 'Legal' ||
                d.name.toLowerCase().includes('visa')
            );

            // Allow override if notes says "Manual Approval" (Optional flexibility)
            const isManual = app.notes?.includes("FORCE_APPROVE");

            if (!hasVisaDoc && !isManual) {
                return { success: false, error: "Compliance Block: Missing Visa Grant Letter. Upload it first." };
            }
        }

        // 3. Execute Update
        await prisma.application.update({
            where: { id: applicationId },
            data: { status: newStatus as any }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) {
        console.error("Failed to update status", e);
        return { success: false, error: "System Error" };
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
                await tx.passport.create({
                    data: {
                        customerId,
                        number: passport.number,
                        country: passport.country,
                        issueDate: new Date(),
                        expiryDate: passport.expiryDate,
                        frontImage: passport.fileUrl,
                        backImage: passport.backFileUrl
                    }
                });

                // Sync to Documents
                if (passport.fileUrl) {
                    await tx.document.create({
                        data: {
                            customerId,
                            name: `Passport Front - ${passport.number}`,
                            category: 'ID Proof',
                            fileUrl: passport.fileUrl,
                            fileSize: passport.fileSize || 0,
                            mimeType: passport.mimeType || 'application/octet-stream'
                        }
                    });
                }
                if (passport.backFileUrl) {
                    await tx.document.create({
                        data: {
                            customerId,
                            name: `Passport Back - ${passport.number}`,
                            category: 'ID Proof',
                            fileUrl: passport.backFileUrl,
                            fileSize: passport.backFileSize || 0,
                            mimeType: passport.backMimeType || 'application/octet-stream'
                        }
                    });
                }
            }

            // 3. Create Visa if provided
            if (visa) {
                await tx.visa.create({
                    data: {
                        customerId,
                        country: visa.country,
                        number: visa.number,
                        type: visa.type,
                        status: 'Active',
                        expiryDate: visa.expiryDate,
                        fileUrl: visa.fileUrl
                    }
                });

                // Sync to Documents
                if (visa.fileUrl) {
                    await tx.document.create({
                        data: {
                            customerId,
                            name: `Visa - ${visa.country} (${visa.type})`,
                            category: 'Legal',
                            fileUrl: visa.fileUrl,
                            fileSize: visa.fileSize || 0,
                            mimeType: visa.mimeType || 'application/octet-stream'
                        }
                    });
                }
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

export async function getApplicationDetails(applicationId: string) {
    const session = await import("@/auth").then(m => m.auth());
    const user = session?.user as any;
    const firmId = user?.firmId;

    if (!firmId) return null;

    const app = await prisma.application.findUnique({
        where: { id: applicationId, firmId },
        include: {
            customer: {
                include: {
                    documents: {
                        where: { deletedAt: null },
                        orderBy: { uploadedAt: 'desc' }
                    }
                }
            },
            payments: {
                orderBy: { createdAt: 'desc' }
            },
            tasks: { // Reminders linked to this app
                where: { deletedAt: null },
                orderBy: { dueDate: 'asc' },
                include: {
                    assignee: { select: { name: true } }
                }
            }
        }
    });

    if (!app) return null;

    // Serialize Decimal types
    return {
        ...app,
        payments: app.payments.map((p: any) => ({
            ...p,
            amount: p.amount.toNumber(),
        }))
    };
}
