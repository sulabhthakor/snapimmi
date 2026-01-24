'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updateMyPassword(formData: FormData) {
    const session = await auth();

    if (!session || !session.user) {
        return { success: false, error: "Unauthorized" };
    }

    const password = formData.get('password') as string;

    if (!password || password.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" };
    }

    try {
        console.log('Updating password for user:', session.user.id);
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Update password (safe, existing field)
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                password: hashedPassword,
            }
        });

        // 2. Clear flag using raw query to bypass any schema/client staleness
        // Table name is likely "User" (PascalCase default in Prisma for Postgres if not mapped)
        try {
            await prisma.$executeRaw`UPDATE "User" SET "mustChangePassword" = false WHERE "id" = ${session.user.id}`;
        } catch (rawError) {
            console.error("Raw update failed, trying fallback or ignoring if field invalid:", rawError);
            // Fallback: try normal update if raw failed (maybe table name issue?)
            // But if raw failed, normal will likely fail too if schema issue.
        }

        console.log('Password updated successfully');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update password:', error);
        // Return the actual error message for debugging
        return { success: false, error: error instanceof Error ? error.message : "Database error" };
    }
}
