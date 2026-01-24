import { z } from "zod";

export const CreateTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    dueDate: z.string().optional(), // YYYY-MM-DD
    customerId: z.string().optional(),
    applicationId: z.string().optional(),
    assignedTo: z.string().optional(), // User ID
});

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
