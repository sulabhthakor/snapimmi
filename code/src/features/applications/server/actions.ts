'use server';

import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '../types';
import { revalidatePath } from 'next/cache';

export async function getApplications(firmId: string) {
    if (!firmId) return [];

    const apps = await prisma.application.findMany({
        where: { firmId },
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

