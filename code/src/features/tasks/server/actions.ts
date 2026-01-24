'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { CreateTaskSchema } from "../types";

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

    // Sort by Status (TODO first) and then Due Date
    // Prisma doesn't support custom sort order for enums directly in orderBy without raw query or separate queries.
    // Ideally we fetch and sort in JS, or map status to integer.
    // For now, we will fetch and sort in JS layer as it is robust.

    // HOWEVER, to keep it simple with Prisma:
    // We can order by 'status' if 'TODO' comes before 'DONE' alphabetically? 
    // DONE, IN_PROGRESS, TODO. -> Alphabetical: DONE, IN_PROGRESS, TODO.
    // If we want TODO first, this is reverse alphabetical basically.
    // But IN_PROGRESS is in middle.

    // Let's sort in JS for correct business logic: TODO -> IN_PROGRESS -> DONE

    const tasks = await prisma.task.findMany({
        where,
        include: {
            customer: { select: { fullName: true } },
            assignee: { select: { name: true } },
            application: { select: { id: true, visaType: true, targetCountry: true } }
        },
        orderBy: [
            { dueDate: 'asc' } // Earliest due first as secondary sort
        ]
    });

    const statusOrder = { 'TODO': 0, 'IN_PROGRESS': 1, 'DONE': 2 };

    return tasks.sort((a, b) => {
        // @ts-ignore
        const scoreA = statusOrder[a.status] ?? 99;
        // @ts-ignore
        const scoreB = statusOrder[b.status] ?? 99;
        return scoreA - scoreB;
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
