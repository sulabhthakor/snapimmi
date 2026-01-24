'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateSettingsSchema = z.object({
    maintenanceMode: z.boolean().optional(),
    allowRegistrations: z.boolean().optional(),
    systemBannerText: z.string().optional().nullable(),
});

export async function getSystemSettings() {
    const session = await auth();
    // Allow non-admins to read settings (for banner display)
    // But update logic remains protected

    // Find first record or create default
    let settings = await prisma.systemSettings.findFirst();

    if (!settings && session?.user?.role === 'SUPER_ADMIN') {
        settings = await prisma.systemSettings.create({
            data: {
                maintenanceMode: false,
                allowRegistrations: true,
            },
        });
    }

    return settings;
}

export async function updateSystemSettings(data: { maintenanceMode?: boolean; allowRegistrations?: boolean; systemBannerText?: string | null }) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
        return { success: false, error: 'Unauthorized' };
    }

    const parsed = updateSettingsSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: 'Invalid data' };
    }

    try {
        const current = await prisma.systemSettings.findFirst();

        if (current) {
            await prisma.systemSettings.update({
                where: { id: current.id },
                data: parsed.data,
            });
        } else {
            await prisma.systemSettings.create({
                data: {
                    maintenanceMode: parsed.data.maintenanceMode ?? false,
                    allowRegistrations: parsed.data.allowRegistrations ?? true,
                    systemBannerText: parsed.data.systemBannerText ?? null,
                }
            });
        }

        revalidatePath('/dashboard/admin/settings');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to update system settings:', error);
        return { success: false, error: 'Failed to update settings' };
    }
}
