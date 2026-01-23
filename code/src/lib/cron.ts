import { prisma } from "@/lib/prisma";
import { addDays, startOfDay, endOfDay } from "date-fns";

export type ExpiryResult = {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    type: 'Passport' | 'Visa';
    expiryDate: Date;
    daysLeft: number;
    docId: string;
};

export async function checkExpiringDocuments() {
    const today = new Date();

    // Define thresholds
    const targets = [30, 60, 90];
    const results: ExpiryResult[] = [];

    // 1. Check Passports
    for (const days of targets) {
        const targetDateStart = startOfDay(addDays(today, days));
        const targetDateEnd = endOfDay(addDays(today, days));

        const passports = await prisma.passport.findMany({
            where: {
                expiryDate: {
                    gte: targetDateStart,
                    lte: targetDateEnd
                },
                customer: { deletedAt: null }
            },
            include: { customer: true }
        });

        passports.forEach(p => {
            results.push({
                customerName: p.customer.fullName,
                customerEmail: p.customer.email || '',
                customerPhone: p.customer.phone || '',
                type: 'Passport',
                expiryDate: p.expiryDate,
                daysLeft: days,
                docId: p.id
            });
        });

        // 2. Check Visas
        const visas = await prisma.visa.findMany({
            where: {
                expiryDate: {
                    gte: targetDateStart,
                    lte: targetDateEnd
                },
                status: 'Active',
                customer: { deletedAt: null }
            },
            include: { customer: true }
        });

        visas.forEach(v => {
            results.push({
                customerName: v.customer.fullName,
                customerEmail: v.customer.email || '',
                customerPhone: v.customer.phone || '',
                type: 'Visa',
                expiryDate: v.expiryDate,
                daysLeft: days,
                docId: v.id
            });
        });
    }

    return results;
}
