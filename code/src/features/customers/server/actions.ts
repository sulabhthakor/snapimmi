'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CustomerFilters, CreateCustomerRequestSchema } from "../types";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

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
        prisma.customer.findMany({
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
        prisma.customer.count({ where })
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

    const { fullName, email, phone, passport, visa, isFamilyHead, existingFamilyId, newFamilyName } = validation.data;

    try {
        const result = await prisma.$transaction(async (tx: TransactionClient) => {
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
                        frontImage: passport.frontImage,
                        backImage: passport.backImage,
                        placeOfIssue: passport.placeOfIssue
                    }
                });
            }

            // 4. Create Visa if provided
            if (visa) {
                await tx.visa.create({
                    data: {
                        customerId: customer.id,
                        country: visa.country,
                        type: visa.type,
                        grantDate: visa.grantDate,
                        expiryDate: visa.expiryDate,
                        fileUrl: visa.fileUrl,
                        status: 'Active'
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

export async function getCustomer(customerId: string) {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;

    if (!firmId) return null;

    const customer = await prisma.customer.findUnique({
        where: {
            id: customerId,
            firmId: firmId // Ensure tenant isolation
        },
        include: {
            familyGroup: true,
            passports: true,
            visas: {
                where: { deletedAt: null },
                orderBy: { expiryDate: 'desc' }
            },
            documents: {
                where: { deletedAt: null },
                orderBy: { uploadedAt: 'desc' }
            },
            applications: {
                where: { deletedAt: null },
                orderBy: { updatedAt: 'desc' }
            },
            _count: {
                select: { applications: true, documents: true }
            }
        }
    });

    return customer;
}

export async function updateCustomer(data: z.infer<typeof import("../types").UpdateCustomerRequestSchema>) {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;

    if (!firmId) {
        return { success: false, error: "Unauthorized" };
    }

    // Lazy import schema to avoid circular dependency issues if any, though here it's fine
    const { UpdateCustomerRequestSchema } = await import("../types");
    const validation = UpdateCustomerRequestSchema.safeParse(data);

    if (!validation.success) {
        return { success: false, error: validation.error.format() };
    }

    const { id, fullName, email, phone, passport, isFamilyHead, existingFamilyId, newFamilyName } = validation.data;

    try {
        const result = await prisma.$transaction(async (tx: TransactionClient) => {
            let familyGroupId = existingFamilyId || null;

            // 1. Handle Family Logic
            if (isFamilyHead && !existingFamilyId) {
                // Creating a new family group
                // Check if already head of another group? Or just create new one. Use new name or default.
                const name = newFamilyName || `${fullName.split(' ').pop()}'s Family`;
                const family = await tx.familyGroup.create({
                    data: { firmId, name }
                });
                familyGroupId = family.id;
            } else if (!isFamilyHead && !existingFamilyId) {
                // Individual, disconnect from family if was connected?
                // For now, we follow the input: if existingFamilyId is emtpy, it sets to null or undefined
            }

            // 2. Update Customer
            const customer = await tx.customer.update({
                where: { id, firmId },
                data: {
                    fullName,
                    email,
                    phone,
                    passportMeta: passport ? passport.number : undefined,
                    isFamilyHead,
                    familyGroupId: familyGroupId === "" ? null : familyGroupId // Handle empty string
                }
            });

            // 3. Upsert Passport
            if (passport) {
                // Check if passport exists for this customer
                const existingPassport = await tx.passport.findFirst({
                    where: { customerId: id }
                });

                if (existingPassport) {
                    await tx.passport.update({
                        where: { id: existingPassport.id },
                        data: {
                            number: passport.number,
                            country: passport.country,
                            issueDate: passport.issueDate,
                            expiryDate: passport.expiryDate,
                            placeOfIssue: passport.placeOfIssue
                        }
                    });
                } else {
                    await tx.passport.create({
                        data: {
                            customerId: id,
                            number: passport.number,
                            country: passport.country,
                            issueDate: passport.issueDate,
                            expiryDate: passport.expiryDate,
                            placeOfIssue: passport.placeOfIssue
                        }
                    });
                }
            }

            return customer;
        });

        revalidatePath(`/dashboard/${firmId}/customers/${id}`);
        revalidatePath(`/dashboard/${firmId}/customers`);

        return { success: true, data: result };

    } catch (error) {
        console.error("Update Customer Error:", error);
        return { success: false, error: "Failed to update customer" };
    }
}
