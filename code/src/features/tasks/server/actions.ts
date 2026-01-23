'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Using a simplified schema definition here, ideally move to types.ts
const CreateTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    dueDate: z.string().optional(), // YYYY-MM-DD
    customerId: z.string().optional(),
    applicationId: z.string().optional(),
    assignedTo: z.string().optional(), // User ID
});

export async function getTasks(firmId: string, userId?: string) {
    const session = await auth();
    const user = session?.user as any;
    if (!user?.firmId || user.firmId !== firmId) return [];

    const where: any = {
        firmId,
        deletedAt: null
    };

    // If userId serves as a filter (e.g. "My Tasks")
    if (userId) {
        where.assignedTo = userId;
    }

    // Default: Sort by DueDate (urgent first)
    return await prisma.task.findMany({
        where,
        include: {
            customer: { select: { fullName: true } },
            assignee: { select: { name: true } },
            application: { select: { id: true, visaType: true, targetCountry: true } }
        },
        orderBy: [
            { status: 'asc' }, // TODO first
            { dueDate: 'asc' } // Earliest due first
        ]
    });
}

export async function createTask(data: z.infer<typeof CreateTaskSchema>) {
    const session = await auth();
    const user = session?.user as any;
    const firmId = user?.firmId;

    if (!firmId) return { success: false, error: "Unauthorized" };

    const validation = CreateTaskSchema.safeParse(data);
    if (!validation.success) return { success: false, error: validation.error.format() };

    const { title, description, priority, dueDate, customerId, applicationId, assignedTo } = validation.data;

    try {
        await prisma.task.create({
            data: {
                firmId,
                title,
                description,
                priority,
                status: 'TODO',
                dueDate: dueDate ? new Date(dueDate) : undefined,
                customerId: customerId || undefined,
                applicationId: applicationId || undefined,
                assignedTo: assignedTo || user.id // Default to self if not specified
            }
        });

        revalidatePath(`/dashboard/${firmId}`);
        return { success: true };
    } catch (e) {
        console.error("Create Task Error", e);
        return { success: false, error: "Failed to create task" };
    }
}

export async function updateTaskStatus(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
    const session = await auth();
    const user = session?.user as any;
    const firmId = user?.firmId;
    if (!firmId) return { success: false, error: "Unauthorized" };

    try {
        await prisma.task.update({
            where: { id: taskId, firmId },
            data: {
                status,
                completedAt: status === 'DONE' ? new Date() : null
            }
        });
        revalidatePath(`/dashboard/${firmId}`);
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to update task" };
    }
}
