'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const CreatePaymentSchema = z.object({
    applicationId: z.string(),
    amount: z.number().positive(),
    method: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER"]),
    notes: z.string().optional(),
});

export async function getRevenue(firmId: string) {
    // Get current year start
    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    const result = await prisma.payment.aggregate({
        where: {
            firmId,
            status: 'COMPLETED',
            paidAt: { gte: yearStart }
        },
        _sum: { amount: true }
    });

    return result._sum.amount || 0;
}

export async function getPaymentsForApplication(applicationId: string) {
    return prisma.payment.findMany({
        where: { applicationId },
        orderBy: { createdAt: 'desc' }
    });
}

export async function createPayment(data: z.infer<typeof CreatePaymentSchema>) {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;

    if (!firmId) return { success: false, error: "Unauthorized" };

    const validation = CreatePaymentSchema.safeParse(data);
    if (!validation.success) return { success: false, error: validation.error.format() };

    const { applicationId, amount, method, notes } = validation.data;

    try {
        await prisma.payment.create({
            data: {
                firmId,
                applicationId,
                amount,
                method,
                status: 'COMPLETED',
                paidAt: new Date(),
                notes
            }
        });

        revalidatePath(`/dashboard/${firmId}`);
        return { success: true };
    } catch (e) {
        console.error("Create Payment Error", e);
        return { success: false, error: "Failed to record payment" };
    }
}

export async function deletePayment(paymentId: string) {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;

    if (!firmId) return { success: false, error: "Unauthorized" };

    try {
        await prisma.payment.delete({
            where: {
                id: paymentId,
                firmId // Ensure ownership
            }
        });

        revalidatePath(`/dashboard/${firmId}`);
        return { success: true };
    } catch (e) {
        console.error("Delete Payment Error", e);
        return { success: false, error: "Failed to delete payment" };
    }
}
