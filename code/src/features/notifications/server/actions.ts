'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications(firmId?: string) {
    const session = await auth();
    // @ts-ignore
    const userId = session?.user?.id;

    if (!userId || !firmId) return [];

    return await prisma.notification.findMany({
        where: {
            firmId,
            userId,
            isRead: false
        },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
}

export async function markAsRead(notificationId: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to update" };
    }
}

export async function markAllAsRead(firmId?: string) {
    const session = await auth();
    // @ts-ignore
    const userId = session?.user?.id;
    if (!userId || !firmId) return { success: false };

    try {
        await prisma.notification.updateMany({
            where: { firmId, userId, isRead: false },
            data: { isRead: true }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

// Internal use primarily
export async function createNotification({
    firmId,
    userId,
    title,
    message,
    type = 'INFO',
    link
}: {
    firmId: string;
    userId: string;
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    link?: string;
}) {
    try {
        await prisma.notification.create({
            data: {
                firmId,
                userId,
                title,
                message,
                type,
                link
            }
        });
        return { success: true };
    } catch (e) {
        console.error("Failed to create notification", e);
        return { success: false };
    }
}
