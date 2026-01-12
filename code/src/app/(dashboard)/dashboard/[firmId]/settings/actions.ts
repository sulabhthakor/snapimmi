'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import bcrypt from "bcryptjs";

const ProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
});

const PasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export async function updateProfile(data: z.infer<typeof ProfileSchema>) {
    const session = await auth();
    // @ts-ignore
    const userId = session?.user?.id;
    // @ts-ignore
    const firmId = session?.user?.firmId;

    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    const validation = ProfileSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.format() };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: validation.data.name,
            },
        });

        if (firmId) {
            revalidatePath(`/dashboard/${firmId}/settings`);
        }

        return { success: true };
    } catch (error) {
        console.error("Update Profile Error:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

export async function changePassword(data: z.infer<typeof PasswordSchema>) {
    const session = await auth();
    // @ts-ignore
    const userId = session?.user?.id;

    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    const validation = PasswordSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.format() };
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.password) {
            return { success: false, error: "User not found" };
        }

        const passwordsMatch = await bcrypt.compare(validation.data.currentPassword, user.password);
        if (!passwordsMatch) {
            return { success: false, error: "Incorrect current password" };
        }

        const hashedPassword = await bcrypt.hash(validation.data.newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { success: true };
    } catch (error) {
        console.error("Change Password Error:", error);
        return { success: false, error: "Failed to update password" };
    }
}
