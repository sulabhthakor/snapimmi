'use server';

import db from "@/lib/db";
import { auth } from "@/auth";
import { CustomerFilters, CreateCustomerRequestSchema } from "../types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Infer TransactionClient type directly from the db instance to avoid import issues
type TransactionClient = Parameters<Parameters<typeof db['$transaction']>[0]>[0];

export async function getCustomers(filters: CustomerFilters) {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;

    if (!firmId) return { data: [], total: 0 };

    const { search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
        firmId: firmId,
        deletedAt: null,
    };

    if (search) {
        where.OR = [
            { fullName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }

    // TODO: Add status filtering when status is added to Customer model or derived

    const [data, total] = await Promise.all([
        db.customer.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { applications: true, documents: true }
                }
            }
        }),
        db.customer.count({ where })
    ]);

    return { data, total, pageCount: Math.ceil(total / limit) };
}

export async function createCustomer(data: z.infer<typeof CreateCustomerRequestSchema>) {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;

    if (!firmId) {
        return { success: false, error: "Unauthorized" };
    }

    const validation = CreateCustomerRequestSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.format() };
    }

    const { fullName, email, phone, passport, isFamilyHead, existingFamilyId, newFamilyName } = validation.data;

    try {
        const result = await db.$transaction(async (tx: TransactionClient) => {
            let familyGroupId = existingFamilyId;

            // 1. Create Family Group if Head
            if (isFamilyHead) {
                const name = newFamilyName || `${fullName.split(' ').pop()}'s Family`;
                const family = await tx.familyGroup.create({
                    data: {
                        firmId,
                        name
                    }
                });
                familyGroupId = family.id;
            }

            // 2. Create Customer
            const customer = await tx.customer.create({
                data: {
                    firmId,
                    fullName,
                    email,
                    phone,
                    passportMeta: passport ? passport.number : undefined,
                    isFamilyHead,
                    familyGroupId
                }
            });

            // 3. Create Passport if provided
            if (passport) {
                await tx.passport.create({
                    data: {
                        customerId: customer.id,
                        number: passport.number,
                        country: passport.country,
                        issueDate: passport.issueDate,
                        expiryDate: passport.expiryDate, // Prisma will use basic DateTime behavior
                    }
                });
            }

            return customer;
        });

        revalidatePath(`/dashboard/${firmId}/customers`);
        return { success: true, data: result };

    } catch (error) {
        console.error("Create Customer Error:", error);
        return { success: false, error: "Failed to create customer" };
    }
}
