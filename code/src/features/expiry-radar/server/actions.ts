'use server';

import { checkExpiringDocuments } from "@/lib/cron";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getExpiringItems(firmId: string) {
    const session = await auth();
    // @ts-ignore
    if (!session?.user?.firmId || session.user.firmId !== firmId) {
        return [];
    }

    // Query for items expiring in the next 90 days
    const today = new Date();
    const future90 = new Date(today);
    future90.setDate(today.getDate() + 90);

    const [passports, visas] = await Promise.all([
        prisma.passport.findMany({
            where: {
                customer: { firmId },
                expiryDate: {
                    gte: today,
                    lte: future90
                },
                deletedAt: null
            },
            include: { customer: true }
        }),
        prisma.visa.findMany({
            where: {
                customer: { firmId },
                expiryDate: {
                    gte: today,
                    lte: future90
                },
                status: 'Active',
                deletedAt: null
            },
            include: { customer: true }
        })
    ]);

    const results = [
        ...passports.map(p => ({
            id: `passport-${p.id}`,
            customerId: p.customerId,
            customerName: p.customer.fullName,
            type: 'Passport',
            detail: `Passport expiring`,
            expiryDate: p.expiryDate.toISOString().split('T')[0],
            daysLeft: Math.ceil((new Date(p.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        })),
        ...visas.map(v => ({
            id: `visa-${v.id}`,
            customerId: v.customerId,
            customerName: v.customer.fullName,
            type: 'Visa',
            detail: `Visa (${v.country}) expiring`,
            expiryDate: v.expiryDate.toISOString().split('T')[0],
            daysLeft: Math.ceil((new Date(v.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        }))
    ].sort((a, b) => a.daysLeft - b.daysLeft);

    return results;
}
