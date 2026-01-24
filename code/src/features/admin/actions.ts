'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const CreateFirmSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase and contain only dashes"),
    email: z.string().email(),
    plan: z.string(),
});

export async function createFirm(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        slug: formData.get('slug'),
        email: formData.get('email'),
        plan: formData.get('plan'),
    };

    const validatedFields = CreateFirmSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { success: false, error: "Invalid input data" };
    }

    const { name, slug, email, plan } = validatedFields.data;

    try {
        // 1. Ensure unique slug
        let uniqueSlug = slug;
        let counter = 1;

        while (true) {
            const existingFirm = await prisma.firm.findFirst({
                where: { slug: uniqueSlug }
            });

            if (!existingFirm) {
                break;
            }

            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        // Use the optionally modified uniqueSlug
        const finalSlug = uniqueSlug;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { success: false, error: "A user with this email already exists." };
        }

        // 2. Create Firm and Owner User in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const firm = await tx.firm.create({
                data: {
                    name,
                    slug: finalSlug,
                    email,
                    subscriptionPlan: plan,
                    status: 'ACTIVE',
                }
            });

            // Generate temporary password
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            const user = await tx.user.create({
                data: {
                    name: name, // Use Firm Name instead of 'Firm Owner'
                    email,
                    password: hashedPassword,
                    role: 'FIRM_OWNER',
                    firmId: firm.id,
                }
            });

            return { firm, user, tempPassword };
        });

        // TODO: Send email with tempPassword

        revalidatePath('/dashboard/admin/firms');
        return { success: true, tempPassword: result.tempPassword, email: result.user.email, firmName: result.firm.name };

    } catch (error) {
        console.error('Failed to create firm:', error);
        return { success: false, error: "Database error" };
    }
}

export async function toggleFirmStatus(firmId: string, currentStatus: string) {
    try {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

        await prisma.firm.update({
            where: { id: firmId },
            data: { status: newStatus as any }
        });

        revalidatePath(`/dashboard/admin/firms`);
        revalidatePath(`/dashboard/admin/firms/${firmId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle status:', error);
        return { success: false, error: "Database error" };
    }
}

export async function deleteFirm(firmId: string) {
    try {
        // Soft delete
        await prisma.firm.update({
            where: { id: firmId },
            data: {
                deletedAt: new Date(),
                status: 'SUSPENDED' // Also suspend it
            }
        });

        revalidatePath('/dashboard/admin/firms');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete firm:', error);
        return { success: false, error: "Database error" };
    }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isActive: !currentStatus }
        });

        revalidatePath(`/dashboard/admin/users`);
        revalidatePath(`/dashboard/admin/users/${userId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle user status:', error);
        return { success: false, error: "Database error" };
    }
}

export async function deleteUser(userId: string) {
    try {
        // Soft delete
        await prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: new Date(),
                isActive: false // Also deactivate
            }
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { success: false, error: "Database error" };
    }
}

export async function resetUserPassword(userId: string) {
    try {
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: true
            }
        });

        revalidatePath(`/dashboard/admin/users/${userId}`);
        return { success: true, tempPassword };
    } catch (error) {
        console.error('Failed to reset password:', error);
        return { success: false, error: "Database error" };
    }
}

export async function setUserForceReset(userId: string, mustChange: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { mustChangePassword: mustChange }
        });

        revalidatePath(`/dashboard/admin/users/${userId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to set force reset:', error);
        return { success: false, error: "Database error" };
    }
}
