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

    const { search, page, limit, status } = filters;
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
            { passportMeta: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (status === 'ACTIVE') {
        where.applications = {
            some: {
                status: {
                    not: 'LEAD'
                }
            }
        };
    } else if (status === 'LEAD') {
        where.applications = {
            none: {
                status: {
                    not: 'LEAD'
                }
            }
        };
    }

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
            familyGroup: {
                include: {
                    members: {
                        where: { id: { not: customerId } }, // Exclude current customer
                        select: {
                            id: true,
                            fullName: true,
                            isFamilyHead: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            },
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
                orderBy: { updatedAt: 'desc' },
                include: { payments: true }
            },
            tasks: {
                where: { deletedAt: null },
                orderBy: { dueDate: 'asc' }
            },
            _count: {
                select: { applications: true, documents: true, tasks: true }
            }
        }
    });

    if (!customer) return null;

    // Serialize Decimal types in nested payments
    return {
        ...customer,
        applications: customer.applications.map((app: any) => ({
            ...app,
            payments: app.payments.map((p: any) => ({
                ...p,
                amount: p.amount.toNumber(),
            }))
        }))
    };
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

    const { id, fullName, email, phone, passport, visa, isFamilyHead, existingFamilyId, newFamilyName } = validation.data;

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
                            placeOfIssue: passport.placeOfIssue,
                            frontImage: passport.frontImage,
                            backImage: passport.backImage
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
                            placeOfIssue: passport.placeOfIssue,
                            frontImage: passport.frontImage,
                            backImage: passport.backImage
                        }
                    });
                }
            }

            // 4. Upsert Visa
            if (visa) {
                // Check for existing active visa for this country/type
                const existingVisa = await tx.visa.findFirst({
                    where: {
                        customerId: id,
                        country: visa.country,
                        type: visa.type,
                        // status: 'Active' // Optional: match only active ones?
                    }
                });

                if (existingVisa) {
                    await tx.visa.update({
                        where: { id: existingVisa.id },
                        data: {
                            grantDate: visa.grantDate,
                            expiryDate: visa.expiryDate,
                            fileUrl: visa.fileUrl
                        }
                    });
                } else {
                    await tx.visa.create({
                        data: {
                            customerId: id,
                            country: visa.country,
                            type: visa.type,
                            grantDate: visa.grantDate,
                            expiryDate: visa.expiryDate,
                            fileUrl: visa.fileUrl,
                            status: 'Active'
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

export async function deleteCustomer(customerId: string) {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;
    // @ts-ignore
    const role = session?.user?.role;

    if (!firmId) {
        return { success: false, error: "Unauthorized" };
    }

    // RBAC: Only ADMIM can delete
    if (role !== 'ADMIN') {
        return { success: false, error: "Permission Denied: Only Admins can delete customers." };
    }

    try {
        await prisma.customer.update({
            where: { id: customerId, firmId },
            data: { deletedAt: new Date() } // Soft Delete
        });

        revalidatePath(`/dashboard/${firmId}/customers`);
        return { success: true };
    } catch (error) {
        console.error("Delete Customer Error:", error);
        return { success: false, error: "Failed to delete customer" };
    }
}
