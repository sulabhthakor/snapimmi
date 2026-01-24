'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
});

export async function updateAdminProfile(data: { name: string; email: string }) {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
        return { success: false, error: 'Unauthorized' };
    }

    const parsed = updateProfileSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: 'Invalid data' };
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: parsed.data.name,
                email: parsed.data.email,
            },
        });

        revalidatePath('/dashboard/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Failed to update profile:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}
